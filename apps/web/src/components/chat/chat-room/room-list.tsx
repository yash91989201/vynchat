import { MessageSquarePlus, Search } from "lucide-react";
import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useIsMobile } from "@/hooks/use-mobile";
import { RoomListItem } from "./room-list-item";
import type { RoomListProps } from "./types";

const CreateRoomForm = () => (
  <form className="grid items-start gap-4" onSubmit={(e) => e.preventDefault()}>
    <div className="grid gap-2">
      <Label htmlFor="name">Room Name</Label>
      <Input id="name" placeholder="e.g. Gamers United" />
    </div>
    <Button type="submit">Create Room</Button>
  </form>
);

const CreateRoom = ({ isMobile }: { isMobile: boolean }) => {
  if (isMobile) {
    return (
      <Drawer>
        <DrawerTrigger asChild>
          <Button className="w-full" variant="secondary">
            Create a room
          </Button>
        </DrawerTrigger>
        <DrawerContent className="px-4 pb-4">
          <DrawerHeader className="sr-only">
            <DrawerTitle>Create a new room</DrawerTitle>
          </DrawerHeader>
          <CreateRoomForm />
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="w-full" variant="secondary">
          Create a room
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a new room</DialogTitle>
        </DialogHeader>
        <CreateRoomForm />
      </DialogContent>
    </Dialog>
  );
};

export const RoomList = ({
  myRooms,
  globalRooms,
  selectedRoomId,
  onRoomSelect,
}: RoomListProps) => {
  const [search, setSearch] = useState("");
  const isMobile = useIsMobile(1024);

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
            <AccordionContent>
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
                  <CreateRoom isMobile={isMobile} />
                </div>
              )}
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
