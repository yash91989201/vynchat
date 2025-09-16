import type { RealtimeChannel } from "@supabase/supabase-js";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import type { Member } from "@/components/chat/chat-room/types";
import { supabase } from "@/lib/supabase";
import type { ChatMessage } from "@/lib/types";
import { queryClient, queryUtils } from "@/utils/orpc";

export const useRoomChat = (user: Member) => {
  const [selectedRoomId, setSelectedRoomId] = useState<string | undefined>();
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [strangerTyping, setStrangerTyping] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const channelRef = useRef<RealtimeChannel | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const strangerTypingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const sessionIdRef = useRef<string>(
    `${Date.now()}_${Math.random().toString(36).substring(2)}`
  );

  // Store user in ref to avoid recreating stable references
  const userRef = useRef(user);
  userRef.current = user;

  const { data: globalRooms = [] } = useQuery(
    queryUtils.room.listRooms.queryOptions()
  );
  const { data: myRooms = [] } = useQuery(
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

  const handleSelectRoom = useCallback(
    (roomId: string) => {
      // If we're switching from one room to another, leave the current room first
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

  const handleLeaveRoom = useCallback(() => {
    if (selectedRoomId) {
      leaveRoom({ roomId: selectedRoomId });
      setSelectedRoomId(undefined);
    }
  }, [selectedRoomId, leaveRoom]);

  // Effect to load messages when room changes
  useEffect(() => {
    if (!selectedRoomId) {
      setMessages([]);
      return;
    }

    // Use initialMessages from React Query instead of direct Supabase query
    if (initialMessages) {
      setMessages(initialMessages);
    }
  }, [selectedRoomId, initialMessages]);

  // Effect to handle room subscription and member tracking
  useEffect(() => {
    // Clear members when no room is selected
    if (!selectedRoomId) {
      setMembers([]);
      return;
    }

    // Get current user from ref
    const currentUser = userRef.current;

    // Generate a unique session-based presence key
    const presenceKey = `${currentUser.id}_${sessionIdRef.current}`;
    let isSubscribed = false;
    let channel: RealtimeChannel | null = null;

    // Helper function to clear timeouts
    const clearTimeouts = () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      if (strangerTypingTimeoutRef.current)
        clearTimeout(strangerTypingTimeoutRef.current);
    };

    // Function to process presence state - defined inside useEffect
    const processPresenceState = (presenceState: Record<string, Member[]>) => {
      const memberMap = new Map<string, Member>();

      // Iterate through all presence entries
      for (const presenceList of Object.values(presenceState)) {
        for (const member of presenceList) {
          if (member?.id) {
            // Keep the most recent entry for each user ID
            memberMap.set(member.id, member);
          }
        }
      }

      return Array.from(memberMap.values());
    };

    // Function to update members with comparison - defined inside useEffect
    const updateMembersState = (newMembers: Member[]) => {
      setMembers((prevMembers) => {
        // Quick length check first
        if (prevMembers.length !== newMembers.length) {
          return newMembers;
        }

        // Deep comparison of member IDs
        const prevIds = new Set(prevMembers.map((m) => m.id));
        const newIds = new Set(newMembers.map((m) => m.id));

        // Check if any new member is not in previous list
        for (const id of newIds) {
          if (!prevIds.has(id)) {
            return newMembers;
          }
        }

        // No changes detected
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

      // Helper function to update members list
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

          // Update local state directly instead of query cache
          setMessages((prev) => {
            // Check if message already exists to prevent duplicates
            const messageExists = prev.some((msg) => msg.id === payload.id);
            if (messageExists) {
              return prev;
            }
            // Add new message to the end
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
            // Initial sync after tracking
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

      // Update local state immediately
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
  };
};
