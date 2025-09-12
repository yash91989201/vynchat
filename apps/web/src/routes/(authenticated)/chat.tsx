import { createFileRoute } from "@tanstack/react-router";
import { HatGlasses, MessagesSquare } from "lucide-react";
import { ChatRoom } from "@/components/chat/chat-room";
import { StrangerChat } from "@/components/chat/stranger-chat";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WelcomeDialog } from "@/components/user/welcome-dialog";

export const Route = createFileRoute("/(authenticated)/chat")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <WelcomeDialog />
      <main className="container mx-auto my-6 flex-1 px-3 md:px-6">
        <div className="flex-col gap-6">
          <Tabs className="h-full" defaultValue="chat-rooms">
            <TabsList className="grid w-full grid-cols-2">
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
            </TabsList>
            <TabsContent value="chat-rooms">
              <ChatRoom />
            </TabsContent>
            <TabsContent value="stranger-chat">
              <StrangerChat />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </>
  );
}
