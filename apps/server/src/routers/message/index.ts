import { eventIterator } from "@orpc/server";
import { eq } from "drizzle-orm";
import { message, reaction } from "@/db/schema";
import { protectedProcedure } from "@/lib/orpc";
import { newMessagePublisher } from "@/lib/publishers";
import {
  CreateReactionInput,
  CreateReactionOutput,
  ListMessagesInput,
  ListMessagesOutput,
  SendMessageInput,
  SendMessageOutput,
} from "@/lib/schemas";

export const messageRouter = {
  listMessages: protectedProcedure
    .input(ListMessagesInput)
    .output(ListMessagesOutput)
    .handler(async ({ context, input }) => {
      const messageList = await context.db.query.message.findMany({
        where: eq(message.roomId, input.roomId),
        columns: {
          type: false,
          updatedAt: false,
        },
        with: {
          sender: {
            columns: {
              name: true,
            },
          },
          reactions: {
            columns: {
              emoji: true,
            },
          },
        },
      });

      const messageListWithSenderAndReactions = messageList.map((message) => {
        const sender = message.sender.name;
        const reactions = message.reactions.flatMap(
          (reaction) => reaction.emoji
        );

        return {
          ...message,
          sender,
          reactions,
        };
      });

      return messageListWithSenderAndReactions;
    }),

  sendMessage: protectedProcedure
    .input(SendMessageInput)
    .output(eventIterator(SendMessageOutput))
    .handler(async function* ({ context, input }) {
      const [newMessage] = await context.db
        .insert(message)
        .values({
          content: input.message,
          roomId: input.roomId,
          senderId: context.session.user.id,
        })
        .returning();

      newMessagePublisher.publish("new-message", {
        id: newMessage.id,
        content: newMessage.content,
        roomId: newMessage.roomId,
        createdAt: newMessage.createdAt,
        sender: context.session.user.name,
        senderId: context.session.user.id,
        reactions: [],
      });

      yield {
        id: newMessage.id,
        content: newMessage.content,
        roomId: newMessage.roomId,
        createdAt: newMessage.createdAt,
        sender: context.session.user.name,
        senderId: context.session.user.id,
        reactions: [],
      };
    }),

  createReaction: protectedProcedure
    .input(CreateReactionInput)
    .output(CreateReactionOutput)
    .handler(async ({ context, input }) => {
      const [newReaction] = await context.db
        .insert(reaction)
        .values({
          messageId: input.messageId,
          userId: context.session.user.id,
          emoji: input.emoji,
        })
        .returning();

      return newReaction;
    }),
};
