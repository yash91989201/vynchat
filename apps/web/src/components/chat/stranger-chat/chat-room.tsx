import type { MessageType } from "@server/lib/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Link, useRouteContext } from "@tanstack/react-router";
import EmojiPicker, { type EmojiClickData } from "emoji-picker-react";
import {
  Loader2,
  LogOut,
  Paperclip,
  Send,
  Smile,
  UserMinus,
  UserPlus,
} from "lucide-react";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { useChatRoom } from "@/hooks/use-stranger-chat-room";
import { cn } from "@/lib/utils";
import { orpcClient, queryClient, queryUtils } from "@/utils/orpc";

interface ChatRoomProps {
  roomId: string;
  userId: string;
  onLeave: () => void;
  onSkip: (continent: string) => void;
  continent: string;
}

const renderMessageContent = (message: MessageType) => {
  const urlRegex = /^(https?:\/\/[^\s]+)$/;
  if (urlRegex.test(message.content)) {
    const url = message.content;
    const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
    const isVideo = /\.(mp4|webm|ogg)$/i.test(url);
    const isAudio = /\.(mp3|wav|ogg)$/i.test(url);

    if (isImage) {
      return (
        <a href={url} rel="noopener noreferrer" target="_blank">
          <img
            alt="sent content"
            className="h-auto max-w-full cursor-pointer rounded-lg"
            src={url}
          />
        </a>
      );
    }
    if (isVideo) {
      return (
        <video className="h-auto max-w-full rounded-lg" controls src={url} />
      );
    }
    if (isAudio) {
      return <audio className="w-full" controls src={url} />;
    }
  }

  return <p className="break-words">{message.content}</p>;
};

