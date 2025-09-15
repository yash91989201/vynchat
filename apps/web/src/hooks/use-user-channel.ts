// use-user-channel.ts (Updated)
import type { RoomType } from "@server/lib/types";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { useRouteContext } from "@tanstack/react-router";
import { useCallback, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";

interface UserChannelCallbacks {
  onIdle: () => void;
  onWaiting: () => void;
  onMatched: (arg: { payload: { room: RoomType } }) => void;
  onSkipped: () => void;
  onNoMatches: (arg: { payload: { reason: string } }) => void;
}

export const useUserChannel = ({
  onIdle,
  onMatched,
  onSkipped,
  onWaiting,
  onNoMatches,
}: UserChannelCallbacks) => {
  const { session } = useRouteContext({
    from: "/(authenticated)",
  });

  const channelRef = useRef<RealtimeChannel | null>(null);
  const userId = session.user.id;

  const cleanup = useCallback(() => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
  }, []);

  const setupChannel = useCallback(() => {
    cleanup();

    const userChannel = supabase.channel(`user:${userId}`, {
      config: {
        broadcast: { self: true, ack: true },
        presence: { key: userId },
      },
    });

    userChannel
      .on("broadcast", { event: "stranger_idle" }, onIdle)
      .on("broadcast", { event: "stranger_matched" }, onMatched)
      .on("broadcast", { event: "stranger_waiting" }, onWaiting)
      .on("broadcast", { event: "stranger_skipped" }, onSkipped)
      .on("broadcast", { event: "stranger_no_matches" }, onNoMatches)
      .subscribe();

    channelRef.current = userChannel;
  }, [userId, onIdle, onWaiting, onMatched, onSkipped, onNoMatches, cleanup]);

  useEffect(() => {
    setupChannel();
    return cleanup;
  }, [setupChannel, cleanup]);
};
