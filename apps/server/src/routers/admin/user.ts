import { and, asc, count, desc, eq, ilike, ne } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { user } from "@/db/schema/auth";
import { adminProcedure } from "@/lib/orpc";

export const adminUserRouter = {
  listUsers: adminProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(10),
        sort: z.enum(["name", "email", "createdAt"]).optional(),
        sortOrder: z.enum(["asc", "desc"]).optional(),
        filter: z
          .object({
            name: z.string().optional(),
            userType: z.enum(["all", "guest", "non-guest"]).optional(),
          })
          .optional(),
      })
    )
    .handler(async ({ input }) => {
      const { page = 1, limit = 10, sort, sortOrder, filter } = input;

      const offset = (page - 1) * limit;

      const whereClauses = [ne(user.role, "admin")];

      if (filter?.name) {
        whereClauses.push(ilike(user.name, `%${filter.name}%`));
      }

      if (filter?.userType === "guest") {
        whereClauses.push(eq(user.isAnonymous, true));
      } else if (filter?.userType === "non-guest") {
        whereClauses.push(eq(user.isAnonymous, false));
      }

      const usersQuery = db
        .select()
        .from(user)
        .where(and(...whereClauses))
        .limit(limit)
        .offset(offset);

      if (sort) {
        const order = sortOrder === "asc" ? asc : desc;
        usersQuery.orderBy(order(user[sort]));
      } else {
        usersQuery.orderBy(desc(user.createdAt));
      }

      const users = await usersQuery;

      const totalUsers = await db
        .select({ value: count() })
        .from(user)
        .where(and(...whereClauses));

      const totalPages = Math.ceil(totalUsers[0].value / limit);
      const hasNextPage = page < totalPages;
      const hasPreviousPage = page > 1;

      return {
        users,
        totalPages,
        hasNextPage,
        hasPreviousPage,
      };
    }),
};
