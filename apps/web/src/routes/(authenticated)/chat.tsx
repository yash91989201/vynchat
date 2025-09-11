import type { MessageType, RoomType } from "@server/lib/types";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute, useRouteContext } from "@tanstack/react-router";
import {
  Loader2,
  LogOut,
  Send,
  SkipForward,
  Users,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
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
  const [dialogMessage, setDialogMessage] = useState<string | null>(null);

  const lobbyChannelRef = useRef<RealtimeChannel | null>(null);

  const { mutateAsync: findStranger, isPending } = useMutation(
    queryUtils.room.findStranger.mutationOptions({})
  );

  useEffect(() => {
    const lobbyChannel: RealtimeChannel = supabase.channel("lobby:global", {
      config: { presence: { key: userId } },
    });

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

  useEffect(() => {
    const personal = supabase.channel(`user:${userId}`, {
      config: { broadcast: { self: true } },
    });

    personal
      .on("broadcast", { event: "stranger_matched" }, ({ payload }) => {
        setStatus("matched");
        setCurrentRoom(payload.room);
      })
      .on("broadcast", { event: "stranger_waiting" }, () => {
        setStatus("waiting");
      })
      .on("broadcast", { event: "stranger_idle" }, () => {
        setStatus("idle");
        setCurrentRoom(undefined);
        setDialogMessage("No match found. Try again!");
      })
      .on("broadcast", { event: "stranger_skipped" }, ({ payload }) => {
        // Immediately set status to waiting since server already queued us
        setStatus("waiting");
        setCurrentRoom(undefined);

        // Show non-blocking toast notification instead of dialog
        toast.info("Finding new match", {
          description:
            payload.message ||
            "The stranger skipped you. Looking for a new match...",
        });

        // Immediately update presence to waiting (no delay needed)
        if (lobbyChannelRef.current) {
          lobbyChannelRef.current
            .track({ status: "waiting" })
            .then(() => {
              console.log("Updated presence to waiting after being skipped");
            })
            .catch((error) => {
              console.error("Failed to update presence after skip:", error);
              // If presence update fails, try to recover by setting idle and letting user retry
              setStatus("waiting");
              toast.error("Connection issue", {
                description: "Failed to rejoin matchmaking. Please try again.",
              });
            });
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(personal);
    };
  }, [userId]);

  const talkToStranger = async () => {
    setStatus("waiting");
    if (lobbyChannelRef.current) {
      await lobbyChannelRef.current.track({ status: "waiting" });
    }
    const result = await findStranger({});
    if (result.status === "waiting") {
      console.log("Enqueued, waiting for matchmaker to run…");
    }
  };

  const handleLeave = async () => {
    setStatus("idle");
    setCurrentRoom(undefined);
    if (lobbyChannelRef.current) {
      await lobbyChannelRef.current.track({ status: "idle" });
    }
  };

  const handleSkip = async () => {
    setStatus("waiting");
    setCurrentRoom(undefined);
    if (lobbyChannelRef.current) {
      await lobbyChannelRef.current.track({ status: "waiting" });
    }
  };

  if (status === "matched" && currentRoom) {
    return (
      <div className="h-full p-4">
        <ChatRoom
          onLeave={handleLeave}
          onSkip={handleSkip}
          roomId={currentRoom.id}
          userId={userId}
        />
      </div>
    );
  }

  return (
    <div className="flex h-full items-center justify-center p-4">
      <AlertDialog
        onOpenChange={() => setDialogMessage(null)}
        open={!!dialogMessage}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Notification</AlertDialogTitle>
            <AlertDialogDescription>{dialogMessage}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Talk to a Stranger</CardTitle>
          <CardDescription>
            Find a random person to chat with anonymously.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center space-y-4 p-6">
          {status === "idle" && (
            <Button
              className="w-full"
              disabled={isPending}
              onClick={talkToStranger}
              size="lg"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Finding...
                </>
              ) : (
                "Talk to Stranger"
              )}
            </Button>
          )}
          {status === "waiting" && (
            <div className="flex flex-col items-center space-y-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Looking for a stranger…</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center text-muted-foreground text-sm">
          <Users className="mr-2 h-4 w-4" />
          {lobbyCount} users online
        </CardFooter>
      </Card>
    </div>
  );
}

export function ChatRoom({
  roomId,
  userId,
  onLeave,
  onSkip,
}: {
  roomId: string;
  userId: string;
  onLeave: () => void;
  onSkip: () => void;
}) {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [input, setInput] = useState("");
  const [isChannelReady, setIsChannelReady] = useState(false);
  const [isStrangerTyping, setIsStrangerTyping] = useState(false);
  const [strangerLeft, setStrangerLeft] = useState(false);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const strangerTypingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { mutateAsync: sendMessage } = useMutation(
    queryUtils.message.send.mutationOptions({})
  );
  const { mutateAsync: leaveRoom } = useMutation(
    queryUtils.room.leave.mutationOptions({})
  );
  const { mutateAsync: skipStranger } = useMutation(
    queryUtils.room.skipStranger.mutationOptions({})
  );

  useEffect(() => {
    const loadMessages = async () => {
      try {
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
    const channel = supabase.channel(`room:${roomId}`, {
      config: {
        broadcast: { self: true, ack: true },
        presence: { key: userId },
      },
    });

    channel
      .on("broadcast", { event: "message" }, ({ payload }) => {
        setMessages((prev) => {
          if (prev.some((msg) => msg.id === payload.id)) return prev;
          return [...prev, payload];
        });
      })
      .on("broadcast", { event: "room_closed" }, () => {
        setStrangerLeft(true);
      })
      .on("broadcast", { event: "typing" }, ({ payload }) => {
        if (payload.senderId === userId) return;

        setIsStrangerTyping(true);

        if (strangerTypingTimeoutRef.current) {
          clearTimeout(strangerTypingTimeoutRef.current);
        }

        strangerTypingTimeoutRef.current = setTimeout(() => {
          setIsStrangerTyping(false);
        }, 3000);
      })
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          setIsChannelReady(true);
        }
      });

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
      setIsChannelReady(false);
      if (strangerTypingTimeoutRef.current) {
        clearTimeout(strangerTypingTimeoutRef.current);
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [userId, roomId]);

  const handleSend = async () => {
    if (!(input.trim() && isChannelReady)) return;
    try {
      const msg = await sendMessage({ roomId, content: input });
      if (channelRef.current) {
        await channelRef.current.send({
          type: "broadcast",
          event: "message",
          payload: msg,
        });
      }
      setInput("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleLeave = async () => {
    try {
      if (channelRef.current) {
        await channelRef.current.send({
          type: "broadcast",
          event: "room_closed",
          payload: {},
        });
      }
      await leaveRoom({ roomId });
      onLeave();
    } catch (error) {
      console.error("Error leaving room:", error);
      onLeave();
    }
  };

  const handleSkip = async () => {
    try {
      await skipStranger({ roomId });
      toast.success("Finding new match", {
        description: "Looking for a new stranger to chat with...",
      });
      onSkip();
    } catch (error) {
      console.error("Error skipping stranger:", error);
      toast.error("Error", {
        description: "Failed to skip stranger. Please try again.",
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newText = e.target.value;
    setInput(newText);

    if (!(channelRef.current && isChannelReady)) return;

    if (newText && !isTypingRef.current) {
      isTypingRef.current = true;
      channelRef.current.send({
        type: "broadcast",
        event: "typing",
        payload: { senderId: userId },
      });
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      isTypingRef.current = false;
    }, 2000);
  };

  return (
    <>
      <AlertDialog
        onOpenChange={() => {
          setStrangerLeft(false);
          onLeave();
        }}
        open={strangerLeft}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Chat Ended</AlertDialogTitle>
            <AlertDialogDescription>
              The stranger has left the chat.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>Find New Stranger</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Card className="flex h-full flex-col">
        <CardHeader className="flex flex-row items-center justify-between border-b">
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarImage src="/placeholder-user.jpg" />
              <AvatarFallback>ST</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-sm leading-none">Stranger</p>
              <p className="text-muted-foreground text-sm">
                {isChannelReady ? (
                  <span className="flex items-center text-green-500">
                    <Wifi className="mr-1 h-3 w-3" /> Connected
                  </span>
                ) : (
                  <span className="flex items-center">
                    <WifiOff className="mr-1 h-3 w-3" /> Connecting...
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button onClick={handleSkip} size="icon" variant="outline">
              <SkipForward className="h-4 w-4" />
            </Button>
            <Button onClick={handleLeave} size="icon" variant="destructive">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 p-0">
          <ScrollArea className="h-[calc(100vh-220px)] p-4" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.map((m) => (
                <div
                  className={cn(
                    "flex items-end gap-2",
                    m.senderId === userId ? "justify-end" : "justify-start"
                  )}
                  key={m.id}
                >
                  {m.senderId !== userId && (
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/placeholder-user.jpg" />
                      <AvatarFallback>ST</AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={cn(
                      "max-w-xs rounded-lg p-3 text-sm",
                      m.senderId === userId
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    )}
                  >
                    <p>{m.content}</p>
                  </div>
                </div>
              ))}
              {isStrangerTyping && (
                <div className="flex items-end justify-start gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder-user.jpg" />
                    <AvatarFallback>ST</AvatarFallback>
                  </Avatar>
                  <div className="rounded-lg bg-muted p-3 text-sm">
                    <div className="flex items-center gap-1">
                      <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.3s]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.15s]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
        <CardFooter className="border-t p-4">
          <div className="flex w-full items-center space-x-2">
            <Input
              disabled={!isChannelReady}
              onChange={handleInputChange}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder={
                isChannelReady ? "Type a message..." : "Connecting..."
              }
              value={input}
            />
            <Button
              disabled={!(isChannelReady && input.trim())}
              onClick={handleSend}
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      </Card>
    </>
  );
}
