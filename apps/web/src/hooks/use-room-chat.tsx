import type { MessageType } from "@server/lib/types";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { queryUtils } from "@/utils/orpc";

export const useRoomChat = (userId: string) => {
  const [selectedRoomId, setSelectedRoomId] = useState<string | undefined>();
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [strangerTyping, setStrangerTyping] = useState(false);

  const channelRef = useRef<RealtimeChannel | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const strangerTypingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const queryClient = useQueryClient();

  const { data: globalRooms = [] } = useQuery(
    queryUtils.room.listRooms.queryOptions()
  );
  const { data: myRooms = [] } = useQuery(
    queryUtils.room.getMyRooms.queryOptions()
  );

  const { data: messages = [] } = useQuery({
    ...queryUtils.message.list.queryOptions({
      input: {
        roomId: selectedRoomId ?? "",
      },
    }),
    enabled: !!selectedRoomId,
  });

  const { mutateAsync: sendMessage } = useMutation(
    queryUtils.message.send.mutationOptions({})
  );

  const { mutate: createRoom } = useMutation(
    queryUtils.room.create.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: queryUtils.room.getMyRooms.queryKey(),
        });
        toast.success("Room created successfully");
      },
    })
  );

  const { mutate: joinRoom } = useMutation(
    queryUtils.room.join.mutationOptions({
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries({
          queryKey: queryUtils.room.getMyRooms.queryKey(),
        });
        setSelectedRoomId(variables.roomId);
        toast.success(data.message);
      },
    })
  );

  const handleSelectRoom = (roomId: string) => {
    const isMyRoom = myRooms.some((r) => r.id === roomId);
    if (isMyRoom) {
      setSelectedRoomId(roomId);
    } else {
      joinRoom({ roomId });
    }
  };

  const clearTimeouts = useCallback(() => {
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    if (strangerTypingTimeoutRef.current)
      clearTimeout(strangerTypingTimeoutRef.current);
  }, []);

  useEffect(() => {
    if (!selectedRoomId) return;

    const channel = supabase.channel(`room:${selectedRoomId}`, {
      config: {
        broadcast: { self: true, ack: true },
        presence: { key: userId },
      },
    });

    channel
      .on("broadcast", { event: "message" }, ({ payload }) => {
        queryClient.setQueryData<MessageType[]>(
          queryUtils.message.list.queryKey({
            input: { roomId: selectedRoomId },
          }),
          (oldData) => {
            if (oldData?.some((msg) => msg.id === payload.id)) {
              return oldData;
            }
            return oldData ? [...oldData, payload] : [payload];
          }
        );
      })
      .on("broadcast", { event: "typing" }, ({ payload }) => {
        if (payload.senderId === userId) return;
        setStrangerTyping(true);
        if (strangerTypingTimeoutRef.current)
          clearTimeout(strangerTypingTimeoutRef.current);
        strangerTypingTimeoutRef.current = setTimeout(
          () => setStrangerTyping(false),
          3000
        );
      })
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
      clearTimeouts();
    };
  }, [selectedRoomId, userId, queryClient, clearTimeouts]);

  const handleSend = async () => {
    if (!(input.trim() && selectedRoomId)) return;

    try {
      const msg = await sendMessage({ roomId: selectedRoomId, content: input });
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
      toast.error("Failed to send message");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    if (!channelRef.current) return;

    if (e.target.value && !isTyping) {
      setIsTyping(true);
      channelRef.current.send({
        type: "broadcast",
        event: "typing",
        payload: { senderId: userId },
      });
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 2000);
  };

  const selectedRoom = [...myRooms, ...globalRooms].find(
    (r) => r.id === selectedRoomId
  );

  return {
    globalRooms,
    myRooms,
    selectedRoomId,
    selectedRoom,
    messages,
    input,
    isTyping,
    strangerTyping,
    handleSelectRoom,
    handleSend,
    handleInputChange,
    createRoom,
  };
};
