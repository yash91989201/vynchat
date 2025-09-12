import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const myRooms = [
  {
    id: "room1",
    name: "Design Team",
    lastMessage: "Let's review the new mockups.",
    time: "10:45 AM",
    unread: 2,
    avatar: "/avatars/team-design.png",
  },
  {
    id: "room2",
    name: "Frontend Devs",
    lastMessage: "I've pushed the latest changes.",
    time: "9:30 AM",
    unread: 0,
    avatar: "/avatars/team-frontend.png",
  },
  {
    id: "room3",
    name: "Project Phoenix",
    lastMessage: "Meeting at 2 PM.",
    time: "Yesterday",
    unread: 5,
    avatar: "/avatars/project-phoenix.png",
  },
];

const globalRooms = [
  { id: "room4", name: "General", members: 128 },
  { id: "room5", name: "Random", members: 73 },
  { id: "room6", name: "Tech Talk", members: 42 },
  { id: "room7", name: "Gaming Lobby", members: 256 },
  { id: "room8", name: "Music Fans", members: 98 },
];

export const RoomList = () => {
  const selectedRoomId = "room1"; // Dummy selected room

  return (
    <div className="flex h-full flex-col border-r bg-card">
      <div className="p-4">
        <h2 className="font-bold text-xl">Chat Rooms</h2>
      </div>
      <Accordion
        className="w-full"
        defaultValue={["my-rooms", "global-rooms"]}
        type="multiple"
      >
        <AccordionItem value="my-rooms">
          <AccordionTrigger className="px-4 font-semibold text-muted-foreground text-sm">
            My Rooms
          </AccordionTrigger>
          <AccordionContent>
            <ScrollArea className="h-[250px]">
              <div className="flex flex-col">
                {myRooms.map((room) => (
                  <Button
                    className={cn(
                      "mx-auto mb-2 h-auto w-11/12 justify-start gap-3 whitespace-normal p-4 text-left",
                      selectedRoomId === room.id && "bg-muted"
                    )}
                    key={room.id}
                    variant="ghost"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage alt={room.name} src={room.avatar} />
                      <AvatarFallback>{room.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 overflow-hidden">
                      <p className="truncate font-semibold">{room.name}</p>
                      <p className="truncate text-muted-foreground text-sm">
                        {room.lastMessage}
                      </p>
                    </div>
                    <div className="flex flex-col items-end text-xs">
                      <span className="text-muted-foreground">{room.time}</span>
                      {room.unread > 0 && (
                        <Badge className="mt-1 h-5 w-5 justify-center p-0">
                          {room.unread}
                        </Badge>
                      )}
                    </div>
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="global-rooms">
          <AccordionTrigger className="px-4 font-semibold text-muted-foreground text-sm">
            Global Rooms
          </AccordionTrigger>
          <AccordionContent>
            <ScrollArea className="h-[250px]">
              <div className="flex flex-col">
                {globalRooms.map((room) => (
                  <Button
                    className="mx-auto mb-2 h-auto w-11/12 justify-start gap-3 whitespace-normal p-4 text-left"
                    key={room.id}
                    variant="ghost"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>#</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 overflow-hidden">
                      <p className="truncate font-semibold">{room.name}</p>
                      <p className="text-muted-foreground text-sm">
                        {room.members} members
                      </p>
                    </div>
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};
