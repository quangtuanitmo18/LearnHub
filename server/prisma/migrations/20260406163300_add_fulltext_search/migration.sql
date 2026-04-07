-- Add tsvector column for full-text search (Hybrid Search - Tier 2)
ALTER TABLE "DocumentChunk" ADD COLUMN IF NOT EXISTS "searchVector" tsvector;

-- Populate tsvector from existing content
UPDATE "DocumentChunk" SET "searchVector" = to_tsvector('english', content);

-- Create trigger function to auto-update searchVector on INSERT/UPDATE
CREATE OR REPLACE FUNCTION update_document_chunk_search_vector() RETURNS trigger AS $$
BEGIN
  NEW."searchVector" := to_tsvector('english', NEW.content);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_document_chunk_search_vector
  BEFORE INSERT OR UPDATE OF content ON "DocumentChunk"
  FOR EACH ROW EXECUTE FUNCTION update_document_chunk_search_vector();

-- GIN index for fast full-text queries
CREATE INDEX IF NOT EXISTS idx_document_chunk_search_vector
  ON "DocumentChunk" USING GIN ("searchVector");

-- HNSW index for faster vector search (upgrade from default sequential scan)
CREATE INDEX IF NOT EXISTS idx_document_chunk_embedding_hnsw
  ON "DocumentChunk" USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);
