import type { UserType } from "@server/lib/types";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import type { ColumnDef } from "@tanstack/react-table";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  FilterX,
  MoreHorizontal,
  Shield,
  ShieldOff,
  Trash2,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { PaginationWindow } from "@/components/shared/pagination-window";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { queryUtils } from "@/utils/orpc";

export const UsersTable = ({
  limit = 10,
  page = 1,
  name,
  userType = "all",
}: {
  limit?: number;
  page?: number;
  name?: string;
  userType?: "all" | "guest" | "non-guest";
}) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState(name ?? "");

  const { data: usersData, refetch: refetchUserList } = useSuspenseQuery(
    queryUtils.admin.listUsers.queryOptions({
      input: {
        limit,
        page,
        filter: {
          name,
          userType,
        },
      },
    })
  );

  const { mutateAsync: deleteUser } = useMutation({
    mutationFn: async ({ userId }: { userId: string }) => {
      await authClient.admin.removeUser({ userId });
    },
    onSettled: () => {
      refetchUserList();
    },
  });

  const { mutateAsync: banUser } = useMutation({
    mutationFn: async ({ userId }: { userId: string }) => {
      await authClient.admin.banUser({ userId });
    },
    onSettled: () => {
      refetchUserList();
    },
  });

  const { mutateAsync: unbanUser } = useMutation({
    mutationFn: async ({ userId }: { userId: string }) => {
      await authClient.admin.unbanUser({ userId });
    },
    onSettled: () => {
      refetchUserList();
    },
  });

  const { mutateAsync: deleteAllGuestUsers, isPending: isDeletingAllGuests } =
    useMutation(
      queryUtils.admin.deleteAllGuestUsers.mutationOptions({
        onSuccess: () => {
          refetchUserList();
        },
      })
    );

  // Debounce effect for name filter
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchTerm !== name) {
        navigate({
          to: "/admin/dashboard/users",
          search: { page: 1, limit, name: searchTerm, userType },
        });
      }
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, navigate, limit, userType, name]);

  // Update local state when URL param changes
  useEffect(() => {
    setSearchTerm(name ?? "");
  }, [name]);

  const users = usersData.users;
  const totalPages = usersData.totalPages;
  const hasNextPage = usersData.hasNextPage;
  const hasPreviousPage = usersData.hasPreviousPage;

  const handleBanUser = (userId: string) => {
    banUser({ userId });
  };

  const handleUnbanUser = (userId: string) => {
    unbanUser({ userId });
  };

  const handleDeleteUser = (userId: string) => {
    deleteUser({ userId });
  };

  const handleDeleteAllGuestUsers = async () => {
    try {
      const result = await deleteAllGuestUsers({});
      console.log(`Deleted ${result.deletedCount} guest users`);
    } catch (error) {
      console.error("Failed to delete guest users:", error);
    }
  };

  const handleLimitChange = (newLimit: string) => {
    navigate({
      to: "/admin/dashboard/users",
      search: { page: 1, limit: Number.parseInt(newLimit, 10), name, userType },
    });
  };

  const handleNameFilterChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSearchTerm(event.target.value);
  };

  const handleUserTypeFilterChange = (
    newUserType: "all" | "guest" | "non-guest"
  ) => {
    navigate({
      to: "/admin/dashboard/users",
      search: { page: 1, limit, name, userType: newUserType },
    });
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    navigate({
      to: "/admin/dashboard/users",
      search: { page: 1, limit, userType: "all" },
    });
  };

  const columns: ColumnDef<UserType>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.getValue("name") || "N/A"}</span>
          <span className="text-muted-foreground text-sm">
            {row.original.email}
          </span>
        </div>
      ),
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="text-right">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="h-8 w-8 p-0" variant="ghost">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {user.banned ? (
                  <DropdownMenuItem
                    className="text-green-600"
                    onClick={() => handleUnbanUser(user.id)}
                  >
                    <ShieldOff className="mr-2 h-4 w-4" />
                    Unban User
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem
                    className="text-yellow-600"
                    onClick={() => handleBanUser(user.id)}
                  >
                    <Shield className="mr-2 h-4 w-4" />
                    Ban User
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  className="text-red-600"
                  onClick={() => handleDeleteUser(user.id)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete User
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: users,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <section>
      <div className="flex items-center gap-3">
        <div className="flex flex-1 items-center gap-3">
          <Input
            className="max-w-sm border border-accent"
            onChange={handleNameFilterChange}
            placeholder="Filter by name..."
            value={searchTerm}
          />
          <Select onValueChange={handleUserTypeFilterChange} value={userType}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="User type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              <SelectItem value="guest">Guest Only</SelectItem>
              <SelectItem value="non-guest">Non-Guest Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Button
            className="flex items-center gap-2"
            disabled={!(searchTerm || userType !== "all")}
            onClick={handleClearFilters}
            size="sm"
            variant="outline"
          >
            <FilterX className="size-4.5" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                className="flex items-center gap-2"
                disabled={isDeletingAllGuests}
                size="sm"
                variant="destructive"
              >
                <Users className="h-4 w-4" />
                {isDeletingAllGuests ? "Deleting..." : "Delete All Guests"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete All Guest Users</AlertDialogTitle>
                <AlertDialogDescription>
                  This action will permanently delete all guest users from the
                  system. This cannot be undone. Are you sure you want to
                  continue?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-red-600 hover:bg-red-700"
                  onClick={handleDeleteAllGuestUsers}
                >
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
      <div className="mt-4 flex flex-col gap-3">
        <div className="overflow-hidden rounded-md border">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-muted/50">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead
                        className={cn(
                          "font-semibold text-gray-700",
                          header.column.id === "actions" && "text-right"
                        )}
                        key={header.id}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
          </Table>
          <div className="max-h-[calc(100vh-24rem)] overflow-y-auto">
            <Table>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      className="bg-white"
                      data-state={row.getIsSelected() && "selected"}
                      key={row.id}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      className="h-24 text-center"
                      colSpan={columns.length}
                    >
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      <div className="my-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-sm">Rows per page</span>
          <Select onValueChange={handleLimitChange} value={limit.toString()}>
            <SelectTrigger className="w-[70px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <PaginationWindow
          basePath="/admin/dashboard/users"
          hasNextPage={hasNextPage}
          hasPreviousPage={hasPreviousPage}
          limit={limit}
          page={page}
          search={{ name, userType }}
          totalPages={totalPages}
        />
      </div>
    </section>
  );
};

export const UsersTableSkeleton = () => {
  return (
    <section>
      <div className="w-full">
        <div className="rounded-md border">
          <div className="border-b bg-muted/50 px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          </div>

          {Array.from({ length: 10 }, (_, i) => (
            <div
              className="border-b px-4 py-3 last:border-b-0"
              key={i.toString()}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-20">
                  <div className="flex flex-col gap-y-1.5">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-36" />
                  </div>
                  <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="h-8 w-8 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="my-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-9 w-[70px]" />
        </div>
        <div className="flex items-center space-x-1">
          <Skeleton className="h-9 w-9" />
          <Skeleton className="h-9 w-9" />
          <Skeleton className="h-9 w-9" />
          <Skeleton className="h-9 w-9" />
          <Skeleton className="h-9 w-9" />
        </div>
      </div>
    </section>
  );
};
