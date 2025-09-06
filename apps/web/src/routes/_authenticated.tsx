import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: ({ context, location }) => {
    const session = context.session;

    if (!session) {
      if (location.pathname.startsWith("/_authenticated/admin")) {
        throw redirect({
          to: "/auth/admin/log-in",
        });
      }
      throw redirect({
        to: "/",
      });
    }

    const isAdmin = session.user.role === "admin";

    if (isAdmin && location.pathname.startsWith("/user")) {
      throw redirect({
        to: "/dashboard",
      });
    }

    if (!isAdmin && location.pathname.startsWith("/dashboard")) {
      throw redirect({
        to: "/chat",
      });
    }
  },
  component: () => <Outlet />,
});
