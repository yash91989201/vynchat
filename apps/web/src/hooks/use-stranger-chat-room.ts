import type { MessageType } from "@server/lib/types";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useReducer, useRef } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { queryUtils } from "@/utils/orpc";

const TYPING_TIMEOUT = 3000;
const TYPING_STOP_TIMEOUT = 2000;

interface StrangerUser {
  id: string;
  name: string;
  image: string | null;
  isAnonymous: boolean | null;
}

interface ChatState {
  messages: MessageType[];
  input: string;
  isChannelReady: boolean;
  isStrangerTyping: boolean;
  strangerLeft: boolean;
  strangerUser: StrangerUser | null;
}

type ChatAction =
  | { type: "SET_MESSAGES"; messages: MessageType[] }
  | { type: "ADD_MESSAGE"; message: MessageType }
  | { type: "SET_INPUT"; input: string }
  | { type: "SET_CHANNEL_READY"; ready: boolean }
  | { type: "SET_STRANGER_TYPING"; typing: boolean }
  | { type: "SET_STRANGER_LEFT"; left: boolean }
  | { type: "SET_STRANGER_USER"; user: StrangerUser | null }
  | { type: "CLEAR_INPUT" };

const initialChatState: ChatState = {
  messages: [],
  input: "",
  isChannelReady: false,
  isStrangerTyping: false,
  strangerLeft: false,
  strangerUser: null,
};

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case "SET_MESSAGES":
      return { ...state, messages: action.messages };
    case "ADD_MESSAGE":
      // Prevent duplicate messages
      if (state.messages.some((msg) => msg.id === action.message.id)) {
        return state;
      }
      return { ...state, messages: [...state.messages, action.message] };
    case "SET_INPUT":
      return { ...state, input: action.input };
    case "SET_CHANNEL_READY":
      return { ...state, isChannelReady: action.ready };
    case "SET_STRANGER_TYPING":
      return { ...state, isStrangerTyping: action.typing };
    case "SET_STRANGER_LEFT":
      return { ...state, strangerLeft: action.left };
    case "SET_STRANGER_USER":
      return { ...state, strangerUser: action.user };
    case "CLEAR_INPUT":
      return { ...state, input: "" };
    default:
      return state;
  }
}

