import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { HatGlasses, MessagesSquare } from "lucide-react";
import { ChatRoom } from "@/components/chat/chat-room";
import { StrangerChat } from "@/components/chat/stranger-chat";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WelcomeDialog } from "@/components/user/welcome-dialog";
import { queryUtils } from "@/utils/orpc";

export const Route = createFileRoute("/(authenticated)/chat")({
  component: RouteComponent,
});

function FollowingList() {
  const { data } = useSuspenseQuery(
    queryUtils.user.userFollowing.queryOptions({})
  );

  const following = data?.followings ?? [];

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
            className="flex items-center justify-between rounded-md p-2 hover:bg-muted"
            key={u.id}
          >
            <div className="flex items-center">
              <div className="mr-3 h-8 w-8 rounded-full bg-gray-200" />
              <div>
                <div className="font-medium">
                  {u.name ?? u.name ?? u.email ?? "Unknown"}
                </div>
                {u.bio && (
                  <div className="text-muted-foreground text-sm">{u.bio}</div>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function RouteComponent() {
  return (
    <>
      <WelcomeDialog />
      <main className="container mx-auto my-6 flex-1 px-3 md:px-6">
        <div className="flex-col gap-6">
          <Tabs className="h-full" defaultValue="stranger-chat">
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
