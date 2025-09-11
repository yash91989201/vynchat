import type { RoomType } from "@server/lib/types";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { useMutation } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { queryUtils } from "@/utils/orpc";

export const useMatchmaking = (userId: string) => {
  const [status, setStatus] = useState<"idle" | "waiting" | "matched">("idle");
  const [currentRoom, setCurrentRoom] = useState<RoomType | undefined>();
  const [dialogMessage, setDialogMessage] = useState<string | null>(null);

  const lobbyChannelRef = useRef<RealtimeChannel | null>(null);
  const matchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { mutateAsync: findStranger, isPending } = useMutation(
    queryUtils.room.findStranger.mutationOptions({})
  );

  const clearMatchTimeout = useCallback(() => {
    if (matchTimeoutRef.current) {
      clearTimeout(matchTimeoutRef.current);
      matchTimeoutRef.current = null;
    }
  }, []);

  const startMatchTimeout = useCallback(() => {
    clearMatchTimeout();

    matchTimeoutRef.current = setTimeout(async () => {
      console.log("Match timeout reached, setting user to idle");
      setStatus("idle");
      setCurrentRoom(undefined);

      if (lobbyChannelRef.current) {
        try {
          await lobbyChannelRef.current.track({ status: "idle" });
          console.log("Updated presence to idle after timeout");
        } catch (error) {
          console.error("Failed to update presence after timeout:", error);
        }
      }

      toast.info("No match found", {
        description: "No users found within 10 seconds. Try again later!",
      });
    }, 10_000);
  }, [clearMatchTimeout]);

  const updatePresenceStatus = useCallback(async (newStatus: string) => {
    if (lobbyChannelRef.current) {
      try {
        await lobbyChannelRef.current.track({ status: newStatus });
      } catch (error) {
        console.error(`Failed to update presence to ${newStatus}:`, error);
      }
    }
  }, []);

  // Personal channel for match events
  useEffect(() => {
    const personal = supabase.channel(`user:${userId}`, {
      config: { broadcast: { self: true } },
    });

    personal
      .on("broadcast", { event: "stranger_matched" }, ({ payload }) => {
        setStatus("matched");
        setCurrentRoom(payload.room);
        clearMatchTimeout();
      })
      .on("broadcast", { event: "stranger_waiting" }, () => {
        setStatus("waiting");
      })
      .on("broadcast", { event: "stranger_idle" }, () => {
        setStatus("idle");
        setCurrentRoom(undefined);
        setDialogMessage("No match found. Try again!");
        clearMatchTimeout();
      })
      .on("broadcast", { event: "stranger_skipped" }, ({ payload }) => {
        setStatus("waiting");
        setCurrentRoom(undefined);

        toast.info("Finding new match", {
          description:
            payload.message ||
            "The stranger skipped you. Looking for a new match...",
        });

        updatePresenceStatus("waiting")
          .then(() => {
            console.log("Updated presence to waiting after being skipped");
            startMatchTimeout();
          })
          .catch((error) => {
            console.error("Failed to update presence after skip:", error);
            setStatus("waiting");
            toast.error("Connection issue", {
              description: "Failed to rejoin matchmaking. Please try again.",
            });
          });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(personal);
    };
  }, [userId, clearMatchTimeout, startMatchTimeout, updatePresenceStatus]);

  const talkToStranger = async () => {
    setStatus("waiting");
    await updatePresenceStatus("waiting");
    startMatchTimeout();

    const result = await findStranger({});
    if (result.status === "waiting") {
      console.log("Enqueued, waiting for matchmaker to run…");
    }
  };

  const handleLeave = async () => {
    setStatus("idle");
    setCurrentRoom(undefined);
    clearMatchTimeout();
    await updatePresenceStatus("idle");
  };

  const handleSkip = async () => {
    setStatus("waiting");
    setCurrentRoom(undefined);
    await updatePresenceStatus("waiting");
    startMatchTimeout();
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearMatchTimeout();
    };
  }, [clearMatchTimeout]);

  return {
    status,
    currentRoom,
    dialogMessage,
    setDialogMessage,
    isPending,
    talkToStranger,
    handleLeave,
    handleSkip,
    lobbyChannelRef,
  };
};
