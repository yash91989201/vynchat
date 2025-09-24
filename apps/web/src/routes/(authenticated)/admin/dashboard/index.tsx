import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";
import {
  AnalyticsFallback,
  DashboardAnalytics,
} from "@/components/admin/dashboard/analytics";

export const Route = createFileRoute("/(authenticated)/admin/dashboard/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex flex-1 flex-col gap-4 md:gap-8">
      <Suspense fallback={<AnalyticsFallback />}>
        <DashboardAnalytics />
      </Suspense>
    </div>
  );
}
