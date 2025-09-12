import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { queryUtils } from "@/utils/orpc";

export const Route = createFileRoute(
  "/(authenticated)/admin/dashboard/feedbacks"
)({
  component: RouteComponent,
});

function RouteComponent() {
  const { data } = useSuspenseQuery(
    queryUtils.feedback.list.queryOptions({ input: { limit: 20, offset: 0 } })
  );

  return (
    <div className="grid gap-4 md:grid-cols-1 md:gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Feedbacks</CardTitle>
          <CardDescription>
            All user feedbacks submitted through the app.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data.feedbacks.length > 0 ? (
            <ul className="space-y-2">
              {data.feedbacks.map((fb) => (
                <li className="rounded-md border p-4" key={fb.id}>
                  <div className="flex items-center justify-between">
                    <div className="text-muted-foreground text-sm">
                      {fb.user?.name ?? fb.user?.email}
                    </div>
                    <div className="text-muted-foreground text-xs">
                      {new Date(fb.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="mt-2">{fb.message}</div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center text-muted-foreground">
              No feedbacks found.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
