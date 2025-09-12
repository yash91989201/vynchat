import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Member } from "./types";

export const RoomMembers = ({ members }: { members: Member[] }) => {
  return (
    <div className="flex h-full flex-col bg-card lg:border-l">
      <div className="border-b p-4 py-6">
        <h3 className="font-semibold text-lg">Members ({members.length})</h3>
      </div>
      <ScrollArea className="flex-1">
        <div className="space-y-2 p-4">
          {members.map((member) => (
            <div
              className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted"
              key={member.id}
            >
              <Avatar className="h-9 w-9">
                <AvatarImage src={member.image ?? undefined} />
                <AvatarFallback>
                  {member.name?.substring(0, 2) ?? "??"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 overflow-hidden">
                <p className="truncate font-medium">{member.name}</p>
              </div>
              <div
                className="h-2 w-2 rounded-full bg-green-500"
                title="Online"
              />
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

