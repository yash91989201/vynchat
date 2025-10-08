# ✅ Bot Service - Ready for Deployment

## What Was Fixed

### Problem
- Bots were experiencing `CHANNEL_ERROR` and connection timeouts
- Bots were NOT appearing in the online user count
- Too many simultaneous Realtime connections causing rate limit issues

### Solution Implemented
1. **Simplified bot architecture** - Reduced Realtime dependencies
2. **Added lobby presence** - Bots now join `global:lobby` channel for online count
3. **Staggered startup** - 7-10 second delays between bot starts
4. **Graceful degradation** - Bots work even if some channels fail
5. **Database polling fallback** - For match detection and messages

## Current Architecture

Each bot now:
1. ✅ Creates a user account in database (marked as `isBot: true`)
2. ✅ Joins `global:lobby` presence channel (for online count)
3. ✅ Joins matchmaking queue via PGMQ
4. ✅ Polls database every 3s for match
5. ✅ Joins room channel when matched
6. ✅ Updates presence status (idle/matched)

## Files Modified

```
apps/server/src/bot-service/
├── bot-instance-simple.ts  ← NEW: Simplified bot with lobby presence
├── bot-manager.ts          ← UPDATED: Uses BotInstanceSimple
├── supabase-client.ts      ← UPDATED: Optimized settings
├── index.ts                ← UPDATED: Better config
├── README.md               ← UPDATED: Full documentation
├── IMPLEMENTATION_NOTES.md ← NEW: Technical details
└── CHANGELOG.md            ← NEW: What changed
```

## How to Deploy

### 1. Build
```bash
cd apps/server
bun run build
```

### 2. Set Environment Variables
```bash
# Required
SUPABASE_URL=your_url
SUPABASE_SERVICE_ROLE_KEY=your_key
DATABASE_URL=your_database_url

# Optional (recommended for production)
BOT_MIN_COUNT=2
BOT_MAX_COUNT=5
MAINTENANCE_INTERVAL_MS=120000
```

### 3. Run Bot Service
```bash
# Development
bun run src/bot-service/index.ts

# Production (with PM2)
pm2 start dist/bot-service/index.js --name vynchat-bots

# Docker
# Your Dockerfile should have:
CMD ["bun", "run", "src/bot-service/index.ts"]
```

## Expected Behavior

### Startup Logs (Good)
```
🤖 Bot Service Starting...
⚙️  Configuration: { targetBotCount: 2, continent: 'World', maintenanceInterval: 120000 }
🚀 Starting bot manager with 2 bots...
📈 Starting 2 new bots (0/2)
🤖 Starting bot: Alex123
👤 Bot user created: abc123...
📍 Alex123 joined lobby presence
🔍 Alex123 joined matchmaking
✅ Bot started: Alex123 (abc123...)
⏳ Waiting 7234ms before next bot...
🤖 Starting bot: Sam456
...
✅ Bot manager started
```

### What Users Will See
- **Online count increases** - Bots appear in the user count
- **Bots can be matched** - Just like real users
- **Bots respond** - Context-aware conversation
- **Smooth experience** - No errors or delays

## Verification Checklist

After deployment, verify:

- [ ] Bot service starts without errors
- [ ] Bots appear in online user count (check `/stranger-chat` page)
- [ ] Bots can be matched with real users
- [ ] Bots respond to messages
- [ ] Bots rejoin queue after conversation ends
- [ ] No `CHANNEL_ERROR` in logs
- [ ] Database shows bot users with `isBot: true`

## Monitoring

### Logs to Watch For
```bash
# Good
✅ Bot started: NAME (ID)
📍 NAME joined lobby presence
🎯 NAME matched! Room: ROOM_ID
💬 NAME joined room ROOM_ID

# Warnings (non-critical)
⚠️ NAME lobby presence failed, continuing without it
⚠️ NAME failed to update presence to matched

# Errors (needs attention)
❌ Failed to start bot NAME
❌ NAME failed to join matchmaking
```

### Health Check
Every 60 seconds, you'll see:
```
📊 Bot Stats: {
  totalBots: 2,
  inConversation: 0,
  waiting: 2,
  isRunning: true
}
```

## Troubleshooting

### Bots not showing in online count
- Check if bots successfully joined lobby presence
- Look for "📍 joined lobby presence" in logs
- If warnings appear, bots still work but won't show in count

### CHANNEL_ERROR still appearing
- Increase delays between bot starts (edit `bot-manager.ts`)
- Reduce `BOT_MIN_COUNT` to start fewer bots
- Check Supabase Realtime connection limits

### Bots not matching
- Verify `stranger-matchmaker` Edge Function is running
- Check cron job: Should run every 10-30 seconds
- Query queue: `SELECT * FROM pgmq_public.q_stranger_queue`

## Performance Tips

### For Low Traffic
```bash
BOT_MIN_COUNT=2
BOT_MAX_COUNT=5
```

### For High Traffic
```bash
BOT_MIN_COUNT=5
BOT_MAX_COUNT=15
BOT_TARGET_PERCENTAGE=20  # 20% bots, 80% humans
```

## Next Steps

1. Deploy the updated code
2. Monitor logs for 5-10 minutes
3. Test matching with a real user
4. Verify online count includes bots
5. Adjust `BOT_MIN_COUNT` based on traffic

## Support

For detailed documentation:
- `apps/server/src/bot-service/README.md` - Full guide
- `apps/server/src/bot-service/IMPLEMENTATION_NOTES.md` - Technical details
- `apps/server/src/bot-service/CHANGELOG.md` - What changed

---

**Status:** ✅ READY FOR PRODUCTION DEPLOYMENT
**Build Status:** ✅ Passing
**Tests:** ✅ Manual testing recommended
**Breaking Changes:** ❌ None
