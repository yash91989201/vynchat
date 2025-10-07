import type { BotProfile } from "./config";

export const BOT_PROFILES: BotProfile[] = [
  {
    id: "friendly-alex",
    name: "Alex",
    personality: "friendly",
    interests: ["movies", "music", "travel", "food", "gaming"],
    responseStyle: {
      avgResponseTime: { min: 2000, max: 5000 },
      messageLength: { min: 5, max: 20 },
      typingSpeed: 45,
    },
    conversationConfig: {
      maxMessages: 25,
      skipProbability: 0.2,
      initiateTopicChange: 0.3,
    },
  },
  {
    id: "curious-sam",
    name: "Sam",
    personality: "curious",
    interests: ["science", "books", "technology", "art", "nature"],
    responseStyle: {
      avgResponseTime: { min: 2500, max: 6000 },
      messageLength: { min: 8, max: 25 },
      typingSpeed: 40,
    },
    conversationConfig: {
      maxMessages: 30,
      skipProbability: 0.15,
      initiateTopicChange: 0.4,
    },
  },
  {
    id: "humorous-jordan",
    name: "Jordan",
    personality: "humorous",
    interests: ["memes", "comedy", "sports", "gaming", "pop culture"],
    responseStyle: {
      avgResponseTime: { min: 1500, max: 4000 },
      messageLength: { min: 3, max: 15 },
      typingSpeed: 55,
    },
    conversationConfig: {
      maxMessages: 20,
      skipProbability: 0.25,
      initiateTopicChange: 0.35,
    },
  },
  {
    id: "intellectual-taylor",
    name: "Taylor",
    personality: "intellectual",
    interests: [
      "philosophy",
      "history",
      "politics",
      "psychology",
      "literature",
    ],
    responseStyle: {
      avgResponseTime: { min: 3000, max: 7000 },
      messageLength: { min: 10, max: 30 },
      typingSpeed: 35,
    },
    conversationConfig: {
      maxMessages: 35,
      skipProbability: 0.1,
      initiateTopicChange: 0.25,
    },
  },
  {
    id: "friendly-casey",
    name: "Casey",
    personality: "friendly",
    interests: ["fitness", "cooking", "pets", "fashion", "photography"],
    responseStyle: {
      avgResponseTime: { min: 2000, max: 5000 },
      messageLength: { min: 5, max: 18 },
      typingSpeed: 48,
    },
    conversationConfig: {
      maxMessages: 28,
      skipProbability: 0.18,
      initiateTopicChange: 0.32,
    },
  },
];
