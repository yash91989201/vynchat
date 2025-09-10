import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { CreateTagForm } from "@/components/admin/dashboard/create-tag-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { queryUtils } from "@/utils/orpc";

export const Route = createFileRoute("/(authenticated)/admin/dashboard/tags")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: tags } = useSuspenseQuery(
    queryUtils.admin.listTags.queryOptions({})
  );

  return (
    <div className="grid gap-4 md:grid-cols-2 md:gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Create Tag</CardTitle>
          <CardDescription>
            Add a new tag to help organize your blog posts.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CreateTagForm />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Existing Tags</CardTitle>
          <CardDescription>
            Here are all the tags you've created so far.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {tags.length > 0 ? (
            <ul className="space-y-2">
              {tags.map((tag) => (
                <li className="rounded-md border p-4" key={tag.id}>
                  {tag.name}
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center text-muted-foreground">
              No tags found. Create one to get started.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