export const ChatRoom = ({
  roomId,
  userId,
  onLeave,
  onSkip,
  continent,
}: ChatRoomProps) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hasHandledStrangerExitRef = useRef(false);

  const { session } = useRouteContext({ from: "/(authenticated)" });

  const {
    messages,
    input,
    isChannelReady,
    isStrangerTyping,
    strangerLeft,
    strangerUser,
    isUploading,
    actions,
    strangerIsFollowingYou,
  } = useChatRoom(roomId, userId, session);

  const { skipStranger: skipStrangerAction, setStrangerLeft } = actions;

  const strangerIsFollowingYouRef = useRef(strangerIsFollowingYou);
  strangerIsFollowingYouRef.current = strangerIsFollowingYou;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStrangerTyping]);

  useEffect(() => {
    if (!strangerLeft) {
      hasHandledStrangerExitRef.current = false;
      return;
    }

    if (hasHandledStrangerExitRef.current) {
      return;
    }

    hasHandledStrangerExitRef.current = true;
    toast.info("The stranger has left. Finding a new match...");

    const handleStrangerExit = async () => {
      const didSkipRoom = await skipStrangerAction(onSkip, continent);

      if (!didSkipRoom) {
        onSkip(continent);
      }

      setStrangerLeft(false);
    };

    void handleStrangerExit();
  }, [strangerLeft, skipStrangerAction, continent, onSkip, setStrangerLeft]);

  // Query to check if following the stranger
  const { data: isFollowing } = useQuery({
    queryKey: ["isFollowing", strangerUser?.id],
    queryFn: async () => {
      if (!strangerUser?.id) return false;
      try {
        return await orpcClient.user.isFollowing({ userId: strangerUser.id });
      } catch {
        return false;
      }
    },
    enabled: !!strangerUser?.id && !!session?.user,
  });

  const followMutation = useMutation(
    queryUtils.user.follow.mutationOptions({
      onSuccess: () => {
        queryClient.setQueryData(["isFollowing", strangerUser?.id], true);

        if (strangerIsFollowingYouRef.current) {
          toast.success(
            `You and ${
              strangerUser?.name || "the stranger"
            } are now following each other! You can now start a 1-on-1 chat.`,
            { duration: 5000 }
          );
          actions.notifyMutualFollow();
        } else {
          toast.info(
            `Once ${
              strangerUser?.name || "the stranger"
            } follows you back, you can start messaging.`,
            { duration: 5000 }
          );
          actions.notifyFollow();
        }

        queryClient.invalidateQueries({
          queryKey: queryUtils.user.userFollowing.queryKey(),
        });
      },
    })
  );

  // Unfollow mutation
  const unfollowMutation = useMutation(
    queryUtils.user.unfollow.mutationOptions({
      onSuccess: () => {
        queryClient.setQueryData(["isFollowing", strangerUser?.id], false);
        toast.success("User unfollowed successfully", { duration: 5000 });
        queryClient.invalidateQueries({
          queryKey: queryUtils.user.userFollowing.queryKey(),
        });
      },
      onError: () => {
        toast.error("Failed to unfollow user", { duration: 5000 });
      },
    })
  );

  const handleFollowToggle = () => {
    if (!strangerUser?.id) return;

    if (isFollowing) {
      unfollowMutation.mutate({ userId: strangerUser.id });
    } else {
      followMutation.mutate({ userId: strangerUser.id });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    actions.sendMessage();
    inputRef.current?.focus();
  };

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    actions.handleInputChange({
      target: { value: input + emojiData.emoji },
    } as React.ChangeEvent<HTMLInputElement>);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      actions.uploadFile(file);
    }
    // Reset file input value to allow selecting the same file again
    if (e.target) {
      e.target.value = "";
    }
  };

  const isFollowLoading =
    followMutation.isPending || unfollowMutation.isPending;

  return (
    <>
      <Card className="flex h-[85vh] flex-col gap-0 overflow-hidden rounded-lg py-0 md:h-full">
        <CardHeader className="flex-shrink-0 grid-cols-[1fr_80px] border-b bg-muted/40 py-6">
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarImage
                src={strangerUser?.image || "/placeholder-user.jpg"}
              />
              <AvatarFallback>
                {strangerUser?.name?.substring(0, 2) || "ST"}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-3">
              <p className="font-medium text-sm leading-none">
                {strangerUser?.name || "Stranger"}
              </p>
              <Button
                onClick={() => actions.skipStranger(onSkip, continent)}
                size="sm"
                type="button"
                variant="secondary"
              >
                Skip
              </Button>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {strangerUser?.id && session?.user && (
              <Button
                disabled={isFollowLoading}
                onClick={handleFollowToggle}
                size="icon"
                title={isFollowing ? "Unfollow" : "Follow"}
                variant="outline"
              >
                {isFollowing ? (
                  <UserMinus className="h-4 w-4" />
                ) : (
                  <UserPlus className="h-4 w-4" />
                )}
                <span className="sr-only">
                  {isFollowing ? "Unfollow" : "Follow"}
                </span>
              </Button>
            )}
            <Button
              onClick={() => actions.leaveRoom(onLeave)}
              size="icon"
              variant="destructive"
            >
              <LogOut className="h-4 w-4" />
              <span className="sr-only">Leave</span>
            </Button>
          </div>
        </CardHeader>

        <CardContent className="min-h-0 flex-1 p-0">
          <div
            className="scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent h-full overflow-y-auto"
            ref={scrollAreaRef}
          >
            <div className="space-y-4 p-4 pb-2">
              {messages.map((message) => (
                <div
                  className={cn(
                    "flex items-end gap-2",
                    message.senderId === userId
                      ? "justify-end"
                      : "justify-start"
                  )}
                  key={message.id}
                >
                  {message.senderId !== userId && (
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarImage
                        src={strangerUser?.image || "/placeholder-user.jpg"}
                      />
                      <AvatarFallback>
                        {strangerUser?.name?.substring(0, 2) || "ST"}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={cn(
                      "max-w-[80%] break-words rounded-lg p-3 text-sm shadow-md sm:max-w-[70%]",
                      message.senderId === userId
                        ? "rounded-br-none bg-primary text-primary-foreground"
                        : "rounded-bl-none bg-muted"
                    )}
                  >
                    {renderMessageContent(message)}
                  </div>
                </div>
              ))}

              {isStrangerTyping && (
                <div className="flex items-end justify-start gap-2">
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarImage
                      src={strangerUser?.image || "/placeholder-user.jpg"}
                    />
                    <AvatarFallback>
                      {strangerUser?.name?.substring(0, 2) || "ST"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="rounded-lg bg-muted p-3 text-sm shadow-md">
                    <div className="flex items-center gap-1">
                      <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.3s]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.15s]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" />
                    </div>
                  </div>
                </div>
              )}

              {/* Invisible element to scroll to */}
              <div ref={messagesEndRef} />
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex-shrink-0 border-t bg-muted/40 p-4">
          <form
            className="flex w-full items-center gap-3"
            onSubmit={handleSubmit}
          >
            <Input
              autoComplete="off"
              className="flex-1"
              disabled={!isChannelReady}
              onChange={actions.handleInputChange}
              placeholder={
                isChannelReady ? "Type a message..." : "Connecting..."
              }
              ref={inputRef}
              value={input}
            />
            <div className="flex flex-shrink-0 items-center">
              <Popover>
                <PopoverTrigger asChild>
                  <Button size="icon" type="button" variant="ghost">
                    <Smile className="h-5 w-5 text-muted-foreground" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto border-none p-0">
                  <EmojiPicker onEmojiClick={handleEmojiClick} />
                </PopoverContent>
              </Popover>
              <input
                accept="image/*,video/*,audio/*"
                className="hidden"
                onChange={handleFileSelect}
                ref={fileInputRef}
                type="file"
              />
              <Button
                disabled={isUploading || !isChannelReady}
                onClick={() => fileInputRef.current?.click()}
                size="icon"
                type="button"
                variant="ghost"
              >
                {isUploading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Paperclip className="h-5 w-5 text-muted-foreground" />
                )}
              </Button>
              <Button
                disabled={!(isChannelReady && input.trim())}
                size="icon"
                type="submit"
              >
                <Send className="h-4 w-4" />
                <span className="sr-only">Send</span>
              </Button>
            </div>
          </form>
        </CardFooter>
      </Card>
    </>
  );
};
