# CinemaQuery — Project Conventions

## Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 15 App Router |
| Language | TypeScript (strict) |
| Database | PostgreSQL + pgvector (Supabase) |
| ORM | Prisma (with `$queryRaw` for vector ops) |
| Embeddings | OpenAI `text-embedding-3-small` (1536 dims) |
| Re-ranking | Claude `claude-sonnet-4-6` |
| Data source | TMDB API |
| State | TanStack Query v5 |
| Validation | Zod |

## Key File Paths

| File | Purpose |
|------|---------|
| `app/page.tsx` | Main UI (client component) |
| `app/api/search/route.ts` | Search API endpoint |
| `app/layout.tsx` | Root layout + fonts + QueryProvider |
| `app/query-provider.tsx` | TanStack QueryClientProvider |
| `lib/prisma.ts` | Prisma singleton |
| `lib/openai.ts` | Embeddings client + helpers |
| `lib/anthropic.ts` | Re-rank client |
| `lib/tmdb.ts` | TMDB API client |
| `lib/utils.ts` | `buildSemanticDoc`, `buildEnrichedMovie`, helpers |
| `types/index.ts` | Zod schemas + TypeScript types |
| `scripts/ingest.ts` | TMDB ingestion script (tsx) |
| `prisma/schema.prisma` | DB schema with `Unsupported("vector(1536)")` |
| `prisma/migrations/001_init/migration.sql` | Raw SQL: table + ivfflat index |

## Critical Patterns

### pgvector with Prisma
Prisma doesn't natively support vector type. Always use `$queryRaw` for vector ops:
```typescript
const results = await prisma.$queryRaw`
  SELECT id, 1 - (embedding <=> ${embStr}::vector) AS similarity
  FROM movies ORDER BY embedding <=> ${embStr}::vector LIMIT 50
`;
```

### Embedding data format
Pass embeddings as PostgreSQL array literal string:
```typescript
const embStr = `[${embedding.join(",")}]`;
// Then use: ${embStr}::vector in query
```

### Semantic document format
`buildSemanticDoc(movie)` produces:
```
"Title (year). "Tagline". Genres: X, Y. Keywords: a, b, c. Director: D. Cast: E, F. Overview..."
```

## Commands

```bash
# Development
npm run dev          # Start dev server on :3000
npm run typecheck    # TypeScript check
npm run build        # Production build

# Database
npx prisma studio    # DB browser UI
npx prisma db push   # Push schema changes (no migration file)
npx prisma migrate deploy  # Apply migrations in production

# Ingestion
npx tsx scripts/ingest.ts --limit 100   # Test with 100 movies
npx tsx scripts/ingest.ts               # Full run (~8-10h for 500k movies)
npx tsx scripts/ingest.ts --page 50     # Resume from page 50
```

## Environment Variables
See `.env.local.example` for all required variables.
Never commit `.env.local`.

## Design System
- Background: `#080808` (void black)
- Text: `#e8e0d0` (parchment)
- Accent: `#c8a832` (cinema gold)
- Fonts: Playfair Display (headings), Special Elite (search input), Courier New (mono/labels)
- All styling via inline styles (no CSS modules, no Tailwind in components)
