import { createEnv } from "@t3-oss/env-core";
import z from "zod";

export const env = createEnv({
  server: {
    PORT: z.string().transform((val) => Number.parseInt(val, 10)),
    DATABASE_URL: z.url(),
    BETTER_AUTH_SECRET: z.string(),
    BETTER_AUTH_URL: z.url(),
    CORS_ORIGIN: z.url(),
    SUPABASE_URL: z.url(),
    SUPABASE_ANON_KEY: z.string(),
    SUPABASE_SERVICE_ROLE_KEY: z.string(),
    SUPABASE_JWT_SECRET: z.string(),
    GOOGLE_CLIENT_ID: z.string(),
    GOOGLE_CLIENT_SECRET: z.string(),
    FACEBOOK_CLIENT_ID: z.string(),
    FACEBOOK_CLIENT_SECRET: z.string(),
    RESEND_API_KEY: z.string(),
  },
  runtimeEnv: process.env,
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});
