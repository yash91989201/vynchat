import { count, eq } from "drizzle-orm";
import { tag } from "@/db/schema";
import { publicProcedure } from "@/lib/orpc";
import {
  GetTagInput,
  GetTagOutput,
  ListTagsInput,
  ListTagsOutput,
} from "@/lib/schemas";

export const tagRouter = {
  getTag: publicProcedure
    .input(GetTagInput)
    .output(GetTagOutput)
    .handler(async ({ context, input }) => {
      const existingTag = await context.db.query.tag.findFirst({
        where: eq(tag.id, input.id),
      });

      return existingTag;
    }),
  listTags: publicProcedure
    .input(ListTagsInput)
    .output(ListTagsOutput)
    .handler(async ({ context, input }) => {
      const tags = await context.db.query.tag.findMany({
        limit: input.limit,
        offset: input.offset,
      });

      const totalCount = await context.db.select({ count: count() }).from(tag);

      const total = totalCount[0]?.count || 0;

      return {
        tags,
        total,
      };
    }),
};
