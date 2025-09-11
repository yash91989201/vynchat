import type { MessageType, RoomType } from "@server/lib/types";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute, useRouteContext } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
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

  // Keep a reference to the lobby channel so we can reuse it
  const lobbyChannelRef = useRef<RealtimeChannel | null>(null);

  const { mutateAsync: findStranger, isPending } = useMutation(
    queryUtils.room.findStranger.mutationOptions({})
  );

  // 1. join lobby presence
  useEffect(() => {
    const lobbyChannel: RealtimeChannel = supabase.channel("lobby:global", {
      config: { presence: { key: userId } },
    });

    // Store reference for later use
    lobbyChannelRef.current = lobbyChannel;

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
      lobbyChannelRef.current = null;
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
      .on("broadcast", { event: "stranger_idle" }, () => {
        console.log("No match found, back to idle");
        setStatus("idle");
        setCurrentRoom(undefined);
        alert("No match found. Try again!");
      })
      .subscribe();

    return () => {
      supabase.removeChannel(personal);
    };
  }, [userId]);

  const talkToStranger = async () => {
    setStatus("waiting");

    // Update presence on existing channel
    if (lobbyChannelRef.current) {
      await lobbyChannelRef.current.track({ status: "waiting" });
    }

    const result = await findStranger({}); // enqueues user
    if (result.status === "waiting") {
      console.log("Enqueued, waiting for matchmaker to run…");
    }
  };

  const handleLeave = async () => {
    setStatus("idle");
    setCurrentRoom(undefined);

    // Update presence on existing channel instead of creating a new one
    if (lobbyChannelRef.current) {
      await lobbyChannelRef.current.track({ status: "idle" });
    }
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
  onLeave: () => void;
}) {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [input, setInput] = useState("");
  const [isChannelReady, setIsChannelReady] = useState(false);
  const channelRef = useRef<RealtimeChannel | null>(null);

  const { mutateAsync: sendMessage } = useMutation(
    queryUtils.message.send.mutationOptions({})
  );
  const { mutateAsync: leaveRoom } = useMutation(
    queryUtils.room.leave.mutationOptions({})
  );

  // Load existing messages when component mounts
  useEffect(() => {
    const loadMessages = async () => {
      try {
        // Assuming you have a way to fetch existing messages
        // If not, you'll need to add this to your backend
        const { data: existingMessages } = await supabase
          .from("message")
          .select("*")
          .eq("room_id", roomId)
          .order("created_at", { ascending: true });

        if (existingMessages) {
          setMessages(existingMessages);
        }
      } catch (error) {
        console.error("Error loading messages:", error);
      }
    };

    loadMessages();
  }, [roomId]);

  useEffect(() => {
    const channel = supabase
      .channel(`room:${roomId}`, {
        config: {
          broadcast: { self: true, ack: true },
          presence: { key: userId },
        },
      })
      .on("broadcast", { event: "message" }, ({ payload }) => {
        console.log("Received message:", payload);
        // Add the message regardless of sender to ensure consistency
        // We'll handle deduplication by checking if message already exists
        setMessages((prev) => {
          const messageExists = prev.some((msg) => msg.id === payload.id);
          if (messageExists) {
            return prev;
          }
          return [...prev, payload];
        });
      })
      .on("broadcast", { event: "room_closed" }, () => {
        alert("The stranger left the chat.");
        onLeave();
      })
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          setIsChannelReady(true);
          console.log("Channel subscribed successfully");
        }
      });

    // Store the channel reference
    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      setIsChannelReady(false);
    };
  }, [userId, roomId, onLeave]);

  const handleSend = async () => {
    if (!(input.trim() && isChannelReady)) return;

    try {
      // First, send message to backend
      const msg = await sendMessage({ roomId, content: input });

      // Then broadcast to all users in the room (including self for consistency)
      if (channelRef.current) {
        await channelRef.current.send({
          type: "broadcast",
          event: "message",
          payload: {
            id: msg.id,
            content: msg.content,
            senderId: msg.senderId,
            roomId: msg.roomId,
            createdAt: msg.createdAt,
            // Add any other fields from your message type
          },
        });
      }

      setInput("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleLeave = async () => {
    try {
      // Notify the other user first
      if (channelRef.current) {
        await channelRef.current.send({
          type: "broadcast",
          event: "room_closed",
          payload: {},
        });
      }

      // Then leave the room (this will delete the room and cleanup)
      await leaveRoom({ roomId });

      onLeave();
    } catch (error) {
      console.error("Error leaving room:", error);
      onLeave(); // Still call onLeave to reset UI state
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-2 overflow-y-auto rounded border p-2">
        {messages.map((m) => (
          <div
            className={m.senderId === userId ? "text-right" : "text-left"}
            key={m.id}
          >
            <span
              className={`inline-block rounded px-2 py-1 ${
                m.senderId === userId
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-black"
              }`}
            >
              {m.content}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-2">
        <input
          className="flex-1 rounded border px-2 py-1"
          disabled={!isChannelReady}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder={isChannelReady ? "Type a message..." : "Connecting..."}
          value={input}
        />
        <Button
          disabled={!(isChannelReady && input.trim())}
          onClick={handleSend}
        >
          Send
        </Button>
        <Button onClick={handleLeave} variant="destructive">
          Leave
        </Button>
      </div>
    </div>
  );
}
