import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { MessageSquare, Users } from "lucide-react";
import { useState } from "react";
import { ChatRoom } from "@/components/chat/chat-room";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { queryUtils } from "@/utils/orpc";

export const Route = createFileRoute("/(authenticated)/chat")({
  component: RouteComponent,
});

function RoomList({
  onSelectRoom,
  selectedRoom,
}: {
  onSelectRoom: (roomId: string) => void;
  selectedRoom: string | null;
}) {
  const { data: rooms } = useQuery(queryUtils.room.listRooms.queryOptions());

  return (
    <div className="flex h-full flex-col border-r bg-slate-50/50">
      <div className="mb-3 flex-shrink-0 border-b p-3">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          <h2 className="font-bold text-lg">Rooms</h2>
        </div>
        <p className="text-slate-500 text-sm">{rooms?.length || 0} available</p>
      </div>

      <ScrollArea className="flex-1 px-3">
        {rooms?.map((room) => {
          const isActive = selectedRoom === room.id;
          return (
            <Button
              className={cn(
                "mb-3 flex w-full cursor-pointer items-center gap-3 rounded-lg p-6 text-left transition-colors",
                isActive ? "bg-slate-200/60" : "hover:bg-slate-200/60"
              )}
              key={room.id}
              onClick={() => onSelectRoom(room.id)}
              tabIndex={0}
              variant="outline"
            >
              <div className="min-w-0 flex-1">
                <h3 className="truncate font-semibold">{room.name}</h3>
                <p className="truncate text-slate-500 text-xs">
                  Click to join conversation
                </p>
              </div>
            </Button>
          );
        })}

        {(!rooms || rooms.length === 0) && (
          <div className="py-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
              <MessageSquare className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="mb-1 font-medium text-slate-900 text-sm">
              No rooms available
            </h3>
            <p className="text-slate-500 text-xs">
              Check back later for new conversations.
            </p>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

function RouteComponent() {
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);

  const { mutate: joinRoom } = useMutation(
    queryUtils.room.joinRoom.mutationOptions()
  );

  const handleSelectRoom = (roomId: string) => {
    joinRoom({ roomId });
    setSelectedRoom(roomId);
  };

  return (
    <div className="container mx-auto my-6">
      <div className="flex h-[calc(100vh-10rem)] rounded-lg border shadow-sm">
        <div
          className={cn(
            "w-full flex-shrink-0 border-r md:w-[300px]",
            selectedRoom && "hidden md:block"
          )}
        >
          <RoomList
            onSelectRoom={handleSelectRoom}
            selectedRoom={selectedRoom}
          />
        </div>
        <div className={cn("flex-1", !selectedRoom && "hidden md:block")}>
          {selectedRoom ? (
            <ChatRoom
              onBack={() => setSelectedRoom(null)}
              roomId={selectedRoom}
            />
          ) : (
            <div className="hidden h-full flex-1 items-center justify-center bg-slate-50/50 md:flex">
              <div className="text-center">
                <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-slate-200/80">
                  <MessageSquare className="h-12 w-12 text-slate-400" />
                </div>
                <h3 className="mb-2 font-semibold text-slate-900 text-xl">
                  Welcome to VynChat
                </h3>
                <p className="mb-6 max-w-md text-slate-500">
                  Select a room from the list to start a conversation.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
