import { useRouteContext } from "@tanstack/react-router";
import { useMatchmaking } from "@/hooks/use-matchmaking";
import { useUserChannel } from "@/hooks/use-user-channel";
import { ChatRoom } from "./chat-room";
import { StrangerChatLobby } from "./stranger-chat-lobby";

export const StrangerChat = () => {
  const { session } = useRouteContext({ from: "/(authenticated)" });
  const {
    state,
    actions: { startMatching, leaveRoom, skipStranger, dismissDialog },
    lobbyCount,
    userChannelCallbacks,
  } = useMatchmaking(session.user.id);

  useUserChannel(userChannelCallbacks);

  if (state.status === "matched" && state.currentRoom) {
    return (
      <div className="h-[85vh] rounded-lg border md:h-[75vh]">
        <ChatRoom
          onLeave={leaveRoom}
          onSkip={skipStranger}
          roomId={state.currentRoom.id}
          userId={session.user.id}
        />
      </div>
    );
  }

  return (
    <div className="h-[85vh] rounded-lg border md:h-[75vh]">
      <StrangerChatLobby
        dialogMessage={state.dialogMessage}
        isPending={state.isPending}
        lobbyCount={lobbyCount}
        onCloseDialog={dismissDialog}
        onTalkToStranger={startMatching}
        status={state.status}
      />
    </div>
  );
};
