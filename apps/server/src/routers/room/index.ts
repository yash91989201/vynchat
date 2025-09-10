import { eq } from "drizzle-orm";
import { room } from "@/db/schema";
import { protectedProcedure } from "@/lib/orpc";

export const roomRouter = {
  listRooms: protectedProcedure.handler(async ({ context }) => {
    const isAnonymous = !!context.session?.user?.isAnonymous;
    const rooms = await context.db.query.room.findMany({
      where: isAnonymous ? eq(room.isPublic, true) : undefined,
    });

    return rooms;
  }),
};
