import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { ChatRoomWindow } from "./chat-room-window";
import { RoomList } from "./room-list";
import type { Room } from "./types";

const myRoomsData: Room[] = [
  {
    id: "room1",
    name: "Design Team",
    lastMessage: "Let's review the new mockups.",
    time: "10:45 AM",
    unread: 2,
    avatar: "/avatars/team-design.png",
    members: 8,
  },
  {
    id: "room2",
    name: "Frontend Devs",
    lastMessage: "I've pushed the latest changes.",
    time: "9:30 AM",
    unread: 0,
    avatar: "/avatars/team-frontend.png",
    members: 12,
  },
  {
    id: "room3",
    name: "Project Phoenix",
    lastMessage: "Meeting at 2 PM.",
    time: "Yesterday",
    unread: 5,
    avatar: "/avatars/project-phoenix.png",
    members: 5,
  },
];

const globalRoomsData: Room[] = [
  { id: "room4", name: "General", members: 128 },
  { id: "room5", name: "Random", members: 73 },
  { id: "room6", name: "Tech Talk", members: 42 },
  { id: "room7", name: "Gaming Lobby", members: 256 },
  { id: "room8", name: "Music Fans", members: 98 },
  { id: "room9", name: "Art & Design", members: 55 },
  { id: "room10", name: "Photography", members: 67 },
  { id: "room11", name: "Book Club", members: 89 },
  { id: "room12", name: "Movies & TV", members: 110 },
  { id: "room13", name: "Science", members: 78 },
  { id: "room14", name: "History", members: 45 },
  { id: "room15", name: "Travel", members: 92 },
  { id: "room16", name: "Foodies", members: 130 },
  { id: "room17", name: "Fitness", members: 88 },
  { id: "room18", name: "Programming", members: 200 },
  { id: "room19", name: "Philosophy", members: 60 },
  { id: "room20", name: "Gardening", members: 35 },
];

const allRooms: Room[] = [...myRoomsData, ...globalRoomsData];

const LG_BREAKPOINT = 1024;

export const ChatRoom = () => {
  const isMobile = useIsMobile(LG_BREAKPOINT);
  const [selectedRoomId, setSelectedRoomId] = useState<string | undefined>();

  const selectedRoom = allRooms.find((r) => r.id === selectedRoomId);

  if (isMobile) {
    return (
      <div className="h-[85vh] overflow-hidden rounded-lg border lg:h-[75vh]">
        <ChatRoomWindow
          globalRooms={globalRoomsData}
          isMobile={true}
          myRooms={myRoomsData}
          onRoomSelect={setSelectedRoomId}
          room={selectedRoom}
          selectedRoomId={selectedRoomId}
        />
      </div>
    );
  }

  return (
    <div className="grid h-[75vh] grid-cols-[360px_1fr] overflow-hidden rounded-lg border xl:grid-cols-[400px_1fr]">
      <RoomList
        globalRooms={globalRoomsData}
        myRooms={myRoomsData}
        onRoomSelect={setSelectedRoomId}
        selectedRoomId={selectedRoomId}
      />
      <ChatRoomWindow
        globalRooms={globalRoomsData}
        myRooms={myRoomsData}
        room={selectedRoom}
      />
    </div>
  );
};
