# Build stage
FROM oven/bun:1.2.22 AS builder
WORKDIR /app

# Copy package files for dependency resolution
COPY package.json ./

# Install dependencies
RUN bun install  --production

# Copy all source code
COPY . .

# Build the application
RUN bun run build

# Production stage
FROM oven/bun:1.2.22-slim AS production

WORKDIR /app

# Copy built files and necessary files from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json

# Install only production dependencies
RUN bun install --frozen-lockfile --production

EXPOSE 30019

# Start the application
ENTRYPOINT ["bun", "run", "start"]
