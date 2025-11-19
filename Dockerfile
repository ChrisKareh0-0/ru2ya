# syntax=docker/dockerfile:1

# -------- Base builder --------
FROM node:20-alpine AS deps
WORKDIR /app

# Install libc6-compat for some native deps
RUN apk add --no-cache libc6-compat

# Install deps first (better cache)
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

FROM node:20-alpine AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Ensure low-memory build settings are honored
ENV NODE_ENV=production
ENV NODE_OPTIONS=--max-old-space-size=256
RUN npm run build

# -------- Runtime (standalone) --------
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user and data directory
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001
RUN mkdir -p /data && chown nextjs:nodejs /data

# Copy standalone output
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Expose port
EXPOSE 3000

# Default to a modest heap inside container; override with env if needed
ENV NODE_OPTIONS=--max-old-space-size=768

# Run as non-root
USER nextjs

CMD ["node", "server.js"]





