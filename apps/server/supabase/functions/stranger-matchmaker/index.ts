import { createClient, type RealtimeChannel } from "@supabase/supabase-js";
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createId } from "@paralleldrive/cuid2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL"),
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
);

const isWaiting = (presenceState: any, userId: string) => {
  const pres = presenceState[userId] as any[] | undefined;
  return pres?.some((p) => p.status === "waiting");
};

const hasRecentlySkipped = async (user1: string, user2: string) => {
  const thirtySecondsAgo = new Date(Date.now() - 30 * 1000).toISOString();

  const { data: skippedPairs, error } = await supabase
    .from("skipped_pair")
    .select("*")
    .or(
      `and(user_a_id.eq.${user1},user_b_id.eq.${user2}),and(user_a_id.eq.${user2},user_b_id.eq.${user1})`
    )
    .gte("created_at", thirtySecondsAgo);

  if (error) {
    console.error("Error checking skipped pairs:", error);
    return false;
  }

  if (skippedPairs && skippedPairs.length > 0) {
    for (const pair of skippedPairs) {
      const { error: deleteError } = await supabase
        .from("skipped_pair")
        .delete()
        .eq("user_a_id", pair.user_a_id)
        .eq("user_b_id", pair.user_b_id);

      if (deleteError) {
        console.error("Error deleting skipped pair:", deleteError);
      }
    }
    return true;
  }

  return false;
};

Deno.serve(async () => {
  try {
    console.log("Matchmaker function started");

    // 1. Read up to 10 queue messages WITHOUT removing
    const { data: msgs, error: readErr } = await supabase
      .schema("pgmq_public")
      .rpc("read", {
        queue_name: "stranger-queue",
        n: 10,
        sleep_seconds: 0,
      });

    if (readErr) throw readErr;

    const users = msgs ?? [];
    console.log(`Found ${users.length} users in queue`);

    const pairedRooms: any[] = [];
    const processedMessageIds: bigint[] = [];

    // 2. Get lobby presence snapshot (subscribe briefly, then close)
    let presenceState: Record<string, unknown> = {};
    const lobbyChannel: RealtimeChannel = supabase.channel("lobby:global", {
      config: { presence: { enabled: true } },
    });

    await new Promise<void>((resolve, reject) => {
      lobbyChannel.subscribe((status) => {
        if (status === "SUBSCRIBED") {
          presenceState = lobbyChannel.presenceState();
          resolve();
        }
      });

      setTimeout(() => reject(new Error("Presence subscribe timeout")), 1500);
    });

    // 3. Process in pairs
    for (let i = 0; i + 1 < users.length; i += 2) {
      const u1 = users[i];
      const u2 = users[i + 1];
      const user1 = u1.message.userId as string;
      const user2 = u2.message.userId as string;

      if (
        !(isWaiting(presenceState, user1) && isWaiting(presenceState, user2))
      ) {
        console.log(
          `Skipping pair [${user1}, ${user2}] because one or both are not waiting`
        );
        processedMessageIds.push(u1.msg_id, u2.msg_id);
        continue;
      }

      if (await hasRecentlySkipped(user1, user2)) {
        console.log(
          `Skipping pair [${user1}, ${user2}] because they recently skipped each other`
        );
        continue;
      }

      console.log(`Matching users: ${user1} with ${user2}`);

      const { data: roomRes, error: roomErr } = await supabase
        .from("room")
        .insert({
          id: createId(),
          name: `${user1}-${user2}`,
          isDM: true,
          owner_id: user1,
        })
        .select("*")
        .single();

      if (roomErr) throw roomErr;
      const roomId = roomRes.id;

      await supabase.from("room_member").insert([
        { room_id: roomId, user_id: user1 },
        { room_id: roomId, user_id: user2 },
      ]);

      processedMessageIds.push(u1.msg_id, u2.msg_id);

      const notify = async (uid: string) => {
        const ch = supabase.channel(`user:${uid}`);
        ch.subscribe();
        await ch.send({
          type: "broadcast",
          event: "stranger_matched",
          payload: { room: roomRes },
        });
        await supabase.removeChannel(ch);
      };

      await notify(user1);
      await notify(user2);

      pairedRooms.push(roomRes);
    }

    // 4. Delete processed queue messages
    for (const msgId of processedMessageIds) {
      const { error: delErr } = await supabase
        .schema("pgmq_public")
        .rpc("delete", {
          queue_name: "stranger-queue",
          message_id: msgId,
        });

      if (delErr) console.error(`Error deleting msg ${msgId}:`, delErr);
    }

    // 5. Handle leftover odd user
    if (users.length % 2 === 1) {
      const leftover = users.at(-1);
      const userId = leftover.message.userId as string;

      try {
        await supabase.schema("pgmq_public").rpc("delete", {
          queue_name: "stranger-queue",
          message_id: leftover.msg_id,
        });
      } catch (e) {
        console.error("Error deleting leftover msg:", e);
      }

      const ch = supabase.channel(`user:${userId}`);
      ch.subscribe();
      await ch.send({
        type: "broadcast",
        event: "stranger_idle",
        payload: { reason: "No match found this round, back to idle" },
      });
      await supabase.removeChannel(ch);
    }

    // 6. Clean up lobby channel before returning
    await supabase.removeChannel(lobbyChannel);

    console.log(`Matchmaker completed: matched ${pairedRooms.length} pairs`);

    // EXPLICIT RESPONSE RETURN - This fixes the InvalidWorkerResponse error
    return new Response(
      JSON.stringify({
        success: true,
        message: "Matchmaker completed successfully",
        stats: {
          totalUsers: users.length,
          pairedRooms: pairedRooms.length,
          processedMessages: processedMessageIds.length,
        },
        rooms: pairedRooms,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (err) {
    console.error("Matchmaker error:", err);

    // EXPLICIT ERROR RESPONSE - Also return proper response on error
    return new Response(
      JSON.stringify({
        success: false,
        error: "Matchmaker function failed",
        message: err instanceof Error ? err.message : "Unknown error occurred",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
});
