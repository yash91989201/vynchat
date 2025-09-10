import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/(authenticated)")({
  beforeLoad: ({ context }) => {
    const session = context.session;

    if (!session) {
      throw redirect({
        to: "/",
      });
    }

    return { session };
  },
  component: RouteComponent,
});

function RouteComponent() {
  return <Outlet />;
}
