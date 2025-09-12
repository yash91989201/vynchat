import { room, roomMember } from "@/db/schema";
import { protectedProcedure } from "@/lib/orpc";
import { CreateRoomInput, CreateRoomOutput } from "@/lib/schemas";

export const userRoomRouter = {
  createRoom: protectedProcedure
    .input(CreateRoomInput)
    .output(CreateRoomOutput)
    .handler(async ({ context, input }) => {
      const userId = context.session.user.id;
      const [newRoom] = await context.db
        .insert(room)
        .values({
          name: input.name,
          ownerId: userId,
          isDM: false,
        })
        .returning();

      await context.db.insert(roomMember).values({
        roomId: newRoom.id,
        userId,
      });

      return newRoom;
    }),
};
