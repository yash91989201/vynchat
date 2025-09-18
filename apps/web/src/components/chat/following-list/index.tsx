import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouteContext } from "@tanstack/react-router";
import { MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Member } from "@/components/chat/chat-room/types";
import { Button } from "@/components/ui/button";
import { AccountLinkDialog } from "@/components/user/account-link-dialog";
import { supabase } from "@/lib/supabase";
import { queryUtils } from "@/utils/orpc";

interface FollowingListProps {
  onUserSelect: (user: Member) => void;
}

function UserRow({
  u,
  onlineUserIds,
  onUserSelect,
}: {
  u: {
    isMutual?: boolean;
    id: string;
    name: string;
    email: string;
    image: string | null;
    bio: string | null;
    isFollowing?: boolean;
    isFollower?: boolean;
  };
  onlineUserIds: Set<string>;
  onUserSelect: (user: Member) => void;
}) {
  const queryClient = useQueryClient();
  const { data: latestMessage } = useQuery(
    queryUtils.dm.getLatestMessage.queryOptions({
      input: { otherUserId: u.id },
    })
  );

  const followMutation = useMutation(
    queryUtils.user.follow.mutationOptions({
      onSuccess: () => {
        toast.success("User followed.");
        queryClient.invalidateQueries({
          queryKey: queryUtils.user.userFollowing.queryKey(),
        });
      },
      onError: (error) => {
        toast.error(`Failed to follow: ${error.message}`);
      },
    })
  );

  const unfollowMutation = useMutation(
    queryUtils.user.unfollow.mutationOptions({
      onSuccess: () => {
        toast.success("User unfollowed.");
        queryClient.invalidateQueries({
          queryKey: queryUtils.user.userFollowing.queryKey(),
        });
      },
      onError: (error) => {
        toast.error(`Failed to unfollow: ${error.message}`);
      },
    })
  );

  const handleFollow = (userId: string) => {
    followMutation.mutate({ userId });
  };

  const handleUnfollow = (userId: string) => {
    unfollowMutation.mutate({ userId });
  };

  return (
    <li className="flex items-center justify-between rounded-md p-2" key={u.id}>
      <div className="flex items-center">
        <div className="relative mr-3">
          <div className="h-8 w-8 rounded-full bg-gray-200" />
          {onlineUserIds.has(u.id) && (
            <div className="absolute right-0 bottom-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-green-500" />
          )}
        </div>
        <div>
          <div className="font-medium">
            {u.name ?? u.name ?? u.email ?? "Unknown"}
          </div>
          {u.bio && (
            <div className="text-muted-foreground text-sm">{u.bio}</div>
          )}
          {latestMessage && (
            <div className="text-muted-foreground text-sm">
              New: {latestMessage.content.split(" ").slice(0, 4).join(" ")}...
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {u.isFollower && (
          <Button onClick={() => handleFollow(u.id)} size="sm">
            Follow
          </Button>
        )}
        {u.isFollowing && (
          <Button
            onClick={() => handleUnfollow(u.id)}
            size="sm"
            variant="destructive"
          >
            Unfollow
          </Button>
        )}
        {(u.isMutual || u.isFollowing) && (
          <Button onClick={() => onUserSelect(u)} size="sm">
            <MessageCircle className="mr-2 h-4 w-4" />
            Chat
          </Button>
        )}
      </div>
    </li>
  );
}

export function FollowingList({ onUserSelect }: FollowingListProps) {
  const { session } = useRouteContext({ from: "/(authenticated)" });
  const isAnonymous = !!session?.user?.isAnonymous;
  const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(new Set());

  const { data } = useQuery(queryUtils.user.userFollowing.queryOptions({}));

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

  const mutual = data?.mutual?.map((u) => ({ ...u, isMutual: true })) ?? [];
  const following =
    data?.following?.map((u) => ({ ...u, isFollowing: true })) ?? [];
  const followers =
    data?.followers?.map((u) => ({ ...u, isFollower: true })) ?? [];

  if (mutual.length === 0 && following.length === 0 && followers.length === 0) {
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
    <div className="space-y-4 p-4">
      {mutual.length > 0 && (
        <div>
          <h2 className="mb-2 font-semibold text-lg">Mutual</h2>
          <ul className="space-y-2">
            {mutual.map((u) => (
              <UserRow
                key={u.id}
                onlineUserIds={onlineUserIds}
                onUserSelect={onUserSelect}
                u={{ ...u, isFollowing: true }}
              />
            ))}
          </ul>
        </div>
      )}
      {following.length > 0 && (
        <div>
          <h2 className="mb-2 font-semibold text-lg">Following</h2>
          <ul className="space-y-2">
            {following.map((u) => (
              <UserRow
                key={u.id}
                onlineUserIds={onlineUserIds}
                onUserSelect={onUserSelect}
                u={u}
              />
            ))}
          </ul>
        </div>
      )}
      {followers.length > 0 && (
        <div>
          <h2 className="mb-2 font-semibold text-lg">Followers</h2>
          <ul className="space-y-2">
            {followers.map((u) => (
              <UserRow
                key={u.id}
                onlineUserIds={onlineUserIds}
                onUserSelect={onUserSelect}
                u={u}
              />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
