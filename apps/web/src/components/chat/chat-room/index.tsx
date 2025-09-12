import { useRouteContext } from "@tanstack/react-router";
import { useIsMobile } from "@/hooks/use-mobile";
import { useRoomChat } from "@/hooks/use-room-chat";
import { ChatRoomWindow } from "./chat-room-window";
import { RoomList } from "./room-list";

const LG_BREAKPOINT = 1024;

export const ChatRoom = () => {
  const isMobile = useIsMobile(LG_BREAKPOINT);
  const { session } = useRouteContext({ from: "/(authenticated)" });
  const userId = session.user.id;

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
  } = useRoomChat(userId);

  if (isMobile) {
    return (
      <div className="h-[85vh] overflow-hidden rounded-lg border lg:h-[75vh]">
        <ChatRoomWindow
          createRoom={createRoom}
          globalRooms={globalRooms}
          handleInputChange={handleInputChange}
          handleSend={handleSend}
          input={input}
          isMobile={true}
          messages={messages}
          myRooms={myRooms}
          onRoomSelect={handleSelectRoom}
          room={selectedRoom}
          selectedRoomId={selectedRoomId}
          strangerTyping={strangerTyping}
          userId={userId}
        />
      </div>
    );
  }

  return (
    <div className="grid h-[75vh] grid-cols-[320px_1fr] overflow-hidden rounded-lg border xl:grid-cols-[400px_1fr]">
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
        handleSend={handleSend}
        input={input}
        messages={messages}
        myRooms={myRooms}
        room={selectedRoom}
        strangerTyping={strangerTyping}
        userId={userId}
      />
    </div>
  );
};
