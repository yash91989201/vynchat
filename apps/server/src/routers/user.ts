import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { userFollowers } from "@/db/schema";
import { protectedProcedure } from "@/lib/orpc";

export const userRouter = {
  follow: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .handler(async ({ input, context }) => {
      await db.insert(userFollowers).values({
        userId: input.userId,
        followerId: context.session.user.id,
      });
      return { success: true };
    }),

  unfollow: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .handler(async ({ input, context }) => {
      await db
        .delete(userFollowers)
        .where(
          and(
            eq(userFollowers.userId, input.userId),
            eq(userFollowers.followerId, context.session.user.id)
          )
        );
      return { success: true };
    }),

  isFollowing: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .handler(async ({ input, context }) => {
      const result = await db
        .select()
        .from(userFollowers)
        .where(
          and(
            eq(userFollowers.userId, input.userId),
            eq(userFollowers.followerId, context.session.user.id)
          )
        );
      return result.length > 0;
    }),
};
