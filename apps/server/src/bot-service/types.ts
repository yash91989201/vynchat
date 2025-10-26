export interface BotConfig {
  id: string;
  supabase: any;
  config: {
    continents: string[];
    messageIntervalMs: {
      min: number;
      max: number;
    };
    lifecycleMinutes: {
      min: number;
      max: number;
    };
  };
}

export interface BotProfile {
  personality: string;
  interests: string[];
  responseStyle: string;
}

export interface BotState {
  status: "idle" | "matchmaking" | "chatting" | "stopped";
  currentRoom?: string;
  matchedWith?: string;
  lastActivity: Date;
  createdAt: Date;
  lifecycleEnd: Date;
  messageCount: number;
  conversationStart?: Date;
}

export interface MessageTemplate {
  text: string;
  category: "greeting" | "question" | "response" | "farewell" | "emoji";
  context?: string[];
}