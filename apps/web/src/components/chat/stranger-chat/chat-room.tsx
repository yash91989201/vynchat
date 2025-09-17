import { useMutation, useQuery } from "@tanstack/react-query";
import { Link, useRouteContext } from "@tanstack/react-router";
import EmojiPicker, { type EmojiClickData } from "emoji-picker-react";
import {
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChatRoom } from "@/hooks/use-stranger-chat-room";
import { cn } from "@/lib/utils";
import { orpcClient, queryClient, queryUtils } from "@/utils/orpc";

interface ChatRoomProps {
  roomId: string;
  userId: string;
  onLeave: () => void;
  onSkip: () => void;
}

export const ChatRoom = ({
  roomId,
  userId,
  onLeave,
  onSkip,
}: ChatRoomProps) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { session } = useRouteContext({ from: "/(authenticated)" });
  const isAnonymous = !!session.user.isAnonymous;

  const {
    messages,
    input,
    isChannelReady,
    isStrangerTyping,
    strangerLeft,
    strangerUser,
    actions,
  } = useChatRoom(roomId, userId, session);

  useEffect(() => {
    if (strangerLeft) {
      toast.info("The stranger has left. Finding a new match...");
      onSkip();
    }
  }, [strangerLeft, onSkip]);

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
        toast.success("User followed successfully");
        queryClient.invalidateQueries({
          queryKey: queryUtils.user.userFollowing.queryKey(),
        });
      },
      onError: () => {
        toast.error("Failed to follow user");
      },
    })
  );

  // Unfollow mutation
  const unfollowMutation = useMutation(
    queryUtils.user.unfollow.mutationOptions({
      onSuccess: () => {
        queryClient.setQueryData(["isFollowing", strangerUser?.id], false);
        toast.success("User unfollowed successfully");
        queryClient.invalidateQueries({
          queryKey: queryUtils.user.userFollowing.queryKey(),
        });
      },
      onError: () => {
        toast.error("Failed to unfollow user");
      },
    })
  );

  const handleFollowToggle = () => {
    if (!strangerUser?.id) return;

    if (isAnonymous) {
      toast(
        <div className="text-sm">
          Guest users cannot follow others. Please go to your{" "}
          <Link className="text-blue-500 underline" to="/profile">
            profile
          </Link>{" "}
          to link your account.
        </div>
      );
      return;
    }

    if (strangerUser.isAnonymous) {
      actions.notifyFollowAttempt();
      toast.info(
        "This user is a guest and cannot accept follow requests yet. They have been notified of your interest."
      );
      return;
    }

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

  const isFollowLoading =
    followMutation.isPending || unfollowMutation.isPending;

  return (
    <>
      <Card className="flex h-full flex-col overflow-hidden rounded-lg py-0">
        <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/40 p-4">
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
                onClick={() => actions.skipStranger(onSkip)}
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

        <CardContent className="flex-1 p-0">
          <ScrollArea className="h-full" ref={scrollAreaRef}>
            <div className="space-y-4 p-4">
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
                    <Avatar className="h-8 w-8">
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
                      "max-w-[80%] rounded-lg p-3 text-sm shadow-md sm:max-w-[70%]",
                      message.senderId === userId
                        ? "rounded-br-none bg-primary text-primary-foreground"
                        : "rounded-bl-none bg-muted"
                    )}
                  >
                    <p>{message.content}</p>
                  </div>
                </div>
              ))}

              {isStrangerTyping && (
                <div className="flex items-end justify-start gap-2">
                  <Avatar className="h-8 w-8">
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
            </div>
          </ScrollArea>
        </CardContent>

        <CardFooter className="border-t bg-muted/40 p-4">
          <form
            className="flex w-full items-center gap-3"
            onSubmit={handleSubmit}
          >
            <Input
              autoComplete="off"
              disabled={!isChannelReady}
              onChange={actions.handleInputChange}
              placeholder={
                isChannelReady ? "Type a message..." : "Connecting..."
              }
              ref={inputRef}
              value={input}
            />
            <div className="flex items-center">
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
              <Button size="icon" type="button" variant="ghost">
                <Paperclip className="h-5 w-5 text-muted-foreground" />
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
