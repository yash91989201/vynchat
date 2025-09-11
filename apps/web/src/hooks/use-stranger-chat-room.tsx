import type { MessageType } from "@server/lib/types";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { useMutation } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { queryUtils } from "@/utils/orpc";

export const useChatRoom = (roomId: string, userId: string) => {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [input, setInput] = useState("");
  const [isChannelReady, setIsChannelReady] = useState(false);
  const [isStrangerTyping, setIsStrangerTyping] = useState(false);
  const [strangerLeft, setStrangerLeft] = useState(false);

  const channelRef = useRef<RealtimeChannel | null>(null);
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

  const clearTimeouts = useCallback(() => {
    if (strangerTypingTimeoutRef.current) {
      clearTimeout(strangerTypingTimeoutRef.current);
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  }, []);

  // Load existing messages
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

  // Setup realtime channel
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
      clearTimeouts();
    };
  }, [userId, roomId, clearTimeouts]);

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

  const handleLeave = async (onLeave: () => void) => {
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

  const handleSkip = async (onSkip: () => void) => {
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

  return {
    messages,
    input,
    isChannelReady,
    isStrangerTyping,
    strangerLeft,
    setStrangerLeft,
    handleSend,
    handleLeave,
    handleSkip,
    handleInputChange,
  };
};
