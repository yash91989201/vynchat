import { createId } from "@paralleldrive/cuid2";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { botAnalytics, message } from "@/db/schema";
import { user } from "@/db/schema/auth";
import type { MessageType, RoomType } from "@/lib/types";
import type { BotProfile } from "./config";
import { botAdmin, connectionPool } from "./supabase-client";
import { createClient, type RealtimeChannel } from "@supabase/supabase-js";

const GreetingRegex = /\b(hi|hello|hey|howdy|sup)\b/;
const InterestsRegex = /\b(hobby|hobbies|interests?|do for fun)\b/;
const ByeRegex = /\b(bye|goodbye|gtg|gotta go)\b/;

export class BotInstance {
  private botUserId = "";
  botName: string;
  profile: BotProfile;

  private currentRoomId: string | null = null;
  private messageCount = 0;
  private conversationStartTime: number | null = null;

  lobbyChannel: RealtimeChannel | null = null;
  private userChannel: RealtimeChannel | null = null;
  private roomChannel: RealtimeChannel | null = null;
  private clientId = `bot-${this.botName.toLowerCase()}-${Date.now()}`;

  isActive = false;
  private shouldStop = false;

  constructor(profile: BotProfile) {
    this.profile = profile;
    this.botName = profile.name;
  }

  async start(continent: string): Promise<void> {
    try {
      console.log(`🤖 Starting bot: ${this.botName}`);
      this.shouldStop = false;

      await this.createBotUser();

      // Add delay before joining lobby to stagger bot connections
      await this.delay(this.randomBetween(1000, 3000));

      await this.joinLobbyPresence();
      await this.setupUserChannel();

      await this.delay(this.randomBetween(3000, 5000));
      await this.joinMatchmakingQueue(continent);

      this.isActive = true;
      console.log(`✅ Bot active: ${this.botName} (${this.botUserId})`);
    } catch (error) {
      console.error(`❌ Failed to start bot ${this.botName}:`, error);
      await this.cleanup();
      throw error;
    }
  }

  private async createBotUser(): Promise<void> {
    const userId = createId();

    await db.insert(user).values({
      id: userId,
      name: this.botName,
      email: `bot-${this.profile.id}-${Date.now()}@bot.internal`,
      emailVerified: false,
      isBot: true,
      isAnonymous: true,
      botProfile: JSON.stringify(this.profile),
      createdAt: new Date(),
      updatedAt: new Date(),
      lastActive: new Date(),
    });

    this.botUserId = userId;
    console.log(`👤 Bot user created: ${this.botUserId}`);
  }

  private async joinLobbyPresence(): Promise<void> {
    const maxRetries = 5; // Increased retries
    let attempt = 0;

    while (attempt < maxRetries) {
      try {
        // Clean up existing channel before creating new one
        if (this.lobbyChannel) {
          try {
            await connectionPool.removeChannel(this.clientId, this.lobbyChannel);
          } catch (cleanupError) {
            console.error('Cleanup error:', cleanupError);
          }
          this.lobbyChannel = null;
        }

        // Add delay to prevent rapid reconnections
        if (attempt > 0) {
          await this.delay(Math.min(3000 * attempt, 10000)); // Cap at 10s
        }

        // Use connection pool for channel creation
        this.lobbyChannel = await connectionPool.createChannelWithRetry(
          this.clientId,
          "global:lobby",
          {
            config: {
              presence: { key: this.botUserId },
              broadcast: { self: true },
            },
          },
          { maxRetries: 3, baseDelay: 2000, maxDelay: 10000 }
        );

        // Track presence with retry
        try {
          await this.delay(500); // Small delay before tracking
          await this.lobbyChannel.track({
            user_id: this.botUserId,
            status: "idle",
          });
        } catch (trackError) {
          console.warn(`⚠️ Presence tracking failed for ${this.botName}:`, trackError);
          // Continue anyway - channel is subscribed
        }

        console.log(`📍 ${this.botName} joined lobby presence`);
        return; // Success, exit the retry loop
      } catch (error) {
        attempt++;
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.warn(
          `!  ${this.botName} failed to join lobby presence (attempt ${attempt}/${maxRetries}):`,
          errorMessage
        );

        // Clean up failed channel
        if (this.lobbyChannel) {
          try {
            await connectionPool.removeChannel(this.clientId, this.lobbyChannel);
          } catch (cleanupError) {
            console.error('Cleanup error:', cleanupError);
          }
          this.lobbyChannel = null;
        }

        if (attempt >= maxRetries) {
          // Gracefully degrade - continue without lobby presence
          console.warn(
            `!  ${this.botName} could not join lobby presence after ${maxRetries} attempts. Continuing without presence tracking.`
          );
          return; // Don't throw, just continue without lobby presence
        }

        // Exponential backoff with jitter
        const baseDelay = 2000;
        const exponentialDelay = Math.min(baseDelay * Math.pow(2, attempt - 1), 15000);
        const jitter = Math.random() * 1000;
        await this.delay(exponentialDelay + jitter);
      }
    }
  }

