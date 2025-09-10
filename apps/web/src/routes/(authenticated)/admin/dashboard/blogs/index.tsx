import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, Search } from "lucide-react";
import { Suspense } from "react";
import { BlogList, BlogListSkeleton } from "@/components/shared/blog-list";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/(authenticated)/admin/dashboard/blogs/")(
  {
    component: RouteComponent,
  }
);

function RouteComponent() {
  return (
    <Tabs defaultValue="all">
      <div className="flex items-center">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="published">Published</TabsTrigger>
          <TabsTrigger value="draft">Draft</TabsTrigger>
        </TabsList>
        <div className="ml-auto flex items-center gap-2">
          <div className="relative ml-auto flex-1 md:grow-0">
            <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
              placeholder="Search..."
              type="search"
            />
          </div>
          <Link className={buttonVariants({})} to="/admin/dashboard/blogs/new">
            <Plus className="mr-2 size-4.5" />
            <span>New Blog</span>
          </Link>
        </div>
      </div>
      <Suspense fallback={<BlogListSkeleton />}>
        <BlogList />
      </Suspense>
    </Tabs>
  );
}
