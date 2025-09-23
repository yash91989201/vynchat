import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { ResetPasswordForm } from "@/components/user/auth/reset-password-form";

const searchSchema = z.object({
  token: z.string().optional(),
});

export const Route = createFileRoute("/(auth)/reset-password")({
  component: RouteComponent,
  validateSearch: searchSchema,
});

function RouteComponent() {
  return (
    <main className="flex h-full w-full items-center justify-center">
      <ResetPasswordForm />
    </main>
  );
}

