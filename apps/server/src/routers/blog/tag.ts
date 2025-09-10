import { eq } from "drizzle-orm";
import { blogTag } from "@/db/schema";
import { publicProcedure } from "@/lib/orpc";
import { ListBlogTagsInput } from "@/lib/schemas";

export const blogTagRouter = {
  listBlogTags: publicProcedure
    .input(ListBlogTagsInput)
    .handler(async ({ context, input }) => {
      const blogTags = await context.db.query.blogTag.findMany({
        where: eq(blogTag.blogId, input.blogId),
        with: {
          tag: true,
        },
      });

      const tags = blogTags.flatMap((bt) => bt.tag);

      return tags;
    }),
};
