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

export const RoomList = ({
  myRooms,
  globalRooms,
  selectedRoomId,
  onRoomSelect,
}: {
  myRooms: {
    id: string;
    name: string;
    lastMessage?: string;
    avatar?: string;
    time?: string;
    unread?: number;
  }[];
  globalRooms: { id: string; name: string; members: number }[];
  selectedRoomId?: string;
  onRoomSelect: (roomId: string) => void;
}) => {
  return (
    <div className="flex h-full flex-col bg-card">
      <div className="p-4">
        <h2 className="font-bold text-xl">Chat Rooms</h2>
      </div>
      <ScrollArea className="flex-1">
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
              <div className="flex flex-col">
                {myRooms.map((room) => (
                  <Button
                    className={cn(
                      "mx-auto mb-2 h-auto w-11/12 justify-start gap-3 whitespace-normal p-4 text-left",
                      selectedRoomId === room.id && "bg-muted"
                    )}
                    key={room.id}
                    onClick={() => onRoomSelect(room.id)}
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
                      {room?.unread && room.unread > 0 && (
                        <Badge className="mt-1 h-5 w-5 justify-center p-0">
                          {room.unread}
                        </Badge>
                      )}
                    </div>
                  </Button>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="global-rooms">
            <AccordionTrigger className="px-4 font-semibold text-muted-foreground text-sm">
              Global Rooms
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-col">
                {globalRooms.map((room) => (
                  <Button
                    className="mx-auto mb-2 h-auto w-11/12 justify-start gap-3 whitespace-normal p-4 text-left"
                    key={room.id}
                    onClick={() => onRoomSelect(room.id)}
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
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </ScrollArea>
    </div>
  );
};
