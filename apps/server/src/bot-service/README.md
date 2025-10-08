# Stranger Chat Bot Service

A robust bot service for the VynChat stranger chat feature. Bots simulate real users to provide a better user experience during low-traffic periods.

## Overview

This service manages a pool of bot instances that:
- Join the matchmaking queue
- Engage in realistic conversations with real users
- Respond contextually to messages
- Gracefully handle connection issues
- Track analytics for optimization

## Architecture

### Components

1. **BotManager** (`bot-manager.ts`)
   - Manages the lifecycle of all bot instances
   - Dynamically adjusts bot count based on human user activity
   - Handles graceful startup and shutdown

2. **BotInstance** (`bot-instance.ts`)
   - Represents a single bot user
   - Manages Supabase Realtime connections (lobby, user, room channels)
   - Implements conversation logic and message generation
   - Handles matchmaking and room events

3. **SupabaseClient** (`supabase-client.ts`)
   - Configured Supabase client with optimized Realtime settings
   - Service role authentication for admin operations

## Key Features

### Robust Connection Handling
- **Exponential backoff** on connection failures
- **Retry logic** for critical operations (matchmaking queue, channels)
- **Graceful degradation** - continues operation even if some channels fail
- **Connection health monitoring** with automatic reconnection

### Smart Bot Pooling
- **Dynamic scaling** based on human user count
- **Staggered startup** (5-8 seconds between bots) to prevent connection storms
- **Configurable limits** via environment variables

### Realistic Behavior
- **Multiple personalities** (friendly, curious, humorous, intellectual)
- **Varied response times** based on typing speed simulation
- **Context-aware responses** using pattern matching
- **Natural conversation flow** with greetings, questions, and farewells

## Configuration

### Environment Variables

```bash
# Required
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
DATABASE_URL=your_database_url

# Optional - Bot Pool Configuration
BOT_MIN_COUNT=2              # Minimum bots to maintain (default: 2)
BOT_MAX_COUNT=8              # Maximum bots allowed (default: 8)
BOT_TARGET_PERCENTAGE=25     # Target percentage of bots vs humans (default: 25%)
MAINTENANCE_INTERVAL_MS=120000  # How often to check pool health (default: 120000ms / 2 minutes)
```

### Bot Profiles

Bots are randomly assigned profiles from `bot-profiles.ts`:
- **Alex** - Friendly, into movies, music, travel
- **Sam** - Curious, interested in science and books
- **Jordan** - Humorous, enjoys memes and sports
- **Taylor** - Intellectual, discusses philosophy and history
- **Casey** - Friendly, talks about fitness and cooking

## How It Works

### Startup Sequence

1. **Validation** - Checks required environment variables
2. **Bot Creation** - Creates bot user accounts in the database
3. **Channel Setup** - Establishes Realtime connections:
   - Lobby presence channel (for showing online status)
   - User channel (for receiving match notifications)
4. **Matchmaking** - Joins the stranger-queue via PostgreSQL PGMQ
5. **Ready** - Bot is now active and waiting for matches

### During a Match

1. **Match Notification** - Receives `stranger_matched` event via user channel
2. **Room Join** - Subscribes to room-specific Realtime channel
3. **Greeting** - Sends initial greeting message
4. **Conversation** - Responds to incoming messages with context-aware replies
5. **Exit** - Either:
   - Bot skips after reaching message limit
   - Partner leaves
   - Bot is skipped by partner

### Recovery & Error Handling

The service handles various failure scenarios:

- **Channel timeouts** - Retries with exponential backoff (up to 3 attempts)
- **Connection errors** - Continues without non-critical channels
- **Queue failures** - Retries queue operations with delays
- **Database errors** - Logs and continues for non-critical operations

## Improvements Made

### Connection Stability
✅ Increased timeouts from 3s to 5s
✅ Added exponential backoff (1s, 2s, 4s, 8s)
✅ Unique channel names per bot to avoid conflicts
✅ Retry logic for all Realtime operations
✅ Promise race conditions fixed with resolved flags

### Performance
✅ Reduced connection storms by staggering bot startup (5-8s delays)
✅ Optimized Realtime settings (10 events/second, proper heartbeat)
✅ Disabled self-broadcast for efficiency
✅ Parallel channel setup with Promise.allSettled

### Reliability
✅ Graceful degradation when channels fail
✅ Automatic room channel reconnection on errors
✅ Better cleanup of channels on shutdown
✅ More informative logging

### Configuration
✅ Safer defaults (2 bots minimum instead of 3)
✅ Configurable maintenance intervals
✅ Better error messages

## Running the Service

### Development
```bash
cd apps/server
bun run bot-service
```

### Production
```bash
# Build first
bun run build

# Run with PM2 or similar process manager
pm2 start dist/bot-service/index.js --name "vynchat-bots"
```

### Docker
```dockerfile
# In your Dockerfile
CMD ["bun", "run", "src/bot-service/index.ts"]
```

## Monitoring

### Health Checks
The service logs bot stats every 60 seconds:
```
📊 Bot Stats: {
  totalBots: 3,
  inConversation: 1,
  waiting: 2,
  isRunning: true
}
```

### Key Metrics to Monitor
- Bot count vs target
- Connection errors
- Matchmaking queue size
- Average conversation duration
- Skip rates

## Troubleshooting

### Bots not starting
1. Check Supabase Realtime connection limits
2. Verify SUPABASE_SERVICE_ROLE_KEY is correct
3. Check database connectivity
4. Review logs for specific errors

### Channel errors (CHANNEL_ERROR)
1. Check Supabase Realtime is enabled
2. Verify service role key has proper permissions
3. Check Realtime connection limits in Supabase dashboard
4. Consider reducing BOT_MIN_COUNT temporarily

### Bots not matching
1. Verify stranger-matchmaker function is running (cron job)
2. Check PGMQ extension is installed
3. Verify stranger-queue exists
4. Check bot user records in database

### High resource usage
1. Reduce BOT_MAX_COUNT
2. Increase MAINTENANCE_INTERVAL_MS
3. Check for memory leaks in logs
4. Review Supabase connection pool settings

## Future Improvements

- [ ] Add more sophisticated conversation AI
- [ ] Implement topic-based conversation threading
- [ ] Add support for multiple languages
- [ ] Bot personality learning from successful conversations
- [ ] Integration with LLM for more natural responses
- [ ] Connection pooling for database operations
- [ ] Distributed bot service across multiple instances
- [ ] Real-time dashboard for bot monitoring

## Support

For issues or questions:
1. Check the logs for error messages
2. Review Supabase dashboard metrics
3. Ensure all environment variables are set
4. Verify database schema is up to date