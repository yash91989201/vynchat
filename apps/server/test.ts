import { createId } from "@paralleldrive/cuid2";
import { createClient, type RealtimeChannel } from "@supabase/supabase-js";
import { sleep } from "bun";

const SUPABASE_URL = "http://localhost:54321";
const SUPABASE_SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Subscribe to lobby presence so we can read presenceState()
const lobbyChannel: RealtimeChannel = supabase.channel("lobby:global", {
  config: { presence: { enabled: true } },
});

lobbyChannel.subscribe();
console.log("Subscribed to lobby:global presence");

// give presence time to sync
await new Promise((r) => setTimeout(r, 1000));

const isWaiting = (presenceState: any, userId: string) => {
  const pres = presenceState[userId] as any[] | undefined;
  return pres?.some((p) => p.status === "waiting");
};

while (true) {
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

    // 2. Get current lobby presence snapshot
    const presenceState = lobbyChannel.presenceState();

    // 3. Process in pairs, but only if both are waiting
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
        // We'll remove their queue messages — they will be notified appropriately
        processedMessageIds.push(u1.msg_id, u2.msg_id);
        continue;
      }

      console.log(`Matching users: ${user1} with ${user2}`);

      // create room
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

      // mark for removal from queue
      processedMessageIds.push(u1.msg_id, u2.msg_id);

      // notify both users (clients will set their own presence to matched)
      const notify = async (uid: string) => {
        const ch = supabase.channel(`user:${uid}`);
        await ch.subscribe();
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

    // 4. Delete processed queue messages one-by-one (pgmq delete expects single id)
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
      const leftover = users.at(-1)!;
      const userId = leftover.message.userId as string;

      // ALWAYS remove leftover msg (we will re-enqueue if client still wants to wait)
      try {
        await supabase.schema("pgmq_public").rpc("delete", {
          queue_name: "stranger-queue",
          message_id: leftover.msg_id,
        });
      } catch (e) {
        console.error("Error deleting leftover msg:", e);
      }

      // Notify client to go back to idle (client will update its own presence)
      const ch = supabase.channel(`user:${userId}`);
      await ch.subscribe();
      await ch.send({
        type: "broadcast",
        event: "stranger_idle",
        payload: { reason: "No match found this round, back to idle" },
      });
      await supabase.removeChannel(ch);
    }

    console.log(`Matchmaker completed: matched ${pairedRooms.length} pairs`);
    await sleep(10_000); // wait before next cycle
  } catch (err) {
    console.error("Matchmaker error:", err);
    await sleep(10_000);
  }
}
