import { Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { buttonVariants } from "../ui/button";

export const AccountLinkDialog = ({
  initialOpen = false,
}: {
  initialOpen?: boolean;
}) => {
  const [open, setOpen] = useState(initialOpen);

  return (
    <AlertDialog onOpenChange={setOpen} open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Link your account</AlertDialogTitle>
          <AlertDialogDescription>
            As a guest user, linking your account will give you access to
            additional features like Room Chat and your Following list.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Link
              className={buttonVariants({ variant: "outline", size: "lg" })}
              search={{ tab: "stranger-chat" }}
              to="/chat"
            >
              Cancel
            </Link>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Link
              className={buttonVariants({ variant: "default", size: "lg" })}
              to="/profile"
            >
              Continue
            </Link>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
