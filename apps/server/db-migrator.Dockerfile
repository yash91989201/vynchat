FROM oven/bun:alpine

# Set the working directory
WORKDIR /app

# Installing only required packages for migration
RUN bun install drizzle-kit@latest @t3-oss/env-core@latest zod@latest drizzle-orm@latest postgres@latest

# Copy only necessary files for migration
COPY ./src/db/migrations ./src/db/migrations
COPY ./src/db/schema ./src/db/schema
COPY ./drizzle.config.ts .

# Set the entrypoint
ENTRYPOINT ["bunx", "--bun", "drizzle-kit", "migrate", "--config", "drizzle.config.ts"]
