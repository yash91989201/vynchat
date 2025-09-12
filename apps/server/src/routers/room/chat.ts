import { and, eq } from "drizzle-orm";
import { room, roomMember, skippedPair } from "@/db/schema";
import { protectedProcedure } from "@/lib/orpc";
import {
  FindStrangerOutput,
  JoinRoomInput,
  JoinRoomOutput,
  LeaveRoomInput,
  LeaveRoomOutput,
  SkipStrangerInput,
  SkipStrangerOutput,
} from "@/lib/schemas";
import { supabase } from "@/lib/supabase";

export const roomChatRouter = {
  join: protectedProcedure
    .input(JoinRoomInput)
    .output(JoinRoomOutput)
    .handler(async ({ context, input }) => {
      const { roomId } = input;
      const userId = context.session.user.id;

      const isAlreadyMember = await context.db.query.roomMember.findFirst({
        where: and(
          eq(roomMember.roomId, roomId),
          eq(roomMember.userId, userId)
        ),
      });

      if (isAlreadyMember) {
        return { success: true, message: "Already a member" };
      }

      await context.db.insert(roomMember).values({ roomId, userId });

      return { success: true, message: "Joined room" };
    }),
  findStranger: protectedProcedure
    .output(FindStrangerOutput)
    .handler(async ({ context }) => {
      const userId = context.session.user.id;

      const sendRes = await supabase.schema("pgmq_public").rpc("send", {
        queue_name: "stranger-queue",
        message: { userId },
      });

      if (sendRes.error) throw sendRes.error;

      return { status: "waiting" };
    }),

  leave: protectedProcedure
    .input(LeaveRoomInput)
    .output(LeaveRoomOutput)
    .handler(async ({ context, input }) => {
      await context.db
        .delete(roomMember)
        .where(
          and(
            eq(roomMember.roomId, input.roomId),
            eq(roomMember.userId, context.session.user.id)
          )
        );

      return { success: true, message: "Room left" };
    }),

  skipStranger: protectedProcedure
    .input(SkipStrangerInput)
    .output(SkipStrangerOutput)
    .handler(async ({ context, input }) => {
      const userId = context.session.user.id;
      const { roomId } = input;

      // Get the other user in the room
      const roomMembers = await context.db.query.roomMember.findMany({
        where: eq(roomMember.roomId, roomId),
      });

      const otherUser = roomMembers.find((member) => member.userId !== userId);
      if (!otherUser) {
        throw new Error("No other user found in room");
      }

      // Record the skipped pair
      await context.db.insert(skippedPair).values({
        userAId: userId,
        userBId: otherUser.userId,
      });

      // Delete the room
      await context.db.delete(room).where(eq(room.id, roomId));

      // Notify the other user they were skipped
      const notifyChannel = supabase.channel(`user:${otherUser.userId}`);
      notifyChannel.subscribe();
      await notifyChannel.send({
        type: "broadcast",
        event: "stranger_skipped",
        payload: {
          message: "The stranger skipped you. Finding a new match...",
        },
      });
      await supabase.removeChannel(notifyChannel);

      // Add current user back to the queue
      await supabase.schema("pgmq_public").rpc("send", {
        queue_name: "stranger-queue",
        message: { userId },
      });

      // Add the other user back to the queue too
      await supabase.schema("pgmq_public").rpc("send", {
        queue_name: "stranger-queue",
        message: { userId: otherUser.userId },
      });

      return { success: true, message: "Skipped stranger and rejoined queue" };
    }),
};
