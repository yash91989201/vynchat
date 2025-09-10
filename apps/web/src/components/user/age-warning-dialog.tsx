import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const AGE_WARNING_KEY = "vynchat_age_warning_accepted";
const AGE_WARNING_QUERY_KEY = ["ageWarningAccepted"];

export function AgeWarningDialog() {
  const queryClient = useQueryClient();

  const { data: hasAccepted } = useQuery({
    queryKey: AGE_WARNING_QUERY_KEY,
    queryFn: () => {
      const stored = localStorage.getItem(AGE_WARNING_KEY);
      return stored === "true";
    },
    initialData: localStorage.getItem(AGE_WARNING_KEY) === "true",
    staleTime: Number.POSITIVE_INFINITY,
  });

  const { mutateAsync: acceptAgeWarning, isPending } = useMutation({
    mutationFn: () => {
      localStorage.setItem(AGE_WARNING_KEY, "true");
      return Promise.resolve(true);
    },
    onSuccess: () => {
      toast.success("Thank you for confirming your age.");
      queryClient.setQueryData(AGE_WARNING_QUERY_KEY, true);
    },
  });

  return (
    <Dialog open={!hasAccepted}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className="font-bold text-2xl text-primary">
            18+ Age Warning
          </DialogTitle>
        </DialogHeader>
        <DialogDescription>
          This website may contain user-generated chat content. By entering, you
          confirm that you are 18 or older.
        </DialogDescription>
        <DialogFooter className="justify-center">
          <Button
            className="w-full gap-1.5 sm:w-auto"
            disabled={isPending}
            onClick={() => acceptAgeWarning()}
            size="lg"
          >
            {isPending && <Loader2 className="size-4.5" />}
            Enter
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
