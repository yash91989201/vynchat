import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";
import { BlogList, BlogListSkeleton } from "@/components/shared/blog-list";

export const Route = createFileRoute("/(public)/blogs/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <main className="container mx-auto my-6 px-3 md:px-6">
      <Suspense fallback={<BlogListSkeleton />}>
        <BlogList />
      </Suspense>
    </main>
  );
}
