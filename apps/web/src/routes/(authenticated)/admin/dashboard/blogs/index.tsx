import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";
import { BlogList, BlogListSkeleton } from "@/components/shared/blog-list";

export const Route = createFileRoute("/(authenticated)/admin/dashboard/blogs/")(
  {
    component: RouteComponent,
  }
);

function RouteComponent() {
  return (
    <Suspense fallback={<BlogListSkeleton />}>
      <BlogList />
    </Suspense>
  );
}
