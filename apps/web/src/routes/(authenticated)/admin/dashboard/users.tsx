import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";
import z from "zod";
import {
  UsersTable,
  UsersTableSkeleton,
} from "@/components/admin/users/users-table";

export const RouteSearchSchema = z.object({
  page: z.number().min(1).default(1).catch(1),
  limit: z.number().min(1).max(50).default(10).catch(10),
  name: z.string().optional(),
  userType: z.enum(["all", "guest", "non-guest"]).default("all").catch("all"),
});

export const Route = createFileRoute("/(authenticated)/admin/dashboard/users")({
  validateSearch: RouteSearchSchema,
  beforeLoad: ({ context: { queryClient, queryUtils }, search }) => {
    queryClient.ensureQueryData(
      queryUtils.admin.listUsers.queryOptions({
        input: {
          page: search.page,
          limit: search.limit,
          filter: {
            name: search.name,
            userType: search.userType,
          },
        },
      })
    );
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { limit, page, name, userType } = Route.useSearch();

  return (
    <div className="space-y-6">
      <section className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-3xl tracking-tight">Manage Users</h2>
          <p className="">
            View and manage user accounts, including banning, unbanning, and
            deleting users.
          </p>
        </div>
      </section>
      <Suspense fallback={<UsersTableSkeleton />}>
        <UsersTable limit={limit} name={name} page={page} userType={userType} />
      </Suspense>
    </div>
  );
}
