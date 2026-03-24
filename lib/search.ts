import { prisma } from "@/lib/prisma";
import { PERSONAS } from "@/lib/personas";
import type { ActivePersona } from "@/lib/personas";
import type { SearchResult } from "@/types";

const VECTOR_CANDIDATES = 50;
const MIN_VOTE_COUNT = 50;

type RawMovie = {
  id: number;
  tmdb_id: number;
  imdb_id: string | null;
  title: string;
  year: number | null;
  overview: string | null;
  poster_path: string | null;
  rating: number | null;
  vote_count: number | null;
  similarity: number;
};

export async function vectorSearch(
  queryEmbedding: number[],
  limit = VECTOR_CANDIDATES
): Promise<SearchResult[]> {
  const embeddingStr = `[${queryEmbedding.join(",")}]`;

  const candidates = await prisma.$queryRaw<RawMovie[]>`
    SELECT
      id,
      tmdb_id,
      imdb_id,
      title,
      year,
      overview,
      poster_path,
      rating,
      vote_count,
      1 - (embedding <=> ${embeddingStr}::vector) AS similarity
    FROM movies
    WHERE vote_count > ${MIN_VOTE_COUNT}
      AND embedding IS NOT NULL
    ORDER BY embedding <=> ${embeddingStr}::vector
    LIMIT ${limit}
  `;

  return candidates.map((m) => ({
    id: m.id,
    tmdbId: m.tmdb_id,
    imdbId: m.imdb_id,
    title: m.title,
    year: m.year,
    overview: m.overview,
    posterPath: m.poster_path,
    rating: m.rating ? Number(m.rating) : null,
    voteCount: m.vote_count,
    similarity: Number(m.similarity),
  }));
}

const BASE_RERANK_RULES = `Return a JSON object (no markdown, no backticks) with this exact shape:
{
  "ranked": [
    { "id": 123, "score": 0.95, "reason": "One concise sentence explaining why this matches the query." }
  ]
}

Rules:
- Only include films with genuine relevance (score >= 0.4)
- Return at most 8 results, ordered by score descending
- Scores should reflect cinematic/thematic match, not just surface similarity
- Reasons should be evocative and specific, not generic
- Be precise, not generous
- One sentence per film. Stay in character.`;

export function buildRerankSystemPrompt(activePersonas: ActivePersona[]): string {
  const active = activePersonas.filter((p) => p.weight > 0);

  if (active.length === 0) {
    return `You are a cinephile AI with deep knowledge of world cinema. Given a user's natural language movie query and a list of candidate films found via semantic search, re-rank them by true relevance.

${BASE_RERANK_RULES}`;
  }

  // Normalize weights to percentages of total
  const totalWeight = active.reduce((sum, p) => sum + p.weight, 0);
  const weightedPersonas = active
    .map((p) => ({
      ...p,
      pct: Math.round((p.weight / totalWeight) * 100),
    }))
    .sort((a, b) => b.pct - a.pct);

  const personaLines = weightedPersonas
    .map((p) => {
      const persona = PERSONAS[p.id as keyof typeof PERSONAS];
      if (!persona) return null;
      return `${persona.name} (${p.pct}%): ${persona.voice}`;
    })
    .filter(Boolean)
    .join("\n");

  return `You are a BLENDED search persona composed of these voices:

${personaLines}

Speak as ONE unified voice shaped by both. The heavier weight dominates tone.

${BASE_RERANK_RULES}`;
}
