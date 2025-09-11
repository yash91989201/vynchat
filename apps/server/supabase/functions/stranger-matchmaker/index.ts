import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")! // service role is required
);

Deno.serve(async (_req) => {
  try {
    // 1. Pop up to 10 users
    const { data: msgs, error: popErr } = await supabase
      .schema("pgmq_public")
      .rpc("receive", {
        queue_name: "stranger-queue",
        sleep_seconds: 0,
        n: 10,
      });

    if (popErr) throw popErr;

    const users = msgs ?? [];
    if (users.length < 2) {
      return new Response(
        JSON.stringify({ status: "waiting", reason: "Not enough users" }),
        { headers: { "Content-Type": "application/json" }, status: 200 }
      );
    }

    const pairedRooms: any[] = [];

    // 2. Process in pairs
    for (let i = 0; i + 1 < users.length; i += 2) {
      const u1 = users[i];
      const u2 = users[i + 1];
      const user1 = u1.message.userId as string;
      const user2 = u2.message.userId as string;

      // create DM room
      const { data: roomRes, error: roomErr } = await supabase
        .from("room")
        .insert({
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

      // archive processed messages
      await supabase.schema("pgmq_public").rpc("archive", {
        queue_name: "stranger-queue",
        message_id: [u1.msg_id, u2.msg_id],
      });

      // notify both users
      await supabase.channel(`user:${user1}`).send({
        type: "broadcast",
        event: "stranger_matched",
        payload: { room: roomRes },
      });

      await supabase.channel(`user:${user2}`).send({
        type: "broadcast",
        event: "stranger_matched",
        payload: { room: roomRes },
      });

      pairedRooms.push(roomRes);
    }

    // 3. Handle leftover (odd user out)
    if (users.length % 2 === 1) {
      const leftover = users.at(-1);
      const userId = leftover.message.userId as string;

      // archive their message (so they aren’t stuck forever)
      await supabase.schema("pgmq_public").rpc("archive", {
        queue_name: "stranger-queue",
        message_id: [leftover.msg_id],
      });

      // notify user they’re still waiting
      await supabase.channel(`user:${userId}`).send({
        type: "broadcast",
        event: "stranger_waiting",
        payload: { reason: "No match found this round, still waiting" },
      });
    }

    return new Response(JSON.stringify({ status: "ok", pairedRooms }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err) {
    console.error("Matchmaker error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});
