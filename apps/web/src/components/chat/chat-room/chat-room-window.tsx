import EmojiPicker, { type EmojiClickData } from "emoji-picker-react";
import { Paperclip, Send, Smile, Users } from "lucide-react";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const messages = [
  {
    id: "msg1",
    senderId: "user2",
    senderName: "Jane Doe",
    avatar: "/avatars/jane-doe.png",
    content: "Hey everyone, what's the plan for the weekend?",
    timestamp: "10:30 AM",
  },
  {
    id: "msg2",
    senderId: "user3",
    senderName: "John Smith",
    avatar: "/avatars/john-smith.png",
    content: "I'm thinking of going for a hike. Anyone interested?",
    timestamp: "10:31 AM",
  },
  {
    id: "msg3",
    senderId: "me",
    senderName: "You",
    avatar: "/avatars/me.png",
    content: "That sounds great! I'm in.",
    timestamp: "10:32 AM",
  },
  {
    id: "msg4",
    senderId: "user2",
    senderName: "Jane Doe",
    avatar: "/avatars/jane-doe.png",
    content: "Awesome! Let's coordinate.",
    timestamp: "10:33 AM",
  },
];

export const ChatRoomWindow = () => {
  const [input, setInput] = useState("");

  const currentRoom = {
    name: "Design Team",
    members: 8,
  };

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setInput((prev) => prev + emojiData.emoji);
  };

  return (
    <div className="flex h-full flex-col bg-card">
      {/* Header */}
      <div className="flex items-center justify-between border-b p-4">
        <div>
          <h3 className="font-semibold text-lg">{currentRoom.name}</h3>
          <p className="flex items-center text-muted-foreground text-sm">
            <Users className="mr-1.5 h-4 w-4" />
            {currentRoom.members} members
          </p>
        </div>
        {/* Maybe some room actions here later */}
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1">
        <div className="space-y-6 p-4">
          {messages.map((msg) => (
            <div
              className={cn(
                "flex items-start gap-3",
                msg.senderId === "me" && "flex-row-reverse"
              )}
              key={msg.id}
            >
              <Avatar>
                <AvatarImage src={msg.avatar} />
                <AvatarFallback>
                  {msg.senderName.substring(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div
                className={cn(
                  "max-w-md rounded-lg p-3 text-sm shadow-sm",
                  msg.senderId === "me"
                    ? "rounded-br-none bg-primary text-primary-foreground"
                    : "rounded-bl-none bg-muted"
                )}
              >
                {msg.senderId !== "me" && (
                  <p className="font-semibold text-primary">{msg.senderName}</p>
                )}
                <p className="mt-1">{msg.content}</p>
                <p className="mt-2 text-right text-xs opacity-70">
                  {msg.timestamp}
                </p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="border-t p-4">
        <form
          className="flex items-center gap-3"
          onSubmit={(e) => {
            e.preventDefault();
          }}
        >
          <Input
            autoComplete="off"
            onChange={(e) => setInput(e.target.value)}
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
            <Button className="ml-2" size="icon" type="submit">
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

