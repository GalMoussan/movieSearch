import Anthropic from "@anthropic-ai/sdk";
import type { RankedResult, SearchResult } from "@/types";

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const RERANK_SYSTEM_PROMPT = `You are a cinephile AI with deep knowledge of world cinema. Given a user's natural language movie query and a list of candidate films found via semantic search, re-rank them by true relevance.

Return a JSON object (no markdown, no backticks) with this exact shape:
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
- Be precise, not generous`;

export async function rerankMovies(
  query: string,
  candidates: SearchResult[]
): Promise<RankedResult[]> {
  const candidateList = candidates
    .map(
      (m) =>
        `[id:${m.id}] "${m.title}" (${m.year ?? "?"}) — ${m.overview?.slice(0, 200) ?? "No overview"}`
    )
    .join("\n");

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1500,
    system: RERANK_SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `Query: "${query}"\n\nCandidates:\n${candidateList}`,
      },
    ],
  });

  const text = message.content
    .filter((block) => block.type === "text")
    .map((block) => (block as { type: "text"; text: string }).text)
    .join("");

  try {
    const parsed = JSON.parse(text) as { ranked: RankedResult[] };
    return parsed.ranked ?? [];
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      const parsed = JSON.parse(match[0]) as { ranked: RankedResult[] };
      return parsed.ranked ?? [];
    }
    return [];
  }
}
