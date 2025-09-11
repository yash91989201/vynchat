import { createFileRoute } from "@tanstack/react-router";
import { HatGlasses, MessagesSquare } from "lucide-react";
import { StrangerChat } from "@/components/chat/stranger-chat";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/(authenticated)/chat")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <main className="container mx-auto px-3 md:px-6">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Tabs defaultValue="chat-rooms">
          <TabsList>
            <TabsTrigger value="chat-rooms">
              <MessagesSquare />
              <span>Chat Rooms</span>
            </TabsTrigger>
            <TabsTrigger value="stranger-chat">
              <HatGlasses />
              <span>Stranger Chat</span>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="chat-rooms">
            <p>chat rooms</p>
          </TabsContent>
          <TabsContent value="stranger-chat">
            <StrangerChat />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
