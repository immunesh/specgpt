#!/usr/bin/env bash
# ============================================================
# Database setup script — run once after docker compose up
# ============================================================
set -euo pipefail

echo "⏳ Waiting for PostgreSQL to be ready..."
until docker exec specgpt_postgres pg_isready -U specgpt_user -d specgpt 2>/dev/null; do
  sleep 1
done
echo "✅ PostgreSQL is ready"

echo "⏳ Running Prisma migrations..."
cd backend && npx prisma migrate deploy
echo "✅ Migrations complete"

echo "⏳ Generating Prisma client..."
npx prisma generate
echo "✅ Prisma client generated"

echo "⏳ Running seed..."
npm run db:seed
echo "✅ Seed complete"

echo ""
echo "🎉 Database setup complete!"
echo "   Admin:  admin@5gspecgpt.com / Admin@SpecGPT2024!"
echo "   Demo:   demo@5gspecgpt.com  / Demo@SpecGPT2024!"
