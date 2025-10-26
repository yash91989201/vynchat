import { createClient } from "@supabase/supabase-js";
import { createId } from "@paralleldrive/cuid2";
import { Bot } from "./bot";
import { BotConfig } from "./types";

interface BotServiceConfig {
  supabaseUrl: string;
  supabaseServiceKey: string;
  numberOfBots: number;
  minActiveBots: number;
  maxActiveBots: number;
  botLifecycleMinutes: {
    min: number;
    max: number;
  };
  matchmakingIntervalMs: number;
  messageIntervalMs: {
    min: number;
    max: number;
  };
  continents: string[];
}

export class BotService {
  private supabase: ReturnType<typeof createClient>;
  private config: BotServiceConfig;
  private bots: Map<string, Bot> = new Map();
  private isRunning = false;
  private lifecycleInterval?: NodeJS.Timeout;
  private matchmakingInterval?: NodeJS.Timeout;

  constructor(config: BotServiceConfig) {
    this.supabase = createClient(config.supabaseUrl, config.supabaseServiceKey);
    this.config = config;
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      console.log("🤖 Bot service is already running");
      return;
    }

    console.log(`🚀 Starting bot service with ${this.config.numberOfBots} bots`);
    this.isRunning = true;

    // Initialize the bot pool
    await this.initializeBotPool();

    // Start lifecycle management
    this.startLifecycleManagement();

    // Start matchmaking simulation
    this.startMatchmakingSimulation();

