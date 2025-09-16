import { ORPCError } from "@orpc/server";
import { and, eq, getTableColumns, inArray, not, sql } from "drizzle-orm";
import { bannedUser, room, roomMember } from "@/db/schema";
import { protectedProcedure } from "@/lib/orpc";
import {
  BanUserInput,
  BanUserOutput,
  CreateDMRoomInput,
  CreateDMRoomOutput,
  CreateRoomInput,
  CreateRoomOutput,
  DeleteRoomInput,
  DeleteRoomOutput,
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

  delete: protectedProcedure
    .input(DeleteRoomInput)
    .output(DeleteRoomOutput)
    .handler(async ({ context, input }) => {
      const { id: roomId } = input;
      const userId = context.session.user.id;

      const [roomToDelete] = await context.db
        .select()
        .from(room)
        .where(eq(room.id, roomId));

      if (!roomToDelete) {
        throw new ORPCError("NOT_FOUND", {
          message: "Room not found.",
        });
      }

      if (roomToDelete.ownerId !== userId) {
        throw new ORPCError("FORBIDDEN", {
          message: "You are not the owner of this room.",
        });
      }

      await context.db.delete(roomMember).where(eq(roomMember.roomId, roomId));
      await context.db.delete(room).where(eq(room.id, roomId));

      return {};
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
    const userId = context.session.user.id;

    const bannedRoomsSubquery = context.db
      .select({ roomId: bannedUser.roomId })
      .from(bannedUser)
      .where(eq(bannedUser.userId, userId));

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
          not(eq(room.ownerId, context.session.user.id)),
          not(inArray(room.id, bannedRoomsSubquery))
        )
      )
      .groupBy(room.id);

    return roomsWithMemberCount;
  }),

  ban: protectedProcedure
    .input(BanUserInput)
    .output(BanUserOutput)
    .handler(async ({ context, input }) => {
      const { roomId, userId: userToBanId } = input;
      const currentUserId = context.session.user.id;

      const [roomToUpdate] = await context.db
        .select()
        .from(room)
        .where(eq(room.id, roomId));

      if (!roomToUpdate) {
        throw new ORPCError("NOT_FOUND", {
          message: "Room not found.",
        });
      }

      if (roomToUpdate.ownerId !== currentUserId) {
        throw new ORPCError("FORBIDDEN", {
          message: "You are not the owner of this room.",
        });
      }

      if (roomToUpdate.ownerId === userToBanId) {
        throw new ORPCError("BAD_REQUEST", {
          message: "You cannot ban yourself.",
        });
      }

      // Add to banned_user table
      await context.db.insert(bannedUser).values({
        roomId,
        userId: userToBanId,
        bannedBy: currentUserId,
      });

      // Remove from room_member table
      await context.db
        .delete(roomMember)
        .where(
          and(eq(roomMember.roomId, roomId), eq(roomMember.userId, userToBanId))
        );

      return {};
    }),
};
