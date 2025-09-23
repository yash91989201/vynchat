import { createFileRoute } from "@tanstack/react-router";
import { ForgotPasswordForm } from "@/components/user/auth/forgot-password-form";

export const Route = createFileRoute("/(auth)/forgot-password")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <main className="flex h-full w-full items-center justify-center">
      <ForgotPasswordForm />
    </main>
  );
}

