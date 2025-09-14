import { useMutation } from "@tanstack/react-query";
import { Link, useNavigate, useRouteContext } from "@tanstack/react-router";
import { LayoutDashboard, Loader2, User } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";
import { Badge } from "../ui/badge";

export const UserMenu = () => {
  const navigate = useNavigate();
  const { session, queryClient, queryUtils } = useRouteContext({
    from: "__root__",
  });

  const { mutateAsync: logOut, isPending: isLoggingOut } = useMutation({
    mutationKey: ["log-out"],
    mutationFn: async () => {
      await authClient.signOut();

      queryClient.invalidateQueries({
        queryKey: queryUtils.key(),
      });
    },
    onSuccess: () => {
      toast.success("Logged out successfully");
      navigate({
        to: "/",
      });
    },
    onError: () => {
      toast.error("There was an error logging out. Please try again.");
    },
  });

  const { mutateAsync: guestSignIn, isPending: isGuestSigningIn } = useMutation(
    {
      mutationKey: ["guest-sign-in"],
      mutationFn: () => authClient.signIn.anonymous(),
      onSuccess: () => {
        toast.success("Signed in as guest");
        navigate({
          to: "/chat",
        });
      },
      onError: () => {
        toast.error("There was an error signing in. Please try again.");
      },
    }
  );

  if (!session) {
    return (
      <div className="flex items-center gap-2">
        <Button
          disabled={isGuestSigningIn}
          onClick={() => guestSignIn()}
          variant="outline"
        >
          {isGuestSigningIn && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Guest Login
        </Button>
        <Link className={buttonVariants()} to="/log-in">
          Log In
        </Link>
      </div>
    );
  }

  const isAnonymous = !!session?.user?.isAnonymous;
  const isAdmin = session.user.role === "admin";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="relative h-8 w-8 rounded-full" variant="ghost">
          <Avatar>
            <AvatarImage
              alt={session.user.name}
              src={
                session.user.image ??
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user.name}`
              }
            />
            <AvatarFallback>{session.user.name.charAt(0)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-card">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col gap-1.5">
            <p className="space-x-1.5 font-semibold">
              <span>{session.user.name}</span>
              {isAnonymous && (
                <Badge className="rounded-full" variant="secondary">
                  Guest
                </Badge>
              )}
              {isAdmin && (
                <Badge className="rounded-full" variant="secondary">
                  Admin
                </Badge>
              )}
            </p>
            {!isAnonymous && (
              <p className="truncate text-muted-foreground text-sm">
                {session.user.email}
              </p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {isAdmin ? (
          <>
            <DropdownMenuItem asChild>
              <Link to="/admin/profile">
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/admin/dashboard">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                <span>Dashboard</span>
              </Link>
            </DropdownMenuItem>
          </>
        ) : (
          <DropdownMenuItem asChild>
            <Link to="/profile">
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Button
            className="w-full"
            disabled={isLoggingOut}
            onClick={() => logOut()}
            variant="destructive"
          >
            {isLoggingOut && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <span>Log Out</span>
          </Button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
