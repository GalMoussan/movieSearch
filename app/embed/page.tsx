"use client";

import { useState } from "react";
import FilmGrain from "@/components/FilmGrain";
import MovieCard from "@/components/MovieCard";
import MovieModal from "@/components/MovieModal";
import SearchBox from "@/components/SearchBox";
import ExampleQueries from "@/components/ExampleQueries";
import PersonaMixer from "@/components/PersonaMixer";
import BlendBar from "@/components/BlendBar";
import { useSearch } from "@/hooks/useSearch";
import type { ActivePersona } from "@/lib/personas";
import type { SearchResult } from "@/types";

export default function EmbedPage() {
  const { search, results, status, statusMessage } = useSearch();
  const [activePersonas, setActivePersonas] = useState<ActivePersona[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<SearchResult | null>(null);

  function handleSearch(query: string) {
    search(query, activePersonas);
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
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.92); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #0a0a0a; }
        ::-webkit-scrollbar-thumb { background: #2a2a2a; }
        @media (max-width: 900px) {
          .results-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 580px) {
          .results-grid { grid-template-columns: 1fr !important; }
          .page-root { padding-left: 16px !important; padding-right: 16px !important; }
        }
        @media (max-width: 760px) {
          .persona-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 640px) {
          .persona-grid { grid-template-columns: 1fr !important; }
          .modal-inner { flex-direction: column !important; }
          .modal-poster-col { width: 100% !important; height: 240px !important; flex-shrink: 0 !important; }
        }
      `}</style>

      <FilmGrain />

      <div
        className="page-root"
        style={{
          minHeight: "100vh",
          background: "radial-gradient(ellipse 60% 30% at 50% 0%, rgba(200,168,50,0.055) 0%, #080808 70%)",
          color: "#e8e0d0",
          fontFamily: "Georgia, serif",
          maxWidth: "none",
          padding: "2rem 1rem",
        }}
      >
        {/* Persona Mixer */}
        <PersonaMixer onChange={setActivePersonas} />

        {/* Blend Bar */}
        <BlendBar active={activePersonas} />

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

        {/* Loading skeleton */}
        {status === "searching" && results.length === 0 && (
          <div
            className="results-grid"
            style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px", marginTop: 40 }}
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column" }}>
                <div
                  style={{
                    width: "100%",
                    paddingBottom: "150%",
                    background: "#111",
                    animation: "pulse 1.5s ease-in-out infinite",
                    animationDelay: `${i * 0.1}s`,
                  }}
                />
                <div style={{ padding: "14px 14px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
                  <div
                    style={{
                      width: "70%",
                      height: 14,
                      background: "#181818",
                      borderRadius: 2,
                      animation: "pulse 1.5s ease-in-out infinite",
                      animationDelay: `${i * 0.1}s`,
                    }}
                  />
                  <div
                    style={{
                      width: "45%",
                      height: 10,
                      background: "#181818",
                      borderRadius: 2,
                      animation: "pulse 1.5s ease-in-out infinite",
                      animationDelay: `${i * 0.1}s`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Results grid */}
        {results.length > 0 && (
          <div
            className="results-grid"
            style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px", marginTop: 40 }}
          >
            {results.map((result, i) => (
              <MovieCard
                key={result.id}
                result={result}
                index={i}
                onClick={() => setSelectedMovie(result)}
              />
            ))}
          </div>
        )}

        {/* Error state */}
        {status === "error" && (
          <div
            style={{
              textAlign: "center",
              padding: "60px 0",
              fontFamily: "'Courier New', monospace",
              fontSize: 12,
              color: "#8B1A1A",
            }}
          >
            {statusMessage}
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
              color: "#666",
            }}
          >
            the archive found no match for this feeling.
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedMovie && (
        <MovieModal result={selectedMovie} onClose={() => setSelectedMovie(null)} />
      )}
    </>
  );
}
