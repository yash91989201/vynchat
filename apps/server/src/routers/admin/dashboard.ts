import { count } from "drizzle-orm";
import { blog, comment, roomMember } from "@/db/schema";
import { user } from "@/db/schema/auth";
import { adminProcedure } from "@/lib/orpc";

export const adminDashboardRouter = {
  getStats: adminProcedure.handler(async ({ context }) => {
    const totalBlogs = await context.db.select({ value: count() }).from(blog);

    const totalComments = await context.db
      .select({ value: count() })
      .from(comment);

    const totalUsers = await context.db.select({ value: count() }).from(user);

    const activeUsers = await context.db
      .select({ value: count() })
      .from(roomMember);

    return {
      totalBlogs: totalBlogs[0]?.value ?? 0,
      totalComments: totalComments[0]?.value ?? 0,
      totalUsers: totalUsers[0]?.value ?? 0,
      activeUsers: activeUsers[0]?.value ?? 0,
    };
  }),
};
