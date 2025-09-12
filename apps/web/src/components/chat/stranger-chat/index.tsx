import { useRouteContext } from "@tanstack/react-router";
import { useLobbyPresence } from "@/hooks/use-global-lobby-presence";
import { useMatchmaking } from "@/hooks/use-matchmaking";
import { ChatRoom } from "./chat-room";
import { StrangerChatLobby } from "./stranger-chat-lobby";

export const StrangerChat = () => {
  const { session } = useRouteContext({ from: "/(authenticated)" });
  const userId = session.user.id;

  const {
    status,
    currentRoom,
    dialogMessage,
    setDialogMessage,
    isPending,
    talkToStranger,
    handleLeave,
    handleSkip,
    lobbyChannelRef,
  } = useMatchmaking(userId);

  const lobbyCount = useLobbyPresence(userId, lobbyChannelRef);

  const handleCloseDialog = () => setDialogMessage(null);

  if (status === "matched" && currentRoom) {
    return (
      <div className="h-[75vh] rounded-lg border">
        <ChatRoom
          onLeave={handleLeave}
          onSkip={handleSkip}
          roomId={currentRoom.id}
          userId={userId}
        />
      </div>
    );
  }

  return (
    <div className="h-[75vh] rounded-lg border">
      <StrangerChatLobby
        dialogMessage={dialogMessage}
        isPending={isPending}
        lobbyCount={lobbyCount}
        onCloseDialog={handleCloseDialog}
        onTalkToStranger={talkToStranger}
        status={status}
      />
    </div>
  );
};
