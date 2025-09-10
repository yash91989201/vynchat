import { eq } from "drizzle-orm";
import { tag } from "@/db/schema";
import { adminProcedure } from "@/lib/orpc";
import {
  CreateTagInput,
  CreateTagOutput,
  DeleteTagInput,
  DeleteTagOutput,
  UpdateTagInput,
  UpdateTagOutput,
} from "@/lib/schemas";

export const adminTagRouter = {
  createTag: adminProcedure
    .input(CreateTagInput)
    .output(CreateTagOutput)
    .handler(async ({ context, input }) => {
      const newTag = await context.db.insert(tag).values(input).returning();

      return newTag[0];
    }),
  listTags: adminProcedure.handler(async ({ context }) => {
    const tags = await context.db.query.tag.findMany();
    return tags;
  }),
  updateTag: adminProcedure
    .input(UpdateTagInput)
    .output(UpdateTagOutput)
    .handler(async ({ context, input }) => {
      const updatedTags = await context.db
        .update(tag)
        .set(input)
        .where(eq(tag.id, input.id))
        .returning();

      return updatedTags[0];
    }),
  deleteTag: adminProcedure
    .input(DeleteTagInput)
    .output(DeleteTagOutput)
    .handler(async ({ context, input }) => {
      await context.db.delete(tag).where(eq(tag.id, input.id)).returning();
      return {};
    }),
};
