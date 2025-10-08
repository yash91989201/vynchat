import { createId } from "@paralleldrive/cuid2";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { botAnalytics, message } from "@/db/schema";
import { user } from "@/db/schema/auth";
import type { MessageType, RoomType } from "@/lib/types";
import type { BotProfile } from "./config";
import { supabase } from "./supabase-client";

/**
 * BotUser - Mimics EXACTLY how a real user behaves
 * 
 * Real user flow:
 * 1. Opens stranger chat page → joins global:lobby presence
 * 2. Clicks "Talk to Stranger" → calls findStranger API → added to queue
 * 3. Gets matched → receives stranger_matched event on user:{userId} channel
 * 4. Joins room:{roomId} channel → sends/receives messages
 * 5. Skips or leaves → room deleted, back to step 2
 */
export class BotUser {
  private botUserId = "";
  botName: string;
  profile: BotProfile;

  // Channels - exactly like a real user
  private lobbyChannel: RealtimeChannel | null = null;
  private userChannel: RealtimeChannel | null = null;
  private roomChannel: RealtimeChannel | null = null;

  // Conversation state
  private currentRoomId: string | null = null;
  private messageCount = 0;
  private conversationStartTime: number | null = null;

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

      // Step 1: Create bot user
      await this.createBotUser();
      await this.delay(this.randomBetween(1000, 2000));

      // Step 2: Join global lobby presence (like opening stranger chat page)
      try {
        await this.joinLobbyPresence();
      } catch (error) {
        console.warn(
          `⚠️ ${this.botName} failed to join lobby, continuing...:`, (error as Error).message
        );
      }
      await this.delay(this.randomBetween(500, 1000));

      // Step 3: Setup user channel (to receive match notifications)
      await this.setupUserChannel();
      await this.delay(this.randomBetween(500, 1000));

      // Step 4: Start matchmaking (like clicking "Talk to Stranger")
      await this.startMatchmaking(continent);

      this.isActive = true;
      console.log(`✅ Bot ready: ${this.botName} (${this.botUserId})`);
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

