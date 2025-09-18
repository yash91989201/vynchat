import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Image } from "@unpic/react";
import {
  AlertTriangle,
  Loader2,
  MessageSquare,
  Shield,
  UserCircle,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "../ui/badge";

const WELCOME_DIALOG_KEY = "vynchat_welcome_dialog_accepted";
const WELCOME_DIALOG_QUERY_KEY = ["welcomeDialogAccepted"];

const features = [
  {
    icon: Users,
    title: "Chat Rooms",
    description: "Join public chat rooms and talk with multiple people.",
  },
  {
    icon: MessageSquare,
    title: "Stranger Chat",
    description:
      "Connect with a random stranger for a one-on-one conversation.",
  },
  {
    icon: UserCircle,
    title: "User Profiles",
    description: "Customize your profile and see others'.",
  },
  {
    icon: Shield,
    title: "Safety First",
    description: "Report or block any user who is behaving inappropriately.",
  },
];

export function WelcomeDialog() {
  const queryClient = useQueryClient();

  const { data: hasAccepted } = useQuery({
    queryKey: WELCOME_DIALOG_QUERY_KEY,
    queryFn: () => {
      const stored = localStorage.getItem(WELCOME_DIALOG_KEY);
      return stored === "true";
    },
    initialData: localStorage.getItem(WELCOME_DIALOG_KEY) === "true",
    staleTime: Number.POSITIVE_INFINITY,
  });

  const { mutateAsync: acceptWelcomeDialog, isPending } = useMutation({
    mutationFn: () => {
      localStorage.setItem(WELCOME_DIALOG_KEY, "true");
      return Promise.resolve(true);
    },
    onSuccess: () => {
      toast.success("Welcome to VynChat! Enjoy your stay.");
      queryClient.setQueryData(WELCOME_DIALOG_QUERY_KEY, true);
    },
  });

  return (
    <Dialog open={!hasAccepted}>
      <DialogContent
        className="max-w-md overflow-y-auto sm:max-w-2xl"
        showCloseButton={false}
      >
        <DialogHeader className="items-center space-y-3 text-center">
          <Image
            alt="VynChat Logo"
            className="size-32 rounded-lg"
            layout="fullWidth"
            src="/logo.webp"
          />
          <div>
            <DialogTitle className="font-bold text-3xl text-primary">
              Welcome to VynChat!
            </DialogTitle>
            <p className="text-center text-muted-foreground">
              Your new favorite chat application.
            </p>
          </div>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div>
            <h3 className="mb-4 text-center font-semibold text-lg">
              Discover what VynChat offers
            </h3>
            <div className="flex flex-wrap gap-2">
              {features.map((feature) => (
                <Badge
                  className="flex items-center gap-2"
                  key={feature.title}
                  variant="outline"
                >
                  <feature.icon className="size-5 shrink-0 scale-110 text-primary" />
                  <h4 className="font-semibold text-sm">{feature.title}</h4>
                </Badge>
              ))}
            </div>
          </div>
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 size-5 flex-shrink-0 text-destructive" />
              <div className="flex-grow">
                <h4 className="font-semibold text-destructive">
                  Age & Content Warning
                </h4>
                <p className="text-destructive/90 text-sm">
                  By continuing, you confirm that you are 18 or older. This
                  website may contain user-generated content.
                </p>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter className="justify-center">
          <Button
            className="w-full gap-1.5 sm:w-auto"
            disabled={isPending}
            onClick={() => acceptWelcomeDialog()}
            size="lg"
          >
            {isPending && <Loader2 className="size-4 animate-spin" />}I
            Understand & Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
