import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { queryUtils } from "@/utils/orpc";

export function PendingComments() {
  const { data: comments, refetch } = useSuspenseQuery(
    queryUtils.admin.listPendingComments.queryOptions({})
  );

  const { mutateAsync: approveComment, isPending } = useMutation(
    queryUtils.admin.approveComment.mutationOptions({
      onSuccess: async () => {
        toast.success("Comment approved successfully.");
        await refetch();
      },
      onError: (err) => {
        toast.error(err.message);
      },
    })
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Comments</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-muted-foreground">No pending comments.</p>
        ) : (
          comments.map((comment) => (
            <div
              className="flex items-start space-x-4 border-b pb-4 last:border-b-0"
              key={comment.id}
            >
              <Avatar>
                <AvatarImage src={comment.author?.image ?? undefined} />
                <AvatarFallback>
                  {comment.author?.name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-semibold">{comment.author?.name}</p>
                <p className="text-muted-foreground text-sm">
                  {new Date(comment.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
                <p className="mt-2 text-sm">{comment.text}</p>
                <Button
                  className="mt-4"
                  disabled={isPending}
                  onClick={() => approveComment({ id: comment.id })}
                  size="sm"
                >
                  {isPending ? "Approving..." : "Approve"}
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

export function PendingCommentsSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Comments</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {[new Array(3)].map((_, i) => (
          <div
            className="flex items-start space-x-4 border-b pb-4 last:border-b-0"
            key={i.toString()}
          >
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-32" />
              <div className="mt-2 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
              </div>
              <Skeleton className="mt-4 h-8 w-24" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
