import { useRouteContext } from "@tanstack/react-router";
import { useFollowerChat } from "@/hooks/use-follower-chat";
import { FullScreenLoader } from "@/components/shared/full-screen-loader";
import { DirectMessageWindow } from "./direct-message-window";
import type { Member } from "../chat-room/types";

interface FollowingChatProps {
  otherUser: Member;
  onClose: () => void;
}

export const FollowingChat = ({ otherUser, onClose }: FollowingChatProps) => {
  const { session } = useRouteContext({ from: "/(authenticated)" });
  const currentUser = session.user;

  const {
    room,
    messages,
    input,
    otherUserTyping,
    handleSend,
    handleInputChange,
    isLoading,
    isUploading,
    uploadFile,
  } = useFollowerChat(currentUser, otherUser);

  if (isLoading || !room) {
    return <FullScreenLoader />;
  }

  return (
    <div className="h-[75vh] rounded-lg border">
      <DirectMessageWindow
        messages={messages}
        input={input}
        otherUserTyping={otherUserTyping}
        handleSend={handleSend}
        handleInputChange={handleInputChange}
        currentUser={currentUser}
        otherUser={otherUser}
        onClose={onClose}
        isUploading={isUploading}
        uploadFile={uploadFile}
      />
    </div>
  );
};
