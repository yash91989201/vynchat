import type { RealtimeChannel } from "@supabase/supabase-js";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createFileRoute,
  useRouteContext,
  useRouter,
} from "@tanstack/react-router";
import { HatGlasses, MessagesSquare } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import z from "zod";
import { ChatRoom } from "@/components/chat/chat-room";
import type { Member } from "@/components/chat/chat-room/types";
import { FollowingChat } from "@/components/chat/following-chat";
import { FollowingList } from "@/components/chat/following-list";
import { StrangerChat } from "@/components/chat/stranger-chat";
// import {
//   AbsoluteLeftAd,
//   AbsoluteRightAd,
// } from "@/components/shared/google-ads";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WelcomeDialog } from "@/components/user/welcome-dialog";
import { supabase } from "@/lib/supabase";
import { queryUtils } from "@/utils/orpc";

const RouteSearchSchema = z.object({
  tab: z
    .enum(["chat-rooms", "stranger-chat", "following"])
    .default("stranger-chat")
    .catch("stranger-chat")
    .optional(),
  roomId: z.string().optional(),
});

export const Route = createFileRoute("/(authenticated)/chat")({
  validateSearch: RouteSearchSchema,
  component: RouteComponent,
});

function RouteComponent() {
  const { tab } = Route.useSearch();
  const router = useRouter();
  const [selectedFollower, setSelectedFollower] = useState<Member | null>(null);
  const { session } = useRouteContext({ from: "/(authenticated)" });
  const queryClient = useQueryClient();
  const notificationChannelsRef = useRef<Map<string, RealtimeChannel>>(
    new Map()
  );

  const unreadSummaryQuery = queryUtils.dm.getUnreadSummary.queryOptions();
  const { data: unreadSummary } = useQuery({
    ...unreadSummaryQuery,
    enabled: !!session?.user?.id,
    refetchInterval: 5000,
  });

  // Keep DM room subscriptions updated for real-time badge updates
  useEffect(() => {
    const userId = session?.user?.id;
    const channels = notificationChannelsRef.current;

    if (!userId) {
      for (const channel of channels.values()) {
        supabase.removeChannel(channel);
      }
      channels.clear();
      return;
    }

    const rooms = unreadSummary?.rooms ?? [];
    const nextRoomIds = new Set(rooms.map((room) => room.roomId));

    for (const [roomId, channel] of channels) {
      if (!nextRoomIds.has(roomId)) {
        supabase.removeChannel(channel);
        channels.delete(roomId);
      }
    }

    for (const room of rooms) {
      if (channels.has(room.roomId)) continue;

      const channel = supabase.channel(`room:${room.roomId}`, {
        config: {
          broadcast: { self: false },
        },
      });

      channel
        .on("broadcast", { event: "message" }, ({ payload }) => {
          const senderId =
            payload?.senderId ??
            payload?.sender?.id ??
            payload?.sender_id ??
            null;

          if (!senderId || senderId === userId) {
            return;
          }

          queryClient.setQueryData(
            queryUtils.dm.getUnreadSummary.queryKey(),
            (current) => {
              if (!current) return current;

              let hasUpdatedRoom = false;
              const updatedRooms = current.rooms.map((roomData) => {
                if (roomData.roomId !== room.roomId) {
                  return roomData;
                }
                hasUpdatedRoom = true;
                return {
                  ...roomData,
                  unreadCount: roomData.unreadCount + 1,
                };
              });

              if (!hasUpdatedRoom) {
                return current;
              }

              return {
                rooms: updatedRooms,
                totalUnread: current.totalUnread + 1,
              };
            }
          );
        })
        .subscribe();

      channels.set(room.roomId, channel);
    }
  }, [unreadSummary?.rooms, session?.user?.id, queryClient]);

  useEffect(() => {
    return () => {
      const channels = notificationChannelsRef.current;
      for (const channel of channels.values()) {
        supabase.removeChannel(channel);
      }
      channels.clear();
    };
  }, []);

  const defaultTab = tab ?? "stranger-chat";
  const totalUnread = unreadSummary?.totalUnread ?? 0;

  const handleTabChange = (newTab: string) => {
    setSelectedFollower(null);
    router.navigate({
      to: "/chat",
      search: { tab: newTab as "chat-rooms" | "stranger-chat" | "following" },
    });
  };

  const handleFollowerSelect = (user: Member) => {
    setSelectedFollower(user);
  };

  const handleChatClose = () => {
    setSelectedFollower(null);
  };

  return (
    <>
      <WelcomeDialog />
      <main className="container mx-auto my-6 flex-1 px-3 md:px-6">
        <div className="flex-col gap-6">
          <Tabs
            className="h-full"
            onValueChange={handleTabChange}
            value={selectedFollower ? "following" : defaultTab}
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger
                className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
                value="chat-rooms"
              >
                <MessagesSquare className="mr-2" />
                <span>Chat Rooms</span>
              </TabsTrigger>
              <TabsTrigger
                className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
                value="stranger-chat"
              >
                <HatGlasses className="mr-2" />
                <span>Stranger Chat</span>
              </TabsTrigger>
              <TabsTrigger
                className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
                value="following"
              >
                <span className="relative mr-2 inline-flex h-5 w-5 items-center justify-center">
                  <MessagesSquare className="h-5 w-5" />
                  {totalUnread > 0 && (
                    <span className="-right-1 -top-1 absolute flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-primary px-1 font-semibold text-[10px] text-primary-foreground leading-none">
                      {totalUnread}
                    </span>
                  )}
                </span>
                <span>Following</span>
              </TabsTrigger>
            </TabsList>
            <TabsContent value="chat-rooms">
              <ChatRoom />
            </TabsContent>
            <TabsContent value="stranger-chat">
              <StrangerChat />
            </TabsContent>
            <TabsContent value="following">
              {selectedFollower ? (
                <FollowingChat
                  onClose={handleChatClose}
                  otherUser={selectedFollower}
                />
              ) : (
                <FollowingList onUserSelect={handleFollowerSelect} />
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </>
  );
}
