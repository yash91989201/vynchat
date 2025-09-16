import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { authClient } from "@/lib/auth-client";
import { orpcClient, queryUtils } from "@/utils/orpc";
import type { Member, Room } from "./types";

export const RoomMembers = ({
  members,
  isRoomOwner,
  room,
}: {
  members: Member[];
  isRoomOwner: boolean;
  room: Room | null | undefined;
}) => {
  const { data: session } = authClient.useSession();
  const queryClient = useQueryClient();

  // Query to check follow status for all members
  const { data: followStatuses } = useQuery({
    queryKey: ["followStatuses", members.map((m) => m.id)],
    queryFn: async () => {
      if (!session?.user) return {};

      const statuses: Record<string, boolean> = {};
      await Promise.all(
        members.map(async (member) => {
          if (member.id !== session.user.id) {
            try {
              const isFollowing = await orpcClient.user.isFollowing({
                userId: member.id,
              });
              statuses[member.id] = isFollowing;
            } catch {
              statuses[member.id] = false;
            }
          }
        })
      );
      return statuses;
    },
    enabled: !!session?.user && members.length > 0,
  });

  // Follow mutation
  const followMutation = useMutation({
    mutationFn: async (userId: string) => {
      await orpcClient.user.follow({ userId });
    },
    onSuccess: (_, userId) => {
      queryClient.setQueryData(
        ["followStatuses", members.map((m) => m.id)],
        (old: Record<string, boolean> | undefined) => ({
          ...old,
          [userId]: true,
        })
      );
      toast.success("User followed successfully");

      queryClient.invalidateQueries({
        queryKey: queryUtils.user.userFollowing.queryKey(),
      });
    },
    onError: () => {
      toast.error("Failed to follow user");
    },
  });

  // Unfollow mutation
  const unfollowMutation = useMutation({
    mutationFn: async (userId: string) => {
      await orpcClient.user.unfollow({ userId });
    },
    onSuccess: (_, userId) => {
      queryClient.setQueryData(
        ["followStatuses", members.map((m) => m.id)],
        (old: Record<string, boolean> | undefined) => ({
          ...old,
          [userId]: false,
        })
      );
      toast.success("User unfollowed successfully");

      queryClient.invalidateQueries({
        queryKey: queryUtils.user.userFollowing.queryKey(),
      });
    },
    onError: () => {
      toast.error("Failed to unfollow user");
    },
  });

  const banUserMutation = useMutation(
    queryUtils.room.ban.mutationOptions({
      onSuccess: () => {
        toast.success("User banned successfully");
        queryClient.invalidateQueries({
          queryKey: queryUtils.room.listRoomMembers.queryKey({
            input: {
              roomId: room?.id ?? "",
            },
          }),
        });
        queryClient.invalidateQueries({
          queryKey: queryUtils.room.listRooms.queryKey(),
        });
        queryClient.invalidateQueries({
          queryKey: queryUtils.room.getMyRooms.queryKey(),
        });
      },
      onError: (error) => {
        toast.error(error.message || "Failed to ban user");
      },
    })
  );

  // const banUserMutation = useMutation({
  //   mutationFn: async (userId: string) => {
  //     if (!room) return;
  //     await queryUtils.room.ban.mutationOptions({ roomId: room.id, userId });
  //   },
  //   onSuccess: (_, userId) => {
  //     toast.success("User banned successfully");
  //     queryClient.invalidateQueries({
  //       queryKey: queryUtils.room.listMembers.queryKey({
  //         roomId: room?.id ?? "",
  //       }),
  //     });
  //   },
  //   onError: (error) => {
  //     toast.error(error.message || "Failed to ban user");
  //   },
  // });

  const handleFollowToggle = (
    memberId: string,
    isCurrentlyFollowing: boolean
  ) => {
    if (isCurrentlyFollowing) {
      unfollowMutation.mutate(memberId);
    } else {
      followMutation.mutate(memberId);
    }
  };

  return (
    <div className="flex h-full flex-col bg-card lg:border-l">
      <div className="border-b p-4 py-6">
        <h3 className="font-semibold text-lg">Members ({members.length})</h3>
      </div>
      <ScrollArea className="flex-1">
        <div className="space-y-2 p-4">
          {members.map((member) => {
            const isCurrentUser = session?.user?.id === member.id;
            const isFollowing = followStatuses?.[member.id] ?? false;
            const isLoading =
              followMutation.isPending || unfollowMutation.isPending;

            return (
              <div
                className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted"
                key={member.id}
              >
                <Avatar className="h-9 w-9">
                  <AvatarImage src={member.image ?? undefined} />
                  <AvatarFallback>
                    {member.name?.substring(0, 2) ?? "??"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 overflow-hidden">
                  <p className="truncate font-medium">{member.name}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="h-2 w-2 rounded-full bg-green-500"
                    title="Online"
                  />
                  {!isCurrentUser && session?.user && (
                    <Button
                      className="ml-2"
                      disabled={isLoading}
                      onClick={() => handleFollowToggle(member.id, isFollowing)}
                      size="sm"
                      variant="link"
                    >
                      {isFollowing ? "Unfollow" : "Follow"}
                    </Button>
                  )}
                  {isRoomOwner && !isCurrentUser && (
                    <Button
                      className="ml-2"
                      disabled={banUserMutation.isPending}
                      onClick={() => {
                        if (room === null || room === undefined) return;

                        banUserMutation.mutate({
                          roomId: room.id,
                          userId: member.id,
                        });
                      }}
                      size="sm"
                      variant="destructive"
                    >
                      {banUserMutation.isPending ? "Banning..." : "Ban"}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};

