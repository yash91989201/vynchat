import { ORPCError } from "@orpc/client";
import { eventIterator } from "@orpc/server";
import { and, count, eq } from "drizzle-orm";
import { room, roomMember } from "@/db/schema";
import { protectedProcedure } from "@/lib/orpc";
import {
  roomMemberJoinedPublisher,
  roomMemberLeftPublisher,
} from "@/lib/publishers";
import {
  JoinRoomInput,
  JoinRoomOutput,
  LeaveRoomInput,
  LeaveRoomOutput,
} from "@/lib/schemas";

export const roomRouter = {
  listRooms: protectedProcedure.handler(async ({ context }) => {
    const isAnonymous = !!context.session?.user?.isAnonymous;
    const rooms = await context.db.query.room.findMany({
      where: isAnonymous ? eq(room.isPublic, true) : undefined,
    });

    return rooms;
  }),

  joinRoom: protectedProcedure
    .input(JoinRoomInput)
    .output(eventIterator(JoinRoomOutput))
    .handler(async function* ({ context, input }) {
      const roomExists = await context.db.query.room.findFirst({
        where: eq(room.id, input.roomId),
      });

      if (!roomExists) {
        throw new ORPCError("NOT_FOUND", { message: "Room not found" });
      }

      if (!roomExists.isPublic && context.session.user.role === "guest") {
        throw new ORPCError("FORBIDDEN", {
          message: "Guests can only join public rooms",
        });
      }

      const roomAlreadyJoined = await context.db.query.roomMember.findFirst({
        where: and(
          eq(roomMember.roomId, input.roomId),
          eq(roomMember.userId, context.session.user.id)
        ),
      });

      const [roomMembers] = await context.db
        .select({ count: count(room.id) })
        .from(room)
        .where(eq(room.id, input.roomId));

      if (roomAlreadyJoined) {
        roomMemberJoinedPublisher.publish("user-joined", {
          roomId: input.roomId,
          userId: context.session.user.id,
          name: context.session.user.name,
          memberCount: roomMembers.count,
        });

        yield {
          success: true,
          message: `${context.session.user.name} joined the room.`,
        };
      }

      await context.db.insert(roomMember).values({
        userId: context.session.user.id,
        roomId: input.roomId,
      });

      roomMemberJoinedPublisher.publish("user-joined", {
        roomId: input.roomId,
        userId: context.session.user.id,
        name: context.session.user.name,
        memberCount: roomMembers.count,
      });

      yield {
        success: true,
        message: `${context.session.user.name} joined the room.`,
      };
    }),

  leaveRoom: protectedProcedure
    .input(LeaveRoomInput)
    .output(eventIterator(LeaveRoomOutput))
    .handler(async function* ({ context, input }) {
      const roomExists = await context.db.query.room.findFirst({
        where: eq(room.id, input.roomId),
      });

      if (!roomExists) {
        throw new ORPCError("NOT_FOUND", { message: "Room not found" });
      }

      if (!roomExists.isPublic && context.session.user.role === "guest") {
        throw new ORPCError("FORBIDDEN", {
          message: "Guests can only join public rooms",
        });
      }

      const roomJoined = await context.db.query.roomMember.findFirst({
        where: and(
          eq(roomMember.roomId, input.roomId),
          eq(roomMember.userId, context.session.user.id)
        ),
      });

      const [roomMembers] = await context.db
        .select({ count: count(room.id) })
        .from(room)
        .where(eq(room.id, input.roomId));

      if (!roomJoined) {
        roomMemberLeftPublisher.publish("user-left", {
          roomId: input.roomId,
          userId: context.session.user.id,
          name: context.session.user.name,
          memberCount: roomMembers.count,
        });

        yield {
          success: true,
          message: `${context.session.user.name} left the room.`,
        };
      }

      await context.db
        .delete(roomMember)
        .where(
          and(
            eq(roomMember.roomId, input.roomId),
            eq(roomMember.userId, context.session.user.id)
          )
        );

      roomMemberLeftPublisher.publish("user-left", {
        roomId: input.roomId,
        userId: context.session.user.id,
        name: context.session.user.name,
        memberCount: roomMembers.count,
      });

      yield {
        success: true,
        message: `${context.session.user.name} left the room.`,
      };
    }),
};
