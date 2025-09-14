import { useSuspenseQuery } from "@tanstack/react-query";
import { Newspaper } from "lucide-react";
import { BlogCard, BlogCardSkeleton } from "@/components/shared/blog-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { queryUtils } from "@/utils/orpc";

export function BlogList() {
  const { data } = useSuspenseQuery(
    queryUtils.blog.listBlogs.queryOptions({
      input: {
        limit: 10,
        offset: 0,
        sort: { field: "updatedAt", order: "desc" },
      },
    })
  );

  if (data.blogs.length === 0) {
    return (
      <Card className="mx-auto mt-8 max-w-xl text-center">
        <CardHeader>
          <Newspaper className="mx-auto h-12 w-12 text-gray-400" />
        </CardHeader>
        <CardContent>
          <CardTitle>No blog posts yet</CardTitle>
          <p className="mt-2 text-muted-foreground">
            It looks like there are no blog posts here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {data.blogs.map((blog) => (
        <BlogCard blog={blog} key={blog.id} />
      ))}
    </div>
  );
}

export const BlogListSkeleton = () => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3].map((_, idx) => (
        <BlogCardSkeleton key={idx.toString()} />
      ))}
    </div>
  );
};

