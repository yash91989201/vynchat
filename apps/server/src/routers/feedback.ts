import { feedback } from "@/db/schema";
import { adminProcedure, protectedProcedure } from "@/lib/orpc";
import {
  CreateFeedbackInput,
  CreateFeedbackOutput,
  GetFeedbackInput,
  GetFeedbackOutput,
  ListFeedbacksInput,
  ListFeedbacksOutput,
} from "@/lib/schemas";

export const feedbackRouter = {
  // User procedure to create feedback
  create: protectedProcedure
    .input(CreateFeedbackInput)
    .output(CreateFeedbackOutput)
    .handler(async ({ input, context }) => {
      const [newFeedback] = await context.db
        .insert(feedback)
        .values({
          userId: context.session.user.id,
          message: input.message,
        })
        .returning();

      return newFeedback;
    }),

  // User procedure to get a specific feedback
  get: protectedProcedure
    .input(GetFeedbackInput)
    .output(GetFeedbackOutput)
    .handler(async ({ input, context }) => {
      const feedbackData = await context.db.query.feedback.findFirst({
        where: (feedback, { eq, and }) =>
          and(
            eq(feedback.id, input.id),
            eq(feedback.userId, context.session.user.id)
          ),
        with: {
          user: {
            columns: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      return feedbackData || undefined;
    }),

  // User procedure to list their own feedbacks
  listUser: protectedProcedure
    .input(ListFeedbacksInput)
    .output(ListFeedbacksOutput)
    .handler(async ({ context, input }) => {
      const { limit = 20, offset = 0 } = input;

      const feedbacks = await context.db.query.feedback.findMany({
        where: (feedback, { eq }) =>
          eq(feedback.userId, context.session.user.id),
        limit,
        offset,
        orderBy: (feedback, { desc }) => desc(feedback.createdAt),
        with: {
          user: {
            columns: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      return {
        feedbacks,
      };
    }),

  list: adminProcedure
    .input(ListFeedbacksInput)
    .output(ListFeedbacksOutput)
    .handler(async ({ context }) => {
      const feedbacks = await context.db.query.feedback.findMany({
        with: {
          user: true,
        },
      });

      return {
        feedbacks,
      };
    }),
};
