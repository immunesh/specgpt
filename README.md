# 5G SpecGPT

> AI-powered assistant for 5G telecommunications specifications — 3GPP, O-RAN, ETSI standards.

## Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                           5G SpecGPT                                  │
│                                                                        │
│  Browser ──► Next.js 15 (3000) ──► Express API (4000)                │
│                                          │                             │
│                              ┌───────────┼───────────┐               │
│                              ▼           ▼           ▼               │
│                         PostgreSQL    pgvector    Claude API          │
│                         + Prisma    (embeddings)  (Anthropic)         │
│                              │                        │               │
│                         Redis (Bull)          Voyage AI               │
│                         (Job Queue)           (Embeddings)            │
└──────────────────────────────────────────────────────────────────────┘
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, TypeScript, TailwindCSS, Shadcn UI |
| State | Zustand, React Query |
| Backend | Express.js, TypeScript, Node.js 20 |
| Database | PostgreSQL 16 + pgvector + Prisma ORM |
| Queue | Bull (Redis-backed) |
| AI | Anthropic Claude (claude-sonnet-4-6) |
| Embeddings | Voyage AI voyage-large-2 (1024-dim) |
| Auth | JWT (access + refresh) + Google OAuth 2.0 |
| Infrastructure | Docker, Docker Compose, GitHub Actions |

## Quick Start

### Prerequisites

- Node.js 20+
- Docker + Docker Compose V2
- Anthropic API key
- Voyage AI API key (or OpenAI for embeddings)

### One-command setup

```bash
git clone <repo>
cd 5g_specgpt
bash scripts/dev-setup.sh
```

Then add your API keys to `.env`:
```env
ANTHROPIC_API_KEY=sk-ant-...
VOYAGE_API_KEY=pa-...
```

Start development servers:
```bash
npm run dev
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:4000 |
| DB Studio | `npm run db:studio --workspace=backend` |

### Default Accounts

| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@5gspecgpt.com | Admin@SpecGPT2024! |
| Demo User | demo@5gspecgpt.com | Demo@SpecGPT2024! |

## Environment Variables

Copy `.env.example` to `.env` and fill in values:

```env
# Required
ANTHROPIC_API_KEY=sk-ant-...
VOYAGE_API_KEY=pa-...          # or OPENAI_API_KEY + EMBEDDING_PROVIDER=openai
JWT_SECRET=<64-char random>
JWT_REFRESH_SECRET=<64-char random>

# Database (auto-configured by Docker)
DATABASE_URL=postgresql://specgpt_user:pass@localhost:5432/specgpt

# Optional
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

## Project Structure

```
5g_specgpt/
├── frontend/                  # Next.js 15 app
│   └── src/
│       ├── app/               # App Router pages
│       │   ├── (auth)/        # Login, Register
│       │   └── (dashboard)/   # Chat, History, Search, Admin, Settings
│       ├── components/
│       │   ├── ui/            # Shadcn UI primitives
│       │   ├── chat/          # Chat interface components
│       │   ├── admin/         # Admin dashboard components
│       │   └── layout/        # Sidebar, ThemeToggle
│       ├── hooks/             # useStreamChat, useConversations, useProfile
│       ├── lib/api/           # Axios API clients
│       ├── store/             # Zustand stores (auth, chat)
│       └── types/             # TypeScript types
│
├── backend/                   # Express.js API
│   └── src/
│       ├── api/
│       │   ├── controllers/   # AuthController, ChatController, AdminController
│       │   ├── middleware/     # authenticate, requireRole, validate, upload
│       │   ├── routes/        # authRoutes, chatRoutes, documentRoutes, adminRoutes
│       │   └── validators/    # Zod schemas
│       ├── core/
│       │   ├── ai/            # FiveGGuard, RagRetriever, ClaudeService, PromptBuilder
│       │   ├── auth/          # JwtService, PasswordService, GoogleOAuthService
│       │   ├── rag/           # PdfExtractor, ChunkingService, DocumentProcessor
│       │   └── search/        # SemanticSearchService
│       ├── domain/
│       │   ├── repositories/  # Repository interfaces
│       │   └── services/      # AuthService, ChatService, DocumentService
│       ├── infrastructure/
│       │   ├── database/      # Prisma client + repository implementations
│       │   ├── queue/         # Bull queue + worker
│       │   ├── storage/       # FileStorageService
│       │   └── vector-store/  # EmbeddingService
│       └── config/            # Zod-validated environment config
│
├── shared/                    # Shared TypeScript types
├── docker/                    # Docker configs
├── scripts/                   # Setup + utility scripts
└── .github/workflows/         # CI/CD pipeline
```

