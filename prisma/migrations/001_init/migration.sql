-- Enable pgvector extension (may already be enabled on Supabase cloud)
CREATE EXTENSION IF NOT EXISTS vector;

-- Create movies table
CREATE TABLE IF NOT EXISTS movies (
  id          SERIAL PRIMARY KEY,
  tmdb_id     INTEGER UNIQUE NOT NULL,
  title       TEXT NOT NULL,
  year        SMALLINT,
  overview    TEXT,
  tagline     TEXT,
  genres      TEXT[],
  keywords    TEXT[],
  director    TEXT,
  cast        TEXT[],
  poster_path TEXT,
  rating      NUMERIC(3,1),
  vote_count  INTEGER,
  metadata    JSONB,
  embedding   vector(1536),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- IVFFlat index for fast approximate nearest neighbor cosine search
-- lists=100 is appropriate for 500k-1M rows; tune upward if recall degrades
CREATE INDEX IF NOT EXISTS movies_embedding_idx
  ON movies USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- Index for common filter
CREATE INDEX IF NOT EXISTS movies_vote_count_idx ON movies (vote_count);
CREATE INDEX IF NOT EXISTS movies_tmdb_id_idx ON movies (tmdb_id);
