import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { Suspense } from "react";
import { BlogPost, BlogPostSkeleton } from "@/components/blogs/blog-post";
import { buttonVariants } from "@/components/ui/button";

export const Route = createFileRoute("/(public)/blogs/$slug/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { slug } = Route.useParams();
  return (
    <main className="container mx-auto my-6 space-y-6 px-3 md:px-6">
      <nav className="mx-auto max-w-5xl">
        <Link
          className={buttonVariants({
            variant: "link",
          })}
          to="/blogs"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to blogs
        </Link>
      </nav>
      <Suspense fallback={<BlogPostSkeleton />}>
        <BlogPost slug={slug} />
      </Suspense>
    </main>
  );
}
