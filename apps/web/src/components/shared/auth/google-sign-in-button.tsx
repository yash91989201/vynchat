import { useMutation } from "@tanstack/react-query";
import { Chrome, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { env } from "@/env";
import { authClient } from "@/lib/auth-client";

export const GoogleSignInButton = () => {
  const googleAuthMutation = useMutation({
    mutationKey: ["google-auth"],
    mutationFn: () => {
      return authClient.signIn.social({
        provider: "google",
        callbackURL: `${env.VITE_WEB_URL}/chat`,
      });
    },
  });

  const handleGoogleAuth = () => {
    googleAuthMutation.mutate();
  };

  return (
    <Button
      className="w-full"
      disabled={googleAuthMutation.isPending}
      onClick={handleGoogleAuth}
      type="button"
      variant="outline"
    >
      {googleAuthMutation.isPending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Chrome className="mr-2 h-4 w-4" />
      )}
      <span>Sign In with Google</span>
    </Button>
  );
};
