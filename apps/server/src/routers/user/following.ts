import { eq } from "drizzle-orm";
import { userFollowing } from "@/db/schema";
import { protectedProcedure } from "@/lib/orpc";

export const userFollowingRouter = {
  userFollowing: protectedProcedure.handler(async ({ context }) => {
    const currentUserId = context.session.user.id;

    const followingRows = await context.db.query.userFollowing.findMany({
      where: eq(userFollowing.userId, currentUserId),
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

    const followersRows = await context.db.query.userFollowing.findMany({
      where: eq(userFollowing.followingId, currentUserId),
      with: {
        user: {
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

    const following = followingRows.map((r) => r.following).filter(Boolean);
    const followers = followersRows.map((r) => r.user).filter(Boolean);

    const followingIds = new Set(following.map((u) => u.id));
    const followersIds = new Set(followers.map((u) => u.id));

    const mutual = following.filter((u) => followersIds.has(u.id));
    const followingOnly = following.filter((u) => !followersIds.has(u.id));
    const followersOnly = followers.filter((u) => !followingIds.has(u.id));

    return { mutual, following: followingOnly, followers: followersOnly };
  }),
};
