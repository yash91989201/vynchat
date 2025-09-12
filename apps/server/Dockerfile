# Start from Bun official image
FROM oven/bun:1.2.21 AS builder
WORKDIR /app

# Install dependencies
COPY package.json ./
RUN bun install

# Copy all source code
COPY . .

RUN bun run build

ENTRYPOINT ["bun", "run", "start"]
