import { z } from "zod";

// ─── API Schemas ──────────────────────────────────────────────────────────────

export const ActivePersonaSchema = z.object({
  id: z.string(),
  weight: z.number().min(0).max(100),
});

export const SearchRequestSchema = z.object({
  query: z.string().min(1, "Query cannot be empty").max(500, "Query too long"),
  personas: z.array(ActivePersonaSchema).max(3).optional(),
});

export const SearchResultSchema = z.object({
  id: z.number(),
  tmdbId: z.number(),
  imdbId: z.string().nullable(),
  title: z.string(),
  year: z.number().nullable(),
  overview: z.string().nullable(),
  posterPath: z.string().nullable(),
  rating: z.number().nullable(),
  voteCount: z.number().nullable(),
  similarity: z.number(),
  score: z.number().optional(),
  reason: z.string().optional(),
});

// ─── TypeScript Types ─────────────────────────────────────────────────────────

export type SearchRequest = z.infer<typeof SearchRequestSchema>;
export type SearchResult = z.infer<typeof SearchResultSchema>;

export interface RankedResult {
  id: number;
  score: number;
  reason: string;
}

export interface SearchResponse {
  results: SearchResult[];
  query: string;
  count: number;
}

// ─── TMDB Types ───────────────────────────────────────────────────────────────

export interface TMDBMovie {
  id: number;
  title: string;
  overview: string;
  release_date: string;
  poster_path: string | null;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  tagline?: string;
  genres?: Array<{ id: number; name: string }>;
  keywords?: string[];
  director?: string;
  cast?: string[];
  year?: number;
}

// ─── DB Row Type ──────────────────────────────────────────────────────────────

export interface MovieRow {
  id: number;
  tmdb_id: number;
  title: string;
  year: number | null;
  overview: string | null;
  tagline: string | null;
  genres: string[];
  keywords: string[];
  director: string | null;
  cast: string[];
  poster_path: string | null;
  rating: number | null;
  vote_count: number | null;
  metadata: Record<string, unknown> | null;
  created_at: Date;
}
