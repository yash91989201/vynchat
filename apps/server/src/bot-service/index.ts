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

// Configuration with safer defaults
const config = {
  targetBotCount: Number.parseInt(process.env.BOT_MIN_COUNT || "2", 10),
  continent: "World",
  maintenanceInterval: Number.parseInt(process.env.MAINTENANCE_INTERVAL_MS || "120000", 10), // 2 minutes
};

console.log("⚙️  Configuration:", config);

// Start bot manager
async function startService() {
  try {
    console.log(`🚀 Starting bot manager with ${config.targetBotCount} bots...`);
    await botManager.start(config.targetBotCount, config.continent);

    // Log stats periodically
    setInterval(() => {
      const stats = botManager.getStats();
      console.log("📊 Bot Stats:", stats);
    }, 60_000); // Every minute
  } catch (error) {
    console.error("❌ Failed to start bot service:", error);
    process.exit(1);
  }
}

// Graceful shutdown
async function shutdown(signal: string) {
  console.log(`\n⚠️  ${signal} received. Shutting down gracefully...`);

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