export const useChatRoom = (
  roomId: string,
  userId: string,
  session: { user: { name: string | null } }
) => {
  const [state, dispatch] = useReducer(chatReducer, initialChatState);

  const channelRef = useRef<RealtimeChannel | null>(null);
  const strangerTypingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Query to fetch room members and identify stranger
  const { data: roomMembers } = useSuspenseQuery(
    queryUtils.room.listRoomMembers.queryOptions({
      input: { roomId },
    })
  );

  useEffect(() => {
    if (roomMembers) {
      const strangerMember = roomMembers.find(
        (member) => member.userId !== userId
      );

      if (strangerMember === undefined) {
        return;
      }

      if (strangerMember?.user) {
        dispatch({
          type: "SET_STRANGER_USER",
          user: {
            id: strangerMember.user.id,
            name: strangerMember.user.name,
            image: strangerMember.user.image,
            isAnonymous: strangerMember.user.isAnonymous,
          },
        });
      }
    }
  }, [roomMembers, userId]);

  // Mutations
  const { mutateAsync: sendMessage } = useMutation(
    queryUtils.message.send.mutationOptions({})
  );
  const { mutateAsync: leaveRoom } = useMutation(
    queryUtils.room.leave.mutationOptions({})
  );
  const { mutateAsync: skipStranger } = useMutation(
    queryUtils.room.skipStranger.mutationOptions({})
  );

  // Cleanup timeouts
  const clearTimeouts = useCallback(() => {
    for (const ref of [strangerTypingTimeoutRef, typingTimeoutRef]) {
      if (ref.current) {
        clearTimeout(ref.current);
        ref.current = null;
      }
    }
  }, []);

  // Load existing messages on mount
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const { data: existingMessages, error } = await supabase
          .from("message")
          .select("*")
          .eq("room_id", roomId)
          .order("created_at", { ascending: true });

        if (error) throw error;

        if (existingMessages) {
          dispatch({ type: "SET_MESSAGES", messages: existingMessages });
        }
      } catch (error) {
        console.error("Error loading messages:", error);
        toast.error("Failed to load chat history");
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
        dispatch({ type: "ADD_MESSAGE", message: payload });
      })
      .on("broadcast", { event: "room_closed" }, () => {
        dispatch({ type: "SET_STRANGER_LEFT", left: true });
      })
      .on("broadcast", { event: "typing" }, ({ payload }) => {
        if (payload.senderId === userId) return;

        dispatch({ type: "SET_STRANGER_TYPING", typing: true });

        // Clear existing timeout
        if (strangerTypingTimeoutRef.current) {
          clearTimeout(strangerTypingTimeoutRef.current);
        }

        // Set new timeout to stop typing indicator
        strangerTypingTimeoutRef.current = setTimeout(() => {
          dispatch({ type: "SET_STRANGER_TYPING", typing: false });
        }, TYPING_TIMEOUT);
      })
      .on("broadcast", { event: "follow_attempt" }, ({ payload }) => {
        if (session.user.name === payload.senderName) return;

        toast.info(
          `${payload.senderName} wants to follow you. Please link your account to connect.`
        );
      })
      .subscribe((status) => {
        dispatch({ type: "SET_CHANNEL_READY", ready: status === "SUBSCRIBED" });
      });

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
      dispatch({ type: "SET_CHANNEL_READY", ready: false });
      clearTimeouts();
    };
  }, [roomId, userId, clearTimeouts, session.user.name]);

  useEffect(() => {
    if (state.isChannelReady && state.strangerUser) {
      toast.success(`You are connected with ${state.strangerUser.name}`);
    }
  }, [state.isChannelReady, state.strangerUser]);

  // Actions
  const actions = {
    sendMessage: useCallback(async () => {
      if (!(state.input.trim() && state.isChannelReady)) return;

      try {
        const message = await sendMessage({ roomId, content: state.input });

        if (channelRef.current) {
          await channelRef.current.send({
            type: "broadcast",
            event: "message",
            payload: message,
          });
        }

        dispatch({ type: "CLEAR_INPUT" });
      } catch (error) {
        console.error("Error sending message:", error);
        toast.error("Failed to send message");
      }
    }, [state.input, state.isChannelReady, sendMessage, roomId]),

    leaveRoom: useCallback(
      async (onLeave: () => void) => {
        try {
          // Notify other user
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
          onLeave(); // Still call onLeave to clean up UI state
        }
      },
      [leaveRoom, roomId]
    ),

    skipStranger: useCallback(
      async (onSkip: () => void) => {
        try {
          await skipStranger({ roomId });
          toast.success("Finding new match", {
            description: "Looking for a new stranger to chat with...",
          });
          onSkip();
        } catch (error) {
          console.error("Error skipping stranger:", error);
          toast.error("Failed to skip stranger. Please try again.");
        }
      },
      [skipStranger, roomId]
    ),

    handleInputChange: useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const newText = e.target.value;
        dispatch({ type: "SET_INPUT", input: newText });

        if (!(channelRef.current && state.isChannelReady)) return;

        // Send typing indicator
        if (newText && !isTypingRef.current) {
          isTypingRef.current = true;
          channelRef.current.send({
            type: "broadcast",
            event: "typing",
            payload: { senderId: userId },
          });
        }

        // Clear existing timeout
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }

        // Set timeout to stop typing
        typingTimeoutRef.current = setTimeout(() => {
          isTypingRef.current = false;
        }, TYPING_STOP_TIMEOUT);
      },
      [state.isChannelReady, userId]
    ),

    setStrangerLeft: useCallback((left: boolean) => {
      dispatch({ type: "SET_STRANGER_LEFT", left });
    }, []),

    notifyFollowAttempt: useCallback(async () => {
      if (channelRef.current) {
        await channelRef.current.send({
          type: "broadcast",
          event: "follow_attempt",
          payload: { senderName: session.user.name || "Stranger user" },
        });
      }
    }, [session.user.name]),
  };

  return {
    ...state,
    actions,
  };
};
