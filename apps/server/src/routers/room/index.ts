import { eq } from "drizzle-orm";
import { room, roomMember } from "@/db/schema";
import { protectedProcedure } from "@/lib/orpc";
import {
  CreateRoomInput,
  CreateRoomOutput,
  LeaveRoomInput,
  LeaveRoomOutput,
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

  findStranger: protectedProcedure.handler(async ({ context }) => {
    const userId = context.session.user.id;

    const sendRes = await supabase.schema("pgmq_public").rpc("send", {
      queue_name: "stranger-queue",
      message: { userId },
    });

    if (sendRes.error) throw sendRes.error;

    return { status: "waiting" as const };
  }),

  leave: protectedProcedure
    .input(LeaveRoomInput)
    .output(LeaveRoomOutput)
    .handler(async ({ context, input }) => {
      await context.db.delete(room).where(eq(room.id, input.roomId));

      return { success: true, message: "Room deleted" };
    }),
};
