import { eq } from "drizzle-orm";
import { userFollowing } from "@/db/schema";
import { protectedProcedure } from "@/lib/orpc";

export const userFollowingRouter = {
  userFollowing: protectedProcedure.handler(async ({ context }) => {
    const rows = await context.db.query.userFollowing.findMany({
      where: eq(userFollowing.userId, context.session.user.id),
      with: {
        following: {
          columns: {
            id: true,
            name: true,
            email: true,
            bio: true,
            image: true,
          },
        },
      },
    });

    const followings = rows.map((r) => r.following).filter(Boolean);

    return { followings };
  }),
};
