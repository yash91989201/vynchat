import { eq } from "drizzle-orm";
import { room, roomMember, skippedPair } from "@/db/schema";
import { protectedProcedure } from "@/lib/orpc";
import {
  CreateRoomInput,
  CreateRoomOutput,
  FindStrangerOutput,
  LeaveRoomInput,
  LeaveRoomOutput,
  SkipStrangerInput,
  SkipStrangerOutput,
} from "@/lib/schemas";
import { supabase } from "@/lib/supabase";

export const roomRouter = {
  createDM: protectedProcedure
    .input(CreateRoomInput)
    .output(CreateRoomOutput)
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
    const rooms = await context.db.query.room.findMany({
      where: eq(room.isDM, false),
    });

    return rooms;
  }),

  findStranger: protectedProcedure
    .output(FindStrangerOutput)
    .handler(async ({ context }) => {
      const userId = context.session.user.id;

      const sendRes = await supabase.schema("pgmq_public").rpc("send", {
        queue_name: "stranger-queue",
        message: { userId },
      });

      console.log(sendRes);

      if (sendRes.error) throw sendRes.error;

      return { status: "waiting" };
    }),

  leave: protectedProcedure
    .input(LeaveRoomInput)
    .output(LeaveRoomOutput)
    .handler(async ({ context, input }) => {
      await context.db.delete(room).where(eq(room.id, input.roomId));

      return { success: true, message: "Room deleted" };
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
