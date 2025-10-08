import { createClient } from "@supabase/supabase-js";
import { env } from "@/env";

/**
 * Optimized Supabase client for bot service
 * Uses service role key with proper connection management
 */
export const supabase = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
      // Heartbeat configuration
      heartbeatIntervalMs: 30000,
      timeout: 10000,
    },
    global: {
      headers: {
        apikey: env.SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      },
    },
  }
);

// Set auth for realtime
supabase.realtime.setAuth(env.SUPABASE_SERVICE_ROLE_KEY);

// Export for backwards compatibility
export const botClient = supabase;
export const botAdmin = supabase;
export const botRealtime = supabase;

