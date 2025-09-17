import type { RealtimeChannel } from "@supabase/supabase-js";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import type { Member } from "@/components/chat/chat-room/types";
import { supabase } from "@/lib/supabase";
import type { ChatMessage } from "@/lib/types";
import { queryClient, queryUtils } from "@/utils/orpc";

export const useRoomChat = (user: Member, roomIdFromUrl?: string) => {
  const [selectedRoomId, setSelectedRoomId] = useState<string | undefined>();
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [strangerTyping, setStrangerTyping] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const channelRef = useRef<RealtimeChannel | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const strangerTypingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const sessionIdRef = useRef<string>(
    `${Date.now()}_${Math.random().toString(36).substring(2)}`
  );

  const userRef = useRef(user);
  userRef.current = user;

  const { data: globalRooms = [], isSuccess: globalRoomsSuccess } = useQuery(
    queryUtils.room.listRooms.queryOptions()
  );
  const { data: myRooms = [], isSuccess: myRoomsSuccess } = useQuery(
    queryUtils.room.getMyRooms.queryOptions()
  );

  const { mutateAsync: sendMessage } = useMutation(
    queryUtils.message.send.mutationOptions({})
  );

  const { data: initialMessages } = useQuery(
    queryUtils.message.list.queryOptions({
      input: {
        roomId: selectedRoomId ?? "",
      },
      enabled: !!selectedRoomId,
    })
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
      onError: (error) => {
        toast.error(error.message);
      },
    })
  );

  const { mutate: leaveRoom } = useMutation(
    queryUtils.room.leave.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: queryUtils.room.getMyRooms.queryKey(),
        });
        toast.success("Left room successfully");
      },
    })
  );

  const { mutate: toggleLock } = useMutation(
    queryUtils.room.toggleLock.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: queryUtils.room.getMyRooms.queryKey(),
        });
        queryClient.invalidateQueries({
          queryKey: queryUtils.room.listRooms.queryKey(),
        });
        toast.success("Room lock status updated");
      },
      onError: (error) => {
        toast.error(error.message);
      },
    })
  );

  const handleSelectRoom = useCallback(
    (roomId: string) => {
      if (selectedRoomId && selectedRoomId !== roomId) {
        leaveRoom({ roomId: selectedRoomId });
      }

      const isMyRoom = myRooms.some((r) => r.id === roomId);
      if (isMyRoom) {
        setSelectedRoomId(roomId);
      } else {
        joinRoom({ roomId });
      }
    },
    [selectedRoomId, myRooms, joinRoom, leaveRoom]
  );

  useEffect(() => {
    if (
      roomIdFromUrl &&
      myRoomsSuccess &&
      globalRoomsSuccess &&
      roomIdFromUrl !== selectedRoomId
    ) {
      handleSelectRoom(roomIdFromUrl);
    }
  }, [
    roomIdFromUrl,
    myRoomsSuccess,
    globalRoomsSuccess,
    handleSelectRoom,
    selectedRoomId,
  ]);

  const handleLeaveRoom = useCallback(() => {
    if (selectedRoomId) {
      leaveRoom({ roomId: selectedRoomId });
      setSelectedRoomId(undefined);
    }
  }, [selectedRoomId, leaveRoom]);

  useEffect(() => {
    if (!selectedRoomId) {
      setMessages([]);
      return;
    }

    if (initialMessages) {
      setMessages(initialMessages);
    }
  }, [selectedRoomId, initialMessages]);

  useEffect(() => {
    if (!selectedRoomId) {
      setMembers([]);
      return;
    }

    const currentUser = userRef.current;

    const presenceKey = `${currentUser.id}_${sessionIdRef.current}`;
    let isSubscribed = false;
    let channel: RealtimeChannel | null = null;

    const clearTimeouts = () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      if (strangerTypingTimeoutRef.current)
        clearTimeout(strangerTypingTimeoutRef.current);
    };

    const processPresenceState = (presenceState: Record<string, Member[]>) => {
      const memberMap = new Map<string, Member>();

      for (const presenceList of Object.values(presenceState)) {
        for (const member of presenceList) {
          if (member?.id) {
            memberMap.set(member.id, member);
          }
        }
      }

      return Array.from(memberMap.values());
    };

    const updateMembersState = (newMembers: Member[]) => {
      setMembers((prevMembers) => {
        if (prevMembers.length !== newMembers.length) {
          return newMembers;
        }

        const prevIds = new Set(prevMembers.map((m) => m.id));
        const newIds = new Set(newMembers.map((m) => m.id));

        for (const id of newIds) {
          if (!prevIds.has(id)) {
            return newMembers;
          }
        }

        return prevMembers;
      });
    };

    const initializeChannel = () => {
      channel = supabase.channel(`room:${selectedRoomId}`, {
        config: {
          broadcast: { self: false, ack: false },
          presence: { key: presenceKey },
        },
      });

      const updateMembersList = () => {
        if (!isSubscribed) return;
        if (!channel) return;

        const presenceState = channel.presenceState<Member>();
        const uniqueMembers = processPresenceState(presenceState);
        updateMembersState(uniqueMembers);
      };

      channel
        .on("presence", { event: "sync" }, updateMembersList)
        .on("presence", { event: "join" }, updateMembersList)
        .on("presence", { event: "leave" }, updateMembersList)
        .on("broadcast", { event: "message" }, ({ payload }) => {
          if (!payload) return;
          if (!selectedRoomId) return;

          setMessages((prev) => {
            const messageExists = prev.some((msg) => msg.id === payload.id);
            if (messageExists) {
              return prev;
            }
            return [...prev, payload];
          });
        })
        .on("broadcast", { event: "typing" }, ({ payload }) => {
          if (payload.senderId === currentUser.id) return;
          setStrangerTyping(true);
          if (strangerTypingTimeoutRef.current)
            clearTimeout(strangerTypingTimeoutRef.current);
          strangerTypingTimeoutRef.current = setTimeout(
            () => setStrangerTyping(false),
            3000
          );
        })
        .on("broadcast", { event: "user_banned" }, ({ payload }) => {
          if (
            payload.userId === currentUser.id &&
            payload.roomId === selectedRoomId
          ) {
            handleLeaveRoom();
            toast.error("You have been banned from this room.");
            queryClient.invalidateQueries({
              queryKey: queryUtils.room.listRooms.queryKey(),
            });
          }
        })
        .subscribe(async (status) => {
          if (status === "SUBSCRIBED") {
            isSubscribed = true;
            await channel?.track({
              id: currentUser.id,
              name: currentUser.name,
              image: currentUser.image,
            });
            updateMembersList();
          }
        });

      channelRef.current = channel;
    };

    initializeChannel();

    return () => {
      isSubscribed = false;
      if (channel) {
        supabase.removeChannel(channel);
      }
      channelRef.current = null;
      clearTimeouts();
      setMembers([]);
    };
  }, [selectedRoomId, handleLeaveRoom]);

  const handleSend = useCallback(async () => {
    if (!(input.trim() && selectedRoomId)) return;

    try {
      const msg = await sendMessage({ roomId: selectedRoomId, content: input });

      setMessages((prev) => [...prev, msg]);

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
  }, [input, selectedRoomId, sendMessage]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setInput(newValue);

      if (!channelRef.current) return;

      if (newValue && !isTyping) {
        setIsTyping(true);
        channelRef.current.send({
          type: "broadcast",
          event: "typing",
          payload: { senderId: userRef.current.id },
        });
      }

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 2000);
    },
    [isTyping]
  );

  const uploadFile = useCallback(
    async (file: File) => {
      if (!selectedRoomId || isUploading) return;

      setIsUploading(true);
      try {
        const filePath = `${selectedRoomId}/${
          userRef.current.id
        }-${Date.now()}-${file.name}`;
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
          roomId: selectedRoomId,
          content: publicUrlData.publicUrl,
        });

        setMessages((prev) => [...prev, msg]);

        if (channelRef.current) {
          await channelRef.current.send({
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
    },
    [selectedRoomId, isUploading, sendMessage]
  );

  const selectedRoom = useMemo(() => {
    return [...myRooms, ...globalRooms].find((r) => r.id === selectedRoomId);
  }, [myRooms, globalRooms, selectedRoomId]);

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
    members,
    handleLeaveRoom,
    toggleLock,
    isUploading,
    uploadFile,
  };
};
