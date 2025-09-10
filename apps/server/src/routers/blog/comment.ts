import { ORPCError } from "@orpc/client";
import { type AnyColumn, and, asc, count, desc, eq } from "drizzle-orm";
import { blog, comment } from "@/db/schema";
import { protectedProcedure, publicProcedure } from "@/lib/orpc";
import {
  CreateCommentInput,
  CreateCommentOutput,
  ListBlogCommentsInput,
  ListBlogCommentsOutput,
} from "@/lib/schemas";

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
        with: {
          author: true,
        },
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

  createComment: protectedProcedure
    .input(CreateCommentInput)
    .output(CreateCommentOutput)
    .handler(async ({ context, input }) => {
      const existingBlog = await context.db.query.blog.findFirst({
        where: eq(blog.id, input.blogId),
        columns: {
          id: true,
        },
      });

      if (!existingBlog) {
        throw new ORPCError("NOT_FOUND", { message: "Blog not found" });
      }

      const newComment = await context.db
        .insert(comment)
        .values({
          blogId: input.blogId,
          userId: context.session.user.id,
          text: input.text,
          approved: false,
        })
        .returning()
        .then((res) => res[0]);

      return newComment;
    }),
};
