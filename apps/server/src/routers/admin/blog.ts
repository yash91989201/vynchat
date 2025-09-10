import { ORPCError } from "@orpc/client";
import { eq } from "drizzle-orm";
import { blog, blogTag, category } from "@/db/schema";
import { adminProcedure } from "@/lib/orpc";
import {
  CreateBlogInput,
  CreateBlogOutput,
  CreateCategoryInput,
  DeleteBlogInput,
  DeleteBlogOutput,
  UpdateBlogInput,
  UpdateBlogOutput,
} from "@/lib/schemas";

export const adminBlogRouter = {
  createBlog: adminProcedure
    .input(CreateBlogInput)
    .output(CreateBlogOutput)
    .handler(async ({ context, input }) => {
      const { tags, ...blogData } = input;
      const [newBlog] = await context.db
        .insert(blog)
        .values(blogData)
        .returning();

      if (!newBlog) {
        throw new ORPCError("BAD_REQUEST", {
          message: "Failed to create new blog",
        });
      }

      const blogTags = tags.map((tag) => ({
        tagId: tag.id,
        blogId: newBlog.id,
      }));

      await context.db.insert(blogTag).values(blogTags);

      return newBlog;
    }),
  updateBlog: adminProcedure
    .input(UpdateBlogInput)
    .output(UpdateBlogOutput)
    .handler(async ({ context, input }) => {
      const updatedPosts = await context.db
        .update(blog)
        .set(input)
        .where(eq(blog.id, input.id))
        .returning();

      return updatedPosts[0];
    }),
  deleteBlog: adminProcedure
    .input(DeleteBlogInput)
    .output(DeleteBlogOutput)
    .handler(async ({ context, input }) => {
      await context.db.delete(blog).where(eq(blog.id, input.id)).returning();
      return {};
    }),
  createCategory: adminProcedure
    .input(CreateCategoryInput)
    .handler(async ({ context, input }) => {
      await context.db.insert(category).values(input);
    }),

  listCategories: adminProcedure.handler(async ({ context }) => {
    const categories = await context.db.select().from(category);
    return categories;
  }),
};
