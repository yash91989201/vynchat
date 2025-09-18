import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { message, room, roomMember } from "@/db/schema";
import { protectedProcedure } from "@/lib/orpc";

export const dmRouter = {
  getLatestMessage: protectedProcedure
    .input(z.object({ otherUserId: z.string() }))
    .handler(async ({ context, input }) => {
      const { user } = context.session;
      const { otherUserId } = input;

      const roomName = `dm:${[user.id, otherUserId].sort().join(":")}`;

      const existingRoom = await db.query.room.findFirst({
        where: eq(room.name, roomName),
      });

      if (!existingRoom) {
        return null;
      }

      const latestMessage = await db.query.message.findFirst({
        where: and(
          eq(message.roomId, existingRoom.id),
          eq(message.senderId, otherUserId)
        ),
        orderBy: [desc(message.createdAt)],
      });

      return latestMessage ?? null;
    }),
  getOrCreateChat: protectedProcedure
    .input(z.object({ otherUserId: z.string() }))
    .handler(async ({ context, input }) => {
      const { user } = context.session;
      const { otherUserId } = input;

      if (user.id === otherUserId) {
        throw new Error("Cannot create a chat with yourself.");
      }

      const roomName = `dm:${[user.id, otherUserId].sort().join(":")}`;

      const existingRoom = await db.query.room.findFirst({
        where: eq(room.name, roomName),
      });

      if (existingRoom) {
        return existingRoom;
      }

      const newRoom = await db.transaction(async (tx) => {
        const [roomData] = await tx
          .insert(room)
          .values({
            name: roomName,
            ownerId: user.id,
            isLocked: true,
            isDM: true,
          })
          .returning();

        await tx.insert(roomMember).values([
          {
            roomId: roomData.id,
            userId: user.id,
          },
          {
            roomId: roomData.id,
            userId: otherUserId,
          },
        ]);

        return roomData;
      });

      return newRoom;
    }),
};
