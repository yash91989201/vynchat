import { useSuspenseQuery } from "@tanstack/react-query";
import { BlogCard, BlogCardSkeleton } from "@/components/shared/blog-card";
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
      <div className="mt-8 text-center text-muted-foreground">
        No blogs found. Create one to get started.
      </div>
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
