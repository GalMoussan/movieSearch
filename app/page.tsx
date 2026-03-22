"use client";

import FilmGrain from "@/components/FilmGrain";
import MovieCard from "@/components/MovieCard";
import SearchBox from "@/components/SearchBox";
import ExampleQueries from "@/components/ExampleQueries";
import { useSearch } from "@/hooks/useSearch";

export default function HomePage() {
  const { search, results, status, statusMessage } = useSearch();

  function handleSearch(query: string) {
    search(query);
  }

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #080808; }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #0a0a0a; }
        ::-webkit-scrollbar-thumb { background: #2a2a2a; }
      `}</style>

      <FilmGrain />

      <div
        style={{
          minHeight: "100vh",
          background: "#080808",
          color: "#e8e0d0",
          fontFamily: "Georgia, serif",
          maxWidth: 720,
          margin: "0 auto",
          padding: "60px 24px 80px",
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: 52, animation: "fadeSlideIn 0.6s ease both" }}>
          <div
            style={{
              fontFamily: "'Courier New', monospace",
              fontSize: 10,
              color: "#c8a832",
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              marginBottom: 10,
            }}
          >
            ◈ CINEMAQUERY v0.2
          </div>
          <h1
            style={{
              fontFamily: "var(--font-playfair), Georgia, serif",
              fontSize: "clamp(36px, 7vw, 58px)",
              fontWeight: 900,
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
              color: "#e8e0d0",
              marginBottom: 14,
            }}
          >
            Search Cinema
            <br />
            <span style={{ color: "#c8a832", fontStyle: "italic" }}>
              by feeling.
            </span>
          </h1>
          <p
            style={{
              fontFamily: "'Courier New', monospace",
              fontSize: 12,
              color: "#444",
              lineHeight: 1.7,
              maxWidth: 420,
            }}
          >
            Describe a mood, a vibe, a half-remembered concept. The archive
            will find the film.
          </p>
        </div>

        {/* Search Box */}
        <SearchBox
          onSearch={handleSearch}
          status={status}
          statusMessage={statusMessage}
        />

        {/* Example queries (only when idle + no results) */}
        {status === "idle" && results.length === 0 && (
          <ExampleQueries onSelect={handleSearch} />
        )}

        {/* Results */}
        {results.length > 0 && (
          <div style={{ borderTop: "1px solid #1a1a1a" }}>
            {results.map((result, i) => (
              <MovieCard key={result.id} result={result} index={i} />
            ))}
          </div>
        )}

        {/* Empty state after search */}
        {status === "done" && results.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "60px 0",
              fontFamily: "'Courier New', monospace",
              fontSize: 12,
              color: "#333",
            }}
          >
            the archive found no match for this feeling.
          </div>
        )}

        {/* Footer */}
        <div
          style={{
            marginTop: 80,
            paddingTop: 24,
            borderTop: "1px solid #111",
            fontFamily: "'Courier New', monospace",
            fontSize: 10,
            color: "#222",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <span>DATA: TMDB · EMBEDDINGS: OPENAI · REASONING: CLAUDE</span>
          <span>SEMANTIC SEARCH ENGINE</span>
        </div>
      </div>
    </>
  );
}
