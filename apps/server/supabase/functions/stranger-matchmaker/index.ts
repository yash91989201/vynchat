import { createClient, type RealtimeChannel } from "@supabase/supabase-js";
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createId } from "@paralleldrive/cuid2";

// Initialize Supabase client with service role key
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

/**
 * Clean up old skipped pairs (older than 10 seconds)
 */
const cleanupOldSkippedPairs = async (): Promise<void> => {
  const tenSecondsAgo = new Date(Date.now() - 10 * 1000).toISOString();

  const { error } = await supabase
    .from("skipped_pair")
    .delete()
    .lt("created_at", tenSecondsAgo);

  if (error) {
    console.error("Error cleaning up old skipped pairs:", error);
  } else {
    console.log("🧹 Cleaned up old skipped pairs");
  }
};

/**
 * Check if two users have recently skipped each other (within 10 seconds)
 */
const hasRecentlySkipped = async (
  user1: string,
  user2: string
): Promise<boolean> => {
  const tenSecondsAgo = new Date(Date.now() - 10 * 1000).toISOString();

  const { data: skippedPairs, error } = await supabase
    .from("skipped_pair")
    .select("*")
    .or(
      `and(user_a_id.eq.${user1},user_b_id.eq.${user2}),and(user_a_id.eq.${user2},user_b_id.eq.${user1})`
    )
    .gte("created_at", tenSecondsAgo);

  if (error) {
    console.error("Error checking skipped pairs:", error);
    return false; // Allow matching if there's an error
  }

  return (skippedPairs && skippedPairs.length > 0);
};

/**
 * Check if a user is currently in waiting status based on presence state
 */
const isWaiting = (
  presenceState: Record<string, any>,
  userId: string
): boolean => {
  const pres = presenceState[userId] as any[] | undefined;
  return pres?.some((p) => p.status === "waiting") ?? false;
};

/**
 * Create a new room and add both users as members
 */
const createMatchRoom = async (user1: string, user2: string) => {
  const roomId = createId();

  const { data: roomRes, error: roomErr } = await supabase
    .from("room")
    .insert({
      id: roomId,
      name: `${user1}-${user2}`,
      isDM: true,
      owner_id: user1,
    })
    .select("*")
    .single();

  if (roomErr) throw roomErr;

  // Add both users to the room
  const { error: memberErr } = await supabase.from("room_member").insert([
    { room_id: roomId, user_id: user1 },
    { room_id: roomId, user_id: user2 },
  ]);

  if (memberErr) throw memberErr;

  return roomRes;
};

/**
 * Notify a user via realtime channel
 */
const notifyUser = async (userId: string, event: string, payload: any) => {
  const channel = supabase.channel(`user:${userId}`);

  try {
    await new Promise<void>((resolve, reject) => {
      channel.subscribe((status) => {
        if (status === "SUBSCRIBED") {
          resolve();
        }
      });
      setTimeout(() => reject(new Error("Subscribe timeout")), 2000);
    });

    await channel.send({
      type: "broadcast",
      event,
      payload,
    });
  } catch (error) {
    console.error(`Error notifying user ${userId}:`, error);
  } finally {
    await supabase.removeChannel(channel);
  }
};

/**
 * Delete queue messages in batch
 */
const deleteQueueMessages = async (messageIds: bigint[]) => {
  const results = await Promise.allSettled(
    messageIds.map(async (msgId) => {
      const { error } = await supabase.schema("pgmq_public").rpc("delete", {
        queue_name: "stranger-queue",
        message_id: msgId,
      });

      if (error) {
        console.error(`Error deleting message ${msgId}:`, error);
        throw error;
      }
      return msgId;
    })
  );

  const failures = results.filter((result) => result.status === "rejected");
  if (failures.length > 0) {
    console.warn(`Failed to delete ${failures.length} messages`);
  }
};

/**
 * Main matchmaking handler
 */
