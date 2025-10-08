import { createId } from "@paralleldrive/cuid2";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { botAnalytics, message, room, roomMember } from "@/db/schema";
import { user } from "@/db/schema/auth";
import type { MessageType, RoomType } from "@/lib/types";
import type { BotProfile } from "./config";
import { supabase } from "./supabase-client";

const GreetingRegex = /\b(hi|hello|hey|howdy|sup)\b/;
const InterestsRegex = /\b(hobby|hobbies|interests?|do for fun)\b/;
const ByeRegex = /\b(bye|goodbye|gtg|gotta go)\b/;

export class BotInstanceSimple {
  private botUserId = "";
  botName: string;
  profile: BotProfile;

  private currentRoomId: string | null = null;
  private messageCount = 0;
  private conversationStartTime: number | null = null;

  private roomChannel: RealtimeChannel | null = null;
  private matchCheckInterval: NodeJS.Timeout | null = null;

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
      
      // Delay before joining queue
      await this.delay(this.randomBetween(2000, 4000));

      // Join matchmaking queue
      await this.joinMatchmakingQueue(continent);

      // Start polling for matches
      this.startMatchPolling();

      this.isActive = true;
      console.log(`✅ Bot started: ${this.botName} (${this.botUserId})`);
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

  private startMatchPolling(): void {
    // Poll for room membership every 3 seconds
    this.matchCheckInterval = setInterval(async () => {
      if (this.shouldStop || this.currentRoomId) return;

      try {
        // Check if bot was matched to a room
        const membership = await db.query.roomMember.findFirst({
          where: eq(roomMember.userId, this.botUserId),
          with: {
            room: true,
          },
        });

        if (membership && membership.room.isDM && !this.currentRoomId) {
          console.log(`🎯 ${this.botName} matched! Room: ${membership.room.id}`);
          await this.handleMatch(membership.room as RoomType);
        }
      } catch (error) {
        console.error(`${this.botName} match polling error:`, error);
      }
    }, 3000);
  }

  private async joinMatchmakingQueue(continent: string): Promise<void> {
    if (this.shouldStop) return;

    let attempt = 0;
    const maxRetries = 3;

    while (attempt < maxRetries) {
      try {
        await supabase.schema("pgmq_public").rpc("send", {
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
        return;
      } catch (error) {
        attempt++;
        if (attempt >= maxRetries) {
          console.error(`❌ ${this.botName} failed to join matchmaking after ${maxRetries} attempts:`, error);
          throw error;
        }
        console.warn(`Matchmaking queue attempt ${attempt} failed, retrying...`);
        await this.delay(1000 * attempt);
      }
    }
  }

  private async handleMatch(room: RoomType): Promise<void> {
    if (this.shouldStop) return;

    this.currentRoomId = room.id;
    this.messageCount = 0;
    this.conversationStartTime = Date.now();

    // Join room channel for real-time messages
    await this.joinRoomChannel();
    
    await this.delay(this.randomBetween(1000, 3000));
    await this.sendGreeting();
  }

  private async joinRoomChannel(): Promise<void> {
    if (!this.currentRoomId || this.shouldStop) return;

    try {
      this.roomChannel = supabase.channel(`room:${this.currentRoomId}`, {
        config: {
          broadcast: { self: false },
        },
      });

      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error("Room channel timeout")), 5000);

        this.roomChannel!
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
          .subscribe((status) => {
            if (status === "SUBSCRIBED") {
              clearTimeout(timeout);
              resolve();
              console.log(`💬 ${this.botName} joined room ${this.currentRoomId}`);
            } else if (status === "CHANNEL_ERROR") {
              clearTimeout(timeout);
              reject(new Error("Room channel error"));
            }
          });
      });
    } catch (error) {
      console.error(`❌ ${this.botName} failed to join room channel:`, error);
      // Fall back to polling for messages
      this.startRoomPolling();
    }
  }

  private startRoomPolling(): void {
    // Fallback: poll for new messages if Realtime fails
    const pollInterval = setInterval(async () => {
      if (this.shouldStop || !this.currentRoomId) {
        clearInterval(pollInterval);
        return;
      }

      try {
        const messages = await db.query.message.findMany({
          where: eq(message.roomId, this.currentRoomId),
          orderBy: (message, { desc }) => [desc(message.createdAt)],
          limit: 1,
        });

        if (messages.length > 0) {
          const lastMsg = messages[0];
          if (lastMsg.senderId !== this.botUserId) {
            await this.handleIncomingMessage(lastMsg as unknown as MessageType);
          }
        }
      } catch (error) {
        console.error(`${this.botName} room polling error:`, error);
      }
    }, 2000);
  }

  private async handleIncomingMessage(msg: MessageType): Promise<void> {
    if (this.shouldStop) return;

    this.messageCount++;
    console.log(`📨 ${this.botName} received: "${msg.content}"`);

    await this.delay(this.randomBetween(800, 1500));

    const response = this.generateResponse(msg.content);
    const typingTime = (response.length / this.profile.responseStyle.typingSpeed) * 1000;
    await this.delay(Math.min(typingTime, 3000));

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
      console.error(`${this.botName} failed to send message:`, error);
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
      try {
        await this.roomChannel.send({
          type: "broadcast",
          event: "room_closed",
          payload: { leaverId: this.botUserId },
        });
      } catch (error) {
        console.warn(`${this.botName} failed to broadcast room_closed:`, error);
      }
    }

    await this.recordAnalytics(true, false);
    await this.cleanupRoom();
    await this.delay(this.randomBetween(1000, 2000));
    await this.joinMatchmakingQueue("World");
  }

  private async handlePartnerLeft(): Promise<void> {
    if (this.shouldStop) return;

    console.log(`👋 ${this.botName}'s partner left`);
    await this.recordAnalytics(false, true);
    await this.cleanupRoom();
    await this.delay(this.randomBetween(1000, 2000));
    await this.joinMatchmakingQueue("World");
  }

  private async cleanupRoom(): Promise<void> {
    if (this.roomChannel) {
      try {
        await supabase.removeChannel(this.roomChannel);
      } catch (error) {
        console.warn(`${this.botName} room channel cleanup error:`, error);
      }
      this.roomChannel = null;
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
      console.error(`${this.botName} failed to record analytics:`, error);
    }
  }

  private async cleanup(): Promise<void> {
    if (this.matchCheckInterval) {
      clearInterval(this.matchCheckInterval);
      this.matchCheckInterval = null;
    }

    if (this.roomChannel) {
      try {
        await supabase.removeChannel(this.roomChannel);
      } catch (error) {
        console.warn(`${this.botName} cleanup error:`, error);
      }
      this.roomChannel = null;
    }
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
