import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { CreateCategoryForm } from "@/components/admin/dashboard/create-category-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { queryUtils } from "@/utils/orpc";

export const Route = createFileRoute(
  "/(authenticated)/admin/dashboard/categories"
)({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: categories } = useSuspenseQuery(
    queryUtils.admin.listCategories.queryOptions({})
  );

  return (
    <div className="grid gap-4 md:grid-cols-2 md:gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Create Category</CardTitle>
          <CardDescription>
            Add a new category to group your blog posts.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CreateCategoryForm />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Existing Categories</CardTitle>
          <CardDescription>
            Here are all the categories you've created so far.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {categories.length > 0 ? (
            <ul className="space-y-2">
              {categories.map((category) => (
                <li className="rounded-md border p-4" key={category.id}>
                  {category.name}
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center text-muted-foreground">
              No categories found. Create one to get started.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
