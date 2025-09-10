import { eq } from "drizzle-orm";
import { room } from "@/db/schema";
import { adminProcedure } from "@/lib/orpc";
import {
  CreateRoomInput,
  CreateRoomOutput,
  DeleteRoomInput,
  DeleteRoomOutput,
  UpdateRoomInput,
  UpdateRoomOutput,
} from "@/lib/schemas";

export const adminRoomRouter = {
  createRoom: adminProcedure
    .input(CreateRoomInput)
    .output(CreateRoomOutput)
    .handler(async ({ context, input }) => {
      const newRoom = await context.db.insert(room).values(input).returning();

      return newRoom[0];
    }),
  listRooms: adminProcedure.handler(async ({ context }) => {
    const rooms = await context.db.query.room.findMany();
    return rooms;
  }),
  updateRoom: adminProcedure
    .input(UpdateRoomInput)
    .output(UpdateRoomOutput)
    .handler(async ({ context, input }) => {
      const updatedRooms = await context.db
        .update(room)
        .set(input)
        .where(eq(room.id, input.id))
        .returning();

      return updatedRooms[0];
    }),
  deleteRoom: adminProcedure
    .input(DeleteRoomInput)
    .output(DeleteRoomOutput)
    .handler(async ({ context, input }) => {
      await context.db.delete(room).where(eq(room.id, input.id)).returning();
      return {};
    }),
};
