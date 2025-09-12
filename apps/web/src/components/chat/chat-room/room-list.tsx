import { Search } from "lucide-react";
import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { RoomListItem } from "./room-list-item";
import type { RoomListProps } from "./types";

export const RoomList = ({
  myRooms,
  globalRooms,
  selectedRoomId,
  onRoomSelect,
}: RoomListProps) => {
  const [search, setSearch] = useState("");

  const filteredMyRooms = myRooms.filter((room) =>
    room.name.toLowerCase().includes(search.toLowerCase())
  );

  const filteredGlobalRooms = globalRooms.filter((room) =>
    room.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden border-r bg-card">
      <div className="p-4">
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
            <AccordionContent>
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
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="global-rooms">
            <AccordionTrigger className="px-2 font-semibold text-muted-foreground text-sm hover:no-underline">
              Global Rooms
            </AccordionTrigger>
            <AccordionContent>
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
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
};