## API Reference

All endpoints are prefixed with `/api/v1`.

### Authentication

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/register` | — | Email + password registration |
| POST | `/auth/login` | — | Email + password login |
| POST | `/auth/google` | — | Google OAuth (idToken or code) |
| GET | `/auth/google/url` | — | Get Google OAuth redirect URL |
| POST | `/auth/refresh` | Cookie | Rotate refresh token |
| POST | `/auth/logout` | Bearer | Revoke current session |
| POST | `/auth/logout-all` | Bearer | Revoke all sessions |
| GET | `/auth/me` | Bearer | Get own profile |
| PATCH | `/auth/me` | Bearer | Update name/avatar |

### Chat

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/chat` | Bearer | Send message (SSE stream or JSON) |
| GET | `/chat/conversations` | Bearer | List conversations |
| GET | `/chat/conversations/:id/messages` | Bearer | Get messages |
| PATCH | `/chat/conversations/:id` | Bearer | Rename / pin |
| POST | `/chat/conversations/:id/archive` | Bearer | Archive |
| DELETE | `/chat/conversations/:id` | Bearer | Delete |
| GET | `/chat/conversations/:id/export` | Bearer | Download as Markdown |
| GET | `/chat/search?q=` | Bearer | Semantic spec search |

### Documents

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/documents/upload` | Admin | Upload PDF spec |
| GET | `/documents` | Bearer | List documents |
| GET | `/documents/:id` | Bearer | Get document |
| GET | `/documents/:id/status` | Bearer | Processing status |
| POST | `/documents/:id/reprocess` | Admin | Re-run RAG pipeline |
| DELETE | `/documents/:id` | Admin | Delete document |

### Admin

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/admin/users` | Admin | List users |
| PATCH | `/admin/users/:id` | Admin | Update role/status |
| DELETE | `/admin/users/:id` | Admin | Delete user |
| GET | `/admin/stats` | Admin | System statistics |
| GET | `/admin/analytics/daily` | Admin | Daily usage data |
| GET | `/admin/analytics/top-users` | Admin | Top users by activity |

### SSE Chat Stream Format

```
POST /api/v1/chat  { message, conversationId?, stream: true }
Content-Type: text/event-stream

data: {"type":"start","conversationId":"...","messageId":"..."}
data: {"type":"delta","content":"..."}
data: {"type":"sources","sources":[...]}
data: {"type":"end","totalTokens":1240}
data: [DONE]
```

## RAG Pipeline

```
PDF Upload → Disk Storage → DB (PENDING)
    ↓
Bull Queue → DocumentProcessor
    ├── PdfExtractor (pdf-parse)
    ├── ChunkingService (section-aware, 400 tokens, 60-token overlap)
    ├── EmbeddingService (Voyage AI voyage-large-2, 1024-dim)
    └── pgvector (IVFFlat cosine similarity index)
         ↓
    DB (READY) — available for RAG retrieval
```

## 5G Domain Guard

Queries are filtered through a 3-tier classifier before hitting Claude:

1. **Fast-allow**: contains a 5G keyword (gNB, AMF, PDCCH, beamforming…) → immediate allow
2. **Fast-reject**: contains clear off-topic keyword (recipe, movie…) → immediate reject
3. **AI classify**: Claude Haiku YES/NO → ~10 tokens, <100ms

## Database Schema

8 tables: `users`, `oauth_accounts`, `refresh_tokens`, `conversations`, `messages`, `documents`, `document_chunks` (with `vector(1024)` column), `user_events`, `api_usage`.

## Docker

```bash
# Development
docker compose up -d

# Production build
docker compose -f docker-compose.yml up -d --build

# View logs
docker compose logs -f backend

# DB Studio
npm run db:studio --workspace=backend
```

## CI/CD

GitHub Actions pipeline (`.github/workflows/ci.yml`):

1. **Quality** — TypeScript typecheck + ESLint (both packages)
2. **Test Backend** — Vitest with real PostgreSQL service
3. **Test Frontend** — Vitest
4. **Build & Push** — Docker images to GitHub Container Registry (main branch only)
5. **Deploy** — Production deployment with manual approval gate

## License

MIT
