export interface Room {
  id: string;
  name: string;
  members: number;
  lastMessage?: string;
  time?: string;
  unread?: number;
  avatar?: string;
}

export interface RoomListProps {
  myRooms: Room[];
  globalRooms: Room[];
  selectedRoomId?: string;
  onRoomSelect: (roomId: string) => void;
}
