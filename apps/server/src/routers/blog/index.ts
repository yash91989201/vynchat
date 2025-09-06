import type { AnyColumn, SQL } from "drizzle-orm";
import { and, asc, count, desc, eq, like } from "drizzle-orm";
import { blog } from "@/db/schema";
import { publicProcedure } from "@/lib/orpc";
import {
  GetBlogInput,
  GetBlogOutput,
  ListBlogsInput,
  ListBlogsOutput,
} from "@/lib/schemas";

export const blogRouter = {
  getBlog: publicProcedure
    .input(GetBlogInput)
    .output(GetBlogOutput)
    .handler(async ({ context, input }) => {
      const existingBlog = await context.db.query.blog.findFirst({
        where: eq(blog.id, input.id),
      });

      return existingBlog;
    }),
  listBlogs: publicProcedure
    .input(ListBlogsInput)
    .output(ListBlogsOutput)
    .handler(async ({ context, input }) => {
      const filters: SQL[] = [];
      if (input.search?.title) {
        filters.push(like(blog.title, `%${input.search.title}%`));
      }
      if (input.search?.slug) {
        filters.push(like(blog.slug, `%${input.search.slug}%`));
      }
      if (input.filter?.category) {
        filters.push(eq(blog.category, input.filter.category));
      }

      const whereClause = filters.length > 0 ? and(...filters) : undefined;

      const sortFields: Record<string, AnyColumn> = {
        updatedAt: blog.updatedAt,
        title: blog.title,
        createdAt: blog.createdAt,
      };

      const orderByColumn = sortFields[input.sort?.field ?? "createdAt"];

      const posts = await context.db.query.blog.findMany({
        where: whereClause,
        orderBy:
          input.sort.order === "asc" ? asc(orderByColumn) : desc(orderByColumn),
        limit: input.limit,
        offset: input.offset,
      });

      const totalCount = await context.db
        .select({ count: count() })
        .from(blog)
        .where(whereClause);

      const total = totalCount[0]?.count || 0;
      const totalPages = Math.ceil(total / input.limit);
      const currentPage = Math.floor(input.offset / input.limit);
      const hasNextPage = input.offset + input.limit < total;
      const hasPreviousPage = input.offset > 0;

      return {
        posts,
        total,
        totalPages,
        currentPage,
        hasNextPage,
        hasPreviousPage,
      };
    }),
};
