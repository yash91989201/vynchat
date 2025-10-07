import { createClient } from "@supabase/supabase-js";
import { env } from "@/env";

/**
 * Dedicated Supabase client for bot service using service role key
 * This allows bots to bypass RLS and have unlimited realtime connections
 */
export const botSupabase = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    realtime: {
      params: {
        eventsPerSecond: 100, // Increase event throughput
      },
    },
  }
);