    console.log("✅ Bot service started successfully");
  }

  async stop(): Promise<void> {
    if (!this.isRunning) {
      console.log("🤖 Bot service is not running");
      return;
    }

    console.log("🛑 Stopping bot service");
    this.isRunning = false;

    // Clear intervals
    if (this.lifecycleInterval) {
      clearInterval(this.lifecycleInterval);
    }
    if (this.matchmakingInterval) {
      clearInterval(this.matchmakingInterval);
    }

    // Stop all bots
    const stopPromises = Array.from(this.bots.values()).map(bot => bot.stop());
    await Promise.all(stopPromises);
    this.bots.clear();

    console.log("✅ Bot service stopped");
  }

  private async initializeBotPool(): Promise<void> {
    console.log("🔧 Initializing bot pool...");
    
    for (let i = 0; i < this.config.numberOfBots; i++) {
      const botId = await this.createBotUser();
      if (botId) {
        const bot = new Bot({
          id: botId,
          supabase: this.supabase,
          config: {
            continents: this.config.continents,
            messageIntervalMs: this.config.messageIntervalMs,
            lifecycleMinutes: this.config.botLifecycleMinutes,
          },
        });
        this.bots.set(botId, bot);
        await bot.start();
      }
    }

    console.log(`✅ Created ${this.bots.size} bots`);
  }

  private async createBotUser(): Promise<string | null> {
    const botId = createId();
    const botNames = [
      "Alex", "Sam", "Jordan", "Taylor", "Morgan", "Casey", "Riley", "Avery",
      "Quinn", "Blake", "Drew", "Cameron", "Jamie", "Reese", "Skyler", "Emerson"
    ];
    const randomName = botNames[Math.floor(Math.random() * botNames.length)];
    const randomNumber = Math.floor(Math.random() * 9999);
    const botName = `${randomName}${randomNumber}`;

    try {
      const { error } = await this.supabase.from("user").insert({
        id: botId,
        name: botName,
        email: `bot_${botId}@vynchat.local`,
        emailVerified: true,
        isAnonymous: true,
        isBot: true,
        botProfile: JSON.stringify({
          personality: this.getRandomPersonality(),
          interests: this.getRandomInterests(),
          responseStyle: this.getRandomResponseStyle(),
        }),
        lastActive: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      if (error) {
        console.error(`❌ Failed to create bot ${botId}:`, error);
        return null;
      }

      console.log(`✅ Created bot user: ${botName} (${botId})`);
      return botId;
    } catch (error) {
      console.error(`❌ Error creating bot user:`, error);
      return null;
    }
  }

  private getRandomPersonality(): string {
    const personalities = [
      "friendly and curious",
      "shy but open",
      "energetic and talkative",
      "thoughtful and deep",
      "humorous and playful",
      "serious and intellectual",
      "adventurous and bold",
      "calm and supportive",
    ];
    return personalities[Math.floor(Math.random() * personalities.length)];
  }

  private getRandomInterests(): string[] {
    const allInterests = [
      "music", "movies", "gaming", "travel", "cooking", "sports",
      "technology", "art", "books", "nature", "photography", "fashion",
      "fitness", "science", "history", "comedy", "pets", "food"
    ];
    const count = Math.floor(Math.random() * 4) + 2; // 2-5 interests
    const shuffled = allInterests.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  private getRandomResponseStyle(): string {
    const styles = ["casual", "formal", "enthusiastic", "minimalist", "detailed"];
    return styles[Math.floor(Math.random() * styles.length)];
  }

  private startLifecycleManagement(): void {
    this.lifecycleInterval = setInterval(async () => {
      if (!this.isRunning) return;

      try {
        await this.manageBotLifecycle();
      } catch (error) {
        console.error("❌ Error in bot lifecycle management:", error);
      }
    }, 60000); // Check every minute
  }

  private async manageBotLifecycle(): Promise<void> {
    const currentCount = this.bots.size;
    const activeBots = Array.from(this.bots.values()).filter(bot => bot.isActive());
    
    console.log(`📊 Bot status: ${currentCount} total, ${activeBots.length} active`);

    // Ensure we have enough bots
    if (currentCount < this.config.minActiveBots) {
      const botsToCreate = this.config.minActiveBots - currentCount;
      for (let i = 0; i < botsToCreate; i++) {
        const botId = await this.createBotUser();
        if (botId) {
          const bot = new Bot({
            id: botId,
            supabase: this.supabase,
            config: {
              continents: this.config.continents,
              messageIntervalMs: this.config.messageIntervalMs,
              lifecycleMinutes: this.config.botLifecycleMinutes,
            },
          });
          this.bots.set(botId, bot);
          await bot.start();
        }
      }
    }

    // Remove inactive bots if we have too many
    if (currentCount > this.config.maxActiveBots) {
      const inactiveBots = Array.from(this.bots.entries())
        .filter(([_, bot]) => !bot.isActive())
        .slice(0, currentCount - this.config.maxActiveBots);

      for (const [botId, bot] of inactiveBots) {
        await bot.stop();
        this.bots.delete(botId);
        console.log(`🗑️ Removed inactive bot: ${botId}`);
      }
    }
  }

  private startMatchmakingSimulation(): void {
    this.matchmakingInterval = setInterval(async () => {
      if (!this.isRunning) return;

      try {
        await this.simulateMatchmaking();
      } catch (error) {
        console.error("❌ Error in matchmaking simulation:", error);
      }
    }, this.config.matchmakingIntervalMs);
  }

  private async simulateMatchmaking(): Promise<void> {
    const idleBots = Array.from(this.bots.values())
      .filter(bot => bot.isIdle())
      .slice(0, Math.floor(this.bots.size * 0.3)); // Start 30% of idle bots

    console.log(`🎯 Starting matchmaking for ${idleBots.length} bots`);

    for (const bot of idleBots) {
      try {
        await bot.startMatchmaking();
        // Add small delay to avoid overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`❌ Bot ${bot.getId()} failed to start matchmaking:`, error);
      }
    }
  }

  getStats(): {
    totalBots: number;
    activeBots: number;
    idleBots: number;
    chattingBots: number;
    matchmakingBots: number;
  } {
    const bots = Array.from(this.bots.values());
    return {
      totalBots: bots.length,
      activeBots: bots.filter(bot => bot.isActive()).length,
      idleBots: bots.filter(bot => bot.isIdle()).length,
      chattingBots: bots.filter(bot => bot.isChatting()).length,
      matchmakingBots: bots.filter(bot => bot.isMatchmaking()).length,
    };
  }
}