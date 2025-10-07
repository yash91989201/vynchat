export interface BotProfile {
  id: string;
  name: string;
  personality: "friendly" | "curious" | "humorous" | "intellectual";
  interests: string[];
  responseStyle: {
    avgResponseTime: { min: number; max: number };
    messageLength: { min: number; max: number };
    typingSpeed: number; // chars per second
  };
  conversationConfig: {
    maxMessages: number;
    skipProbability: number;
    initiateTopicChange: number;
  };
}

export interface BotManagerConfig {
  targetBotCount: number;
  continent: string;
  maintenanceIntervalMs: number;
}

export interface BotStats {
  totalBots: number;
  inConversation: number;
  waiting: number;
  isRunning: boolean;
}
