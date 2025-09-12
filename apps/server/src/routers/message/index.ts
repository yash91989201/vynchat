import { and, asc, eq } from "drizzle-orm";
import z from "zod";
import { message, roomMember } from "@/db/schema";
import { protectedProcedure } from "@/lib/orpc";
import { MessageOutput } from "@/lib/schemas";

export const messageRouter = {
  list: protectedProcedure
    .input(z.object({ roomId: z.string() }))
    .output(z.array(MessageOutput))
    .handler(async ({ context, input }) => {
      const messages = await context.db.query.message.findMany({
        where: eq(message.roomId, input.roomId),
        with: {
          sender: {
            columns: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
        orderBy: asc(message.createdAt),
        limit: 50,
      });

      return messages;
    }),
  send: protectedProcedure
    .input(
      z.object({
        roomId: z.string(),
        content: z.string().min(1).max(1000),
      })
    )
    .output(MessageOutput)
    .handler(async ({ context, input }) => {
      const { roomId, content } = input;
      const userId = context.session.user.id;

      // Verify user is member of the room
      const membership = await context.db.query.roomMember.findFirst({
        where: and(
          eq(roomMember.roomId, roomId),
          eq(roomMember.userId, userId)
        ),
      });

      if (!membership) {
        throw new Error("Not a member of this room");
      }

      // Insert message into database
      const [newMessage] = await context.db
        .insert(message) // assuming you have a message table
        .values({
          content,
          senderId: userId,
          roomId,
        })
        .returning();

      return {
        ...newMessage,
        sender: {
          ...context.session.user,
          image: null,
        },
      };
    }),
};
