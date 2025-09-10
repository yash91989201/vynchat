import { useSuspenseQuery } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { queryUtils } from "@/utils/orpc";

export function BlogComments({ blogId }: { blogId: string }) {
  const {
    data: { comments },
  } = useSuspenseQuery(
    queryUtils.blog.listComments.queryOptions({
      input: {
        blogId,
        limit: 10,
        offset: 0,
        sort: { field: "createdAt", order: "desc" },
      },
    })
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comments</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {comments.length === 0 ? (
          <p className="text-muted-foreground">No comments yet.</p>
        ) : (
          comments.map((comment) => (
            <div className="flex items-start space-x-4" key={comment.id}>
              <Avatar>
                <AvatarImage src={comment.author.image ?? undefined} />
                <AvatarFallback>
                  {comment.author.name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-semibold">{comment.author.name}</p>
                <p className="text-muted-foreground text-sm">
                  {new Date(comment.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
                <p className="mt-2 text-sm">{comment.text}</p>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

export function BlogCommentsSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Comments</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {[new Array(3)].map((_, i) => (
          <div className="flex items-start space-x-4" key={i.toString()}>
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-32" />
              <div className="mt-2 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
