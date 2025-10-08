# Bot Service Changelog

## [2.0.0] - Latest

### Fixed
- ✅ **Bots now appear in online user count** - Added lobby presence channel
- ✅ **No more CHANNEL_ERROR storms** - Staggered bot startup (7-10s delays)
- ✅ **Graceful lobby presence failures** - Bot continues even if presence fails
- ✅ **Proper presence status updates** - idle → matched → idle transitions

### Changed
- Bots now join `global:lobby` presence channel (same as human users)
- Increased delays between bot starts from 5-8s to 7-10s
- Lobby presence is non-critical (bot continues if it fails)
- Presence status is updated when entering/leaving conversations

### Technical Details
**Connection Pattern:**
- Each bot: 1-2 Realtime connections (lobby presence + room when matched)
- Staggered startup prevents all bots connecting simultaneously
- Retry logic with graceful failure for lobby presence
- Database polling remains as backup for match detection

**What Shows in Online Count:**
- Real users who have the stranger chat page open
- Bot users who successfully joined lobby presence
- Count updates in real-time via Supabase Realtime presence sync

### Migration
No action needed. Just rebuild and redeploy:
```bash
cd apps/server
bun run build
# Restart bot service
```

## [1.0.0] - Previous

### Added
- Initial implementation of simplified bot service
- Database polling for match detection
- Fallback to message polling if Realtime fails
- Removed user notification channels

### Removed
- Complex multi-channel Realtime setup
- User notification channels (replaced with polling)
