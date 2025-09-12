import { useMutation } from "@tanstack/react-query";
import { Facebook, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { env } from "@/env";
import { authClient } from "@/lib/auth-client";

export const FacebookSignInButton = () => {
  const facebookAuthMutation = useMutation({
    mutationKey: ["facebook-auth"],
    mutationFn: () => {
      return authClient.signIn.social({
        provider: "facebook",
        callbackURL: `${env.VITE_SERVER_URL}/chat`,
      });
    },
  });

  const handleFacebookAuth = () => {
    facebookAuthMutation.mutate();
  };

  return (
    <Button
      className="w-full"
      disabled={facebookAuthMutation.isPending || 5 > 2}
      onClick={handleFacebookAuth}
      type="button"
      variant="outline"
    >
      {facebookAuthMutation.isPending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Facebook className="mr-2 h-4 w-4" />
      )}
      <span>Sign In with Facebook</span>
    </Button>
  );
};
