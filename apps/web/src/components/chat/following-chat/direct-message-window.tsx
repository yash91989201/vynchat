import EmojiPicker, { type EmojiClickData } from "emoji-picker-react";
import { ArrowLeft, Loader2, Paperclip, Send, Smile } from "lucide-react";
import { useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { checkProfanity } from "@/lib/profanity-checker";
import type { ChatMessage } from "@/lib/types";
import { cn } from "@/lib/utils";
import type { Member } from "../chat-room/types";

interface DirectMessageWindowProps {
  messages: ChatMessage[];
  input: string;
  otherUserTyping: boolean;
  handleSend: () => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  currentUser: Member;
  otherUser: Member;
  onClose: () => void;
  isUploading: boolean;
  uploadFile: (file: File) => void;
}

const renderMessageContent = (message: ChatMessage) => {
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

  return <p className="mt-1">{checkProfanity(message.content).autoReplaced}</p>;
};

export const DirectMessageWindow = ({
  messages,
  input,
  otherUserTyping,
  handleSend,
  handleInputChange,
  currentUser,
  otherUser,
  onClose,
  isUploading,
  uploadFile,
}: DirectMessageWindowProps) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    handleInputChange({
      target: { value: input + emojiData.emoji },
    } as React.ChangeEvent<HTMLInputElement>);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadFile(file);
    }
    if (e.target) {
      e.target.value = "";
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, otherUserTyping]);

  return (
    <div className="flex h-[75vh] flex-col gap-0 overflow-hidden bg-card md:h-full">
      <div className="flex flex-shrink-0 items-center justify-between border-b p-4">
        <div className="flex items-center gap-3">
          <Button onClick={onClose} size="icon" variant="ghost">
            <ArrowLeft />
          </Button>
          <Avatar>
            <AvatarImage src={otherUser.image ?? undefined} />
            <AvatarFallback>{otherUser.name?.substring(0, 2)}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-lg">{otherUser.name}</h3>
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1">
        <div className="h-full overflow-y-auto" ref={scrollAreaRef}>
          <div className="space-y-6 p-4">
            {messages.map((msg) => (
              <div
                className={cn(
                  "flex items-start gap-3",
                  msg.sender.id === currentUser.id && "flex-row-reverse"
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
                    msg.sender.id === currentUser.id
                      ? "rounded-br-none bg-primary text-primary-foreground"
                      : "rounded-bl-none bg-muted"
                  )}
                >
                  {msg.sender.id !== currentUser.id && (
                    <p className="font-semibold text-primary">
                      {msg.sender.name}
                    </p>
                  )}
                  {renderMessageContent(msg)}
                  <p className="mt-2 text-right text-xs opacity-70">
                    {new Date(msg.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            {otherUserTyping && (
              <div className="flex items-end justify-start gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={otherUser.image ?? undefined} />
                  <AvatarFallback>
                    {otherUser.name?.substring(0, 2)}
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
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      <div className="flex-shrink-0 border-t p-4">
        <form
          className="flex items-center gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (!input.trim()) return;
            handleSend();
            handleInputChange({
              target: { value: "" },
            } as React.ChangeEvent<HTMLInputElement>);
            inputRef.current?.focus();
          }}
        >
          <Input
            autoComplete="off"
            onChange={handleInputChange}
            placeholder="Type a message..."
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
            <input
              accept="image/*,video/*,audio/*"
              className="hidden"
              onChange={handleFileSelect}
              ref={fileInputRef}
              type="file"
            />
            <Button
              disabled={isUploading}
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

