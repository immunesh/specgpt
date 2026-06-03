# ============================================================
# Backend Dockerfile - Multi-stage build
# ============================================================

# Base stage
FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat openssl
COPY package*.json ./
COPY prisma ./prisma/

# Development stage
FROM base AS development
RUN npm ci
COPY . .
RUN npx prisma generate
EXPOSE 4000
CMD ["npm", "run", "dev"]

# Builder stage
FROM base AS builder
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

# Production stage
FROM node:20-alpine AS production
WORKDIR /app
RUN apk add --no-cache libc6-compat openssl
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
RUN mkdir -p uploads
EXPOSE 4000
USER node
CMD ["node", "dist/server.js"]
