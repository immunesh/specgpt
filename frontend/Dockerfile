# ============================================================
# Frontend Dockerfile - Multi-stage build (root build context)
# ============================================================

# Base stage
FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat

# Root manifest + lockfile + all workspace package.jsons so npm ci can resolve
COPY package*.json ./
COPY frontend/package.json ./frontend/
COPY backend/package.json ./backend/
COPY shared/package.json ./shared/

# Development stage
FROM base AS development
RUN npm ci
COPY frontend/ ./frontend/
COPY shared/ ./shared/
WORKDIR /app/frontend
EXPOSE 3000
CMD ["npm", "run", "dev"]

# Builder stage
FROM base AS builder
RUN npm ci
COPY frontend/ ./frontend/
COPY shared/ ./shared/
WORKDIR /app/frontend
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Production stage
FROM node:20-alpine AS production
WORKDIR /app
RUN apk add --no-cache libc6-compat
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
COPY --from=builder /app/frontend/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/frontend/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/frontend/.next/static ./.next/static
USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
CMD ["node", "server.js"]
