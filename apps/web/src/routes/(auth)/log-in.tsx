import { createFileRoute } from "@tanstack/react-router";
import { LogInForm } from "@/components/user/auth/log-in-form";

export const Route = createFileRoute("/(auth)/log-in")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <main className="flex h-full w-full items-center justify-center">
      <LogInForm />
    </main>
  );
}
