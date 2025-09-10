import { EventPublisher } from "@orpc/client";

export const roomMemberJoinedPublisher = new EventPublisher<{
  "user-joined": {
    roomId: string;
    userId: string;
    name: string;
    memberCount: number;
  };
}>();

export const roomMemberLeftPublisher = new EventPublisher<{
  "user-left": {
    roomId: string;
    userId: string;
    name: string;
    memberCount: number;
  };
}>();

export const newMessagePublisher = new EventPublisher<{
  "new-message": {
    id: string;
    content: string;
    roomId: string;
    sender: string;
    senderId: string;
    reactions: string[];
    createdAt: Date;
  };
}>();
