import { Loader2, Users } from "lucide-react";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Talk to a Stranger</CardTitle>
          <CardDescription>
            Find a random person to chat with anonymously.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center space-y-4 p-6">
          {status === "idle" && (
            <Button
              className="w-full"
              disabled={isPending}
              onClick={onTalkToStranger}
              size="lg"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Finding...
                </>
              ) : (
                "Talk to Stranger"
              )}
            </Button>
          )}
          {status === "waiting" && (
            <div className="flex flex-col items-center space-y-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Looking for a stranger…</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center text-muted-foreground text-sm">
          <Users className="mr-2 h-4 w-4" />
          {lobbyCount - 1} users online
        </CardFooter>
      </Card>
    </div>
  );
};
