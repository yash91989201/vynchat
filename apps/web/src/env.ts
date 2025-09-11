import { createEnv } from "@t3-oss/env-core";
import z from "zod";

export const env = createEnv({
  clientPrefix: "VITE_",
  client: {
    VITE_SERVER_URL: z.url(),
    VITE_SUPABASE_URL: z.url(),
    VITE_SUPABASE_ANON_KEY: z.string(),
  },
  runtimeEnv: import.meta.env,
  skipValidation: !!import.meta.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});
