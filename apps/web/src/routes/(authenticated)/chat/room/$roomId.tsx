import { ChatRoom } from "@/components/chat/chat-room";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(authenticated)/chat/room/$roomId")({
  component: ChatRoom,
});
