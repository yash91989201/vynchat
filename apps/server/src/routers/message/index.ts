import { eq } from "drizzle-orm";
import { message } from "@/db/schema";
import { protectedProcedure } from "@/lib/orpc";
import { ListMessagesInput, ListMessagesOutput } from "@/lib/schemas";

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
};
