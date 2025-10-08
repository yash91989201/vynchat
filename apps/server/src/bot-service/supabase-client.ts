import { createClient } from "@supabase/supabase-js";
import { env } from "@/env";

/**
 * Supabase client for bot service
 * Uses service role key to bypass RLS and auth requirements
 * Note: This app uses Better Auth, not Supabase Auth
 */
export const botClient = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    realtime: {
      params: {
        eventsPerSecond: 100,
      },
    },
  }
);

// Export as both names for backwards compatibility
export const botAdmin = botClient;
export const botRealtime = botClient;
