import { createClient } from "@supabase/supabase-js";
import { env } from "@/env";
import { realtimeMonitor, createExponentialBackoff, measureTime } from "./realtime-monitor";

/**
 * Connection pool for managing Supabase realtime connections
 * Prevents connection storms and manages resources efficiently
 */
class RealtimeConnectionPool {
  private static instance: RealtimeConnectionPool;
  private connections: Map<string, any> = new Map();
  private connectionCounts: Map<string, number> = new Map();
  private maxConnectionsPerClient = 10;
  private connectionTimeout = 10000; // 10 seconds
  private maxRetries = 10;
  private baseDelay = 1000;
  private maxDelay = 30000;
  private getBackoffDelay = createExponentialBackoff(this.baseDelay, this.maxDelay);

  private constructor() {}

  static getInstance(): RealtimeConnectionPool {
    if (!RealtimeConnectionPool.instance) {
      RealtimeConnectionPool.instance = new RealtimeConnectionPool();
    }
    return RealtimeConnectionPool.instance;
  }

  /**
   * Get or create a Supabase client with connection pooling
   */
  getClient(clientId: string) {
    if (!this.connections.has(clientId)) {
      const client = createClient(
        env.SUPABASE_URL,
        env.SUPABASE_SERVICE_ROLE_KEY,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
          realtime: {
            params: {
              eventsPerSecond: 10, // Reduced to prevent rate limiting
            },
          },
        }
      );
      this.connections.set(clientId, client);
      this.connectionCounts.set(clientId, 0);
    }
    return this.connections.get(clientId);
  }

  /**
   * Create a channel with connection limits and retry logic
   */
  async createChannelWithRetry(
    clientId: string,
    channelName: string,
    config: any,
    options: {
      maxRetries?: number;
      baseDelay?: number;
      maxDelay?: number;
    } = {}
  ): Promise<any> {
    const client = this.getClient(clientId);
    const connectionCount = this.connectionCounts.get(clientId) || 0;
    
    if (connectionCount >= this.maxConnectionsPerClient) {
      throw new Error(`Connection limit exceeded for client ${clientId}`);
    }

    const maxRetries = options.maxRetries || this.maxRetries;
    const baseDelay = options.baseDelay || this.baseDelay;
    const maxDelay = options.maxDelay || this.maxDelay;

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Add timestamp to prevent channel name collisions
        const uniqueChannelName = `${channelName}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const channel = client.channel(uniqueChannelName, config);

        this.connectionCounts.set(clientId, connectionCount + 1);

        await new Promise<void>((resolve, reject) => {
          let isResolved = false;
          let timeoutId: NodeJS.Timeout;

          const cleanup = () => {
            if (timeoutId) clearTimeout(timeoutId);
          };

          channel.subscribe((status, err) => {
            if (isResolved) return;

            if (status === "SUBSCRIBED") {
              isResolved = true;
              cleanup();
              resolve();
            } else if (
              status === "CHANNEL_ERROR" ||
              status === "TIMED_OUT" ||
              status === "CLOSED"
            ) {
              isResolved = true;
              cleanup();
              const errorMsg = `Channel subscription failed: ${status}${err ? ` - ${err}` : ''}`;
              reject(new Error(errorMsg));
            }
          });

          timeoutId = setTimeout(() => {
            if (!isResolved) {
              isResolved = true;
              reject(new Error("Channel subscription timeout"));
            }
          }, this.connectionTimeout);
        });

        console.log(`✅ Channel created successfully: ${uniqueChannelName} (attempt ${attempt})`);
        return channel;

      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.warn(`❌ Channel creation failed (attempt ${attempt}/${maxRetries}):`, lastError.message);

        // Clean up failed connection count
        const currentCount = this.connectionCounts.get(clientId) || 0;
        this.connectionCounts.set(clientId, Math.max(0, currentCount - 1));

        if (attempt === maxRetries) {
          break;
        }

        // Exponential backoff with jitter
        const exponentialDelay = Math.min(baseDelay * Math.pow(2, attempt - 1), maxDelay);
        const jitter = Math.random() * 0.3 * exponentialDelay; // 30% jitter
        const delay = exponentialDelay + jitter;
        
        console.log(`⏳ Retrying in ${Math.round(delay)}ms...`);
        await this.delay(delay);
      }
    }

    throw lastError || new Error("Failed to create channel after all retries");
  }

  /**
   * Safely remove a channel and update connection count
   */
  async removeChannel(clientId: string, channel: any): Promise<void> {
    try {
      const client = this.getClient(clientId);
      await client.removeChannel(channel);
      
      const currentCount = this.connectionCounts.get(clientId) || 0;
      this.connectionCounts.set(clientId, Math.max(0, currentCount - 1));
      
      console.log(`🗑️ Channel removed for client ${clientId}. Active connections: ${this.connectionCounts.get(clientId)}`);
    } catch (error) {
      console.error(`Error removing channel for client ${clientId}:`, error);
    }
  }

  /**
   * Get connection statistics
   */
  getStats() {
    const realtimeMetrics = realtimeMonitor.getMetrics();
    return {
      totalConnections: Array.from(this.connectionCounts.values()).reduce((sum, count) => sum + count, 0),
      clients: Object.fromEntries(this.connectionCounts),
      realtimeMetrics,
    };
  }

  /**
   * Clean up all connections for a client
   */
  async cleanupClient(clientId: string): Promise<void> {
    try {
      const client = this.connections.get(clientId);
      if (client) {
        // Note: Supabase client doesn't have a direct cleanup method for all channels
        // We'll just remove the reference and let GC handle it
        this.connections.delete(clientId);
        this.connectionCounts.delete(clientId);
        console.log(`🧹 Cleaned up client ${clientId}`);
      }
    } catch (error) {
      console.error(`Error cleaning up client ${clientId}:`, error);
    }

    // Clean up monitor states for this client
    realtimeMonitor.cleanup();
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Log comprehensive status including monitor data
   */
  logDetailedStatus(): void {
    console.log('\n📊 Detailed Connection Pool Status:');
    console.log('====================================');
    
    const stats = this.getStats();
    console.log('Pool Stats:', stats);
    
    realtimeMonitor.logStatus();
    
    console.log('====================================\n');
  }
}

export const connectionPool = RealtimeConnectionPool.getInstance();

// Export individual clients for backwards compatibility
export const botClient = connectionPool.getClient('bot-service');
export const botAdmin = botClient;
export const botRealtime = botClient;