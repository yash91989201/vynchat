import { and, eq } from "drizzle-orm";
import z from "zod";
import { message, roomMember } from "@/db/schema";
import { protectedProcedure } from "@/lib/orpc";

export const messageRouter = {
  send: protectedProcedure
    .input(
      z.object({
        roomId: z.string(),
        content: z.string().min(1).max(1000),
      })
    )
    .output(
      z.object({
        id: z.string(),
        content: z.string(),
        senderId: z.string(),
        roomId: z.string(),
        createdAt: z.date(),
      })
    )
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
          createdAt: new Date(),
        })
        .returning();

      return {
        id: newMessage.id,
        content: newMessage.content,
        senderId: newMessage.senderId,
        roomId: newMessage.roomId,
        createdAt: newMessage.createdAt,
      };
    }),
};
