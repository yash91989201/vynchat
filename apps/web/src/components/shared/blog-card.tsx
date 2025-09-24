import type { ListBlogsOutputType } from "@server/lib/types";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import { Suspense } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/lib/auth-client";
import { queryUtils } from "@/utils/orpc";

export function BlogCard({
  blog,
}: {
  blog: ListBlogsOutputType["blogs"][number];
}) {
  const { data: session } = authClient.useSession();
  const isAdmin = session?.user?.role === "admin";

  const { mutateAsync: deleteBlog, isPending: isDeletingBlog } = useMutation(
    queryUtils.admin.deleteBlog.mutationOptions({
      onSuccess: () => {
        toast.success("Blog deleted successfully");
      },
      onError: () => {
        toast.error("Failed to delete blog, try again");
      },
    })
  );

  return (
    <Link
      className="block h-full"
      params={{
        slug: blog.slug,
      }}
      to="/blogs/$slug"
    >
      <Card className="h-full overflow-hidden pt-0">
        <Image
          alt={blog.title}
          className="h-56 w-full object-cover"
          layout="fullWidth"
          src={
            blog.imageUrl?.length === 0
              ? "/logo.webp"
              : (blog.imageUrl ?? "/logo.webp")
          }
        />
        <CardHeader>
          <CardTitle>{blog.title}</CardTitle>
          {blog.category && (
            <CardDescription>{blog.category.name}</CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-2">
          {blog.excerpt && (
            <p className="text-muted-foreground text-sm">{blog.excerpt}</p>
          )}
          {blog.tldr && (
            <div className="space-y-1 pt-2">
              <p className="font-semibold text-sm">TL;DR:</p>
              <p className="text-sm">{blog.tldr}</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-wrap items-center justify-between gap-3">
          <div className="gap- items-center">
            <Suspense fallback={<BlogTagsSkeleton />}>
              <BlogTags blogId={blog.id} />
            </Suspense>
          </div>
          {isAdmin && (
            <Button
              disabled={isDeletingBlog}
              onClick={() => deleteBlog({ id: blog.id })}
              size="sm"
              variant="destructive"
            >
              Delete
            </Button>
          )}
        </CardFooter>
      </Card>
    </Link>
  );
}

export const BlogTags = ({ blogId }: { blogId: string }) => {
  const { data: tags } = useSuspenseQuery(
    queryUtils.blog.listBlogTags.queryOptions({ input: { blogId } })
  );

  return tags.map((tag) => (
    <Badge className="rounded-full" key={tag.id.toString()}>
      {tag.name}
    </Badge>
  ));
};

export const BlogCardSkeleton = () => {
  return (
    <Card className="overflow-hidden pt-0">
      <Skeleton className="h-56 w-full" />
      <CardHeader>
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="mt-2 h-4 w-1/4" />
      </CardHeader>
      <CardContent className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="mt-2 h-4 w-5/6" />
        <div className="space-y-1 pt-2">
          <p className="font-semibold text-sm">TL;DR:</p>
          <Skeleton className="h-4 w-full" />
        </div>
      </CardContent>
      <CardFooter className="gap-3">
        <BlogTagsSkeleton />
      </CardFooter>
    </Card>
  );
};

export const BlogTagsSkeleton = () => {
  return (
    <>
      <Skeleton className="h-6 w-16 rounded-full" />
      <Skeleton className="h-6 w-20 rounded-full" />
      <Skeleton className="h-6 w-12 rounded-full" />
    </>
  );
};
