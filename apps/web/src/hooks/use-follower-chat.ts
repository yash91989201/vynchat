import type { RealtimeChannel } from "@supabase/supabase-js";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { Member, Room } from "@/components/chat/chat-room/types";
import { supabase } from "@/lib/supabase";
import type { ChatMessage } from "@/lib/types";
import { queryUtils } from "@/utils/orpc";

export const useFollowerChat = (currentUser: Member, otherUser: Member) => {
  const [room, setRoom] = useState<Room | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const channelRef = useRef<RealtimeChannel | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const otherUserTypingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { mutate: getOrCreateChat, isPending: isCreatingChat } = useMutation(
    queryUtils.dm.getOrCreateChat.mutationOptions({
      onSuccess: (data) => {
        setRoom(data as Room);
      },
      onError: (error) => {
        toast.error(`Failed to start chat: ${error.message}`);
      },
    })
  );

  useEffect(() => {
    if (otherUser) {
      getOrCreateChat({ otherUserId: otherUser.id });
    }
  }, [otherUser, getOrCreateChat]);

  const { data: initialMessages } = useQuery(
    queryUtils.message.list.queryOptions({
      input: {
        roomId: room?.id ?? "",
      },
      enabled: !!room,
    })
  );

  useEffect(() => {
    if (initialMessages) {
      setMessages(initialMessages);
    }
  }, [initialMessages]);

  const { mutateAsync: sendMessage } = useMutation(
    queryUtils.message.send.mutationOptions({
      onError: () => {
        toast.error(
          "You can only send 3 messages before the other person replies."
        );
      },
    })
  );

  useEffect(() => {
    if (!room) return;

    const channel = supabase.channel(`room:${room.id}`, {
      config: {
        broadcast: { self: false },
        presence: { key: currentUser.id },
      },
    });
    channelRef.current = channel;

    channel
      .on("broadcast", { event: "message" }, ({ payload }) => {
        setMessages((prev) => [...prev, payload]);
      })
      .on("broadcast", { event: "typing" }, ({ payload }) => {
        if (payload.senderId === currentUser.id) return;
        setOtherUserTyping(true);
        if (otherUserTypingTimeoutRef.current)
          clearTimeout(otherUserTypingTimeoutRef.current);
        otherUserTypingTimeoutRef.current = setTimeout(
          () => setOtherUserTyping(false),
          3000
        );
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [room, currentUser.id]);

  const handleSend = useCallback(async () => {
    if (!(input.trim() && room)) return;
    const msg = await sendMessage({ roomId: room.id, content: input });
    setMessages((prev) => [...prev, msg]);
    if (channelRef.current) {
      channelRef.current.send({
        type: "broadcast",
        event: "message",
        payload: msg,
      });
    }
  }, [input, room, sendMessage]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setInput(newValue);
      if (newValue && !isTyping && channelRef.current) {
        setIsTyping(true);
        channelRef.current.send({
          type: "broadcast",
          event: "typing",
          payload: { senderId: currentUser.id },
        });
      }
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 2000);
    },
    [isTyping, currentUser.id]
  );

  const uploadFile = useCallback(async (file: File) => {
    if (!room || isUploading) return;

    setIsUploading(true);
    try {
      const filePath = `${room.id}/${currentUser.id}-${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("chat-message-file")
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: publicUrlData } = supabase.storage
        .from("chat-message-file")
        .getPublicUrl(filePath);

      if (!publicUrlData.publicUrl) {
        throw new Error("Could not get public URL");
      }

      const msg = await sendMessage({
        roomId: room.id,
        content: publicUrlData.publicUrl,
      });

      setMessages((prev) => [...prev, msg]);

      if (channelRef.current) {
        channelRef.current.send({
          type: "broadcast",
          event: "message",
          payload: msg,
        });
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Failed to send file.");
    } finally {
      setIsUploading(false);
    }
  }, [room, isUploading, currentUser.id, sendMessage]);

  return {
    room,
    messages,
    input,
    otherUserTyping,
    handleSend,
    handleInputChange,
    isLoading: isCreatingChat,
    isUploading,
    uploadFile,
  };
};
