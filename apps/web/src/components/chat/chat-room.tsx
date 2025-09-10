import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import type { ListMessagesOutputType } from "@server/lib/types";
import { useMutation, useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { useRouteContext } from "@tanstack/react-router";
import { ArrowLeft, Send, SmilePlus } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SendMessageFormSchema } from "@/lib/schemas";
import type { SendMessageFormType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { queryUtils } from "@/utils/orpc";

const getAvatarColor = (name: string) => {
  const colors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-yellow-500",
    "bg-red-500",
    "bg-teal-500",
  ];
  const index =
    name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) %
    colors.length;
  return colors[index];
};

export const ChatRoom = ({
  roomId,
  onBack,
}: {
  roomId: string;
  onBack: () => void;
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { session } = useRouteContext({
    from: "/(authenticated)",
  });

  const user = session.user;

  const { data: initialMessages } = useSuspenseQuery(
    queryUtils.message.listMessages.queryOptions({
      input: {
        roomId,
      },
    })
  );

  const [liveMessages, setLiveMessages] =
    useState<ListMessagesOutputType>(initialMessages);

  const { data: newMessage } = useQuery(
    queryUtils.sse.onNewMessage.experimental_liveOptions({
      input: { roomId },
    })
  );

  const { data: newRoomJoinee } = useQuery(
    queryUtils.sse.onRoomJoin.experimental_liveOptions({
      input: {
        roomId,
      },
    })
  );

  const { data: userLeft } = useQuery(
    queryUtils.sse.onRoomLeave.experimental_liveOptions({
      input: {
        roomId,
      },
    })
  );

  const { mutateAsync: sendMessage, isPending: isSendingMessage } = useMutation(
    queryUtils.message.sendMessage.mutationOptions({})
  );

  const { mutateAsync: createReaction, isPending: isCreatingReaction } =
    useMutation(queryUtils.message.createReaction.mutationOptions({}));

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }, 100);
  }, []);

  useEffect(() => {
    if (newMessage) {
      setLiveMessages((prev) => {
        const isDuplicate = prev.some((msg) => msg.id === newMessage.id);
        if (isDuplicate) {
          return prev;
        }

        const newMessages = [...prev, newMessage];
        setTimeout(scrollToBottom, 0);
        return newMessages;
      });
    }
  }, [scrollToBottom, newMessage]);

  useEffect(() => {
    if (liveMessages.length === 0) {
      return;
    }

    scrollToBottom();
  }, [scrollToBottom, liveMessages.length]);

  useEffect(() => {
    if (newRoomJoinee === undefined) {
      return;
    }
    toast.info(`${newRoomJoinee?.name} joined the room`);
  }, [newRoomJoinee]);

  useEffect(() => {
    if (userLeft === undefined) {
      return;
    }

    toast.info(`${userLeft.name} left the room`);
  }, [userLeft]);

  const form = useForm({
    resolver: standardSchemaResolver(SendMessageFormSchema),
    defaultValues: {
      roomId,
      message: "",
    },
  });

  const onSubmit: SubmitHandler<SendMessageFormType> = async (formData) => {
    try {
      await sendMessage(formData);
      form.reset();
      scrollToBottom();
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message");
    }
  };

  const handleAddReaction = async (messageId: string, emoji: string) => {
    if (isCreatingReaction) {
      return;
    }

    try {
      await createReaction({
        messageId,
        emoji,
      });
    } catch (error) {
      console.error("Failed to add reaction:", error);
      toast.error("Failed to add reaction");
    }
  };

  return (
    <Card className="flex h-full flex-col border-none shadow-none">
      <CardHeader className="flex-shrink-0 border-b p-3">
        <div className="flex items-center gap-2">
          <Button
            className="md:hidden"
            onClick={onBack}
            size="icon"
            variant="ghost"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <CardTitle>Chat Room</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col p-0">
        <ScrollArea className="h-[60vh] bg-slate-50/50 p-4">
          <div className="space-y-6">
            {liveMessages && liveMessages.length > 0 ? (
              liveMessages.map((message) => {
                const isCurrentUser = message.sender === user?.name;
                return (
                  <div
                    className={cn(
                      "flex items-end gap-3",
                      isCurrentUser ? "justify-end" : "justify-start"
                    )}
                    key={message.id}
                  >
                    {!isCurrentUser && message.sender && (
                      <Avatar className="h-8 w-8">
                        <AvatarFallback
                          className={cn(
                            "text-white",
                            getAvatarColor(message.sender)
                          )}
                        >
                          {message.sender.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={cn(
                        "group relative max-w-[70%]",
                        isCurrentUser && "mr-2"
                      )}
                    >
                      <div
                        className={cn(
                          "relative rounded-2xl px-4 py-2 shadow-sm",
                          isCurrentUser
                            ? "rounded-br-none bg-blue-600 text-white"
                            : "rounded-bl-none border bg-white text-gray-900"
                        )}
                      >
                        {!isCurrentUser && message.sender && (
                          <p className="mb-1 font-semibold text-blue-600 text-xs">
                            {message.sender}
                          </p>
                        )}

                        <p className="text-sm leading-relaxed">
                          {message.content}
                        </p>

                        <div className="mt-1 text-right">
                          <span
                            className={cn(
                              "text-xs",
                              isCurrentUser ? "text-blue-200" : "text-gray-400"
                            )}
                          >
                            {new Date(message.createdAt).toLocaleTimeString(
                              [],
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </span>
                        </div>
                      </div>

                      {message.reactions && message.reactions.length > 0 && (
                        <div
                          className={cn(
                            "mt-1 flex gap-1",
                            isCurrentUser ? "justify-end" : "justify-start"
                          )}
                        >
                          {Object.entries(
                            message.reactions.reduce(
                              (acc, emoji) => {
                                acc[emoji] = (acc[emoji] || 0) + 1;
                                return acc;
                              },
                              {} as Record<string, number>
                            )
                          ).map(([emoji, count]) => (
                            <div
                              className="rounded-full border bg-white px-2 py-0.5 text-xs shadow-sm"
                              key={emoji}
                            >
                              {emoji} {count}
                            </div>
                          ))}
                        </div>
                      )}

                      <div
                        className={cn(
                          "-translate-y-1/2 absolute top-1/2 opacity-0 transition-opacity group-hover:opacity-100",
                          isCurrentUser ? "-left-10" : "-right-10"
                        )}
                      >
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              className="rounded-full"
                              disabled={isCreatingReaction}
                              size="icon"
                              variant="ghost"
                            >
                              <SmilePlus className="h-4 w-4 text-gray-500" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-1">
                            <div className="flex gap-1">
                              {["👍", "❤", "😂", "😮", "😢", "🙏"].map(
                                (emoji) => (
                                  <Button
                                    className="transform text-xl transition-transform hover:scale-125"
                                    disabled={isCreatingReaction}
                                    key={emoji}
                                    onClick={() =>
                                      handleAddReaction(message.id, emoji)
                                    }
                                    size="icon"
                                    variant="ghost"
                                  >
                                    {emoji}
                                  </Button>
                                )
                              )}
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex h-full items-center justify-center pt-24">
                <div className="text-center">
                  <p className="text-gray-500">No messages yet.</p>
                  <p className="text-gray-400 text-sm">
                    Be the first to say something!
                  </p>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <div className="flex-shrink-0 border-t bg-white p-4">
          <Form {...form}>
            <form
              className="flex items-center gap-3"
              onSubmit={form.handleSubmit(onSubmit)}
            >
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input
                        autoComplete="off"
                        className="rounded-full"
                        placeholder="Type a message..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                className="h-10 w-10 shrink-0 rounded-full"
                disabled={isSendingMessage || !form.formState.isValid}
                size="icon"
                type="submit"
              >
                {isSendingMessage ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </Button>
            </form>
          </Form>
        </div>
      </CardContent>
    </Card>
  );
};
