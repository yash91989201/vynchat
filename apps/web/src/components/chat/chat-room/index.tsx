import { ChatRoomWindow } from "./chat-room-window";
import { RoomList } from "./room-list";

export const ChatRoom = () => {
  return (
    <div className="grid h-[75vh] grid-cols-[400px_1fr] overflow-hidden rounded-lg border">
      <RoomList />
      <ChatRoomWindow />
    </div>
  );
};
