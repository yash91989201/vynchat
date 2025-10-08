import { db } from "@/db";
import { connectionPool } from "./supabase-client";
import { BotInstance } from "./bot-instance";
import { BOT_PROFILES } from "./bot-profiles";
import type { BotProfile, BotStats } from "./config";
import { user } from "@/db/schema/auth";
import { eq } from "drizzle-orm";

export class BotManager {
  activeBots = new Map<string, BotInstance>();
  private isRunning = false;
  private maintenanceInterval: Timer | null = null;

  async start(targetBotCount: number, continent = "World"): Promise<void> {
    if (this.isRunning) {
      console.log("! Bot manager already running");
      return;
    }

    this.isRunning = true;
    console.log("🚀 Starting bot manager...");

    // Start bots with staggered timing to prevent connection storms
    await this.maintainBotPool(targetBotCount, continent);

    this.maintenanceInterval = setInterval(
      async () => {
        try {
          const newTarget = await this.calculateTargetBotCount();
          await this.maintainBotPool(newTarget, continent);
          await this.cleanupInactiveBots();
        } catch (error) {
          console.error("❌ Bot maintenance error:", error);
        }
      },
      Number.parseInt(process.env.MAINTENANCE_INTERVAL_MS || "60000", 10)
    );

    console.log("✅ Bot manager started");
  }

  async stop(): Promise<void> {
    if (!this.isRunning) return;

    console.log("🛑 Stopping bot manager...");
    this.isRunning = false;

    if (this.maintenanceInterval) {
      clearInterval(this.maintenanceInterval);
      this.maintenanceInterval = null;
    }

    const stopPromises = Array.from(this.activeBots.values()).map((bot) =>
      bot.stop().catch((err) => console.error("Error stopping bot:", err))
    );

    await Promise.all(stopPromises);
    this.activeBots.clear();

    console.log("✅ Bot manager stopped");
  }

  private async calculateTargetBotCount(): Promise<number> {
    try {
      // Use connection pool for presence check
      const client = connectionPool.getClient('bot-manager');
      const lobbyChannel = client.channel("global:lobby-presence-check", {
        config: { presence: { enabled: true } },
      });

      try {
        await new Promise<void>((resolve, reject) => {
          let timeoutId: number;
          
          const cleanup = () => {
            if (timeoutId) clearTimeout(timeoutId);
          };
          
          lobbyChannel.subscribe((status, err) => {
            if (status === "SUBSCRIBED") {
              cleanup();
              resolve();
            } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
              cleanup();
              reject(new Error(`Presence check failed: ${status}`));
            }
          });
          
          timeoutId = setTimeout(() => {
            cleanup();
            resolve(); // Don't fail, just continue without presence
          }, 5000);
        });
        
        // const presenceState = lobbyChannel.presenceState();
        // const totalUsers = Object.keys(presenceState).length;
      } catch (presenceError) {
        console.warn("⚠️ Presence check failed, proceeding without it:", presenceError instanceof Error ? presenceError.message : presenceError);
      } finally {
        try {
          await client.removeChannel(lobbyChannel);
        } catch (cleanupError) {
          // Ignore cleanup errors
        }
      }

      const humanUsers = await db.query.user.findMany({
        where: eq(user.isBot, false),
      });

      const humanCount = humanUsers.length;

      const minBots = Number.parseInt(process.env.BOT_MIN_COUNT || "3", 10);
      const maxBots = Number.parseInt(process.env.BOT_MAX_COUNT || "15", 10);
      const targetPercentage = Number.parseInt(
        process.env.BOT_TARGET_PERCENTAGE || "30",
        10
      );

      if (humanCount === 0) {
        return minBots;
      }

      const target = Math.ceil(humanCount * (targetPercentage / 100));
      return Math.max(minBots, Math.min(maxBots, target));
    } catch (error) {
      console.error("Error calculating target bot count:", error);
      return Number.parseInt(process.env.BOT_MIN_COUNT || "3", 10);
    }
  }

  async maintainBotPool(targetCount: number, continent: string): Promise<void> {
    const currentCount = this.activeBots.size;

    if (currentCount < targetCount) {
      const needed = targetCount - currentCount;
      console.log(
        `📈 Starting ${needed} new bots (${currentCount}/${targetCount})`
      );

      // Start bots sequentially with longer delays to prevent connection storms
      for (let i = 0; i < needed; i++) {
        try {
          await this.startBot(continent);
          // Significantly increased delay with jitter to reduce connection contention
          const delay = 5000 + Math.random() * 3000; // 5-8 seconds
          console.log(`⏳ Waiting ${Math.round(delay)}ms before next bot...`);
          await this.delay(delay);
        } catch (error) {
          console.error("Failed to start bot:", error);
          // Add extra delay after a failure
          await this.delay(3000);
        }
      }
    } else if (currentCount > targetCount) {
      const excess = currentCount - targetCount;
      console.log(
        `📉 Stopping ${excess} bots (${currentCount}/${targetCount})`
      );
      await this.stopExcessBots(excess);
    } else {
      console.log(`✅ Bot pool optimal: ${currentCount}/${targetCount}`);
    }
  }

  private async startBot(continent: string): Promise<void> {
    const profile = this.selectRandomProfile();
    const bot = new BotInstance(profile);

    await bot.start(continent);

    const botId = bot.getBotId();
    if (botId) {
      this.activeBots.set(botId, bot);
      console.log(`✅ Bot started: ${profile.name} (${botId})`);
    }
  }

  private async stopExcessBots(count: number): Promise<void> {
    const botsToStop: BotInstance[] = [];

    for (const bot of this.activeBots.values()) {
      if (!bot.isInConversation()) {
        botsToStop.push(bot);
        if (botsToStop.length >= count) break;
      }
    }

    if (botsToStop.length < count) {
      for (const bot of this.activeBots.values()) {
        if (bot.isInConversation() && !botsToStop.includes(bot)) {
          botsToStop.push(bot);
          if (botsToStop.length >= count) break;
        }
      }
    }

    for (const bot of botsToStop) {
      const botId = bot.getBotId();
      try {
        await bot.stop();
        if (botId) {
          this.activeBots.delete(botId);
        }
      } catch (error) {
        console.error("Error stopping bot:", error);
      }
    }
  }

  private cleanupInactiveBots(): void {
    const inactiveBots: string[] = [];

    for (const [botId, bot] of this.activeBots.entries()) {
      if (!bot) {
        inactiveBots.push(botId);
      }
    }

    for (const botId of inactiveBots) {
      this.activeBots.delete(botId);
      console.log(`🧹 Cleaned up inactive bot: ${botId}`);
    }
  }

  private selectRandomProfile(): BotProfile {
    const profile =
      BOT_PROFILES[Math.floor(Math.random() * BOT_PROFILES.length)];
    return {
      ...profile,
      name: `${profile.name}${Math.floor(Math.random() * 1000)}`,
      id: `${profile.id}-${Date.now()}`,
    };
  }

  getStats(): BotStats {
    let inConversation = 0;
    let waiting = 0;

    for (const bot of this.activeBots.values()) {
      if (bot.isInConversation()) {
        inConversation++;
      } else {
        waiting++;
      }
    }

    // Log connection pool stats
    const poolStats = connectionPool.getStats();
    console.log(`📊 Connection pool stats:`, poolStats);

    return {
      totalBots: this.activeBots.size,
      inConversation,
      waiting,
      isRunning: this.isRunning,
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