Deno.serve(async () => {
  try {
    console.log("🎯 Matchmaker function started");

    // 0. Clean up old skipped pairs first
    await cleanupOldSkippedPairs();

    // 1. Read pending queue messages (up to 100 for better matching)
    const { data: msgs, error: readErr } = await supabase
      .schema("pgmq_public")
      .rpc("read", {
        queue_name: "stranger-queue",
        n: 100,
        sleep_seconds: 0,
      });

    if (readErr) {
      throw new Error(`Failed to read queue: ${readErr.message}`);
    }

    const users = msgs ?? [];
    console.log(`📋 Found ${users.length} users in queue`);

    if (users.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "No users in queue",
          stats: { totalUsers: 0, pairedRooms: 0, processedMessages: 0 },
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // 2. Subscribe to lobby presence
    let presenceState: Record<string, any> = {};
    const lobbyChannel: RealtimeChannel = supabase.channel("lobby:global", {
      config: { presence: { enabled: true } },
    });

    try {
      await new Promise<void>((resolve, reject) => {
        lobbyChannel.subscribe((status) => {
          if (status === "SUBSCRIBED") {
            presenceState = lobbyChannel.presenceState();
            resolve();
          } else if (status === "CHANNEL_ERROR") {
            reject(new Error("Failed to subscribe to presence"));
          }
        });
        setTimeout(() => reject(new Error("Presence subscribe timeout")), 3000);
      });
    } catch (presenceError) {
      console.warn(
        "! Failed to get presence state, proceeding anyway:",
        presenceError
      );
    }

    // 3. Group users by continent
    const usersByContinent: Record<string, typeof users> = {};
    for (const user of users) {
      const continent = user.message.continent || "World";
      if (!usersByContinent[continent]) {
        usersByContinent[continent] = [];
      }
      usersByContinent[continent].push(user);
    }

    const pairedRooms: any[] = [];
    const processedMessageIds: bigint[] = [];
    let unprocessedUsers: typeof users = [];

    // 4. Process each continent group (excluding 'World')
    for (const continent in usersByContinent) {
      if (continent === "World") continue;

      console.log(`
--- Processing continent: ${continent} ---`);
      const continentUsers = usersByContinent[continent];
      const { paired, unprocessed, processedIds } = await processUserGroup(
        continentUsers,
        presenceState
      );
      pairedRooms.push(...paired);
      unprocessedUsers.push(...unprocessed);
      processedMessageIds.push(...processedIds);
    }

    // 5. Pool 'World' users and unprocessed users from other continents
    const worldUsers = usersByContinent["World"] || [];
    const finalGroup = [...worldUsers, ...unprocessedUsers];
    console.log(`
--- Processing World group (${finalGroup.length} users) ---`);

    const { paired, unprocessed, processedIds } = await processUserGroup(
      finalGroup,
      presenceState
    );
    pairedRooms.push(...paired);
    processedMessageIds.push(...processedIds);

    // 6. Clean up processed queue messages
    if (processedMessageIds.length > 0) {
      await deleteQueueMessages(processedMessageIds);
    }

    // 7. Handle remaining unprocessed users
    for (const unprocessedUser of unprocessed) {
      const userId = unprocessedUser.message.userId as string;
      console.log(`👤 No match available for user: ${userId}`);
      await supabase.schema("pgmq_public").rpc("delete", {
        queue_name: "stranger-queue",
        message_id: unprocessedUser.msg_id,
      });
      await notifyUser(userId, "stranger_no_matches", {
        reason:
          "No available users to match with. Please try again in a few seconds.",
      });
    }

    // 8. Clean up lobby channel
    await supabase.removeChannel(lobbyChannel);

    const stats = {
      totalUsers: users.length,
      pairedRooms: pairedRooms.length,
      processedMessages: processedMessageIds.length,
      unprocessedUsers: unprocessed.length,
    };

    console.log("✨ Matchmaker completed:", stats);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Matchmaker completed successfully",
        stats,
        rooms: pairedRooms,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("💥 Matchmaker error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: "Matchmaker function failed",
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});

/**
 * Helper to process a group of users for matching
 */
async function processUserGroup(
  users: any[],
  presenceState: Record<string, any>
) {
  const paired: any[] = [];
  const processedIds: bigint[] = [];
  let unprocessed = [...users];

  // Create a copy to iterate over, while modifying the original unprocessed array
  const usersToProcess = [...unprocessed];
  unprocessed = [];

  while (usersToProcess.length >= 2) {
    const u1 = usersToProcess.shift()!;
    let matchFound = false;

    for (let i = 0; i < usersToProcess.length; i++) {
      const u2 = usersToProcess[i];
      const user1 = u1.message.userId as string;
      const user2 = u2.message.userId as string;

      // Skip if same user
      if (user1 === user2) continue;

      // Check presence
      if (
        Object.keys(presenceState).length > 0 &&
        !(isWaiting(presenceState, user1) && isWaiting(presenceState, user2))
      ) {
        continue;
      }

      // Check for recent skips
      if (await hasRecentlySkipped(user1, user2)) {
        continue;
      }

      // Match found!
      try {
        console.log(`✅ Matching users: ${user1} with ${user2}`);
        const roomRes = await createMatchRoom(user1, user2);

        processedIds.push(u1.msg_id, u2.msg_id);
        await Promise.all([
          notifyUser(user1, "stranger_matched", { room: roomRes }),
          notifyUser(user2, "stranger_matched", { room: roomRes }),
        ]);

        paired.push(roomRes);
        usersToProcess.splice(i, 1); // Remove matched user
        matchFound = true;
        break; // Exit inner loop and process next user
      } catch (matchError) {
        console.error(`❌ Error matching ${user1} and ${user2}:`, matchError);
      }
    }

    if (!matchFound) {
      unprocessed.push(u1);
    }
  }

  // Add any remaining user from the loop to unprocessed
  if (usersToProcess.length > 0) {
    unprocessed.push(...usersToProcess);
  }

  return { paired, unprocessed, processedIds };
}