  private async setupUserChannel(): Promise<void> {
    try {
      // Clean up existing channel
      if (this.userChannel) {
        try {
          await connectionPool.removeChannel(this.clientId, this.userChannel);
        } catch (cleanupError) {
          console.error('User channel cleanup error:', cleanupError);
        }
        this.userChannel = null;
      }

      this.userChannel = await connectionPool.createChannelWithRetry(
        this.clientId,
        `user:${this.botUserId}`,
        {
          config: {
            broadcast: { self: true, ack: true },
            presence: { key: this.botUserId },
          },
        },
        { maxRetries: 3, baseDelay: 1500, maxDelay: 8000 }
      );

      this.userChannel
        .on("broadcast", { event: "stranger_matched" }, async ({ payload }) => {
          if (!this.shouldStop) {
            console.log(`🎯 ${this.botName} matched! Room: ${payload.room.id}`);
            await this.handleMatch(payload.room);
          }
        })
        .on("broadcast", { event: "stranger_skipped" }, async () => {
          if (!this.shouldStop) {
            console.log(`⏭ ${this.botName} was skipped`);
            await this.handleSkipped();
          }
        })
        .subscribe((status, err) => {
          if (status === "SUBSCRIBED") {
            console.log(`📡 ${this.botName} listening for matches`);
          } else if (status === "CHANNEL_ERROR") {
            console.error(`❌ ${this.botName} user channel error:`, err);
          } else {
            console.log(`📡 ${this.botName} user channel status:`, status);
          }
        });
    } catch (error) {
      console.error(`❌ Failed to setup user channel for ${this.botName}:`, error);
      // Don't throw - continue without user channel (will affect functionality but not crash)
    }
  }

  private async joinMatchmakingQueue(continent: string): Promise<void> {
    if (this.shouldStop) return;

    if (this.lobbyChannel) {
      await this.lobbyChannel.track({
        user_id: this.botUserId,
        status: "waiting",
      });
    }

    // Use admin client for queue RPC
    await botAdmin.schema("pgmq_public").rpc("send", {
      queue_name: "stranger-queue",
      message: { userId: this.botUserId, continent },
    });

    await db
      .update(user)
      .set({
        lastActive: new Date(),
      })
      .where(eq(user.id, this.botUserId));

    console.log(`🔍 ${this.botName} joined matchmaking`);
  }

  private async handleMatch(room: RoomType): Promise<void> {
    if (this.shouldStop) return;

    this.currentRoomId = room.id;
    this.messageCount = 0;
    this.conversationStartTime = Date.now();

    if (this.lobbyChannel) {
      await this.lobbyChannel.track({
        user_id: this.botUserId,
        status: "matched",
      });
    }

    this.joinRoomChannel();
    await this.delay(this.randomBetween(2000, 4000));
    await this.sendGreeting();
  }

