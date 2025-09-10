import { eq } from "drizzle-orm";
import { comment } from "@/db/schema";
import { adminProcedure } from "@/lib/orpc";
import { ApproveCommentInput, ApproveCommentOutput } from "@/lib/schemas";

export const adminCommentRouter = {
  listPendingComments: adminProcedure.handler(async ({ context }) => {
    const pendingComments = await context.db.query.comment.findMany({
      where: eq(comment.approved, false),
      with: {
        author: true,
      },
    });
    return pendingComments;
  }),
  approveComment: adminProcedure
    .input(ApproveCommentInput)
    .output(ApproveCommentOutput)
    .handler(async ({ context, input }) => {
      const updatedComments = await context.db
        .update(comment)
        .set({ approved: true })
        .where(eq(comment.id, input.id))
        .returning();

      return updatedComments[0];
    }),
};
