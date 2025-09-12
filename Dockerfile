# Build stage
FROM oven/bun:1.2.21 AS builder
WORKDIR /app

# Copy package files for dependency resolution
COPY package.json bun.lock ./
COPY apps/web/package.json ./apps/web/
COPY apps/server/package.json ./apps/server/

# Install dependencies
RUN bun install --frozen-lockfile

# Copy all source code needed for web build (web app needs server for type definitions and schemas)
COPY apps/web ./apps/web
COPY apps/server ./apps/server

ARG VITE_SERVER_URL
ENV VITE_SERVER_URL=$VITE_SERVER_URL

ARG VITE_ALLOWED_HOSTS
ENV VITE_ALLOWED_HOSTS=$VITE_ALLOWED_HOSTS

# Build the web application
WORKDIR /app/apps/web
RUN bun run build

# Production stage
FROM oven/bun:1.2.21-slim AS production

WORKDIR /app/apps/web

# Copy built files maintaining the expected structure
COPY --from=builder /app/apps/web/dist ./dist
COPY --from=builder /app/apps/web/package.json ./package.json
COPY --from=builder /app/apps/web/vite.config.ts ./vite.config.ts

RUN bun add vite@latest

# Expose port
EXPOSE 5173

# Start the application
ENTRYPOINT ["bunx", "vite", "preview", "--host", "0.0.0.0", "--port", "5173"]
