-- CreateExtensions (already done in docker init.sql, but safe to re-run)
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN', 'SUPER_ADMIN');
CREATE TYPE "MessageRole" AS ENUM ('user', 'assistant', 'system');
CREATE TYPE "DocumentStatus" AS ENUM ('PENDING', 'PROCESSING', 'READY', 'FAILED');
CREATE TYPE "SpecSeries" AS ENUM ('TS_23', 'TS_24', 'TS_29', 'TS_33', 'TS_37', 'TS_38', 'O_RAN', 'ETSI', 'OTHER');
CREATE TYPE "Release" AS ENUM ('REL_15', 'REL_16', 'REL_17', 'REL_18', 'REL_19');

-- CreateTable: users
CREATE TABLE "users" (
    "id"             UUID NOT NULL DEFAULT uuid_generate_v4(),
    "email"          VARCHAR(255) NOT NULL,
    "name"           VARCHAR(255) NOT NULL,
    "password_hash"  VARCHAR(255),
    "avatar"         VARCHAR(500),
    "role"           "UserRole" NOT NULL DEFAULT 'USER',
    "is_active"      BOOLEAN NOT NULL DEFAULT true,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "last_active_at" TIMESTAMPTZ,
    "created_at"     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at"     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE INDEX "users_email_idx" ON "users"("email");
CREATE INDEX "users_role_idx" ON "users"("role");
CREATE INDEX "users_created_at_idx" ON "users"("created_at");

-- CreateTable: oauth_accounts
CREATE TABLE "oauth_accounts" (
    "id"               UUID NOT NULL DEFAULT uuid_generate_v4(),
    "user_id"          UUID NOT NULL,
    "provider"         VARCHAR(50) NOT NULL,
    "provider_user_id" VARCHAR(255) NOT NULL,
    "access_token"     TEXT,
    "refresh_token"    TEXT,
    "expires_at"       TIMESTAMPTZ,
    "created_at"       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at"       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT "oauth_accounts_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "oauth_accounts_provider_provider_user_id_key" ON "oauth_accounts"("provider", "provider_user_id");
CREATE INDEX "oauth_accounts_user_id_idx" ON "oauth_accounts"("user_id");

ALTER TABLE "oauth_accounts" ADD CONSTRAINT "oauth_accounts_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: refresh_tokens
CREATE TABLE "refresh_tokens" (
    "id"          UUID NOT NULL DEFAULT uuid_generate_v4(),
    "user_id"     UUID NOT NULL,
    "token_hash"  VARCHAR(255) NOT NULL,
    "expires_at"  TIMESTAMPTZ NOT NULL,
    "is_revoked"  BOOLEAN NOT NULL DEFAULT false,
    "user_agent"  VARCHAR(500),
    "ip_address"  VARCHAR(50),
    "created_at"  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "refresh_tokens_token_hash_key" ON "refresh_tokens"("token_hash");
CREATE INDEX "refresh_tokens_user_id_idx" ON "refresh_tokens"("user_id");
CREATE INDEX "refresh_tokens_token_hash_idx" ON "refresh_tokens"("token_hash");
CREATE INDEX "refresh_tokens_expires_at_idx" ON "refresh_tokens"("expires_at");

ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: conversations
CREATE TABLE "conversations" (
    "id"          UUID NOT NULL DEFAULT uuid_generate_v4(),
    "user_id"     UUID NOT NULL,
    "title"       VARCHAR(500) NOT NULL,
    "summary"     TEXT,
    "is_archived" BOOLEAN NOT NULL DEFAULT false,
    "is_pinned"   BOOLEAN NOT NULL DEFAULT false,
    "metadata"    JSONB NOT NULL DEFAULT '{}',
    "created_at"  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at"  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "conversations_user_id_idx" ON "conversations"("user_id");
CREATE INDEX "conversations_user_id_updated_at_idx" ON "conversations"("user_id", "updated_at" DESC);
CREATE INDEX "conversations_is_archived_idx" ON "conversations"("is_archived");

ALTER TABLE "conversations" ADD CONSTRAINT "conversations_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: messages
CREATE TABLE "messages" (
    "id"               UUID NOT NULL DEFAULT uuid_generate_v4(),
    "conversation_id"  UUID NOT NULL,
    "role"             "MessageRole" NOT NULL,
    "content"          TEXT NOT NULL,
    "sources"          JSONB NOT NULL DEFAULT '[]',
    "token_count"      INTEGER,
    "model_used"       VARCHAR(100),
    "latency_ms"       INTEGER,
    "is_filtered"      BOOLEAN NOT NULL DEFAULT false,
    "filter_reason"    VARCHAR(255),
    "created_at"       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "messages_conversation_id_idx" ON "messages"("conversation_id");
CREATE INDEX "messages_conversation_id_created_at_idx" ON "messages"("conversation_id", "created_at");
CREATE INDEX "messages_role_idx" ON "messages"("role");

ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_fkey"
    FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: documents
CREATE TABLE "documents" (
    "id"            UUID NOT NULL DEFAULT uuid_generate_v4(),
    "name"          VARCHAR(500) NOT NULL,
    "file_name"     VARCHAR(255) NOT NULL,
    "file_path"     VARCHAR(1000) NOT NULL,
    "file_size"     BIGINT NOT NULL,
    "mime_type"     VARCHAR(100) NOT NULL,
    "status"        "DocumentStatus" NOT NULL DEFAULT 'PENDING',
    "error_message" TEXT,
    "spec_number"   VARCHAR(50),
    "spec_title"    VARCHAR(500),
    "series"        "SpecSeries",
    "release"       "Release",
    "version"       VARCHAR(20),
    "total_pages"   INTEGER,
    "chunk_count"   INTEGER DEFAULT 0,
    "uploaded_by"   UUID NOT NULL,
    "processed_at"  TIMESTAMPTZ,
    "created_at"    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at"    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "documents_status_idx" ON "documents"("status");
CREATE INDEX "documents_spec_number_idx" ON "documents"("spec_number");
CREATE INDEX "documents_series_idx" ON "documents"("series");
CREATE INDEX "documents_release_idx" ON "documents"("release");
CREATE INDEX "documents_uploaded_by_idx" ON "documents"("uploaded_by");

-- Full-text search index on spec_number and name
CREATE INDEX "documents_spec_number_trgm_idx" ON "documents" USING gin ("spec_number" gin_trgm_ops);
CREATE INDEX "documents_name_trgm_idx" ON "documents" USING gin ("name" gin_trgm_ops);

ALTER TABLE "documents" ADD CONSTRAINT "documents_uploaded_by_fkey"
    FOREIGN KEY ("uploaded_by") REFERENCES "users"("id") ON UPDATE CASCADE;

-- CreateTable: document_chunks
CREATE TABLE "document_chunks" (
    "id"           UUID NOT NULL DEFAULT uuid_generate_v4(),
    "document_id"  UUID NOT NULL,
    "chunk_index"  INTEGER NOT NULL,
    "content"      TEXT NOT NULL,
    "content_hash" VARCHAR(64) NOT NULL,
    "embedding"    vector(1024),
    "page_start"   INTEGER,
    "page_end"     INTEGER,
    "section"      VARCHAR(500),
    "token_count"  INTEGER,
    "created_at"   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT "document_chunks_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "document_chunks_document_id_chunk_index_key" ON "document_chunks"("document_id", "chunk_index");
CREATE INDEX "document_chunks_document_id_idx" ON "document_chunks"("document_id");
CREATE INDEX "document_chunks_content_hash_idx" ON "document_chunks"("content_hash");

-- IVFFlat index for approximate nearest-neighbor search (1024-dim vectors)
-- Lists = sqrt(number of rows), tune after initial data load
CREATE INDEX "document_chunks_embedding_idx" ON "document_chunks"
    USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

ALTER TABLE "document_chunks" ADD CONSTRAINT "document_chunks_document_id_fkey"
    FOREIGN KEY ("document_id") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: user_events
CREATE TABLE "user_events" (
    "id"          UUID NOT NULL DEFAULT uuid_generate_v4(),
    "user_id"     UUID,
    "event_type"  VARCHAR(100) NOT NULL,
    "event_data"  JSONB NOT NULL DEFAULT '{}',
    "session_id"  VARCHAR(255),
    "ip_address"  VARCHAR(50),
    "user_agent"  VARCHAR(500),
    "created_at"  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT "user_events_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "user_events_user_id_idx" ON "user_events"("user_id");
CREATE INDEX "user_events_event_type_idx" ON "user_events"("event_type");
CREATE INDEX "user_events_created_at_idx" ON "user_events"("created_at");

ALTER TABLE "user_events" ADD CONSTRAINT "user_events_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable: api_usage
CREATE TABLE "api_usage" (
    "id"               UUID NOT NULL DEFAULT uuid_generate_v4(),
    "user_id"          UUID NOT NULL,
    "conversation_id"  UUID,
    "model"            VARCHAR(100) NOT NULL,
    "input_tokens"     INTEGER NOT NULL,
    "output_tokens"    INTEGER NOT NULL,
    "total_tokens"     INTEGER NOT NULL,
    "latency_ms"       INTEGER NOT NULL,
    "is_streamed"      BOOLEAN NOT NULL DEFAULT false,
    "created_at"       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT "api_usage_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "api_usage_user_id_idx" ON "api_usage"("user_id");
CREATE INDEX "api_usage_created_at_idx" ON "api_usage"("created_at");
CREATE INDEX "api_usage_model_idx" ON "api_usage"("model");

ALTER TABLE "api_usage" ADD CONSTRAINT "api_usage_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ============================================================
-- Updated_at trigger function (auto-update timestamps)
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON "users"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_oauth_accounts_updated_at
    BEFORE UPDATE ON "oauth_accounts"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at
    BEFORE UPDATE ON "conversations"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at
    BEFORE UPDATE ON "documents"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
