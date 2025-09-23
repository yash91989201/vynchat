# # Build stage
# FROM oven/bun:1.2.22 AS builder
# WORKDIR /app
#
# # Copy package files for dependency resolution
# COPY package.json bun.lock ./
# COPY apps/web/package.json ./apps/web/
# COPY apps/server/package.json ./apps/server/
#
# # Install dependencies
# RUN bun install --frozen-lockfile
#
# # Copy all source code needed for web build (web app needs server for type definitions and schemas)
# COPY apps/web ./apps/web
# COPY apps/server ./apps/server
#
# ARG VITE_WEB_URL
# ENV VITE_WEB_URL=$VITE_WEB_URL
#
# ARG VITE_SERVER_URL
# ENV VITE_SERVER_URL=$VITE_SERVER_URL
#
# ARG VITE_ALLOWED_HOSTS
# ENV VITE_ALLOWED_HOSTS=$VITE_ALLOWED_HOSTS
#
# ARG VITE_AD_SENSE_SLOT
# ENV VITE_AD_SENSE_SLOT=$VITE_AD_SENSE_SLOT
#
# ARG VITE_AD_SENSE_CLIENT
# ENV VITE_AD_SENSE_CLIENT=$VITE_AD_SENSE_CLIENT
#
# ARG VITE_ALLOWED_HOSTS
# ENV VITE_ALLOWED_HOSTS=$VITE_ALLOWED_HOSTS
#
# ARG VITE_SUPABASE_URL
# ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
#
# ARG VITE_SUPABASE_ANON_KEY
# ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY
#
# # Build the web application
# WORKDIR /app/apps/web
# RUN bun run build
#
# # Production stage
# FROM oven/bun:1.2.22-slim AS production
#
# WORKDIR /app/apps/web
#
# # Copy built files maintaining the expected structure
# COPY --from=builder /app/apps/web/dist ./dist
# COPY --from=builder /app/apps/web/package.json ./package.json
# COPY --from=builder /app/apps/web/vite.config.ts ./vite.config.ts
#
# RUN bun add vite@latest
#
# # Expose port
# EXPOSE 34356
#
# # Start the application
# ENTRYPOINT ["bunx", "vite", "preview", "--host", "0.0.0.0", "--port", "34356"]

# Build stage
FROM oven/bun:1.2.22 AS builder
WORKDIR /app

COPY package.json bun.lock ./
COPY apps/web/package.json ./apps/web/
COPY apps/server/package.json ./apps/server/
RUN bun install --frozen-lockfile

COPY apps/web ./apps/web
COPY apps/server ./apps/server


ARG VITE_WEB_URL
ENV VITE_WEB_URL=$VITE_WEB_URL

ARG VITE_SERVER_URL
ENV VITE_SERVER_URL=$VITE_SERVER_URL

ARG VITE_ALLOWED_HOSTS
ENV VITE_ALLOWED_HOSTS=$VITE_ALLOWED_HOSTS

ARG VITE_AD_SENSE_SLOT
ENV VITE_AD_SENSE_SLOT=$VITE_AD_SENSE_SLOT

ARG VITE_AD_SENSE_CLIENT
ENV VITE_AD_SENSE_CLIENT=$VITE_AD_SENSE_CLIENT

ARG VITE_ALLOWED_HOSTS
ENV VITE_ALLOWED_HOSTS=$VITE_ALLOWED_HOSTS

ARG VITE_SUPABASE_URL
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL

ARG VITE_SUPABASE_ANON_KEY
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY


# Build web app
WORKDIR /app/apps/web
RUN bun run build

# Production stage (nginx)
FROM nginx:1.27-alpine AS production
WORKDIR /usr/share/nginx/html

# Copy built files
COPY --from=builder /app/apps/web/dist ./

# Configure nginx for SPA (handles TanStack Router client-side routing)
COPY <<EOF /etc/nginx/conf.d/default.conf
server {
  listen 80;
  server_name _;

  root /usr/share/nginx/html;
  index index.html;

  location / {
    try_files \$uri /index.html;
  }
}
EOF

EXPOSE 80
ENTRYPOINT ["nginx", "-g", "daemon off;"]