  /**
   * Join global:lobby presence - EXACTLY like a real user
   */
  private async joinLobbyPresence(): Promise<void> {
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        console.warn(`⚠️ ${this.botName} lobby presence timed out, continuing...`);
        if (this.lobbyChannel) {
          supabase.removeChannel(this.lobbyChannel).catch(() => {});
          this.lobbyChannel = null;
        }
        resolve();
      }, 10000);

      this.lobbyChannel = supabase.channel("global:lobby", {
        config: {
          presence: { key: this.botUserId },
        },
      });

      this.lobbyChannel
        .on("presence", { event: "sync" }, () => {
          // Presence synced - just like real users
        })
        .subscribe(async (status) => {
          if (status === "SUBSCRIBED") {
            clearTimeout(timeout);
            // Track presence with status: idle (like real user)
            await this.lobbyChannel!.track({
              user_id: this.botUserId,
              status: "idle",
            });
            console.log(`📍 ${this.botName} joined lobby`);
            resolve();
          } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
            clearTimeout(timeout);
            console.warn(`⚠️ ${this.botName} lobby channel failed (${status}), continuing...`);
            if (this.lobbyChannel) {
              supabase.removeChannel(this.lobbyChannel).catch(() => {});
              this.lobbyChannel = null;
            }
            resolve();
          }
        });
    });
  }

  /**
   * Setup user channel - EXACTLY like a real user
   */
  private async setupUserChannel(): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error("User channel timeout"));
      }, 10000);

      this.userChannel = supabase.channel(`user:${this.botUserId}`, {
        config: {
          broadcast: { self: true, ack: true },
          presence: { key: this.botUserId },
        },
      });

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
        .subscribe((status) => {
          if (status === "SUBSCRIBED") {
            clearTimeout(timeout);
            console.log(`📡 ${this.botName} user channel ready`);
            resolve();
          } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
            clearTimeout(timeout);
            reject(new Error(`User channel failed: ${status}`));
          }
        });
    });
  }

  /**
   * Start matchmaking - calls API EXACTLY like a real user
   */
  private async startMatchmaking(continent: string): Promise<void> {
    if (this.shouldStop) return;

    // Update lobby presence to "waiting" (like real user)
    if (this.lobbyChannel) {
      await this.lobbyChannel.track({
        user_id: this.botUserId,
        status: "waiting",
      });
    }

    // Call the findStranger API - EXACTLY like real user
    const { error } = await supabase.schema("pgmq_public").rpc("send", {
      queue_name: "stranger-queue",
      message: { userId: this.botUserId, continent },
    });

    if (error) {
      console.error(`❌ ${this.botName} failed to join queue:`, error);
      throw error;
    }

    // Update lastActive
    await db
      .update(user)
      .set({ lastActive: new Date() })
      .where(eq(user.id, this.botUserId));

    console.log(`🔍 ${this.botName} finding stranger...`);
  }

  /**
   * Handle match - join room EXACTLY like a real user
   */
  private async handleMatch(room: RoomType): Promise<void> {
    if (this.shouldStop) return;

    this.currentRoomId = room.id;
    this.messageCount = 0;
    this.conversationStartTime = Date.now();

    // Update lobby presence to "matched"
    if (this.lobbyChannel) {
      await this.lobbyChannel.track({
        user_id: this.botUserId,
        status: "matched",
      });
    }

    // Join room channel - EXACTLY like real user
    await this.joinRoomChannel();

    // Wait a bit, then send greeting
    await this.delay(this.randomBetween(1500, 3000));
    await this.sendGreeting();
  }

  /**
   * Join room channel - EXACTLY like a real user
   */
  private async joinRoomChannel(): Promise<void> {
    if (!this.currentRoomId || this.shouldStop) return;

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error("Room channel timeout"));
      }, 10000);

      this.roomChannel = supabase.channel(`room:${this.currentRoomId}`, {
        config: {
          broadcast: { self: true },
          presence: { key: this.botUserId },
        },
      });

      this.roomChannel
        .on("broadcast", { event: "message" }, async ({ payload }) => {
          if (payload.senderId !== this.botUserId && !this.shouldStop) {
            await this.handleIncomingMessage(payload);
          }
        })
        .on("broadcast", { event: "typing" }, ({ payload }) => {
          if (payload.senderId !== this.botUserId) {
            // Other user is typing
          }
        })
        .on("broadcast", { event: "room_closed" }, async ({ payload }) => {
          if (payload.leaverId !== this.botUserId && !this.shouldStop) {
            await this.handlePartnerLeft();
          }
        })
        .on("presence", { event: "join" }, ({ key }) => {
          // Partner joined presence
        })
        .on("presence", { event: "leave" }, ({ key }) => {
          // Partner left presence
        })
        .subscribe(async (status) => {
          if (status === "SUBSCRIBED") {
            clearTimeout(timeout);
            // Track presence in room
            await this.roomChannel!.track({
              user_id: this.botUserId,
              name: this.botName,
            });
            console.log(`💬 ${this.botName} in room ${this.currentRoomId}`);
            resolve();
          } else if (status === "CHANNEL_ERROR") {
            clearTimeout(timeout);
            reject(new Error("Room channel error"));
          }
        });
    });
  }

  private async handleIncomingMessage(msg: MessageType): Promise<void> {
    if (this.shouldStop) return;

    this.messageCount++;
    console.log(`📨 ${this.botName} received: "${msg.content}"`);

    // Simulate typing delay
    await this.delay(this.randomBetween(800, 1500));

    // Send typing indicator
    if (this.roomChannel) {
      await this.roomChannel.send({
        type: "broadcast",
        event: "typing",
        payload: { senderId: this.botUserId },
      });
    }

    // Generate and send response
    const response = this.generateResponse(msg.content);
    const typingTime = (response.length / this.profile.responseStyle.typingSpeed) * 1000;
    await this.delay(Math.min(typingTime, 3000));

    await this.sendMessage(response);

    // Maybe skip after max messages
    if (
      this.messageCount >= this.profile.conversationConfig.maxMessages &&
      Math.random() < this.profile.conversationConfig.skipProbability
    ) {
      await this.delay(this.randomBetween(2000, 4000));
      await this.skipConversation();
    }
  }

  private async sendMessage(content: string): Promise<void> {
    if (!this.currentRoomId || this.shouldStop) return;

    try {
      const messageId = createId();

      // Save to database
      await db.insert(message).values({
        id: messageId,
        content,
        senderId: this.botUserId,
        roomId: this.currentRoomId,
        createdAt: new Date(),
      });

      // Broadcast via realtime
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
      console.error(`${this.botName} failed to send message:`, error);
    }
  }

  private generateResponse(incomingMessage: string): string {
    const lower = incomingMessage.toLowerCase();

    if (lower.match(/\b(hi|hello|hey|howdy|sup)\b/)) {
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

    if (lower.match(/\b(hobby|hobbies|interests?|do for fun)\b/)) {
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

    if (lower.match(/\b(bye|goodbye|gtg|gotta go)\b/)) {
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

    console.log(`⏭ ${this.botName} skipping...`);

    // Broadcast room_closed
    if (this.roomChannel) {
      await this.roomChannel.send({
        type: "broadcast",
        event: "room_closed",
        payload: { leaverId: this.botUserId },
      });
    }

    await this.recordAnalytics(true, false);
    await this.cleanupRoom();

    // Rejoin matchmaking
    await this.delay(this.randomBetween(1000, 2000));
    await this.startMatchmaking("World");
  }

  private async handlePartnerLeft(): Promise<void> {
    if (this.shouldStop) return;

    console.log(`👋 ${this.botName}'s partner left`);
    await this.recordAnalytics(false, true);
    await this.cleanupRoom();

    // Rejoin matchmaking
    await this.delay(this.randomBetween(1000, 2000));
    await this.startMatchmaking("World");
  }

  private async handleSkipped(): Promise<void> {
    if (this.shouldStop) return;

    console.log(`😔 ${this.botName} was skipped`);
    await this.cleanupRoom();

    // Rejoin matchmaking
    await this.delay(this.randomBetween(1000, 2000));
    await this.startMatchmaking("World");
  }

  private async cleanupRoom(): Promise<void> {
    // Clean up room channel
    if (this.roomChannel) {
      try {
        await supabase.removeChannel(this.roomChannel);
      } catch (error) {
        console.warn(`${this.botName} room cleanup error:`, error);
      }
      this.roomChannel = null;
    }

    // Update lobby presence back to idle
    if (this.lobbyChannel) {
      await this.lobbyChannel.track({
        user_id: this.botUserId,
        status: "idle",
      });
    }

    this.currentRoomId = null;
    this.messageCount = 0;
    this.conversationStartTime = null;
  }

  private async recordAnalytics(botSkipped: boolean, humanSkipped: boolean): Promise<void> {
    const duration = this.conversationStartTime
      ? Math.floor((Date.now() - this.conversationStartTime) / 1000)
      : 0;

    try {
      if (!this.currentRoomId) return;

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
      console.error(`${this.botName} analytics error:`, error);
    }
  }

  private async cleanup(): Promise<void> {
    const channels = [this.roomChannel, this.userChannel, this.lobbyChannel];

    for (const channel of channels) {
      if (channel) {
        try {
          await supabase.removeChannel(channel);
        } catch (error) {
          console.warn(`${this.botName} cleanup error:`, error);
        }
      }
    }

    this.roomChannel = null;
    this.userChannel = null;
    this.lobbyChannel = null;
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
