# Build stage
FROM node:18-alpine AS builder

# Install pnpm
RUN corepack enable && corepack prepare pnpm@10.10.0 --activate

# Install build dependencies for sharp (native module)
RUN apk add --no-cache python3 make g++ pkgconfig vips-dev

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY tsconfig.json tsup.config.ts ./
COPY src ./src

# Build
RUN pnpm build

# Production stage
FROM node:18-alpine AS production

# Install runtime dependencies for sharp
RUN apk add --no-cache vips

WORKDIR /app

# Copy built files and production dependencies
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./

# Install pnpm for production install
RUN corepack enable && corepack prepare pnpm@10.10.0 --activate

# Install only production dependencies
RUN pnpm install --prod --frozen-lockfile

# Create cache directory with proper permissions
RUN mkdir -p /app/cache && chmod 777 /app/cache

# Environment defaults
ENV NODE_ENV=production
ENV PORT=3333

# Expose HTTP port
EXPOSE 3333

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3333/mcp || exit 1

# Run the server
CMD ["node", "dist/bin.js"]