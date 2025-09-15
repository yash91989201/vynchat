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

      // Record the skipped pair - create both directions to prevent future matching
      await context.db.insert(skippedPair).values([
        {
          userAId: userId,
          userBId: otherUser.userId,
        },
        {
          userAId: otherUser.userId,
          userBId: userId,
        },
      ]);

      // Delete the room
      await context.db.delete(room).where(eq(room.id, roomId));

      // Notify the other user they were skipped
      try {
        const notifyChannel = supabase.channel(`user:${otherUser.userId}`);

        await new Promise<void>((resolve, reject) => {
          notifyChannel.subscribe((status) => {
            if (status === "SUBSCRIBED") {
              resolve();
            } else if (status === "CHANNEL_ERROR") {
              reject(new Error("Failed to subscribe to notification channel"));
            }
          });

          // Timeout after 3 seconds
          setTimeout(() => reject(new Error("Channel subscription timeout")), 3000);
        });

        await notifyChannel.send({
          type: "broadcast",
          event: "stranger_skipped",
          payload: {
            message: "The stranger skipped you. Finding a new match...",
          },
        });

        await supabase.removeChannel(notifyChannel);
      } catch (notificationError) {
        console.error("Failed to notify other user:", notificationError);
        // Don't throw here - the skip was successful even if notification failed
      }

      // Add current user back to the queue
      try {
        await supabase.schema("pgmq_public").rpc("send", {
          queue_name: "stranger-queue",
          message: { userId },
        });
      } catch (queueError) {
        console.error("Failed to add current user to queue:", queueError);
      }

      // Add the other user back to the queue too
      try {
        await supabase.schema("pgmq_public").rpc("send", {
          queue_name: "stranger-queue",
          message: { userId: otherUser.userId },
        });
      } catch (queueError) {
        console.error("Failed to add other user to queue:", queueError);
      }

      return { success: true, message: "Skipped stranger and rejoined queue" };
    }),
};
