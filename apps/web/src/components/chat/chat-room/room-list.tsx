import { MessageSquarePlus, Search } from "lucide-react";
import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { CreateRoomForm } from "@/components/user/create-room-form";
import { RoomListItem } from "./room-list-item";
import type { RoomListProps } from "./types";

export const RoomList = ({
  myRooms,
  globalRooms,
  selectedRoomId,
  onRoomSelect,
  createRoom,
}: RoomListProps) => {
  const [search, setSearch] = useState("");

  const filteredMyRooms = myRooms.filter((room) =>
    room.name.toLowerCase().includes(search.toLowerCase())
  );

  const filteredGlobalRooms = globalRooms.filter((room) =>
    room.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex h-full flex-col overflow-hidden lg:border-r">
      <div className="p-1.5 lg:p-4">
        <h2 className="font-bold text-xl">Chat Rooms</h2>
        <div className="relative mt-4">
          <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-10"
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search rooms..."
            value={search}
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-2">
        <Accordion
          className="w-full"
          defaultValue={["my-rooms", "global-rooms"]}
          type="multiple"
        >
          <AccordionItem value="my-rooms">
            <AccordionTrigger className="px-2 font-semibold text-muted-foreground text-sm hover:no-underline">
              My Rooms
            </AccordionTrigger>
            <AccordionContent className="space-y-3">
              {filteredMyRooms.length > 0 ? (
                <div className="flex flex-col gap-1 py-1">
                  {filteredMyRooms.map((room) => (
                    <RoomListItem
                      isMyRoom={true}
                      isSelected={selectedRoomId === room.id}
                      key={room.id}
                      onSelect={onRoomSelect}
                      room={room}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-4 p-8 text-center">
                  <div className="rounded-full border border-dashed p-4">
                    <MessageSquarePlus className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold">No Rooms</h3>
                    <p className="text-muted-foreground text-sm">
                      You haven't created any rooms yet.
                    </p>
                  </div>
                </div>
              )}
              <CreateRoomForm createRoom={createRoom} />
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="global-rooms">
            <AccordionTrigger className="px-2 font-semibold text-muted-foreground text-sm hover:no-underline">
              Global Rooms
            </AccordionTrigger>
            <AccordionContent>
              {filteredGlobalRooms.length > 0 ? (
                <div className="flex flex-col gap-1 py-1">
                  {filteredGlobalRooms.map((room) => (
                    <RoomListItem
                      isMyRoom={false}
                      isSelected={selectedRoomId === room.id}
                      key={room.id}
                      onSelect={onRoomSelect}
                      room={room}
                    />
                  ))}
                </div>
              ) : (
                <p className="p-4 text-center text-sm text-muted-foreground">
                  No global rooms available.
                </p>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
};
