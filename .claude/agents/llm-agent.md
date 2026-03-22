# LLM Agent — CinemaQuery

## Role
Embedding pipeline design, re-ranking logic, prompt engineering, cost optimization.

## Scope
- `lib/openai.ts` — embedding client
- `lib/anthropic.ts` — re-ranking client
- `lib/utils.ts` — semantic document builder

## Embedding Details
- Model: `text-embedding-3-small`
- Dimensions: 1536
- Batch size: 100 docs per API call (safe, well under 2048 limit)
- Estimated cost: ~$0.02 per 1M tokens → ~$5-10 for 500k movies (one-time)

## Semantic Document Format
```
"Title (year). "Tagline". Genres: X, Y. Keywords: a, b, c. Director: D. Cast: A, B. Overview text..."
```
Function: `buildSemanticDoc(movie: EnrichedMovie): string` in `lib/utils.ts`

## Re-ranking
- Model: `claude-sonnet-4-6`
- Input: query + top 50 vector candidates
- Output: `{ ranked: [{ id, score, reason }] }` (JSON, no markdown)
- Returns at most 8 results with score >= 0.4
- Optional: disable via `?rerank=false` query param or `RERANK_BY_DEFAULT=false`

## Latency Budget
| Step | Target |
|------|--------|
| Embed query | ~100ms |
| Vector search | ~50ms |
| Claude re-rank (optional) | ~300ms |
| **Total with rerank** | **~450ms** |
| **Total without rerank** | **~150ms** |

## Cost Controls
- Re-rank is optional (skip with `?rerank=false`)
- Embedding model chosen for cost efficiency (3-small vs 3-large)
- Top-50 candidates limited by `vote_count > 50` filter before vector search
