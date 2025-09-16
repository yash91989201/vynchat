import { useQuery } from "@tanstack/react-query";
import { useRouteContext } from "@tanstack/react-router";
import { MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { AccountLinkDialog } from "@/components/user/account-link-dialog";
import { Button } from "@/components/ui/button";
import type { Member } from "@/components/chat/chat-room/types";
import { supabase } from "@/lib/supabase";
import { queryUtils } from "@/utils/orpc";

interface FollowingListProps {
  onUserSelect: (user: Member) => void;
}

export function FollowingList({ onUserSelect }: FollowingListProps) {
  const { session } = useRouteContext({ from: "/(authenticated)" });
  const isAnonymous = !!session?.user?.isAnonymous;
  const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(new Set());

  const { data } = useQuery(queryUtils.user.userFollowing.queryOptions({}));

  const following = data?.followings ?? [];

  useEffect(() => {
    if (isAnonymous) return;

    const channel = supabase.channel("following:tab", {
      config: {
        presence: {
          key: session.user.id,
        },
      },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        const newState = channel.presenceState();
        setOnlineUserIds(new Set(Object.keys(newState)));
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({});
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAnonymous, session.user.id]);

  if (isAnonymous) {
    return <AccountLinkDialog initialOpen={true} />;
  }

  if (following.length === 0) {
    return (
      <div className="p-4">
        <h2 className="mb-2 font-semibold text-lg">Following</h2>
        <p className="text-muted-foreground">
          You are not following anyone yet.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="mb-2 font-semibold text-lg">Following</h2>
      <ul className="space-y-2">
        {following.map((u) => (
          <li
            className="flex items-center justify-between rounded-md p-2"
            key={u.id}
          >
            <div className="flex items-center">
              <div className="relative mr-3">
                <div className="h-8 w-8 rounded-full bg-gray-200" />
                {onlineUserIds.has(u.id) && (
                  <div className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-white" />
                )}
              </div>
              <div>
                <div className="font-medium">
                  {u.name ?? u.name ?? u.email ?? "Unknown"}
                </div>
                {u.bio && (
                  <div className="text-muted-foreground text-sm">{u.bio}</div>
                )}
              </div>
            </div>
            <Button onClick={() => onUserSelect(u)} size="sm">
              <MessageCircle className="mr-2 h-4 w-4" />
              Chat
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
