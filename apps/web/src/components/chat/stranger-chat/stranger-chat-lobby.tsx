import { HatGlasses, Loader2, Users } from "lucide-react";
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

interface StrangerChatLobbyProps {
  status: "idle" | "waiting" | "matched";
  lobbyCount: number;
  isPending: boolean;
  dialogMessage: string | null;
  onTalkToStranger: () => void;
  onCloseDialog: () => void;
}

export const StrangerChatLobby = ({
  status,
  lobbyCount,
  isPending,
  dialogMessage,
  onTalkToStranger,
  onCloseDialog,
}: StrangerChatLobbyProps) => {
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

      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 sm:h-28 sm:w-28">
          <HatGlasses className="h-12 w-12 text-primary sm:h-16 sm:w-16" />
        </div>
        <h1 className="font-bold text-3xl tracking-tight sm:text-4xl">
          Talk to a Stranger
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Find a random person to chat with anonymously.
        </p>

        <div className="mt-10">
          {status === "idle" && (
            <Button
              className="w-full max-w-xs transform rounded-full px-8 py-6 font-semibold text-lg transition-transform duration-200 hover:scale-105"
              disabled={isPending}
              onClick={onTalkToStranger}
              size="lg"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                  Finding...
                </>
              ) : (
                "Talk to Stranger"
              )}
            </Button>
          )}
          {status === "waiting" && (
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-lg text-muted-foreground">
                Looking for a stranger…
              </p>
            </div>
          )}
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
