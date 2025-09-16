import { ORPCError } from "@orpc/server";
import { and, eq } from "drizzle-orm";
import { bannedUser, room, roomMember } from "@/db/schema";
import { protectedProcedure } from "@/lib/orpc";
import {
  BanUserInput,
  BanUserOutput,
  ToggleLockInput,
  ToggleLockOutput,
} from "@/lib/schemas";

export const roomAdminRouter = {
  toggleLock: protectedProcedure
    .input(ToggleLockInput)
    .output(ToggleLockOutput)
    .handler(async ({ context, input }) => {
      const { roomId } = input;
      const userId = context.session.user.id;

      const [roomToUpdate] = await context.db
        .select()
        .from(room)
        .where(eq(room.id, roomId));

      if (!roomToUpdate) {
        throw new ORPCError("NOT_FOUND", {
          message: "Room not found.",
        });
      }

      if (roomToUpdate.ownerId !== userId) {
        throw new ORPCError("FORBIDDEN", {
          message: "You are not the owner of this room.",
        });
      }

      const [updatedRoom] = await context.db
        .update(room)
        .set({ isLocked: !roomToUpdate.isLocked })
        .where(eq(room.id, roomId))
        .returning();

      return updatedRoom;
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

      await context.db.insert(bannedUser).values({
        roomId,
        userId: userToBanId,
        bannedBy: currentUserId,
      });

      await context.db
        .delete(roomMember)
        .where(
          and(eq(roomMember.roomId, roomId), eq(roomMember.userId, userToBanId))
        );

      return {};
    }),
};
