import { createFileRoute, useRouter } from "@tanstack/react-router";
import { HatGlasses, MessagesSquare } from "lucide-react";
import { useState } from "react";
import z from "zod";
import { ChatRoom } from "@/components/chat/chat-room";
import type { Member } from "@/components/chat/chat-room/types";
import { FollowingChat } from "@/components/chat/following-chat";
import { FollowingList } from "@/components/chat/following-list";
import { StrangerChat } from "@/components/chat/stranger-chat";
import {
  AbsoluteLeftAd,
  AbsoluteRightAd,
} from "@/components/shared/google-ads";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WelcomeDialog } from "@/components/user/welcome-dialog";

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

  const defaultTab = tab ?? "stranger-chat";

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
      <AbsoluteLeftAd />
      <AbsoluteRightAd />
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
                <MessagesSquare className="mr-2" />
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
