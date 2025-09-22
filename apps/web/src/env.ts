import { createEnv } from "@t3-oss/env-core";
import z from "zod";

export const env = createEnv({
  clientPrefix: "VITE_",
  client: {
    VITE_ALLOWED_HOSTS: z
      .string()
      .transform((val) => val.split(",").map((host) => host.trim())),
    VITE_WEB_URL: z.url(),
    VITE_SERVER_URL: z.url(),
    VITE_SUPABASE_URL: z.url(),
    VITE_SUPABASE_ANON_KEY: z.string(),
    VITE_AD_SENSE_CLIENT: z.string(),
    VITE_AD_SENSE_SLOT: z.string(),
  },
  runtimeEnv: import.meta.env,
  skipValidation: !!import.meta.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});
