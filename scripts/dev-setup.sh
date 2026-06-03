#!/usr/bin/env bash
# ============================================================
# 5G SpecGPT — Full Development Setup Script
# Run once: bash scripts/dev-setup.sh
# ============================================================
set -euo pipefail

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; NC='\033[0m'
info()  { echo -e "${BLUE}[INFO]${NC} $1"; }
ok()    { echo -e "${GREEN}[OK]${NC} $1"; }
warn()  { echo -e "${YELLOW}[WARN]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

# ── Pre-flight checks ─────────────────────────────────────────────
info "Checking prerequisites…"
command -v node >/dev/null 2>&1 || error "Node.js 20+ required"
command -v npm  >/dev/null 2>&1 || error "npm 10+ required"
command -v docker >/dev/null 2>&1 || error "Docker required"
command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1 || error "Docker Compose V2 required"

NODE_VER=$(node -e "process.stdout.write(process.version.slice(1).split('.')[0])")
[[ $NODE_VER -ge 20 ]] || error "Node.js 20+ required (found v${NODE_VER})"
ok "Prerequisites satisfied (Node.js v$(node --version | tr -d v))"

# ── Environment file ─────────────────────────────────────────────
if [[ ! -f .env ]]; then
  info "Creating .env from .env.example…"
  cp .env.example .env

  # Generate random secrets
  JWT_SECRET=$(openssl rand -hex 64)
  JWT_REFRESH=$(openssl rand -hex 64)
  NEXTAUTH_SECRET=$(openssl rand -hex 32)
  POSTGRES_PASS=$(openssl rand -base64 16 | tr -d '/+=')
  REDIS_PASS=$(openssl rand -base64 12 | tr -d '/+=')

  sed -i.bak \
    -e "s|your_jwt_secret_here_min_64_chars|${JWT_SECRET}|g" \
    -e "s|your_jwt_refresh_secret_here_min_64_chars|${JWT_REFRESH}|g" \
    -e "s|your_nextauth_secret_here|${NEXTAUTH_SECRET}|g" \
    -e "s|your_strong_password_here|${POSTGRES_PASS}|g" \
    -e "s|your_redis_password_here|${REDIS_PASS}|g" \
    .env && rm -f .env.bak

  ok ".env created with generated secrets"
  warn "Add your ANTHROPIC_API_KEY and VOYAGE_API_KEY to .env before starting!"
else
  ok ".env already exists"
fi

# ── Install dependencies ──────────────────────────────────────────
info "Installing dependencies…"
npm install
ok "Dependencies installed"

# ── Start infrastructure ──────────────────────────────────────────
info "Starting Docker services (PostgreSQL + Redis)…"
docker compose up -d postgres redis

info "Waiting for PostgreSQL…"
RETRIES=30
until docker exec specgpt_postgres pg_isready -U specgpt_user -d specgpt -q 2>/dev/null || [[ $RETRIES -eq 0 ]]; do
  RETRIES=$((RETRIES - 1))
  sleep 2
done
[[ $RETRIES -gt 0 ]] || error "PostgreSQL did not become ready in time"
ok "PostgreSQL is ready"

# ── Database setup ────────────────────────────────────────────────
info "Running Prisma migrations…"
cd backend
npx prisma generate
DATABASE_URL="$(grep DATABASE_URL ../.env | cut -d= -f2-)" npx prisma migrate deploy
ok "Migrations applied"

info "Running seed…"
npx tsx src/infrastructure/database/seed.ts
ok "Database seeded"
cd ..

echo ""
echo -e "${GREEN}══════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  5G SpecGPT is ready!${NC}"
echo -e "${GREEN}══════════════════════════════════════════════════${NC}"
echo ""
echo -e "  ${BLUE}Accounts:${NC}"
echo -e "    Admin: admin@5gspecgpt.com / Admin@SpecGPT2024!"
echo -e "    Demo:  demo@5gspecgpt.com  / Demo@SpecGPT2024!"
echo ""
echo -e "  ${BLUE}Start dev servers:${NC}  npm run dev"
echo -e "  ${BLUE}Frontend:${NC}           http://localhost:3000"
echo -e "  ${BLUE}Backend API:${NC}        http://localhost:4000"
echo -e "  ${BLUE}DB Studio:${NC}          npm run db:studio --workspace=backend"
echo ""
echo -e "  ${YELLOW}Next: Add ANTHROPIC_API_KEY + VOYAGE_API_KEY to .env${NC}"
echo ""
