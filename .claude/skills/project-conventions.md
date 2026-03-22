# CinemaQuery Project Conventions (Always-On)

## pgvector Pattern
```typescript
// ALWAYS format embeddings as string before $queryRaw
const embStr = `[${embedding.join(",")}]`;
await prisma.$queryRaw`SELECT ... WHERE embedding <=> ${embStr}::vector`;
```

## API Response Envelope
```typescript
{ results: SearchResult[], query: string, count: number }
```

## Color Tokens
- Void: `#080808`
- Parchment: `#e8e0d0`
- Gold: `#c8a832`
- Dark border: `#1a1a1a` / `#2a2a2a`
- Success green: `#4a7a4a`
- Error red: `#7a3a3a`

## Font Stack
- Headings: `var(--font-playfair), Georgia, serif`
- Search input: `var(--font-special-elite), Georgia, serif`
- Labels/mono: `'Courier New', monospace`
- Body: `Georgia, serif`

## Search Status States
`idle` → `searching` → `done` | `error`

## Ingestion Resume
Script checks existing `tmdb_id` before enriching — safe to re-run at any time.
