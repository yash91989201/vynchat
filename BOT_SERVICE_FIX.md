# Bot Service Fix - Lobby Join Timeout Issue

## Problem
The bot service was experiencing "Lobby join timeout" errors when starting multiple bots simultaneously. Some bots would successfully join the lobby while others would timeout after 5 seconds.

## Root Causes Identified

1. **Using ANON_KEY instead of SERVICE_ROLE_KEY**: The bot service was using the regular Supabase client with ANON_KEY, which has:
   - Rate limiting on concurrent realtime connections
   - Connection limits that cause timeouts
   - Insufficient permissions for bot operations

2. **Aggressive Timeout**: The 5-second timeout was too short for concurrent connections

3. **No Retry Logic**: Failed subscriptions had no retry mechanism

4. **Concurrent Connection Storm**: Multiple bots starting simultaneously (1 second apart) created connection contention

## Solutions Implemented

### 1. Created Dedicated Bot Supabase Client
- **File**: `apps/server/src/bot-service/supabase-client.ts`
- Uses `SUPABASE_SERVICE_ROLE_KEY` instead of `ANON_KEY`
- Bypasses RLS (Row Level Security)
- Unlimited realtime connections
- Increased events per second to 100

### 2. Updated Bot Instance
- **File**: `apps/server/src/bot-service/bot-instance.ts`
- Now uses `botSupabase` client instead of regular `supabase`
- Increased lobby join timeout from 5s to 15s
- Added retry logic with exponential backoff (3 attempts)
- Added proper channel cleanup on failure
- Added random delay (500-1500ms) before joining lobby to stagger connections
- Improved subscription status handling (SUBSCRIBED, CHANNEL_ERROR, TIMED_OUT)
- Better promise resolution tracking to prevent race conditions

### 3. Updated Bot Manager
- **File**: `apps/server/src/bot-service/bot-manager.ts`
- Now uses `botSupabase` client
- Increased delay between starting bots from 1s to 2s
- Better error handling for bot startup failures

## Key Changes Summary

### Before:
```typescript
// Using ANON_KEY client with rate limits
import { supabase } from "@/lib/supabase";

// 5 second timeout, no retries
setTimeout(() => reject(new Error("Lobby join timeout")), 5000);

// 1 second delay between bot starts
await this.delay(1000);
```

### After:
```typescript
// Using SERVICE_ROLE_KEY client with no limits
import { botSupabase as supabase } from "./supabase-client";

// 15 second timeout with retry logic
setTimeout(() => {
  if (!isResolved) {
    isResolved = true;
    reject(new Error("Lobby join timeout"));
  }
}, 15000);

// 2 second delay between bot starts + random stagger
await this.delay(2000);
// Plus random 500-1500ms delay before lobby join
```

## Expected Behavior

After these changes:
- All bots should successfully join the lobby
- Retries will handle temporary connection issues
- Staggered connections reduce contention
- Service role key eliminates rate limiting
- Better error messages for debugging

## Testing

To test the fix:
```bash
bun run dev:server
```

Look for:
- ✅ All bots joining lobby successfully
- ⚠️  Warning messages if retries are needed
- 📍 Confirmation messages when bots join
- No "Lobby join timeout" errors (or very rare if network issues)
