import { useMutation } from "@tanstack/react-query";
import EmojiPicker, { type EmojiClickData } from "emoji-picker-react";
import {
  Link,
  Lock,
  LogOut,
  MessageSquarePlus,
  MoreHorizontal,
  PanelRightOpen,
  Paperclip,
  Send,
  Smile,
  Trash2,
  Unlock,
  Users,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { checkProfanity } from "@/lib/profanity-checker";
import type { ChatMessage } from "@/lib/types";
import { cn } from "@/lib/utils";
import { queryUtils } from "@/utils/orpc";
import { RoomList } from "./room-list";
import { RoomMembers } from "./room-members";
import type { Member, Room } from "./types";

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
  members: Member[];
  handleLeaveRoom?: () => void;
  isRoomOwner: boolean;
  toggleLock: (values: { roomId: string }) => void;
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
  members,
  handleLeaveRoom,
  isRoomOwner,
  toggleLock,
}: ChatRoomWindowProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const { mutate: deleteRoom, isPending: isDeleting } = useMutation(
    queryUtils.room.delete.mutationOptions({
      onSuccess: () => {
        if (onRoomSelect && myRooms.length > 1) {
          const nextRoom = myRooms.find((r) => r.id !== room?.id);
          if (nextRoom) {
            onRoomSelect(nextRoom.id);
          } else if (globalRooms.length > 0) {
            onRoomSelect(globalRooms[0].id);
          }
        }
      },
      onError: (error: Error) => {
        console.error("Error deleting room:", error);
        alert(
          `Failed to delete room: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      },
    })
  );

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

  const onDeleteClick = () => {
    if (!room || isDeleting) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${room.name}"? This action cannot be undone.`
    );

    if (!confirmed) return;
    if (handleLeaveRoom) {
      handleLeaveRoom();
    }

    deleteRoom({ id: room.id });
  };

  const onToggleLockClick = () => {
    if (!room) return;
    toggleLock({ roomId: room.id });
  };

  const handleShareClick = () => {
    if (!room) return;
    const roomUrl = `${window.location.origin}/chat?roomId=${room.id}&tab=chat-rooms`;
    navigator.clipboard.writeText(roomUrl);
    toast.success("Room link copied to clipboard!");
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
      <div className="flex items-center justify-between border-b p-4">
        <div className="flex items-center gap-3">
          <div>
            <h3 className="flex items-center gap-2 font-semibold text-lg">
              {room.name}
              {room.isLocked && <Lock className="h-4 w-4" />}
            </h3>
            <p className="flex items-center text-muted-foreground text-sm">
              <Users className="mr-1.5 h-4 w-4" />
              {members.length} members
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isMobile && (
            <>
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
              <Sheet>
                <SheetTrigger asChild>
                  <Button size="icon" variant="outline">
                    <PanelRightOpen className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader className="sr-only">
                    <SheetTitle>Room Members</SheetTitle>
                  </SheetHeader>
                  <RoomMembers
                    isRoomOwner={isRoomOwner}
                    members={members}
                    room={room}
                  />
                </SheetContent>
              </Sheet>
            </>
          )}

          {(handleLeaveRoom || isRoomOwner) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="outline">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {handleLeaveRoom && (
                  <DropdownMenuItem onClick={handleLeaveRoom}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Leave Room
                  </DropdownMenuItem>
                )}
                {isRoomOwner && (
                  <>
                    <DropdownMenuItem onClick={handleShareClick}>
                      <Link className="mr-2 h-4 w-4" />
                      <span>Share Room</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onToggleLockClick}>
                      {room.isLocked ? (
                        <>
                          <Unlock className="mr-2 h-4 w-4" />
                          Unlock Room
                        </>
                      ) : (
                        <>
                          <Lock className="mr-2 h-4 w-4" />
                          Lock Room
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      disabled={isDeleting}
                      onClick={onDeleteClick}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      {isDeleting ? "Deleting..." : "Delete Room"}
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

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
                <p className="mt-1">
                  {checkProfanity(msg.content).autoReplaced}
                </p>
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
