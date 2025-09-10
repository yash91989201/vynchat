import { createFileRoute } from "@tanstack/react-router";
import { LogInForm } from "@/components/admin/auth/log-in-form";

export const Route = createFileRoute("/(auth)/admin/log-in")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <main className="flex h-full w-full items-center justify-center">
      <LogInForm />
    </main>
  );
}
