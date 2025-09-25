import { and, count, eq, gte, sql } from "drizzle-orm";
import { z } from "zod";
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
  getEngagementTrends: adminProcedure
    .input(
      z
        .object({
          days: z.number().int().min(1).max(90).default(7),
        })
        .optional()
    )
    .handler(async ({ input }) => {
      const days = input?.days ?? 7;

      const endDate = new Date();
      endDate.setHours(0, 0, 0, 0);

      const startDate = new Date(endDate);
      startDate.setDate(endDate.getDate() - (days - 1));

      const dayExpression = sql<string>`date_trunc('day', ${
        message.createdAt
      })::date`;

      const [messagesPerDayRaw, activeUsersPerDayRaw] = await Promise.all([
        db
          .select({
            day: dayExpression,
            totalMessages: count(message.id),
          })
          .from(message)
          .where(gte(message.createdAt, startDate))
          .groupBy(dayExpression)
          .orderBy(dayExpression),
        db
          .select({
            day: dayExpression,
            totalActiveUsers: sql<number>`count(distinct ${message.senderId})`,
          })
          .from(message)
          .where(gte(message.createdAt, startDate))
          .groupBy(dayExpression)
          .orderBy(dayExpression),
      ]);

      const formatDateKey = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      };

      const toDateKey = (value: unknown) => {
        if (value instanceof Date) {
          return formatDateKey(value);
        }

        if (typeof value === "string") {
          return value;
        }

        if (typeof value === "number") {
          return formatDateKey(new Date(value));
        }

        if (value && typeof value === "object") {
          if (value instanceof Date) {
            return formatDateKey(value);
          }

          if (
            "toISOString" in value &&
            typeof (value as { toISOString?: unknown }).toISOString ===
              "function"
          ) {
            return (value as { toISOString: () => string })
              .toISOString()
              .slice(0, 10);
          }

          if (
            "valueOf" in value &&
            typeof (value as { valueOf?: unknown }).valueOf === "function"
          ) {
            const rawValue = Number(
              (value as { valueOf: () => unknown }).valueOf()
            );
            if (!Number.isNaN(rawValue)) {
              return formatDateKey(new Date(rawValue));
            }
          }
        }

        return formatDateKey(startDate);
      };

      const toNumber = (value: unknown) => {
        if (typeof value === "number") return value;
        if (typeof value === "bigint") return Number(value);
        if (typeof value === "string") return Number(value);
        return 0;
      };

      const dateKeys = Array.from({ length: days }, (_, index) => {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + index);
        return formatDateKey(date);
      });

      const messageCountMap = new Map<string, number>();
      for (const row of messagesPerDayRaw) {
        messageCountMap.set(toDateKey(row.day), toNumber(row.totalMessages));
      }

      const activeUsersMap = new Map<string, number>();
      for (const row of activeUsersPerDayRaw) {
        activeUsersMap.set(toDateKey(row.day), toNumber(row.totalActiveUsers));
      }

      const messagesPerDay = dateKeys.map((date) => ({
        date,
        count: messageCountMap.get(date) ?? 0,
      }));

      const activeUsersPerDay = dateKeys.map((date) => ({
        date,
        count: activeUsersMap.get(date) ?? 0,
      }));

      return {
        range: {
          days,
          start: dateKeys[0] ?? formatDateKey(startDate),
          end: dateKeys.at(-1) ?? formatDateKey(endDate),
        },
        activeUsersPerDay,
        messagesPerDay,
      };
    }),
};
