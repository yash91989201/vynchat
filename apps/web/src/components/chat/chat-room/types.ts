import type { ChatRoom } from "@/lib/types";

export type Room = ChatRoom & {
  lastMessage?: string;
  time?: string;
  unread?: number;
  avatar?: string;
};

export interface RoomListProps {
  myRooms: Room[];
  globalRooms: Room[];
  selectedRoomId?: string;
  onRoomSelect: (roomId: string) => void;
  createRoom: (values: { name: string }) => void;
}

export type Member = {
  id: string;
  name: string;
  image?: string | null;
};

