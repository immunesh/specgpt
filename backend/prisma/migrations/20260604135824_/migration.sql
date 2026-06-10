-- DropForeignKey
ALTER TABLE "documents" DROP CONSTRAINT "documents_uploaded_by_fkey";

-- DropIndex (conditional — these indexes may not exist without pgvector)
DROP INDEX IF EXISTS "document_chunks_embedding_idx";
DROP INDEX IF EXISTS "documents_name_trgm_idx";
DROP INDEX IF EXISTS "documents_spec_number_trgm_idx";

-- AlterTable
ALTER TABLE "conversations" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "documents" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "oauth_accounts" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
