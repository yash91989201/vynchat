import { createClient } from "@supabase/supabase-js";
import { env } from "@/env";

/**
 * Single shared client for all bot operations
 * Prevents connection limit issues by reusing one client
 */
class BotSupabaseClient {
  private static instance: BotSupabaseClient;
  private client: any;

  private constructor() {
    // Create a single client with service role key
    this.client = createClient(
      env.SUPABASE_URL,
      env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
        realtime: {
          // Use service role key explicitly for realtime
          params: {
            eventsPerSecond: 2, // Very low to prevent rate limiting
          },
        },
        global: {
          headers: {
            apikey: env.SUPABASE_SERVICE_ROLE_KEY,
            Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
          },
        },
      }
    );

    // Set the access token explicitly for realtime
    this.client.realtime.setAuth(env.SUPABASE_SERVICE_ROLE_KEY);
  }

  static getInstance(): BotSupabaseClient {
    if (!BotSupabaseClient.instance) {
      BotSupabaseClient.instance = new BotSupabaseClient();
    }
    return BotSupabaseClient.instance;
  }

  getClient() {
    return this.client;
  }

  /**
   * Create a channel with minimal retry logic
   */
  createChannel(channelName: string, config: any = {}): Promise<any> {
    const client = this.getClient();

    // Use simple channel name without timestamps for consistency
    const channel = client.channel(channelName, {
      config: {
        broadcast: { self: true, ack: false }, // Disable ack to reduce overhead
        presence: { key: config.presence?.key },
        ...config,
      },
    });

    return new Promise((resolve, reject) => {
      let timeoutId: NodeJS.Timeout;

      const cleanup = () => {
        if (timeoutId) clearTimeout(timeoutId);
      };

      channel.subscribe((status, err) => {
        if (status === "SUBSCRIBED") {
          cleanup();
          console.log(`✅ Channel subscribed: ${channelName}`);
          resolve(channel);
        } else if (
          status === "CHANNEL_ERROR" ||
          status === "TIMED_OUT" ||
          status === "CLOSED"
        ) {
          cleanup();
          const errorMsg = `Channel ${channelName} failed: ${status}${err ? ` - ${err}` : ""}`;
          console.error(`❌ ${errorMsg}`);
          reject(new Error(errorMsg));
        }
      });

      // Shorter timeout for faster failure detection
      timeoutId = setTimeout(() => {
        cleanup();
        console.error(`❌ Channel ${channelName} timed out`);
        reject(new Error("Channel subscription timeout"));
      }, 5000);
    });
  }

  /**
   * Safely remove a channel
   */
  async removeChannel(channel: any): Promise<void> {
    try {
      await this.client.removeChannel(channel);
    } catch (error) {
      console.warn("Channel removal error:", error);
    }
  }
}

// Export singleton instance
export const botSupabaseClient = BotSupabaseClient.getInstance();

// Export for backwards compatibility
export const botClient = botSupabaseClient.getClient();
export const botAdmin = botClient;
export const botRealtime = botClient;

