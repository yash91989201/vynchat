import { ORPCError } from "@orpc/server";
import { and, eq } from "drizzle-orm";
import { room, roomMember, skippedPair } from "@/db/schema";
import { protectedProcedure } from "@/lib/orpc";
import {
  FindStrangerInput,
  FindStrangerOutput,
  JoinRoomInput,
  JoinRoomOutput,
  LeaveRoomInput,
  LeaveRoomOutput,
  ListRoomMembersInput,
  ListRoomMembersOutput,
  SkipStrangerInput,
  SkipStrangerOutput,
} from "@/lib/schemas";
import { supabase } from "@/lib/supabase";

export const roomChatRouter = {
  join: protectedProcedure
    .input(JoinRoomInput)
    .output(JoinRoomOutput)
    .handler(async ({ context, input }) => {
      const { roomId, requeueOther } = input;
      const userId = context.session.user.id;

      const roomToJoin = await context.db.query.room.findFirst({
        where: eq(room.id, roomId),
      });

      if (!roomToJoin) {
        throw new ORPCError("NOT_FOUND", {
          message: "Room not found.",
        });
      }

      const isAlreadyMember = await context.db.query.roomMember.findFirst({
        where: and(
          eq(roomMember.roomId, roomId),
          eq(roomMember.userId, userId)
        ),
      });

      if (isAlreadyMember) {
        return { success: true, message: "Already a member" };
      }

      if (roomToJoin.isLocked) {
        throw new ORPCError("FORBIDDEN", {
          message: "This room is locked. You cannot join at this time.",
        });
      }

      await context.db.insert(roomMember).values({ roomId, userId });

      return { success: true, message: "Joined room" };
    }),
  findStranger: protectedProcedure
    .input(FindStrangerInput)
    .output(FindStrangerOutput)
    .handler(async ({ context, input }) => {
      const userId = context.session.user.id;
      const { continent } = input;

      const sendRes = await supabase.schema("pgmq_public").rpc("send", {
        queue_name: "stranger-queue",
        message: { userId, continent },
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
      const { roomId, requeueOther } = input;

      // Get the other user in the room
      const roomMembers = await context.db.query.roomMember.findMany({
        where: eq(roomMember.roomId, roomId),
      });

      const otherUser = roomMembers.find((member) => member.userId !== userId);

      // Always clean up the room so the remaining participant is free to rematch
      await context.db.delete(room).where(eq(room.id, roomId));

      // If we can identify the other participant, record the skip + notify them
      if (otherUser) {
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
            setTimeout(
              () => reject(new Error("Channel subscription timeout")),
              3000
            );
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

        if (requeueOther ?? true) {
          // Add the other user back to the queue so they can be re-matched when they return
          try {
            await supabase.schema("pgmq_public").rpc("send", {
              queue_name: "stranger-queue",
              message: { userId: otherUser.userId, continent: "World" },
            });
          } catch (queueError) {
            console.error("Failed to add other user to queue:", queueError);
          }
        }
      }

      // Add current user back to the queue
      try {
        await supabase.schema("pgmq_public").rpc("send", {
          queue_name: "stranger-queue",
          message: { userId, continent: input.continent },
        });
      } catch (queueError) {
        console.error("Failed to add current user to queue:", queueError);
      }

      return { success: true, message: "Skipped stranger and rejoined queue" };
    }),
  listRoomMembers: protectedProcedure
    .input(ListRoomMembersInput)
    .output(ListRoomMembersOutput)
    .handler(async ({ context, input }) => {
      const roomWithMembers = await context.db.query.room.findFirst({
        where: eq(room.id, input.roomId),
        with: {
          members: {
            with: {
              user: {
                columns: {
                  id: true,
                  name: true,
                  image: true,
                  isAnonymous: true,
                },
              },
            },
          },
        },
      });

      if (roomWithMembers === undefined) {
        return [];
      }

      const roomMembers = roomWithMembers.members;

      if (input.includeSelf === false) {
        return roomMembers.filter(
          (member) => member.userId !== context.session.user.id
        );
      }

      return roomMembers;
    }),
};
