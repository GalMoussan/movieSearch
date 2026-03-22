#!/usr/bin/env tsx
/**
 * CinemaQuery Ingestion Script
 *
 * Paginates TMDB /discover/movie, enriches each movie with credits + keywords,
 * builds semantic documents, embeds them in batches, and upserts to Supabase.
 *
 * Usage:
 *   npx tsx scripts/ingest.ts
 *   npx tsx scripts/ingest.ts --limit 100       # test with first 100 movies
 *   npx tsx scripts/ingest.ts --page 50         # resume from page 50
 *   npx tsx scripts/ingest.ts --limit 500 --page 10
 *
 * Env required: DATABASE_URL, DIRECT_URL, OPENAI_API_KEY, TMDB_API_KEY or TMDB_READ_TOKEN
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { embedBatch } from "../lib/openai";
import {
  discoverMovies,
  getMovieDetails,
  getMovieCredits,
  getMovieKeywords,
} from "../lib/tmdb";
import {
  buildEnrichedMovie,
  buildSemanticDoc,
  sleep,
  chunk,
  type EnrichedMovie,
} from "../lib/utils";

// ─── Config ───────────────────────────────────────────────────────────────────

const BATCH_EMBED_SIZE = 100; // docs per OpenAI embeddings call (keep under 2048)
const TMDB_CONCURRENT = 5;    // concurrent TMDB requests per batch
const RATE_LIMIT_SLEEP = 100; // ms between TMDB batches (~50 req/s target)
const DB_UPSERT_BATCH = 50;   // rows per DB upsert

// ─── CLI args ─────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const limitArg = args.indexOf("--limit");
const pageArg = args.indexOf("--page");

const LIMIT = limitArg >= 0 ? parseInt(args[limitArg + 1], 10) : Infinity;
const START_PAGE = pageArg >= 0 ? parseInt(args[pageArg + 1], 10) : 1;

// ─── Prisma ───────────────────────────────────────────────────────────────────

const prisma = new PrismaClient();

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function getExistingTmdbIds(ids: number[]): Promise<Set<number>> {
  const existing = await prisma.$queryRaw<Array<{ tmdb_id: number }>>`
    SELECT tmdb_id FROM movies WHERE tmdb_id = ANY(${ids}::int[])
  `;
  return new Set(existing.map((r) => r.tmdb_id));
}

async function enrichMovie(
  tmdbId: number
): Promise<EnrichedMovie | null> {
  try {
    const [details, credits, keywords] = await Promise.all([
      getMovieDetails(tmdbId),
      getMovieCredits(tmdbId),
      getMovieKeywords(tmdbId),
    ]);
    return buildEnrichedMovie(details, credits, keywords);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn(`  ⚠ Failed to enrich tmdb_id=${tmdbId}: ${message}`);
    return null;
  }
}

async function upsertMoviesWithEmbeddings(
  movies: EnrichedMovie[],
  embeddings: number[][]
): Promise<number> {
  if (movies.length === 0) return 0;

  const batches = chunk(movies, DB_UPSERT_BATCH);
  const embBatches = chunk(embeddings, DB_UPSERT_BATCH);
  let upserted = 0;

  for (let b = 0; b < batches.length; b++) {
    const batchMovies = batches[b];
    const batchEmbs = embBatches[b];

    for (let i = 0; i < batchMovies.length; i++) {
      const m = batchMovies[i];
      const emb = batchEmbs[i];

      // Format as PostgreSQL array literal for vector casting
      const embeddingStr = `[${emb.join(",")}]`;

      await prisma.$executeRaw`
        INSERT INTO movies (
          tmdb_id, title, year, overview, tagline,
          genres, keywords, director, cast,
          poster_path, rating, vote_count, embedding
        )
        VALUES (
          ${m.tmdbId}, ${m.title}, ${m.year}, ${m.overview}, ${m.tagline},
          ${m.genres}::text[], ${m.keywords}::text[], ${m.director}, ${m.cast}::text[],
          ${m.posterPath}, ${m.rating}, ${m.voteCount},
          ${embeddingStr}::vector
        )
        ON CONFLICT (tmdb_id) DO UPDATE SET
          title       = EXCLUDED.title,
          year        = EXCLUDED.year,
          overview    = EXCLUDED.overview,
          tagline     = EXCLUDED.tagline,
          genres      = EXCLUDED.genres,
          keywords    = EXCLUDED.keywords,
          director    = EXCLUDED.director,
          cast        = EXCLUDED.cast,
          poster_path = EXCLUDED.poster_path,
          rating      = EXCLUDED.rating,
          vote_count  = EXCLUDED.vote_count,
          embedding   = EXCLUDED.embedding
      `;
      upserted++;
    }
  }

  return upserted;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🎬 CinemaQuery Ingestion Script");
  console.log(`   Start page: ${START_PAGE}`);
  console.log(`   Limit: ${LIMIT === Infinity ? "none (full run)" : LIMIT}`);
  console.log("");

  let totalIngested = 0;
  let totalSkipped = 0;
  let page = START_PAGE;

  // Fetch first page to get total
  const firstPage = await discoverMovies(page);
  const totalPages = Math.min(firstPage.total_pages, 500); // TMDB caps at 500 pages
  console.log(
    `📊 Total: ~${firstPage.total_results.toLocaleString()} movies across ${totalPages} pages`
  );
  console.log("");

  const allPages = [firstPage, ...Array.from({ length: totalPages - 1 }, (_, i) => i + page + 1)];

  for (let pageIdx = 0; pageIdx < allPages.length; pageIdx++) {
    const currentPage = typeof allPages[pageIdx] === "number"
      ? allPages[pageIdx] as number
      : page;

    const pageData =
      pageIdx === 0
        ? (allPages[0] as Awaited<ReturnType<typeof discoverMovies>>)
        : await discoverMovies(currentPage);

    if (pageIdx > 0) page = currentPage;

    const candidates = pageData.results;
    if (candidates.length === 0) break;

    // Resume support: skip already-ingested movies
    const tmdbIds = candidates.map((m) => m.id);
    const existingIds = await getExistingTmdbIds(tmdbIds);
    const toProcess = candidates.filter((m) => !existingIds.has(m.id));

    if (toProcess.length === 0) {
      process.stdout.write(`  Page ${currentPage}/${totalPages}: all ${candidates.length} already ingested, skipping\n`);
      totalSkipped += candidates.length;
      if (totalIngested + totalSkipped >= LIMIT) break;
      await sleep(RATE_LIMIT_SLEEP);
      continue;
    }

    process.stdout.write(
      `  Page ${currentPage}/${totalPages}: enriching ${toProcess.length} movies...`
    );

    // Enrich in small concurrent batches
    const enrichedMovies: EnrichedMovie[] = [];
    const enrichBatches = chunk(toProcess, TMDB_CONCURRENT);

    for (const batch of enrichBatches) {
      const results = await Promise.all(batch.map((m) => enrichMovie(m.id)));
      enrichedMovies.push(...results.filter((m): m is EnrichedMovie => m !== null));
      await sleep(RATE_LIMIT_SLEEP);
    }

    if (enrichedMovies.length === 0) {
      process.stdout.write(" no valid movies, skipping\n");
      continue;
    }

    // Build semantic docs and embed
    const docs = enrichedMovies.map(buildSemanticDoc);
    const embBatches = chunk(docs, BATCH_EMBED_SIZE);
    const allEmbeddings: number[][] = [];

    for (const embBatch of embBatches) {
      const embs = await embedBatch(embBatch);
      allEmbeddings.push(...embs);
    }

    // Upsert to DB
    const upserted = await upsertMoviesWithEmbeddings(enrichedMovies, allEmbeddings);
    totalIngested += upserted;
    totalSkipped += candidates.length - upserted;

    process.stdout.write(
      ` ✓ ${upserted} ingested (total: ${totalIngested.toLocaleString()})\n`
    );

    if (totalIngested >= LIMIT) {
      console.log(`\n✅ Reached limit of ${LIMIT} movies. Stopping.`);
      break;
    }

    await sleep(RATE_LIMIT_SLEEP);
  }

  console.log(`\n🏁 Done.`);
  console.log(`   Ingested: ${totalIngested.toLocaleString()}`);
  console.log(`   Skipped:  ${totalSkipped.toLocaleString()}`);

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
