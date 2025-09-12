import { LogOut, Send, SkipForward, Wifi, WifiOff } from "lucide-react";
import { useRef } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChatRoom } from "@/hooks/use-stranger-chat-room";
import { cn } from "@/lib/utils";

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

  const {
    messages,
    input,
    isChannelReady,
    isStrangerTyping,
    strangerLeft,
    setStrangerLeft,
    handleSend,
    handleLeave,
    handleSkip,
    handleInputChange,
  } = useChatRoom(roomId, userId);

  const onStrangerLeftClose = () => {
    setStrangerLeft(false);
    onLeave();
  };

  return (
    <>
      <AlertDialog onOpenChange={onStrangerLeftClose} open={strangerLeft}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Chat Ended</AlertDialogTitle>
            <AlertDialogDescription>
              The stranger has left the chat.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>Find New Stranger</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Card className="flex h-full flex-col overflow-hidden rounded-lg">
        <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/40 p-4">
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarImage src="/placeholder-user.jpg" />
              <AvatarFallback>ST</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-sm leading-none">Stranger</p>
              <p className="text-muted-foreground text-sm">
                {isChannelReady ? (
                  <span className="flex items-center text-green-500">
                    <Wifi className="mr-1 h-3 w-3" /> Connected
                  </span>
                ) : (
                  <span className="flex items-center">
                    <WifiOff className="mr-1 h-3 w-3" /> Connecting...
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => handleSkip(onSkip)}
              size="icon"
              variant="outline"
            >
              <SkipForward className="h-4 w-4" />
              <span className="sr-only">Skip</span>
            </Button>
            <Button
              onClick={() => handleLeave(onLeave)}
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
              {messages.map((m) => (
                <div
                  className={cn(
                    "flex items-end gap-2",
                    m.senderId === userId ? "justify-end" : "justify-start",
                  )}
                  key={m.id}
                >
                  {m.senderId !== userId && (
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/placeholder-user.jpg" />
                      <AvatarFallback>ST</AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={cn(
                      "max-w-md rounded-lg p-3 text-sm shadow-md",
                      m.senderId === userId
                        ? "rounded-br-none bg-primary text-primary-foreground"
                        : "rounded-bl-none bg-muted",
                    )}
                  >
                    <p>{m.content}</p>
                  </div>
                </div>
              ))}

              {isStrangerTyping && (
                <div className="flex items-end justify-start gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder-user.jpg" />
                    <AvatarFallback>ST</AvatarFallback>
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
            className="flex w-full items-center space-x-2"
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
          >
            <Input
              autoComplete="off"
              disabled={!isChannelReady}
              onChange={handleInputChange}
              placeholder={
                isChannelReady ? "Type a message..." : "Connecting..."
              }
              value={input}
            />
            <Button
              disabled={!(isChannelReady && input.trim())}
              size="icon"
              type="submit"
            >
              <Send className="h-4 w-4" />
              <span className="sr-only">Send</span>
            </Button>
          </form>
        </CardFooter>
      </Card>
    </>
  );
};
