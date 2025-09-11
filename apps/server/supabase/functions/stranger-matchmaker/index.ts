import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")! // service role is required
);

Deno.serve(async (_req) => {
  try {
    console.log("Matchmaker function started");

    // 1. Read messages WITHOUT removing them from queue first
    const { data: msgs, error: readErr } = await supabase
      .schema("pgmq_public")
      .rpc("read", {
        // Changed from "receive" to "read" - this doesn't remove messages
        queue_name: "stranger-queue",
        n: 10,
        sleep_seconds: 0,
      });

    if (readErr) {
      console.error("Error reading queue:", readErr);
      throw readErr;
    }

    const users = msgs ?? [];
    console.log(`Found ${users.length} users in queue`);

    if (users.length < 2) {
      console.log("Not enough users to match");
      return new Response(
        JSON.stringify({ status: "waiting", reason: "Not enough users" }),
        { headers: { "Content-Type": "application/json" }, status: 200 }
      );
    }

    const pairedRooms: any[] = [];
    const processedMessageIds: bigint[] = [];

    // 2. Process in pairs
    for (let i = 0; i + 1 < users.length; i += 2) {
      const u1 = users[i];
      const u2 = users[i + 1];
      const user1 = u1.message.userId as string;
      const user2 = u2.message.userId as string;

      console.log(`Matching users: ${user1} with ${user2}`);

      // Create DM room
      const { data: roomRes, error: roomErr } = await supabase
        .from("room")
        .insert({
          name: `${user1}-${user2}`,
          is_dm: true, // Make sure this matches your schema (isDM vs is_dm)
          owner_id: user1,
        })
        .select("*")
        .single();

      if (roomErr) {
        console.error("Error creating room:", roomErr);
        throw roomErr;
      }

      const roomId = roomRes.id;
      console.log(`Created room: ${roomId}`);

      // Add room members
      const { error: memberErr } = await supabase.from("room_member").insert([
        { room_id: roomId, user_id: user1 },
        { room_id: roomId, user_id: user2 },
      ]);

      if (memberErr) {
        console.error("Error adding room members:", memberErr);
        throw memberErr;
      }

      // Track which messages to delete
      processedMessageIds.push(u1.msg_id, u2.msg_id);

      // Notify both users via broadcast
      console.log(`Notifying user: ${user1}`);
      const channel1 = supabase.channel(`user:${user1}`);
      channel1.subscribe();
      await channel1.send({
        type: "broadcast",
        event: "stranger_matched",
        payload: { room: roomRes },
      });

      console.log(`Notifying user: ${user2}`);
      const channel2 = supabase.channel(`user:${user2}`);
      channel2.subscribe();
      await channel2.send({
        type: "broadcast",
        event: "stranger_matched",
        payload: { room: roomRes },
      });

      // Clean up channels
      await supabase.removeChannel(channel1);
      await supabase.removeChannel(channel2);

      pairedRooms.push(roomRes);
    }

    // 3. Delete processed messages from queue
    if (processedMessageIds.length > 0) {
      console.log(`Deleting ${processedMessageIds.length} processed messages`);
      const { error: deleteErr } = await supabase
        .schema("pgmq_public")
        .rpc("delete", {
          // Use delete instead of archive
          queue_name: "stranger-queue",
          message_ids: processedMessageIds,
        });

      if (deleteErr) {
        console.error("Error deleting processed messages:", deleteErr);
      }
    }

    // 4. Handle leftover (odd user out) - keep them in queue
    if (users.length % 2 === 1) {
      const leftover = users.at(-1);
      const userId = leftover.message.userId as string;
      console.log(`User ${userId} is still waiting`);

      // Notify user they're still waiting (but keep them in queue)
      const channelLeftover = supabase.channel(`user:${userId}`);
      channelLeftover.subscribe();
      await channelLeftover.send({
        type: "broadcast",
        event: "stranger_waiting",
        payload: { reason: "No match found this round, still waiting" },
      });
      await supabase.removeChannel(channelLeftover);
    }

    console.log(`Matchmaker completed: matched ${pairedRooms.length} pairs`);
    return new Response(
      JSON.stringify({
        status: "ok",
        pairedRooms,
        matched: pairedRooms.length * 2,
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (err) {
    console.error("Matchmaker error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});
