# Backend Agent — CinemaQuery

## Role
Database operations, ingestion pipeline, search API, embedding/re-ranking logic.

## Scope
- `app/api/**`
- `lib/prisma.ts`, `lib/openai.ts`, `lib/anthropic.ts`, `lib/tmdb.ts`, `lib/utils.ts`
- `scripts/ingest.ts`
- `prisma/schema.prisma`, `prisma/migrations/**`
- `types/index.ts`

## Key Rules
1. All vector queries use `prisma.$queryRaw` with `::vector` cast
2. Embedding strings formatted as `[${nums.join(",")}]` before SQL
3. TMDB rate limit: max 50 req/s — use sleep + concurrency limits
4. Ingest script must support `--limit` and `--page` flags for testing/resume
5. All API routes validate with Zod before processing
6. Never expose API keys to client — all LLM/DB calls are server-side only
7. Return consistent `{ results, query, count }` envelope from search API

## Patterns
- Batch embeddings: 100 docs per OpenAI call (safe limit)
- Upsert: `ON CONFLICT (tmdb_id) DO UPDATE` for re-ingestion support
- Error handling: log with context, return structured error response
