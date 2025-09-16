import { and, asc, eq } from "drizzle-orm";
import z from "zod";
import { message, room, roomMember } from "@/db/schema";
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

      // Check for DM message limit
      const roomData = await context.db.query.room.findFirst({
        where: eq(room.id, roomId),
      });

      if (roomData?.name.startsWith("dm:")) {
        const messages = await context.db.query.message.findMany({
          where: eq(message.roomId, roomId),
        });

        const userIds = roomData.name.replace("dm:", "").split(":");
        const otherUserId = userIds.find((id) => id !== userId);

        const otherUserHasReplied = messages.some(
          (m) => m.senderId === otherUserId
        );

        if (!otherUserHasReplied) {
          const currentUserMessagesCount = messages.filter(
            (m) => m.senderId === userId
          ).length;
          if (currentUserMessagesCount >= 3) {
            throw new Error(
              "You can only send 3 messages until the user replies."
            );
          }
        }
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
