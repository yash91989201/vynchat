# Connection Limits and Rate Limiting:
# - Adjust Supabase Realtime connection limits in your Supabase dashboard
# - Consider increasing the "Max concurrent connections" setting for Realtime
# - Monitor the "Realtime" metrics in Supabase dashboard

# Environment Variables to consider adding to your bot service deployment:
# MAINTENANCE_INTERVAL_MS=60000
# BOT_MIN_COUNT=3
# BOT_MAX_COUNT=15
# BOT_TARGET_PERCENTAGE=30

# For production deployment, consider:
# 1. Setting up health checks in your container orchestration
# 2. Adding resource limits (CPU/memory) to prevent runaway processes
# 3. Using connection pooling if you encounter database connection issues
# 4. Setting up proper logging and monitoring