  private joinRoomChannel(): void {
    if (!this.currentRoomId || this.shouldStop) return;

    // Create channel synchronously for room joins (faster response)
    const supabase = connectionPool.getClient(this.clientId);
    this.roomChannel = supabase.channel(`room:${this.currentRoomId}`, {
      config: {
        broadcast: { self: true, ack: true },
        presence: { key: this.botUserId },
      },
    });

    this.roomChannel
      .on("broadcast", { event: "message" }, async ({ payload }) => {
        if (payload.senderId !== this.botUserId && !this.shouldStop) {
          await this.handleIncomingMessage(payload);
        }
      })
      .on("broadcast", { event: "room_closed" }, async ({ payload }) => {
        if (payload.leaverId !== this.botUserId && !this.shouldStop) {
          await this.handlePartnerLeft();
        }
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          try {
            await this.roomChannel?.track({
              user_id: this.botUserId,
              name: this.botName,
            });
            console.log(`💬 ${this.botName} joined room ${this.currentRoomId}`);
          } catch (trackError) {
            console.warn(`⚠️ Room presence tracking failed for ${this.botName}:`, trackError);
          }
        } else if (status === "CHANNEL_ERROR") {
          console.error(`❌ ${this.botName} room channel error`);
        }
      });
  }

  private async handleIncomingMessage(msg: MessageType): Promise<void> {
    if (this.shouldStop) return;

    this.messageCount++;
    console.log(`📨 ${this.botName} received: "${msg.content}"`);

    await this.delay(this.randomBetween(1000, 2000));

    if (this.roomChannel) {
      await this.roomChannel.send({
        type: "broadcast",
        event: "typing",
        payload: { senderId: this.botUserId },
      });
    }

    const response = this.generateResponse(msg.content);
    const typingTime =
      (response.length / this.profile.responseStyle.typingSpeed) * 1000;
    await this.delay(typingTime);

    await this.sendMessage(response);

    if (
      this.messageCount >= this.profile.conversationConfig.maxMessages &&
      Math.random() < this.profile.conversationConfig.skipProbability
    ) {
      await this.skipConversation();
    }
  }

  private async sendMessage(content: string): Promise<void> {
    if (!this.currentRoomId || this.shouldStop) return;

    try {
      const messageId = createId();

      await db.insert(message).values({
        id: messageId,
        content,
        senderId: this.botUserId,
        roomId: this.currentRoomId,
        createdAt: new Date(),
      });

      if (this.roomChannel) {
        await this.roomChannel.send({
          type: "broadcast",
          event: "message",
          payload: {
            id: messageId,
            content,
            senderId: this.botUserId,
            roomId: this.currentRoomId,
            createdAt: new Date().toISOString(),
          },
        });
      }

      console.log(`✉ ${this.botName} sent: "${content}"`);
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  }

  private generateResponse(incomingMessage: string): string {
    const lower = incomingMessage.toLowerCase();

    if (lower.match(GreetingRegex)) {
      return this.randomChoice([
        "Hey! How are you?",
        "Hi there! What's up?",
        "Hello! Nice to meet you!",
        "Hey! How's it going?",
      ]);
    }

    if (lower.includes("name")) {
      return `I'm ${this.botName}! What's your name?`;
    }

    if (lower.match(InterestsRegex)) {
      const interest = this.randomChoice(this.profile.interests);
      return `I'm really into ${interest}! What about you?`;
    }

    if (lower.includes("?")) {
      return this.randomChoice([
        "That's a good question!",
        "Hmm, interesting question.",
        "I'd say it depends. What do you think?",
        "Good point! I haven't thought about that.",
      ]);
    }

    if (lower.match(ByeRegex)) {
      return this.randomChoice([
        "Nice chatting with you!",
        "Take care!",
        "See you around!",
        "Bye! Have a good one!",
      ]);
    }

    return this.randomChoice([
      "That's cool!",
      "Interesting!",
      "I see what you mean.",
      "Tell me more!",
      "Really? That's neat!",
      "Yeah, I get that.",
      "That sounds nice!",
      "Cool, cool.",
    ]);
  }

  private async sendGreeting(): Promise<void> {
    const greeting = this.randomChoice([
      "Hey! How's it going?",
      "Hi there! What's up?",
      "Hello! Nice to meet you!",
      "Hey! What brings you here?",
    ]);
    await this.sendMessage(greeting);
  }

  private async skipConversation(): Promise<void> {
    if (!this.currentRoomId || this.shouldStop) return;

    console.log(`⏭ ${this.botName} skipping conversation`);

    if (this.roomChannel) {
      await this.roomChannel.send({
        type: "broadcast",
        event: "room_closed",
        payload: { leaverId: this.botUserId },
      });
    }

    await this.recordAnalytics(true, false);
    await this.cleanupRoom();
    await this.delay(this.randomBetween(1000, 3000));
    await this.joinMatchmakingQueue("World");
  }

  private async handlePartnerLeft(): Promise<void> {
    if (this.shouldStop) return;

    console.log(`👋 ${this.botName}'s partner left`);
    await this.recordAnalytics(false, true);
    await this.cleanupRoom();
    await this.delay(this.randomBetween(1000, 3000));
    await this.joinMatchmakingQueue("World");
  }

  private async handleSkipped(): Promise<void> {
    if (this.shouldStop) return;

    console.log(`😔 ${this.botName} was skipped`);
    await this.cleanupRoom();
    await this.delay(this.randomBetween(1000, 3000));
    await this.joinMatchmakingQueue("World");
  }

  private async cleanupRoom(): Promise<void> {
    if (this.roomChannel) {
      try {
        await connectionPool.removeChannel(this.clientId, this.roomChannel);
      } catch (error) {
        console.error('Room channel cleanup error:', error);
      }
      this.roomChannel = null;
    }

    if (this.lobbyChannel) {
      try {
        await this.lobbyChannel.track({
          user_id: this.botUserId,
          status: "idle",
        });
      } catch (error) {
        console.warn('Lobby presence update error:', error);
      }
    }

    this.currentRoomId = null;
    this.messageCount = 0;
    this.conversationStartTime = null;
  }

  private async recordAnalytics(
    botSkipped: boolean,
    humanSkipped: boolean
  ): Promise<void> {
    const duration = this.conversationStartTime
      ? Math.floor((Date.now() - this.conversationStartTime) / 1000)
      : 0;

    try {
      if (this.currentRoomId === null) {
        throw new Error("Invalid currentRoomId for analytics");
      }

      await db.insert(botAnalytics).values({
        id: createId(),
        botId: this.botUserId,
        conversationId: this.currentRoomId,
        messagesExchanged: this.messageCount,
        conversationDuration: duration,
        humanSkipped,
        botSkipped,
      });
    } catch (error) {
      console.error("Failed to record analytics:", error);
    }
  }

  private async cleanup(): Promise<void> {
    const channels = [this.roomChannel, this.userChannel, this.lobbyChannel];
    
    for (const channel of channels) {
      if (channel) {
        try {
          await connectionPool.removeChannel(this.clientId, channel);
        } catch (error) {
          console.error(`Channel cleanup error for ${this.botName}:`, error);
        }
      }
    }

    // Clean up all connections for this bot
    await connectionPool.cleanupClient(this.clientId);
  }

  async stop(): Promise<void> {
    console.log(`🛑 Stopping ${this.botName}`);
    this.shouldStop = true;
    this.isActive = false;

    if (this.currentRoomId) {
      await this.skipConversation();
    }

    await this.cleanup();
    console.log(`✅ ${this.botName} stopped`);
  }

  isInConversation(): boolean {
    return !!this.currentRoomId;
  }

  getBotId(): string {
    return this.botUserId;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private randomBetween(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private randomChoice<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }
}
