import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AdminHeader, SideNav } from "@/components/admin/dashboard/sidebar-nav";

export const Route = createFileRoute("/(authenticated)/admin/dashboard")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <SideNav />
      <div className="flex flex-col">
        <AdminHeader />
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
