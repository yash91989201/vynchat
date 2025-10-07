FROM oven/bun:1.2.23 as base

WORKDIR /app

# Install dependencies
COPY package.json ./
RUN bun install

# Copy source code
COPY . .

# Run the service
CMD ["bun", "run", "src/index.ts"]
