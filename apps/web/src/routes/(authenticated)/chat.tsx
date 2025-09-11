import type { MessageType, RoomType } from "@server/lib/types";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute, useRouteContext } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { queryUtils } from "@/utils/orpc";

export const Route = createFileRoute("/(authenticated)/chat")({
  component: RouteComponent,
});

function RouteComponent() {
  const { session } = useRouteContext({ from: "/(authenticated)" });
  const userId = session.user.id;

  const [lobbyCount, setLobbyCount] = useState(0);
  const [status, setStatus] = useState<"idle" | "waiting" | "matched">("idle");
  const [currentRoom, setCurrentRoom] = useState<RoomType | undefined>();

  const { mutateAsync: findStranger, isPending } = useMutation(
    queryUtils.room.findStranger.mutationOptions({})
  );

  // 1. join lobby presence
  useEffect(() => {
    const lobbyChannel: RealtimeChannel = supabase.channel("lobby:global", {
      config: { presence: { key: userId } },
    });

    lobbyChannel
      .on("presence", { event: "sync" }, () => {
        const state = lobbyChannel.presenceState();
        setLobbyCount(Object.keys(state).length);
      })
      .subscribe(async (st) => {
        if (st === "SUBSCRIBED") {
          await lobbyChannel.track({ status: "idle" });
        }
      });

    return () => {
      supabase.removeChannel(lobbyChannel);
    };
  }, [userId]);

  // 2. listen for personal notifications (match results)
  useEffect(() => {
    const personal = supabase.channel(`user:${userId}`, {
      config: { broadcast: { self: true } },
    });

    personal
      .on("broadcast", { event: "stranger_matched" }, ({ payload }) => {
        console.log("Matched!", payload.room);
        setStatus("matched");
        setCurrentRoom(payload.room);
      })
      .on("broadcast", { event: "stranger_waiting" }, () => {
        console.log("Still waiting…");
        setStatus("waiting");
      })
      .subscribe();

    return () => {
      supabase.removeChannel(personal);
    };
  }, [userId]);

  const talkToStranger = async () => {
    setStatus("waiting");
    const result = await findStranger({}); // enqueues user
    if (result.status === "waiting") {
      console.log("Enqueued, waiting for matchmaker to run…");
    }
  };

  const handleLeave = () => {
    setStatus("idle");
    setCurrentRoom(undefined);
  };

  return (
    <div className="h-full space-y-4 p-4">
      <p>Users online: {lobbyCount}</p>

      {status === "idle" && (
        <Button disabled={isPending} onClick={talkToStranger}>
          {isPending ? "Finding..." : "Talk to Stranger"}
        </Button>
      )}

      {status === "waiting" && <p>Looking for a stranger…</p>}

      {status === "matched" && currentRoom && (
        <div className="h-[80vh]">
          <h2 className="mb-2 font-semibold text-lg">
            Matched! Room: {currentRoom.id}
          </h2>
          <ChatRoom
            onLeave={handleLeave}
            roomId={currentRoom.id}
            userId={userId}
          />
        </div>
      )}
    </div>
  );
}

export function ChatRoom({
  roomId,
  userId,
  onLeave,
}: {
  roomId: string;
  userId: string;
  onLeave: () => void; // callback to reset state in parent
}) {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [input, setInput] = useState("");

  const { mutateAsync: sendMessage } = useMutation(
    queryUtils.message.send.mutationOptions({})
  );
  const { mutateAsync: leaveRoom } = useMutation(
    queryUtils.room.leave.mutationOptions({}) // 👈 you'll implement this in backend
  );

  useEffect(() => {
    const channel = supabase
      .channel(`room:${roomId}`, {
        config: { broadcast: { self: true, ack: true } },
      })
      .on("broadcast", { event: "message" }, ({ payload }) => {
        setMessages((prev) => [...prev, payload]);
      })
      .on("broadcast", { event: "room_closed" }, () => {
        // other user left
        alert("The stranger left the chat.");
        onLeave();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId, onLeave]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const msg = await sendMessage({ roomId, content: input });
    setMessages((prev) => [...prev, msg]); // optimistic
    setInput("");
  };

  const handleLeave = async () => {
    await leaveRoom({ roomId }); // backend removes room, members, messages
    // notify the other user
    await supabase.channel(`room:${roomId}`).send({
      type: "broadcast",
      event: "room_closed",
      payload: {},
    });
    onLeave();
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-2 overflow-y-auto rounded border p-2">
        {messages.map((m) => (
          <div
            className={m.senderId === userId ? "text-right" : "text-left"}
            key={m.id}
          >
            <span className="inline-block rounded bg-gray-200 px-2 py-1">
              {m.content}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-2">
        <input
          className="flex-1 rounded border px-2 py-1"
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          value={input}
        />
        <Button onClick={handleSend}>Send</Button>
        <Button onClick={handleLeave} variant="destructive">
          Leave
        </Button>
      </div>
    </div>
  );
}
