import { useRouteContext } from "@tanstack/react-router";
import { useIsMobile } from "@/hooks/use-mobile";
import { useRoomChat } from "@/hooks/use-room-chat";
import { ChatRoomWindow } from "./chat-room-window";
import { RoomList } from "./room-list";
import { RoomMembers } from "./room-members";

const LG_BREAKPOINT = 1024;

export const ChatRoom = () => {
  const isMobile = useIsMobile(LG_BREAKPOINT);
  const { session } = useRouteContext({ from: "/(authenticated)" });
  const user = {
    id: session.user.id,
    name: session.user.name,
    image: session.user.image,
  };

  const {
    globalRooms,
    myRooms,
    selectedRoomId,
    selectedRoom,
    messages,
    input,
    strangerTyping,
    handleSelectRoom,
    handleSend,
    handleInputChange,
    createRoom,
    members,
    handleLeaveRoom,
  } = useRoomChat(user);

  if (isMobile) {
    return (
      <div className="h-[85vh] overflow-hidden rounded-lg border lg:h-[75vh]">
        <ChatRoomWindow
          createRoom={createRoom}
          globalRooms={globalRooms}
          handleInputChange={handleInputChange}
          handleLeaveRoom={handleLeaveRoom}
          handleSend={handleSend}
          input={input}
          isMobile={true}
          members={members}
          messages={messages}
          myRooms={myRooms}
          onRoomSelect={handleSelectRoom}
          room={selectedRoom}
          selectedRoomId={selectedRoomId}
          strangerTyping={strangerTyping}
          userId={user.id}
        />
      </div>
    );
  }

  return (
    <div className="grid h-[75vh] grid-cols-[320px_1fr_280px] overflow-hidden rounded-lg border xl:grid-cols-[320px_1fr_320px]">
      <RoomList
        createRoom={createRoom}
        globalRooms={globalRooms}
        myRooms={myRooms}
        onRoomSelect={handleSelectRoom}
        selectedRoomId={selectedRoomId}
      />
      <ChatRoomWindow
        createRoom={createRoom}
        globalRooms={globalRooms}
        handleInputChange={handleInputChange}
        handleLeaveRoom={handleLeaveRoom}
        handleSend={handleSend}
        input={input}
        members={members}
        messages={messages}
        myRooms={myRooms}
        room={selectedRoom}
        strangerTyping={strangerTyping}
        userId={user.id}
      />
      <RoomMembers members={members} />
    </div>
  );
};
