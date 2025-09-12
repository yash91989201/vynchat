import { and, eq, getTableColumns, inArray, not, sql } from "drizzle-orm";
import { room, roomMember } from "@/db/schema";
import { protectedProcedure } from "@/lib/orpc";
import {
  CreateDMRoomInput,
  CreateDMRoomOutput,
  CreateRoomInput,
  CreateRoomOutput,
} from "@/lib/schemas";

export const roomBaseRouter = {
  create: protectedProcedure
    .input(CreateRoomInput)
    .output(CreateRoomOutput)
    .handler(async ({ context, input }) => {
      const { name } = input;
      const userId = context.session.user.id;

      const [newRoom] = await context.db
        .insert(room)
        .values({ name, ownerId: userId })
        .returning();

      await context.db.insert(roomMember).values({
        roomId: newRoom.id,
        userId,
      });

      return newRoom;
    }),

  getMyRooms: protectedProcedure.handler(async ({ context }) => {
    const userId = context.session.user.id;

    // 1. Get all non-DM rooms where user is a member
    const userRooms = await context.db
      .select(getTableColumns(room))
      .from(room)
      .where(and(eq(room.ownerId, userId), eq(room.isDM, false)));

    if (userRooms.length === 0) {
      return [];
    }

    // 2. Get member counts for all these rooms
    const roomIds = userRooms.map((room) => room.id);

    const memberCounts = await context.db
      .select({
        roomId: roomMember.roomId,
        memberCount: sql<number>`count(*)`.mapWith(Number),
      })
      .from(roomMember)
      .where(inArray(roomMember.roomId, roomIds))
      .groupBy(roomMember.roomId);

    // 3. Combine the data using JavaScript
    const memberCountMap = new Map(
      memberCounts.map((mc) => [mc.roomId, mc.memberCount])
    );

    const roomsWithMemberCount = userRooms.map((room) => ({
      ...room,
      memberCount: memberCountMap.get(room.id) || 0,
    }));

    return roomsWithMemberCount;
  }),

  createDM: protectedProcedure
    .input(CreateDMRoomInput)
    .output(CreateDMRoomOutput)
    .handler(async ({ context, input }) => {
      const { user1Id, user2Id } = input;

      const [newDMRoom] = await context.db
        .insert(room)
        .values({
          name: `${user1Id}-${user2Id}`,
          isDM: true,
          ownerId: context.session.user.id,
        })
        .returning();

      const roomId = newDMRoom.id;
      await context.db.insert(roomMember).values([
        {
          roomId,
          userId: user1Id,
        },
        { roomId, userId: user2Id },
      ]);

      return newDMRoom;
    }),
  listRooms: protectedProcedure.handler(async ({ context }) => {
    const roomsWithMemberCount = await context.db
      .select({
        id: room.id,
        name: room.name,
        ownerId: room.ownerId,
        createdAt: room.createdAt,
        isDM: room.isDM,
        memberCount: sql<number>`count(${roomMember.userId})`,
      })
      .from(room)
      .leftJoin(roomMember, eq(room.id, roomMember.roomId))
      .where(
        and(
          eq(room.isDM, false),
          not(eq(room.ownerId, context.session.user.id))
        )
      )
      .groupBy(room.id);

    return roomsWithMemberCount;
  }),
};
