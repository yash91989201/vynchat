import { useSuspenseQuery } from "@tanstack/react-query";
import { Image } from "@unpic/react";
import parse from "html-react-parser";
import { Suspense } from "react";
import {
  BlogComments,
  BlogCommentsSkeleton,
} from "@/components/blogs/blog-comments";
import { CreateCommentForm } from "@/components/blogs/create-comment-form";
import { BlogTags, BlogTagsSkeleton } from "@/components/shared/blog-card";
import { Skeleton } from "@/components/ui/skeleton";
import { queryUtils } from "@/utils/orpc";

export function BlogPost({ slug }: { slug: string }) {
  const { data: blog } = useSuspenseQuery(
    queryUtils.blog.getBlog.queryOptions({ input: { slug } })
  );

  if (!blog) {
    return <div>Blog not found</div>;
  }

  return (
    <article className="prose dark:prose-invert mx-auto max-w-5xl">
      <h1 className="mb-2 font-bold text-4xl">{blog.title}</h1>
      {blog.category && (
        <p className="mt-0 text-lg text-muted-foreground">
          {blog.category.name}
        </p>
      )}
      <Image
        alt={blog.title}
        className="my-6 h-[36vh] w-full rounded-lg object-cover"
        layout="fullWidth"
        src={
          blog.imageUrl?.length === 0
            ? "/logo.webp"
            : (blog.imageUrl ?? "/logo.webp")
        }
      />
      <div className="mt-6">{parse(blog.body ?? "")}</div>
      <div className="mt-8 flex flex-wrap gap-3">
        <Suspense fallback={<BlogTagsSkeleton />}>
          <BlogTags blogId={blog.id} />
        </Suspense>
      </div>
      <div className="mt-12">
        <Suspense fallback={<BlogCommentsSkeleton />}>
          <BlogComments blogId={blog.id} />
        </Suspense>
      </div>
      <div className="mt-8">
        <CreateCommentForm blogId={blog.id} blogSlug={slug} />
      </div>
    </article>
  );
}

export const BlogPostSkeleton = () => {
  return (
    <div className="mx-auto max-w-4xl">
      <Skeleton className="h-12 w-3/4" />
      <Skeleton className="mt-4 h-6 w-1/4" />
      <Skeleton className="my-6 h-96 w-full rounded-lg" />
      <div className="mt-6 space-y-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
      <div className="mt-8 flex flex-wrap gap-3">
        <BlogTagsSkeleton />
      </div>
    </div>
  );
};
