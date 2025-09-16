import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { userFollowing } from "@/db/schema";
import { user } from "@/db/schema/auth";
import { protectedProcedure } from "@/lib/orpc";
import { UpdateProfileInput } from "@/lib/schemas";

export const userBaseRouter = {
  follow: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .handler(async ({ input, context }) => {
      await db.insert(userFollowing).values({
        userId: context.session.user.id,
        followingId: input.userId,
      });

      return { success: true };
    }),

  unfollow: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .handler(async ({ input, context }) => {
      await db
        .delete(userFollowing)
        .where(
          and(
            eq(userFollowing.userId, context.session.user.id),
            eq(userFollowing.followingId, input.userId)
          )
        );
      return { success: true };
    }),

  isFollowing: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .handler(async ({ input, context }) => {
      const result = await db
        .select()
        .from(userFollowing)
        .where(
          and(
            eq(userFollowing.userId, context.session.user.id),
            eq(userFollowing.followingId, input.userId)
          )
        );
      return result.length > 0;
    }),
  getBio: protectedProcedure.handler(async ({ context }) => {
    const existingUser = await context.db.query.user.findFirst({
      where: eq(user.id, context.session.user.id),
    });

    return existingUser?.bio || "";
  }),

  updateProfile: protectedProcedure
    .input(UpdateProfileInput)
    .handler(async ({ context, input }) => {
      await context.db
        .update(user)
        .set(input)
        .where(eq(user.id, context.session.user.id));
    }),
};
