import { adminClient, anonymousClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { env } from "@/env";

export const authClient = createAuthClient({
  baseURL: env.VITE_SERVER_URL,
  plugins: [adminClient(), anonymousClient()],
});
