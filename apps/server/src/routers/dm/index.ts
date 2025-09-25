import { and, desc, eq, gt, inArray, ne, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { message, room, roomMember } from "@/db/schema";
import { user } from "@/db/schema/auth";
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
  getUnreadSummary: protectedProcedure
    .output(
      z.object({
        totalUnread: z.number(),
        rooms: z.array(
          z.object({
            roomId: z.string(),
            unreadCount: z.number(),
            otherUser: z.object({
              id: z.string(),
              name: z.string().nullable(),
              image: z.string().nullable(),
            }),
          })
        ),
      })
    )
    .handler(async ({ context }) => {
      const { user: sessionUser } = context.session;

      const memberships = await db
        .select({
          roomId: roomMember.roomId,
          lastReadAt: roomMember.lastReadAt,
        })
        .from(roomMember)
        .innerJoin(room, eq(roomMember.roomId, room.id))
        .where(and(eq(roomMember.userId, sessionUser.id), eq(room.isDM, true)));

      if (memberships.length === 0) {
        return { totalUnread: 0, rooms: [] };
      }

      const roomIds = memberships.map((membership) => membership.roomId);
      const otherMembers = await db
        .select({
          roomId: roomMember.roomId,
          otherUserId: roomMember.userId,
          name: user.name,
          image: user.image,
        })
        .from(roomMember)
        .innerJoin(user, eq(roomMember.userId, user.id))
        .where(
          and(
            inArray(roomMember.roomId, roomIds),
            ne(roomMember.userId, sessionUser.id)
          )
        );

      const otherUserMap = new Map<
        string,
        { id: string; name: string | null; image: string | null }
      >();
      for (const member of otherMembers) {
        otherUserMap.set(member.roomId, {
          id: member.otherUserId,
          name: member.name,
          image: member.image,
        });
      }

      const unreadRows = await db
        .select({
          roomId: message.roomId,
          unreadCount: sql<number>`count(${message.id})`.mapWith(Number),
        })
        .from(message)
        .innerJoin(
          roomMember,
          and(
            eq(roomMember.roomId, message.roomId),
            eq(roomMember.userId, sessionUser.id)
          )
        )
        .where(
          and(
            inArray(message.roomId, roomIds),
            ne(message.senderId, sessionUser.id),
            gt(message.createdAt, roomMember.lastReadAt)
          )
        )
        .groupBy(message.roomId);

      const unreadMap = new Map<string, number>();
      for (const row of unreadRows) {
        unreadMap.set(row.roomId, row.unreadCount);
      }

      const rooms = roomIds
        .map((roomId) => {
          const other = otherUserMap.get(roomId);
          if (!other) return null;
          return {
            roomId,
            otherUser: other,
            unreadCount: unreadMap.get(roomId) ?? 0,
          };
        })
        .filter(
          (roomData): roomData is NonNullable<typeof roomData> =>
            roomData !== null
        );

      const totalUnread = rooms.reduce(
        (acc, roomData) => acc + roomData.unreadCount,
        0
      );

      return {
        totalUnread,
        rooms,
      };
    }),
  markAsRead: protectedProcedure
    .input(z.object({ roomId: z.string() }))
    .output(
      z.object({
        roomId: z.string(),
        lastReadAt: z.coerce.date(),
      })
    )
    .handler(async ({ context, input }) => {
      const { user: sessionUser } = context.session;
      const { roomId } = input;

      const membership = await context.db.query.roomMember.findFirst({
        where: and(
          eq(roomMember.roomId, roomId),
          eq(roomMember.userId, sessionUser.id)
        ),
        with: {
          room: {
            columns: {
              isDM: true,
            },
          },
        },
      });

      if (!membership?.room?.isDM) {
        throw new Error("Room not found or not authorized.");
      }

      const [updated] = await context.db
        .update(roomMember)
        .set({ lastReadAt: new Date() })
        .where(
          and(
            eq(roomMember.roomId, roomId),
            eq(roomMember.userId, sessionUser.id)
          )
        )
        .returning({ lastReadAt: roomMember.lastReadAt });

      if (!updated) {
        throw new Error("Failed to update read status.");
      }

      return {
        roomId,
        lastReadAt: updated.lastReadAt,
      };
    }),
};
