import { eq } from "drizzle-orm";
import { user } from "@/db/schema/auth";
import { auth } from "@/lib/auth";
import { protectedProcedure } from "@/lib/orpc";
import { ChangePasswordInput, UpdateProfileInput } from "@/lib/schemas";

export const profileRouter = {
  getBio: protectedProcedure.handler(async ({ context }) => {
    const existingUser = await context.db.query.user.findFirst({
      where: eq(user.id, context.session.user.id),
    });

    return existingUser?.bio || "";
  }),

  updateProfile: protectedProcedure
    .input(UpdateProfileInput)
    .handler(async ({ context, input }) => {
      await context.db
        .update(user)
        .set(input)
        .where(eq(user.id, context.session.user.id));
    }),

  changePassword: protectedProcedure
    .input(ChangePasswordInput)
    .handler(async ({ context, input }) => {
      await auth.api.changePassword({
        body: {
          currentPassword: input.currentPassword,
          newPassword: input.newPassword,
        },
        headers: context.headers,
      });
    }),
};
