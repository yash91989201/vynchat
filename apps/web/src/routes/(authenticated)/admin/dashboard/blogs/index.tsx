import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { Suspense } from "react";
import { BlogList, BlogListSkeleton } from "@/components/shared/blog-list";
import { buttonVariants } from "@/components/ui/button";

export const Route = createFileRoute("/(authenticated)/admin/dashboard/blogs/")(
  {
    component: RouteComponent,
  }
);

function RouteComponent() {
  return (
    <>
      <div className="mb-3 flex items-end">
        <Link className={buttonVariants()} to="/admin/dashboard/blogs/new">
          <Plus className="size-4.5" />
          <span>New Blog</span>
        </Link>
      </div>
      <Suspense fallback={<BlogListSkeleton />}>
        <BlogList />
      </Suspense>
    </>
  );
}
