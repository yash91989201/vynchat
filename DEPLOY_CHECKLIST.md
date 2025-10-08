# 🚀 Deployment Checklist - Bot Service Fix

## Pre-Deployment

- [ ] Read `BOT_MATCHMAKING_FIX.md` to understand the changes
- [ ] Backup current edge function (optional but recommended)
- [ ] Note current bot count and behavior

## Deployment Order

### Step 1: Deploy Edge Function FIRST ⚠️
```bash
cd apps/server
supabase functions deploy stranger-matchmaker
```

**Why first?** The new matchmaker supports both old and new bot behavior.

### Step 2: Rebuild Server
```bash
cd apps/server
bun run build
```

### Step 3: Restart Bot Service
```bash
# Docker
docker-compose restart bot-service

# PM2
pm2 restart vynchat-bots

# Manual
# Kill old process and start new one
```

## Post-Deployment Verification

### 1. Check Bot Service Logs (2-3 minutes)
Look for:
```
✅ Bot started: NAME (ID)
🔍 NAME joined matchmaking
```

**Expected warnings (OK):**
```
⚠️ NAME skipping lobby presence: ...
```

### 2. Check Matchmaker Logs (Wait for next run)
```bash
supabase functions logs stranger-matchmaker --tail
```

Look for:
```
✅ Matching users: USER1 with USER2
```

### 3. Test Matching (5 minutes)
1. Open stranger chat in browser
2. Click "Talk to Stranger"
3. Wait 10-30 seconds
4. Should be matched with a bot
5. Send a message
6. Bot should respond

## Success Criteria

- ✅ Bots start without fatal errors
- ✅ Bots join matchmaking queue
- ✅ Human users get matched with bots
- ✅ Bots respond to messages
- ✅ No CHANNEL_ERROR blocking bot startup

## Rollback Plan

If bots still don't match:

### 1. Check Edge Function
```bash
supabase functions logs stranger-matchmaker --tail
```

### 2. Revert Edge Function (if needed)
```bash
# You'll need to restore from backup or redeploy old version
git checkout HEAD~1 apps/server/supabase/functions/stranger-matchmaker/index.ts
supabase functions deploy stranger-matchmaker
```

### 3. Check Database
```sql
-- Verify bots are in database
SELECT COUNT(*) FROM "user" WHERE "isBot" = true;

-- Verify bots have recent lastActive
SELECT id, name, "lastActive" 
FROM "user" 
WHERE "isBot" = true 
ORDER BY "lastActive" DESC 
LIMIT 5;
```

## Monitoring (First 24 hours)

### Every Hour:
- [ ] Check bot service is running
- [ ] Check error logs for new issues
- [ ] Verify bot count in stats

### Daily:
- [ ] Check matchmaking success rate
- [ ] Monitor bot analytics
- [ ] Check user feedback

## Performance Optimization (Optional)

If matching is slow, add database index:

```sql
CREATE INDEX IF NOT EXISTS idx_user_bot_active 
ON "user" ("isBot", "lastActive") 
WHERE "isBot" = true;
```

## Environment Variables (Optional Tuning)

```bash
# Reduce bot count if still having issues
BOT_MIN_COUNT=1
BOT_MAX_COUNT=3

# Increase maintenance interval
MAINTENANCE_INTERVAL_MS=180000  # 3 minutes
```

## Support

If issues persist:

1. Check `BOT_MATCHMAKING_FIX.md` for troubleshooting
2. Review bot service logs for specific errors
3. Check edge function logs for matching failures
4. Verify database has bot users with recent `lastActive`

## Key Files Modified

```
✅ apps/server/supabase/functions/stranger-matchmaker/index.ts
✅ apps/server/src/bot-service/bot-instance-simple.ts
```

No database migrations required.
No breaking changes to user-facing features.

---

**Deployment Time:** ~5 minutes
**Downtime:** None (rolling update)
**Risk Level:** Low (backward compatible)
**Status:** ✅ READY
