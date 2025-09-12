import EmojiPicker, { type EmojiClickData } from "emoji-picker-react";
import { MessageSquarePlus, Paperclip, Send, Smile, Users } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import type { ChatMessage } from "@/lib/types";
import { cn } from "@/lib/utils";
import { RoomList } from "./room-list";
import type { Room } from "./types";

interface ChatRoomWindowProps {
  isMobile?: boolean;
  room?: Room | null;
  myRooms: Room[];
  globalRooms: Room[];
  onRoomSelect?: (roomId: string) => void;
  selectedRoomId?: string;
  messages: ChatMessage[];
  input: string;
  strangerTyping: boolean;
  handleSend: () => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  userId: string;
  createRoom: (values: { name: string }) => void;
}

export const ChatRoomWindow = ({
  isMobile,
  room,
  myRooms,
  globalRooms,
  onRoomSelect,
  selectedRoomId,
  messages,
  input,
  strangerTyping,
  handleSend,
  handleInputChange,
  userId,
  createRoom,
}: ChatRoomWindowProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    handleInputChange({
      target: { value: input + emojiData.emoji },
    } as React.ChangeEvent<HTMLInputElement>);
  };

  const handleRoomSelection = (roomId: string) => {
    if (onRoomSelect) {
      onRoomSelect(roomId);
    }
    setIsDialogOpen(false);
  };

  useEffect(() => {
    if (scrollAreaRef.current && messages.length > 0) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  if (isMobile && !room) {
    return (
      <div className="flex h-full items-center justify-center bg-card p-4">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto mb-6 flex size-24 items-center justify-center rounded-full bg-primary/10 sm:h-28 sm:w-28">
            <MessageSquarePlus className="h-12 w-12 text-primary sm:h-16 sm:w-16" />
          </div>
          <h1 className="font-bold text-2xl tracking-tight">Select a Room</h1>
          <p className="text-muted-foreground">
            Choose a room to start chatting with others.
          </p>
          <Dialog onOpenChange={setIsDialogOpen} open={isDialogOpen}>
            <DialogTrigger asChild>
              <Button
                className="mt-6 transform rounded-full font-semibold transition-transform duration-200"
                size="lg"
              >
                Select Room
              </Button>
            </DialogTrigger>
            <DialogContent className="flex h-[80vh] max-w-[90vw] flex-col sm:max-w-lg">
              <DialogHeader className="sr-only">
                <DialogTitle>Select a Room</DialogTitle>
              </DialogHeader>
              <RoomList
                createRoom={createRoom}
                globalRooms={globalRooms}
                myRooms={myRooms}
                onRoomSelect={handleRoomSelection}
                selectedRoomId={selectedRoomId}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="hidden h-full flex-col items-center justify-center bg-card lg:flex">
        <div className="text-center">
          <Users className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 font-semibold text-lg">Welcome to Chat</h3>
          <p className="mt-2 text-muted-foreground text-sm">
            Select a room to start messaging.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-card">
      {/* Header */}
      <div className="flex items-center justify-between border-b p-4">
        <div className="flex items-center gap-3">
          <div>
            <h3 className="font-semibold text-lg">{room.name}</h3>
            <p className="flex items-center text-muted-foreground text-sm">
              <Users className="mr-1.5 h-4 w-4" />
              {room.memberCount} members
            </p>
          </div>
        </div>
        {isMobile && (
          <Dialog onOpenChange={setIsDialogOpen} open={isDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">Change Room</Button>
            </DialogTrigger>
            <DialogContent className="flex h-[80vh] max-w-[90vw] flex-col sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Select a Room</DialogTitle>
              </DialogHeader>
              <RoomList
                createRoom={createRoom}
                globalRooms={globalRooms}
                myRooms={myRooms}
                onRoomSelect={handleRoomSelection}
                selectedRoomId={selectedRoomId}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto" ref={scrollAreaRef}>
        <div className="space-y-6 p-4">
          {messages.map((msg) => (
            <div
              className={cn(
                "flex items-start gap-3",
                msg.sender.id === userId && "flex-row-reverse"
              )}
              key={msg.id}
            >
              <Avatar>
                <AvatarImage src={msg.sender.image ?? undefined} />
                <AvatarFallback>
                  {msg.sender.name?.substring(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div
                className={cn(
                  "max-w-md rounded-lg p-3 text-sm shadow-sm",
                  msg.sender.id === userId
                    ? "rounded-br-none bg-primary text-primary-foreground"
                    : "rounded-bl-none bg-muted"
                )}
              >
                {msg.sender.id !== userId && (
                  <p className="font-semibold text-primary">
                    {msg.sender.name}
                  </p>
                )}
                <p className="mt-1">{msg.content}</p>
                <p className="mt-2 text-right text-xs opacity-70">
                  {new Date(msg.createdAt).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          {strangerTyping && (
            <div className="flex items-end justify-start gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback>...</AvatarFallback>
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
      </div>

      {/* Input */}
      <div className="border-t p-4">
        <form
          className="flex items-center gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
        >
          <Input
            autoComplete="off"
            onChange={handleInputChange}
            placeholder="Type a message..."
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
              className="ml-2"
              disabled={!input.trim()}
              size="icon"
              type="submit"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
