import { ORPCError } from "@orpc/client";
import { eq } from "drizzle-orm";
import { user } from "@/db/schema/auth";
import { auth } from "@/lib/auth";
import { publicProcedure } from "@/lib/orpc";
import { AdminSignUpInput } from "@/lib/schemas";

export const adminAuthRouter = {
  signUp: publicProcedure
    .input(AdminSignUpInput)
    .handler(async ({ context, input }) => {
      const existingAdmin = await context.db.query.user.findMany({
        where: eq(user.role, "admin"),
      });

      if (existingAdmin.length >= 1) {
        throw new ORPCError("CONFLICT", {
          message: "Admin already exists",
        });
      }

      const signUpEmailRes = await auth.api.signUpEmail({
        body: {
          name: input.email.split("@")[0],
          email: input.email,
          password: input.password,
        },
      });

      await context.db
        .update(user)
        .set({
          role: "admin",
        })
        .where(eq(user.id, signUpEmailRes.user.id));
    }),
};
