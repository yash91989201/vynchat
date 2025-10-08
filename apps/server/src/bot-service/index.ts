import { BotManager } from "./bot-manager";

console.log("🤖 Bot Service Starting...");
console.log("Environment:", process.env.NODE_ENV || "development");

// Validate environment variables
const requiredEnvVars = [
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "DATABASE_URL",
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`❌ Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

// Initialize bot manager
const botManager = new BotManager();

// Configuration
const config = {
  targetBotCount: Number.parseInt(process.env.BOT_MIN_COUNT || "3", 10),
  continent: "World",
};

// Start bot manager
async function startService() {
  try {
    await botManager.start(config.targetBotCount, config.continent);

    // Log stats periodically
    setInterval(() => {
      const stats = botManager.getStats();
      console.log("📊 Bot Stats:", stats);
    }, 30_000);
  } catch (error) {
    console.error("❌ Failed to start bot service:", error);
    process.exit(1);
  }
}

// Graceful shutdown
async function shutdown(signal: string) {
  console.log(`\n${signal} received. Shutting down gracefully...`);

  try {
    await botManager.stop();
    console.log("✅ Bot service stopped successfully");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error during shutdown:", error);
    process.exit(1);
  }
}

// Handle shutdown signals
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

// Handle uncaught errors
process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught Exception:", error);
  shutdown("UNCAUGHT_EXCEPTION");
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
});

// Start the service
startService();