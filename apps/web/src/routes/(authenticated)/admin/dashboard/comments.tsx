import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";
import {
  PendingComments,
  PendingCommentsSkeleton,
} from "@/components/admin/dashboard/pending-comments";

export const Route = createFileRoute(
  "/(authenticated)/admin/dashboard/comments"
)({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <Suspense fallback={<PendingCommentsSkeleton />}>
      <PendingComments />
    </Suspense>
  );
}
