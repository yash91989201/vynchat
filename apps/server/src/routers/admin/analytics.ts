import { and, count, eq, gte } from "drizzle-orm";
import { db } from "@/db";
import { blog, comment, message, room, roomMember } from "@/db/schema";
import { user } from "@/db/schema/auth";
import { adminProcedure } from "@/lib/orpc";

export const analyticsRouter = {
  getDashboardMetrics: adminProcedure.handler(async () => {
    const [
      totalBlogsResult,
      totalCommentsResult,
      totalUsersResult,
      totalLoggedInUsersResult,
      totalGuestUsersResult,
      activeNowResult,
    ] = await Promise.all([
      db.select({ count: count() }).from(blog),
      db.select({ count: count() }).from(comment),
      db.select({ count: count() }).from(user),
      db
        .select({ count: count() })
        .from(user)
        .where(eq(user.isAnonymous, false)),
      db
        .select({ count: count() })
        .from(user)
        .where(eq(user.isAnonymous, true)),
      db
        .selectDistinct({ userId: roomMember.userId })
        .from(roomMember)
        .leftJoin(room, eq(roomMember.roomId, room.id))
        .leftJoin(message, eq(room.id, message.roomId))
        .where(
          and(
            eq(room.isDM, false),
            gte(message.createdAt, new Date(Date.now() - 5 * 60 * 1000))
          )
        ),
    ]);

    const totalBlogs = totalBlogsResult[0]?.count ?? 0;
    const totalComments = totalCommentsResult[0]?.count ?? 0;
    const totalUsers = totalUsersResult[0]?.count ?? 0;
    const totalLoggedInUsers = totalLoggedInUsersResult[0]?.count ?? 0;
    const totalGuestUsers = totalGuestUsersResult[0]?.count ?? 0;
    const activeNow = activeNowResult.length;

    return {
      totalBlogs,
      totalComments,
      totalUsers,
      totalLoggedInUsers,
      totalGuestUsers,
      activeNow,
    };
  }),
};
