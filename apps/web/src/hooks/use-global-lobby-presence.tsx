import type { RealtimeChannel } from "@supabase/supabase-js";
import { type RefObject, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export const useLobbyPresence = (
  userId: string,
  lobbyChannelRef: RefObject<RealtimeChannel | null>
) => {
  const [lobbyCount, setLobbyCount] = useState(0);

  useEffect(() => {
    const lobbyChannel: RealtimeChannel = supabase.channel("lobby:global", {
      config: { presence: { key: userId } },
    });

    lobbyChannelRef.current = lobbyChannel;

    lobbyChannel
      .on("presence", { event: "sync" }, () => {
        const state = lobbyChannel.presenceState();
        setLobbyCount(Object.keys(state).length);
      })
      .subscribe(async (st) => {
        if (st === "SUBSCRIBED") {
          await lobbyChannel.track({ status: "idle" });
        }
      });

    return () => {
      supabase.removeChannel(lobbyChannel);
      lobbyChannelRef.current = null;
    };
  }, [userId, lobbyChannelRef]);

  return lobbyCount;
};
