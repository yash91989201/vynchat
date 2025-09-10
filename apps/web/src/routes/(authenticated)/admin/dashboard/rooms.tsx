import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { CreateRoomForm } from "@/components/admin/dashboard/create-room-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { queryUtils } from "@/utils/orpc";

export const Route = createFileRoute("/(authenticated)/admin/dashboard/rooms")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: rooms } = useSuspenseQuery(
    queryUtils.admin.listRooms.queryOptions({})
  );

  return (
    <div className="grid gap-4 md:grid-cols-2 md:gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Create Room</CardTitle>
          <CardDescription>
            Add a new room for users to chat in.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CreateRoomForm />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Existing Rooms</CardTitle>
          <CardDescription>
            Here are all the rooms you've created so far.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {rooms.length > 0 ? (
            <ul className="space-y-2">
              {rooms.map((room) => (
                <li className="rounded-md border p-4" key={room.id}>
                  {room.name}
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center text-muted-foreground">
              No rooms found. Create one to get started.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
