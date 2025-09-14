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
}

export const useUserChannel = ({
  onIdle,
  onMatched,
  onSkipped,
  onWaiting,
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
      // Original events for internal communication
      .on("broadcast", { event: "idle" }, onIdle)
      .on("broadcast", { event: "matched" }, onMatched)
      .on("broadcast", { event: "waiting" }, onWaiting)
      .on("broadcast", { event: "skipped" }, onSkipped)
      .subscribe();

    channelRef.current = userChannel;
  }, [userId, onIdle, onWaiting, onMatched, onSkipped, cleanup]);

  useEffect(() => {
    setupChannel();
    return cleanup;
  }, [setupChannel, cleanup]);
};
