import { adminProcedure } from "@/lib/orpc";
import { ListFeedbacksInput, ListFeedbacksOutput } from "@/lib/schemas";

export const adminFeedbackRouter = {
  list: adminProcedure
    .input(ListFeedbacksInput)
    .output(ListFeedbacksOutput)
    .handler(async ({ context }) => {
      const feedbacks = await context.db.query.feedback.findMany({
        with: {
          user: {
            columns: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: (feedback, { desc }) => desc(feedback.createdAt),
      });

      return {
        feedbacks,
      };
    }),
};

