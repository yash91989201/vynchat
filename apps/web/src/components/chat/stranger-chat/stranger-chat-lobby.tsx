import { HatGlasses, Loader2, Users } from "lucide-react";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouteContext } from "@tanstack/react-router";

interface StrangerChatLobbyProps {
  status: "idle" | "waiting" | "matched";
  lobbyCount: number;
  isPending: boolean;
  dialogMessage: string | null;
  onTalkToStranger: () => void;
  onCloseDialog: () => void;
}

const continents = [
  "Africa",
  "Antarctica",
  "Asia",
  "Europe",
  "North America",
  "Oceania",
  "South America",
];

export const StrangerChatLobby = ({
  status,
  lobbyCount,
  isPending,
  dialogMessage,
  onTalkToStranger,
  onCloseDialog,
}: StrangerChatLobbyProps) => {
  const { session } = useRouteContext({
    from: "/(authenticated)",
  });

  const [name, setName] = useState(session.user.name);
  const [continent, setContinent] = useState("");

  return (
    <div className="flex h-full items-center justify-center p-4">
      <AlertDialog onOpenChange={onCloseDialog} open={!!dialogMessage}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Notification</AlertDialogTitle>
            <AlertDialogDescription>{dialogMessage}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="w-full max-w-lg text-center">
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 sm:h-28 sm:w-28">
          <HatGlasses className="h-12 w-12 text-primary sm:h-16 sm:w-16" />
        </div>
        <h1 className="font-bold text-3xl tracking-tight sm:text-4xl">
          Talk to a Stranger
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Find a random person to chat with anonymously.
        </p>

        <div className="mt-10 space-y-4">
          <div className="flex flex-col items-center gap-3 sm:flex-row">
            <Input
              className="text-center"
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              value={name}
            />
            <Select onValueChange={setContinent} value={continent}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a continent" />
              </SelectTrigger>
              <SelectContent>
                {continents.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            className="rounded-full"
            disabled={
              (isPending && status !== "idle") || !name.trim() || !continent
            }
            onClick={onTalkToStranger}
            size="lg"
          >
            {isPending || status === "waiting" ? (
              <>
                <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                Finding...
              </>
            ) : (
              "Talk to Stranger"
            )}
          </Button>
        </div>

        <div className="mt-10 text-muted-foreground">
          <div className="inline-flex items-center">
            <Users className="mr-2 h-5 w-5" />
            <span>
              <strong>{lobbyCount > 0 ? lobbyCount - 1 : 0}</strong> user(s)
              online
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
