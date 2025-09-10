import { createFileRoute } from "@tanstack/react-router";
import { SignUpForm } from "@/components/user/auth/sign-up-form";

export const Route = createFileRoute("/(auth)/sign-up")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <main className="flex h-full w-full items-center justify-center">
      <SignUpForm />
    </main>
  );
}
