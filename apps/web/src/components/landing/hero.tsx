import { useMutation } from "@tanstack/react-query";
import { Link, useNavigate, useRouteContext } from "@tanstack/react-router";
import { ArrowRightLeft, Ban, ImageUp, Loader2, User } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";

export function Hero() {
  const navigate = useNavigate();
  const { session } = useRouteContext({
    from: "__root__",
  });

  const isLoggedIn = !!session;

  const {
    mutateAsync: guestSignInStrangerChat,
    isPending: isGuestSigningInStrangerChat,
  } = useMutation({
    mutationKey: ["guest-sign-in"],
    mutationFn: () => authClient.signIn.anonymous(),
    onSuccess: () => {
      toast.success("Signed in as guest");
      navigate({
        to: "/chat",
        search: { tab: "stranger-chat" },
      });
    },
    onError: () => {
      toast.error("There was an error signing in. Please try again.");
    },
  });

  const {
    mutateAsync: guestSignInChatRoom,
    isPending: isGuestSigningInChatRoom,
  } = useMutation({
    mutationKey: ["guest-sign-in"],
    mutationFn: () => authClient.signIn.anonymous(),
    onSuccess: () => {
      toast.success("Signed in as guest");
      navigate({
        to: "/chat",
        search: { tab: "chat-rooms" },
      });
    },
    onError: () => {
      toast.error("There was an error signing in. Please try again.");
    },
  });

  return (
    <section className="py-12 md:py-24">
      <div className="container z-10 mx-auto grid items-center gap-8 px-4 text-center md:px-6 lg:grid-cols-2 lg:gap-16 lg:text-left">
        <div className="flex flex-col space-y-6">
          <div className="mx-auto inline-block w-fit rounded-full bg-muted px-3 py-1.5 text-sm lg:mx-0">
            🎉 New in VynChat: Real-time messaging!
          </div>
          <h1 className="font-bold text-4xl tracking-tighter sm:text-5xl md:text-7xl">
            Chat. Connect.
            <br />
            <span className="text-primary">Instantly.</span>
          </h1>
          <p className="mx-auto max-w-2xl text-muted-foreground md:text-xl/relaxed lg:mx-0 lg:text-base/relaxed xl:text-xl/relaxed">
            VynChat lets you join live rooms, share photos, and connect with
            people across the globe — all in a fast, fun, and safe environment.
          </p>
          <div className="flex flex-col justify-center gap-4 lg:justify-start min-[400px]:flex-row">
            {isLoggedIn ? (
              <>
                <Link
                  className={buttonVariants({ variant: "default", size: "lg" })}
                  search={{ tab: "stranger-chat" }}
                  to="/chat"
                >
                  Stranger Chat
                </Link>
                <Link
                  className={buttonVariants({
                    variant: "secondary",
                    size: "lg",
                  })}
                  search={{ tab: "chat-rooms" }}
                  to="/chat"
                >
                  Chat Rooms
                </Link>
              </>
            ) : (
              <>
                <Button
                  disabled={isGuestSigningInStrangerChat}
                  onClick={() => guestSignInStrangerChat()}
                >
                  {isGuestSigningInStrangerChat && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Stranger Chat
                </Button>

                <Button
                  disabled={isGuestSigningInChatRoom}
                  onClick={() => guestSignInChatRoom()}
                  variant="secondary"
                >
                  {isGuestSigningInChatRoom && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Chat Room
                </Button>
              </>
            )}
            <Link
              className={buttonVariants({ variant: "outline", size: "lg" })}
              to="/blogs"
            >
              Explore Blog
            </Link>
          </div>
          <div className="mx-auto flex flex-wrap items-center justify-center gap-6 lg:mx-0 lg:justify-start">
            <Badge
              className="flex scale-110 items-center gap-1.5 rounded-full px-3 py-1.5"
              variant="outline"
            >
              <Ban className="text-primary" />
              <span className="text-muted-foreground text-xs">
                No signup needed
              </span>
            </Badge>
            <Badge
              className="flex scale-110 items-center gap-1.5 rounded-full px-3 py-1.5"
              variant="outline"
            >
              <ArrowRightLeft className="text-primary" />
              <span className="text-muted-foreground text-xs">
                Skip to next stranger
              </span>
            </Badge>
            <Badge
              className="flex scale-110 items-center gap-1.5 rounded-full px-3 py-1.5"
              variant="outline"
            >
              <ImageUp className="text-primary" />
              <span className="text-muted-foreground text-xs">
                Photo sharing
              </span>
            </Badge>
          </div>
        </div>
        <div className="hidden lg:block lg:w-lg xl:w-xl">
          <Card className="w-full rounded-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="font-bold text-primary text-xl">
                Chat Preview
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Incoming Message */}
              <div className="flex items-start space-x-4">
                <div className="flex size-10 flex-shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow">
                  <User className="size-5" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="rounded-full bg-muted p-3 text-sm shadow-sm">
                    hey! where are you from?
                  </div>
                </div>
              </div>

              {/* Outgoing Message */}
              <div className="flex items-start justify-end space-x-4">
                <div className="flex-1 space-y-1 text-right">
                  <div className="inline-block rounded-full bg-primary p-3 text-primary-foreground text-sm shadow">
                    India you?
                  </div>
                </div>
                <div className="flex size-10 flex-shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow">
                  <User className="size-5" />
                </div>
              </div>

              {/* Incoming Message */}
              <div className="flex items-start space-x-4">
                <div className="flex size-10 flex-shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow">
                  <User className="size-5" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="rounded-full bg-muted p-3 text-sm shadow-sm">
                    EU! let’s join the music room 🎶
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
