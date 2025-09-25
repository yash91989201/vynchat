import type { GlobalLobbyPresenceType, RoomType } from "@server/lib/types";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { useMutation } from "@tanstack/react-query";
import { useCallback, useEffect, useReducer, useRef } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { queryUtils } from "@/utils/orpc";

const MATCH_TIMEOUT_MS = 10_000;

// Consolidated state management with reducer
interface MatchmakingState {
  status: GlobalLobbyPresenceType;
  currentRoom: RoomType | null;
  dialogMessage: string | null;
  isPending: boolean;
  lobbyCount: number;
}

type MatchmakingAction =
  | { type: "SET_STATUS"; status: GlobalLobbyPresenceType }
  | { type: "SET_PENDING"; isPending: boolean }
  | { type: "SET_ROOM"; room: RoomType | null }
  | { type: "SET_DIALOG"; message: string | null }
  | { type: "SET_LOBBY_COUNT"; count: number }
  | { type: "RESET_TO_IDLE" }
  | { type: "MATCH_FOUND"; room: RoomType }
  | { type: "MATCH_TIMEOUT" };

const initialState: MatchmakingState = {
  status: "idle",
  currentRoom: null,
  dialogMessage: null,
  isPending: false,
  lobbyCount: 0,
};

function matchmakingReducer(
  state: MatchmakingState,
  action: MatchmakingAction
): MatchmakingState {
  switch (action.type) {
    case "SET_STATUS":
      return { ...state, status: action.status };
    case "SET_PENDING":
      return { ...state, isPending: action.isPending };
    case "SET_ROOM":
      return { ...state, currentRoom: action.room };
    case "SET_DIALOG":
      return { ...state, dialogMessage: action.message };
    case "SET_LOBBY_COUNT":
      return { ...state, lobbyCount: action.count };
    case "RESET_TO_IDLE":
      return { ...state, status: "idle", currentRoom: null, isPending: false };
    case "MATCH_FOUND":
      return {
        ...state,
        status: "matched",
        currentRoom: action.room,
        dialogMessage: null,
        isPending: false,
      };
    case "MATCH_TIMEOUT":
      return {
        ...state,
        status: "idle",
        currentRoom: null,
        isPending: false,
        dialogMessage: "No match found. Try again!",
      };
    default:
      return state;
  }
}

