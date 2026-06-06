# ============================================================
# Backend Dockerfile - Multi-stage build (root build context)
# ============================================================

# Base stage
FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat openssl

# Root manifest + lockfile + all workspace package.jsons so npm ci can resolve
COPY package*.json ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/
COPY shared/package.json ./shared/
COPY backend/prisma ./backend/prisma/

# Development stage
FROM base AS development
RUN npm ci
COPY backend/ ./backend/
COPY shared/ ./shared/
WORKDIR /app/backend
RUN npx prisma generate
EXPOSE 4000
CMD ["npm", "run", "dev"]

# Builder stage
FROM base AS builder
RUN npm ci
COPY backend/ ./backend/
COPY shared/ ./shared/
WORKDIR /app/backend
RUN npx prisma generate
RUN npm run build

# Production stage
FROM node:20-alpine AS production
WORKDIR /app
RUN apk add --no-cache libc6-compat openssl
COPY package*.json ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/
COPY shared/package.json ./shared/
COPY backend/prisma ./backend/prisma/
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=builder /app/backend/dist /app/backend/dist
COPY --from=builder /app/node_modules/.prisma /app/node_modules/.prisma
RUN mkdir -p /app/backend/uploads
WORKDIR /app/backend
EXPOSE 4000
USER node
CMD ["node", "dist/server.js"]
