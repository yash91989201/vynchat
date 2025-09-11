# Use Bun official image
FROM oven/bun:1.2.21

# Set working directory
WORKDIR /app

# Copy only your file
COPY matchmaking-service.ts .

# Install dependencies manually
RUN bun add @paralleldrive/cuid2 @supabase/supabase-js

# Run the loop
CMD ["bun", "matchmaking-service.ts.ts"]
