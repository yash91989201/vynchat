# Build stage
FROM oven/bun:1.2.22 AS builder
WORKDIR /app

# Copy package manifests and install dependencies
COPY package.json bun.lock ./
COPY apps/web/package.json ./apps/web/
COPY apps/server/package.json ./apps/server/
RUN bun install --frozen-lockfile

# Copy source
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

# Build the web app
WORKDIR /app/apps/web
RUN bun run build

# Production stage with nginx
FROM nginx:1.27-alpine AS production
WORKDIR /usr/share/nginx/html

# Copy built dist folder
COPY --from=builder /app/apps/web/dist ./

# Replace default nginx config with SPA config
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

# Expose HTTP port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
