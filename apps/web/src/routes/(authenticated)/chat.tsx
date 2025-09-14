import { createFileRoute } from "@tanstack/react-router";
import { HatGlasses, MessagesSquare } from "lucide-react";
import z from "zod";
import { ChatRoom } from "@/components/chat/chat-room";
import { FollowingList } from "@/components/chat/following-list";
import { StrangerChat } from "@/components/chat/stranger-chat";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WelcomeDialog } from "@/components/user/welcome-dialog";

const RouteSearchSchema = z.object({
  tab: z
    .enum(["chat-rooms", "stranger-chat", "following"])
    .default("stranger-chat")
    .catch("stranger-chat")
    .optional(),
});

export const Route = createFileRoute("/(authenticated)/chat")({
  validateSearch: RouteSearchSchema,
  component: RouteComponent,
});

function RouteComponent() {
  const { tab } = Route.useSearch();

  const defaultTab = tab ?? "stranger-chat";

  return (
    <>
      <WelcomeDialog />
      <main className="container mx-auto my-6 flex-1 px-3 md:px-6">
        <div className="flex-col gap-6">
          <Tabs className="h-full" defaultValue={defaultTab}>
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
              <FollowingList />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </>
  );
}
