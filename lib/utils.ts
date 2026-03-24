import type { TMDBMovieDetails, TMDBCredits, TMDBKeywords } from "@/lib/tmdb";

export interface EnrichedMovie {
  tmdbId: number;
  imdbId: string | null;
  title: string;
  year: number | null;
  overview: string | null;
  tagline: string | null;
  genres: string[];
  keywords: string[];
  director: string | null;
  cast: string[];
  posterPath: string | null;
  rating: number | null;
  voteCount: number | null;
}

export function buildEnrichedMovie(
  details: TMDBMovieDetails,
  credits: TMDBCredits,
  keywords: TMDBKeywords
): EnrichedMovie {
  const director =
    credits.crew.find((c) => c.job === "Director")?.name ?? null;

  const cast = credits.cast
    .sort((a, b) => a.order - b.order)
    .slice(0, 5)
    .map((c) => c.name);

  const genres = details.genres.map((g) => g.name);
  const keywordNames = keywords.keywords.slice(0, 20).map((k) => k.name);

  const yearStr = details.release_date?.slice(0, 4);
  const year = yearStr ? parseInt(yearStr, 10) : null;

  return {
    tmdbId: details.id,
    imdbId: details.imdb_id || null,
    title: details.title,
    year,
    overview: details.overview || null,
    tagline: details.tagline || null,
    genres,
    keywords: keywordNames,
    director,
    cast,
    posterPath: details.poster_path,
    rating: details.vote_average ? Math.round(details.vote_average * 10) / 10 : null,
    voteCount: details.vote_count ?? null,
  };
}

export function buildSemanticDoc(movie: EnrichedMovie): string {
  const parts = [
    `${movie.title} (${movie.year ?? "unknown year"}).`,
    movie.tagline ? `"${movie.tagline}".` : "",
    movie.genres.length > 0 ? `Genres: ${movie.genres.join(", ")}.` : "",
    movie.keywords.length > 0
      ? `Keywords: ${movie.keywords.slice(0, 15).join(", ")}.`
      : "",
    movie.director ? `Director: ${movie.director}.` : "",
    movie.cast.length > 0 ? `Cast: ${movie.cast.slice(0, 5).join(", ")}.` : "",
    movie.overview ?? "",
  ];

  return parts.filter(Boolean).join(" ").trim();
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function chunk<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}
