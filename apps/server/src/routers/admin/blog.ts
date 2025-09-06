import { eq } from "drizzle-orm";
import { blog } from "@/db/schema";
import { adminProcedure } from "@/lib/orpc";
import {
  CreateBlogInput,
  CreateBlogOutput,
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
      const newPost = await context.db.insert(blog).values(input).returning();

      return newPost[0];
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
};
