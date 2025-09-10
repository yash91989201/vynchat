import { createFileRoute } from "@tanstack/react-router";
import { SignUpForm } from "@/components/admin/auth/sign-up-form";

export const Route = createFileRoute("/(auth)/admin/sign-up")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <main className="flex h-full w-full items-center justify-center">
      <SignUpForm />
    </main>
  );
}
