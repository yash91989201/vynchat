import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { FeedbackForm } from "@/components/shared/feedback-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { queryUtils } from "@/utils/orpc";

export const Route = createFileRoute("/(authenticated)/feedback")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data } = useSuspenseQuery(
    queryUtils.feedback.listUser.queryOptions({
      input: { limit: 20, offset: 0 },
    })
  );

  return (
    <div className="grid gap-4 md:grid-cols-2 md:gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Send Feedback</CardTitle>
        </CardHeader>
        <CardContent>
          <FeedbackForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Feedbacks</CardTitle>
        </CardHeader>
        <CardContent>
          {data.feedbacks.length > 0 ? (
            <ul className="space-y-2">
              {data.feedbacks.map((fb) => (
                <li className="rounded-md border p-4" key={fb.id}>
                  <div className="text-muted-foreground text-sm">
                    {new Date(fb.createdAt).toLocaleString()}
                  </div>
                  <div className="mt-2">{fb.message}</div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center text-muted-foreground">
              You have not sent any feedback yet.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
