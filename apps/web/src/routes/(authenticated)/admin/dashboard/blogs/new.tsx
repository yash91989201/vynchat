import { createFileRoute } from "@tanstack/react-router";
import { CreateBlogForm } from "@/components/admin/dashboard/create-blog-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const Route = createFileRoute(
  "/(authenticated)/admin/dashboard/blogs/new"
)({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create a new blog post</CardTitle>
        <CardDescription>
          Fill out the form below to create a new blog post.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <CreateBlogForm />
      </CardContent>
    </Card>
  );
}
