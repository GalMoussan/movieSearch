import { NextRequest, NextResponse } from "next/server";
import { embedText } from "@/lib/openai";
import { rerankMovies } from "@/lib/anthropic";
import { blendQueryVector } from "@/lib/persona-embeddings";
import { vectorSearch } from "@/lib/search";
import { SearchRequestSchema } from "@/types";
import type { SearchResult, SearchResponse } from "@/types";

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

  const { query, personas } = parsed.data;
  const useRerank =
    req.nextUrl.searchParams.get("rerank") !== "false" &&
    process.env.RERANK_BY_DEFAULT !== "false";

  try {
    // 2. Embed the query
    let queryEmbedding = await embedText(query);

    // 3. Blend embedding with active personas (if any)
    const activePersonas = personas?.filter((p) => p.weight > 0) ?? [];
    if (activePersonas.length > 0) {
      queryEmbedding = await blendQueryVector(queryEmbedding, activePersonas);
    }

    // 4. Vector search via pgvector
    const searchResults = await vectorSearch(queryEmbedding);

    if (searchResults.length === 0) {
      const response: SearchResponse = { results: [], query, count: 0 };
      return NextResponse.json(response);
    }

    // 5. Optional Claude re-rank
    if (useRerank) {
      const reranked = await rerankMovies(query, searchResults, activePersonas);

      if (reranked.length > 0) {
        // Merge re-rank scores/reasons into results
        const idToResult = new Map(searchResults.map((r) => [r.id, r]));

        const merged: SearchResult[] = [];
        for (const r of reranked) {
          const base = idToResult.get(r.id);
          if (base) merged.push({ ...base, score: r.score, reason: r.reason });
        }

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
