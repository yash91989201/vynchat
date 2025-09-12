import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Room } from "./types";

interface RoomListItemProps {
  room: Room;
  isSelected: boolean;
  onSelect: (roomId: string) => void;
  isMyRoom: boolean;
}

export const RoomListItem = ({
  room,
  isSelected,
  onSelect,
  isMyRoom,
}: RoomListItemProps) => {
  return (
    <Button
      className={cn(
        "h-auto w-full justify-start gap-3 whitespace-normal rounded-lg p-3 text-left",
        isSelected && "bg-muted"
      )}
      onClick={() => onSelect(room.id)}
      variant="ghost"
    >
      <Avatar className="h-10 w-10">
        {isMyRoom ? (
          <>
            <AvatarImage alt={room.name} src={room.avatar} />
            <AvatarFallback>{room.name.charAt(0)}</AvatarFallback>
          </>
        ) : (
          <AvatarFallback>#</AvatarFallback>
        )}
      </Avatar>
      <div className="flex-1 overflow-hidden">
        <p className="truncate font-semibold">{room.name}</p>
      </div>
      {isMyRoom && (
        <div className="flex flex-col items-end text-xs">
          <span className="text-muted-foreground">{room.time}</span>
          {room.unread && room.unread > 0 && (
            <Badge className="mt-1 h-5 w-5 justify-center p-0">
              {room.unread}
            </Badge>
          )}
        </div>
      )}
    </Button>
  );
};