export const useMatchmaking = (userId: string) => {
  const [state, dispatch] = useReducer(matchmakingReducer, initialState);

  const lobbyChannelRef = useRef<RealtimeChannel | null>(null);
  const userChannelRef = useRef<RealtimeChannel | null>(null);
  const matchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const clearMatchTimeout = useCallback(() => {
    if (matchTimeoutRef.current) {
      clearTimeout(matchTimeoutRef.current);
      matchTimeoutRef.current = null;
    }
  }, []);

  const { mutateAsync: findStranger } = useMutation(
    queryUtils.room.findStranger.mutationOptions({})
  );

  // Centralized cleanup function
  const cleanup = useCallback(() => {
    clearMatchTimeout();

    if (lobbyChannelRef.current) {
      supabase.removeChannel(lobbyChannelRef.current);
      lobbyChannelRef.current = null;
    }

    if (userChannelRef.current) {
      supabase.removeChannel(userChannelRef.current);
      userChannelRef.current = null;
    }
  }, [clearMatchTimeout]);

  // Update presence status helper
  const updatePresenceStatus = useCallback(
    async (status: GlobalLobbyPresenceType) => {
      if (lobbyChannelRef.current) {
        try {
          await lobbyChannelRef.current.track({ status });
          dispatch({ type: "SET_STATUS", status });
        } catch (error) {
          console.error(`Failed to update presence to ${status}:`, error);
        }
      }
    },
    []
  );

  // Match timeout handler
  const handleMatchTimeout = useCallback(() => {
    clearMatchTimeout();
    dispatch({ type: "MATCH_TIMEOUT" });
    updatePresenceStatus("idle");
    toast.info("No match found", {
      description: "No users found within 10 seconds. Try again later!",
    });
  }, [clearMatchTimeout, updatePresenceStatus]);

  // Setup lobby presence channel
  useEffect(() => {
    const lobbyChannel = supabase.channel("global:lobby", {
      config: { presence: { key: userId } },
    });

    lobbyChannel
      .on("presence", { event: "sync" }, () => {
        const presenceState = lobbyChannel.presenceState();
        dispatch({
          type: "SET_LOBBY_COUNT",
          count: Object.keys(presenceState).length,
        });
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await lobbyChannel.track({ status: "idle" });
        }
      });

    lobbyChannelRef.current = lobbyChannel;

    return () => {
      supabase.removeChannel(lobbyChannel);
      lobbyChannelRef.current = null;
    };
  }, [userId]);

  // Use the existing useUserChannel hook for consistency
  const userChannelCallbacks = {
    onIdle: useCallback(() => {
      clearMatchTimeout();
      dispatch({ type: "RESET_TO_IDLE" });
      void updatePresenceStatus("idle");
    }, [clearMatchTimeout, updatePresenceStatus]),

    onWaiting: useCallback(() => {
      dispatch({ type: "SET_STATUS", status: "waiting" });
      void updatePresenceStatus("waiting");
    }, [updatePresenceStatus]),

    onMatched: useCallback(({ payload }: { payload: { room: RoomType } }) => {
      clearMatchTimeout();
      dispatch({ type: "MATCH_FOUND", room: payload.room });
      void updatePresenceStatus("matched");
    }, [clearMatchTimeout, updatePresenceStatus]),

    onSkipped: useCallback(() => {
      clearMatchTimeout();
      dispatch({ type: "SET_STATUS", status: "waiting" });
      dispatch({ type: "SET_ROOM", room: null });
      updatePresenceStatus("waiting");

      // Set new timeout for finding next match
      matchTimeoutRef.current = setTimeout(handleMatchTimeout, MATCH_TIMEOUT_MS);

      toast.info("Finding new match", {
        description: "The stranger skipped you. Looking for a new match...",
      });
    }, [clearMatchTimeout, updatePresenceStatus, handleMatchTimeout]),

    onNoMatches: useCallback(
      ({ payload }: { payload: { reason: string } }) => {
        clearMatchTimeout();

        dispatch({ type: "RESET_TO_IDLE" });
        updatePresenceStatus("idle");

        toast.info("No new matches available", {
          description: payload.reason,
        });
      },
      [clearMatchTimeout, updatePresenceStatus]
    ),
  };

  // This will be handled by a separate useUserChannel hook in the main component

  // Actions object for cleaner API
  const actions = {
    startMatching: useCallback(async (continent: string) => {
      dispatch({ type: "SET_PENDING", isPending: true });

      try {
        clearMatchTimeout();
        await updatePresenceStatus("waiting");

        // Set match timeout
        matchTimeoutRef.current = setTimeout(handleMatchTimeout, MATCH_TIMEOUT_MS);

        const result = await findStranger({ continent });
        if (result.status === "waiting") {
          console.log("Enqueued, waiting for matchmaker to run...");
        }
      } catch (error) {
        console.error("Failed to start matching:", error);
        dispatch({ type: "RESET_TO_IDLE" });
        clearMatchTimeout();
        toast.error("Failed to start matching. Please try again.");
      } finally {
        dispatch({ type: "SET_PENDING", isPending: false });
      }
    }, [clearMatchTimeout, updatePresenceStatus, handleMatchTimeout, findStranger]),

    leaveRoom: useCallback(async () => {
      clearMatchTimeout();
      dispatch({ type: "RESET_TO_IDLE" });
      await updatePresenceStatus("idle");
    }, [clearMatchTimeout, updatePresenceStatus]),

    skipStranger: useCallback(async (continent: string) => {
      clearMatchTimeout();
      dispatch({ type: "SET_STATUS", status: "waiting" });
      dispatch({ type: "SET_ROOM", room: null });
      await updatePresenceStatus("waiting");

      // Set timeout for new match
      matchTimeoutRef.current = setTimeout(handleMatchTimeout, MATCH_TIMEOUT_MS);

      try {
        await findStranger({ continent });
      } catch (error) {
        console.error("Failed to re-queue for matching:", error);
        dispatch({ type: "RESET_TO_IDLE" });
        clearMatchTimeout();
        toast.error("Failed to find a new match. Please try again.");
      }
    }, [clearMatchTimeout, findStranger, handleMatchTimeout, updatePresenceStatus]),

    dismissDialog: useCallback(() => {
      dispatch({ type: "SET_DIALOG", message: null });
    }, []),
  };

  // Cleanup on unmount
  useEffect(() => cleanup, [cleanup]);

  return {
    state,
    actions,
    lobbyCount: state.lobbyCount,
    userChannelCallbacks,
  };
};
