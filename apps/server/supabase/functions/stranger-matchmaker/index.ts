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

    // 1. Read pending queue messages (up to 10)
    const { data: msgs, error: readErr } = await supabase
      .schema("pgmq_public")
      .rpc("read", {
        queue_name: "stranger-queue",
        n: 10,
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

    // 2. Subscribe to lobby presence to get current user statuses
    let presenceState: Record<string, any> = {};
    const lobbyChannel: RealtimeChannel = supabase.channel("lobby:global", {
      config: { presence: { enabled: true } },
    });

    try {
      await new Promise<void>((resolve, reject) => {
        lobbyChannel.subscribe((status) => {
          if (status === "SUBSCRIBED") {
            presenceState = lobbyChannel.presenceState();
            console.log(
              `👥 Got presence for ${Object.keys(presenceState).length} users`
            );
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
      // Continue without presence validation
    }

    // 3. Process users in pairs
    const pairedRooms: any[] = [];
    const processedMessageIds: bigint[] = [];
    const unprocessedUsers: typeof users = [];

    for (let i = 0; i + 1 < users.length; i += 2) {
      const u1 = users[i];
      const u2 = users[i + 1];
      const user1 = u1.message.userId as string;
      const user2 = u2.message.userId as string;

      console.log(`🔍 Evaluating pair: ${user1} <-> ${user2}`);

      // Check if both users are still waiting
      if (
        Object.keys(presenceState).length > 0 &&
        !(isWaiting(presenceState, user1) && isWaiting(presenceState, user2))
      ) {
        console.log("⏭ Skipping pair - not both waiting");
        processedMessageIds.push(u1.msg_id, u2.msg_id);
        continue;
      }

      // Check if they recently skipped each other
      if (await hasRecentlySkipped(user1, user2)) {
        console.log("⏭ Skipping pair - recently skipped each other");
        // Add both users back to unprocessed list for potential other matches
        unprocessedUsers.push(u1, u2);
        continue;
      }

      try {
        console.log(`✅ Matching users: ${user1} with ${user2}`);

        // Create room and add members
        const roomRes = await createMatchRoom(user1, user2);

        // Mark messages for deletion
        processedMessageIds.push(u1.msg_id, u2.msg_id);

        // Notify both users
        await Promise.all([
          notifyUser(user1, "stranger_matched", { room: roomRes }),
          notifyUser(user2, "stranger_matched", { room: roomRes }),
        ]);

        pairedRooms.push(roomRes);
        console.log(`🎉 Successfully matched pair ${pairedRooms.length}`);
      } catch (matchError) {
        console.error(`❌ Error matching ${user1} and ${user2}:`, matchError);
        // Add back to unprocessed for potential retry
        unprocessedUsers.push(u1, u2);
      }
    }

    // 4. Handle leftover odd user from main processing
    if (users.length % 2 === 1) {
      unprocessedUsers.push(users.at(-1)!);
    }

    // 5. Try to find alternative matches for unprocessed users
    const remainingUnprocessed: typeof users = [];

    for (let i = 0; i + 1 < unprocessedUsers.length; i += 2) {
      const u1 = unprocessedUsers[i];
      const u2 = unprocessedUsers[i + 1];
      const user1 = u1.message.userId as string;
      const user2 = u2.message.userId as string;

      console.log(`🔄 Retry evaluating pair: ${user1} <-> ${user2}`);

      // Check if they recently skipped each other
      if (await hasRecentlySkipped(user1, user2)) {
        console.log("⏭ Still skipped - adding to remaining");
        remainingUnprocessed.push(u1, u2);
        continue;
      }

      try {
        console.log(`✅ Retry matching users: ${user1} with ${user2}`);

        // Create room and add members
        const roomRes = await createMatchRoom(user1, user2);

        // Mark messages for deletion
        processedMessageIds.push(u1.msg_id, u2.msg_id);

        // Notify both users
        await Promise.all([
          notifyUser(user1, "stranger_matched", { room: roomRes }),
          notifyUser(user2, "stranger_matched", { room: roomRes }),
        ]);

        pairedRooms.push(roomRes);
        console.log(`🎉 Successfully retry matched pair ${pairedRooms.length}`);
      } catch (matchError) {
        console.error(`❌ Error retry matching ${user1} and ${user2}:`, matchError);
        remainingUnprocessed.push(u1, u2);
      }
    }

    // 6. Handle final leftover odd user from retry
    if (unprocessedUsers.length % 2 === 1) {
      remainingUnprocessed.push(unprocessedUsers.at(-1)!);
    }

    // 7. Clean up processed queue messages
    if (processedMessageIds.length > 0) {
      console.log(
        `🧹 Deleting ${processedMessageIds.length} processed messages`
      );
      await deleteQueueMessages(processedMessageIds);
    }

    // 8. Handle remaining unprocessed users - notify them no matches available
    for (const unprocessedUser of remainingUnprocessed) {
      const userId = unprocessedUser.message.userId as string;

      console.log(`👤 No match available for user: ${userId}`);

      // Remove message from queue
      try {
        await supabase.schema("pgmq_public").rpc("delete", {
          queue_name: "stranger-queue",
          message_id: unprocessedUser.msg_id,
        });
      } catch (deleteError) {
        console.error("Error deleting unprocessed message:", deleteError);
      }

      // Notify user no matches available
      await notifyUser(userId, "stranger_no_matches", {
        reason: "No available users to match with. Please try again in a few seconds.",
      });
    }

    // 9. Clean up lobby channel
    await supabase.removeChannel(lobbyChannel);

    const stats = {
      totalUsers: users.length,
      pairedRooms: pairedRooms.length,
      processedMessages: processedMessageIds.length,
      unprocessedUsers: remainingUnprocessed.length,
    };

    console.log("✨ Matchmaker completed:", stats);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Matchmaker completed successfully",
        stats,
        rooms: pairedRooms,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
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
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});
