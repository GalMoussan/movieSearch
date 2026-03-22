const TMDB_BASE = "https://api.themoviedb.org/3";

function getHeaders(): HeadersInit {
  const token = process.env.TMDB_READ_TOKEN;
  if (token) {
    return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
  }
  // Fallback to API key param
  return { "Content-Type": "application/json" };
}

function buildUrl(path: string, params: Record<string, string> = {}): string {
  const url = new URL(`${TMDB_BASE}${path}`);
  if (!process.env.TMDB_READ_TOKEN && process.env.TMDB_API_KEY) {
    url.searchParams.set("api_key", process.env.TMDB_API_KEY);
  }
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return url.toString();
}

async function tmdbFetch<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  const url = buildUrl(path, params);
  const res = await fetch(url, { headers: getHeaders() });

  if (!res.ok) {
    throw new Error(`TMDB ${path} failed: ${res.status} ${res.statusText}`);
  }

  return res.json() as Promise<T>;
}

export interface TMDBDiscoverResult {
  id: number;
  title: string;
  overview: string;
  release_date: string;
  poster_path: string | null;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
}

export interface TMDBMovieDetails {
  id: number;
  title: string;
  overview: string;
  tagline: string;
  release_date: string;
  poster_path: string | null;
  vote_average: number;
  vote_count: number;
  genres: Array<{ id: number; name: string }>;
}

export interface TMDBCredits {
  cast: Array<{ name: string; order: number }>;
  crew: Array<{ name: string; job: string; department: string }>;
}

export interface TMDBKeywords {
  keywords: Array<{ id: number; name: string }>;
}

export interface TMDBDiscoverPage {
  page: number;
  total_pages: number;
  total_results: number;
  results: TMDBDiscoverResult[];
}

export async function discoverMovies(page: number): Promise<TMDBDiscoverPage> {
  return tmdbFetch<TMDBDiscoverPage>("/discover/movie", {
    page: String(page),
    sort_by: "popularity.desc",
    include_adult: "false",
    include_video: "false",
    language: "en-US",
    "vote_count.gte": "10",
  });
}

export async function getMovieDetails(id: number): Promise<TMDBMovieDetails> {
  return tmdbFetch<TMDBMovieDetails>(`/movie/${id}`, { language: "en-US" });
}

export async function getMovieCredits(id: number): Promise<TMDBCredits> {
  return tmdbFetch<TMDBCredits>(`/movie/${id}/credits`);
}

export async function getMovieKeywords(id: number): Promise<TMDBKeywords> {
  return tmdbFetch<TMDBKeywords>(`/movie/${id}/keywords`);
}
