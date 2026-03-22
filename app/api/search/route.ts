import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { embedText } from "@/lib/openai";
import { rerankMovies } from "@/lib/anthropic";
import { SearchRequestSchema } from "@/types";
import type { SearchResult, SearchResponse } from "@/types";

const VECTOR_CANDIDATES = 50;
const MIN_VOTE_COUNT = 50;

export async function POST(req: NextRequest): Promise<NextResponse> {
  // 1. Parse + validate input
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = SearchRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request" },
      { status: 400 }
    );
  }

  const { query } = parsed.data;
  const useRerank =
    req.nextUrl.searchParams.get("rerank") !== "false" &&
    (process.env.RERANK_BY_DEFAULT ?? "true") === "true";

  try {
    // 2. Embed the query
    const queryEmbedding = await embedText(query);
    const embeddingStr = `[${queryEmbedding.join(",")}]`;

    // 3. Vector search — cosine similarity via pgvector
    type RawMovie = {
      id: number;
      tmdb_id: number;
      title: string;
      year: number | null;
      overview: string | null;
      poster_path: string | null;
      rating: number | null;
      vote_count: number | null;
      similarity: number;
    };

    const candidates = await prisma.$queryRaw<RawMovie[]>`
      SELECT
        id,
        tmdb_id,
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
      LIMIT ${VECTOR_CANDIDATES}
    `;

    if (candidates.length === 0) {
      const response: SearchResponse = { results: [], query, count: 0 };
      return NextResponse.json(response);
    }

    // Normalize raw DB results to SearchResult shape
    const searchResults: SearchResult[] = candidates.map((m) => ({
      id: m.id,
      tmdbId: m.tmdb_id,
      title: m.title,
      year: m.year,
      overview: m.overview,
      posterPath: m.poster_path,
      rating: m.rating ? Number(m.rating) : null,
      voteCount: m.vote_count,
      similarity: Number(m.similarity),
    }));

    // 4. Optional Claude re-rank
    if (useRerank) {
      const reranked = await rerankMovies(query, searchResults);

      if (reranked.length > 0) {
        // Merge re-rank scores/reasons into results
        const idToResult = new Map(searchResults.map((r) => [r.id, r]));

        const merged: SearchResult[] = reranked
          .map((r) => {
            const base = idToResult.get(r.id);
            if (!base) return null;
            return { ...base, score: r.score, reason: r.reason };
          })
          .filter((r): r is SearchResult => r !== null);

        const response: SearchResponse = {
          results: merged,
          query,
          count: merged.length,
        };
        return NextResponse.json(response);
      }
    }

    // Return vector results without rerank
    const response: SearchResponse = {
      results: searchResults.slice(0, 10),
      query,
      count: Math.min(searchResults.length, 10),
    };
    return NextResponse.json(response);
  } catch (err) {
    console.error("[/api/search] Error:", err);
    const message =
      err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
