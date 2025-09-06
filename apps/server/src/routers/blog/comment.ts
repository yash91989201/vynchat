import { type AnyColumn, and, asc, count, desc, eq } from "drizzle-orm";
import { comment } from "@/db/schema";
import { publicProcedure } from "@/lib/orpc";
import { ListBlogCommentsInput, ListBlogCommentsOutput } from "@/lib/schemas";

export const blogCommentRouter = {
  listComments: publicProcedure
    .input(ListBlogCommentsInput)
    .output(ListBlogCommentsOutput)
    .handler(async ({ context, input }) => {
      const whereClause = and(
        eq(comment.blogId, input.blogId),
        eq(comment.approved, true)
      );

      const sortFields: Record<string, AnyColumn> = {
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
      };

      const orderByColumn = sortFields[input.sort.field ?? "createdAt"];

      const comments = await context.db.query.comment.findMany({
        where: whereClause,
        orderBy:
          input.sort.order === "asc" ? asc(orderByColumn) : desc(orderByColumn),
        limit: input.limit,
        offset: input.offset,
      });

      const totalCount = await context.db
        .select({ count: count() })
        .from(comment)
        .where(whereClause);

      const total = totalCount[0]?.count || 0;
      const totalPages = Math.ceil(total / input.limit);
      const currentPage = Math.floor(input.offset / input.limit);
      const hasNextPage = input.offset + input.limit < total;
      const hasPreviousPage = input.offset > 0;

      return {
        comments,
        total,
        totalPages,
        currentPage,
        hasNextPage,
        hasPreviousPage,
      };
    }),
};
