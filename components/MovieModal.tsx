"use client";

import { useEffect, useState } from "react";
import type { SearchResult } from "@/types";

const IMG_BASE = "https://image.tmdb.org/t/p/w500";

interface MovieModalProps {
  result: SearchResult;
  onClose: () => void;
}

export default function MovieModal({ result, onClose }: MovieModalProps) {
  const [closeHovered, setCloseHovered] = useState(false);

  const { title, year, posterPath, rating, voteCount, overview, reason, score, similarity, imdbId } = result;
  const displayScore = score !== undefined ? score : similarity;
  const displayRating = rating?.toFixed(1) ?? "—";

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: "rgba(0,0,0,0.85)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        animation: "fadeIn 0.22s ease both",
      }}
    >
      <div
        className="modal-inner-panel"
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "relative",
          background: "#0e0e0e",
          border: "1px solid #2a2a2a",
          maxWidth: 880,
          width: "100%",
          maxHeight: "90vh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          animation: "scaleIn 0.22s ease both",
        }}
      >
        {/* Close button */}
        <button
          onMouseEnter={() => setCloseHovered(true)}
          onMouseLeave={() => setCloseHovered(false)}
          onClick={onClose}
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            width: 32,
            height: 32,
            border: closeHovered ? "1px solid #c8a832" : "1px solid #333",
            color: closeHovered ? "#e8e0d0" : "#888",
            background: "transparent",
            fontFamily: "'Courier New', monospace",
            fontSize: 14,
            cursor: "pointer",
            zIndex: 10,
            transition: "border-color 0.2s, color 0.2s",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          ✕
        </button>

        {/* Two-column layout */}
        <div
          className="modal-inner"
          style={{
            display: "flex",
            flex: 1,
            overflow: "hidden",
          }}
        >
          {/* Left — Poster column */}
          <div
            className="modal-poster-col"
            style={{
              width: 280,
              flexShrink: 0,
              position: "relative",
              overflow: "hidden",
            }}
          >
            {posterPath ? (
              <img
                src={`${IMG_BASE}${posterPath}`}
                alt={title}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            ) : (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  background: "#111",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span style={{ fontSize: 48, color: "#2a2a2a" }}>◻</span>
              </div>
            )}
          </div>

          {/* Right — Info column */}
          <div
            style={{
              flex: 1,
              padding: "32px 32px 32px 28px",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: 20,
            }}
          >
            {/* Eyebrow */}
            <div
              style={{
                fontFamily: "'Courier New', monospace",
                fontSize: 10,
                color: "#c8a832",
                letterSpacing: "0.3em",
                textTransform: "uppercase" as const,
              }}
            >
              ◈ ARCHIVE ENTRY
            </div>

            {/* Title */}
            <h2
              style={{
                fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif",
                fontSize: "clamp(22px, 3vw, 32px)",
                fontWeight: 900,
                color: "#e8e0d0",
                lineHeight: 1.1,
                margin: 0,
              }}
            >
              {title}
            </h2>

            {/* Meta row */}
            <div
              style={{
                fontFamily: "'Courier New', monospace",
                fontSize: 12,
                color: "#999",
                display: "flex",
                gap: 8,
                flexWrap: "wrap" as const,
              }}
            >
              <span>{year ?? "?"}</span>
              <span>·</span>
              <span>★ {displayRating}</span>
              {voteCount != null && (
                <>
                  <span>·</span>
                  <span>({voteCount.toLocaleString()} votes)</span>
                </>
              )}
            </div>

            {/* Match score block */}
            <div
              style={{
                padding: "10px 14px",
                background: "rgba(200,168,50,0.06)",
                border: "1px solid rgba(200,168,50,0.15)",
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <span
                style={{
                  fontFamily: "'Courier New', monospace",
                  fontSize: 10,
                  color: "#888",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase" as const,
                }}
              >
                MATCH SCORE
              </span>
              <span
                style={{
                  fontFamily: "'Courier New', monospace",
                  fontSize: 20,
                  color: "#c8a832",
                  fontWeight: "bold",
                }}
              >
                {Math.round(displayScore * 100)}%
              </span>
            </div>

            {/* Claude reason block */}
            {reason && (
              <div
                style={{
                  padding: "14px 16px",
                  background: "#0a0a0a",
                  border: "1px solid #1e1e1e",
                  borderLeft: "2px solid #c8a832",
                }}
              >
                <div
                  style={{
                    fontFamily: "'Courier New', monospace",
                    fontSize: 9,
                    color: "#c8a832",
                    letterSpacing: "0.3em",
                    textTransform: "uppercase" as const,
                    marginBottom: 8,
                  }}
                >
                  ↳ CLAUDE REASONING
                </div>
                <p
                  style={{
                    margin: 0,
                    fontFamily: "'Courier New', monospace",
                    fontSize: 12,
                    color: "#b0a890",
                    lineHeight: 1.7,
                    fontStyle: "italic",
                  }}
                >
                  {reason}
                </p>
              </div>
            )}

            {/* Synopsis */}
            {overview && (
              <div>
                <div
                  style={{
                    fontFamily: "'Courier New', monospace",
                    fontSize: 9,
                    color: "#555",
                    letterSpacing: "0.3em",
                    textTransform: "uppercase" as const,
                    marginBottom: 8,
                  }}
                >
                  SYNOPSIS
                </div>
                <p
                  style={{
                    margin: 0,
                    fontFamily: "Georgia, serif",
                    fontSize: 14,
                    color: "#b8b0a0",
                    lineHeight: 1.75,
                  }}
                >
                  {overview}
                </p>
              </div>
            )}

            {/* Stremio button */}
            {imdbId && (
              <a
                href={`stremio://movie/${imdbId}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "10px 18px",
                  background: "transparent",
                  border: "1px solid #333",
                  color: "#888",
                  fontFamily: "'Courier New', monospace",
                  fontSize: 11,
                  letterSpacing: "0.2em",
                  textDecoration: "none",
                  textTransform: "uppercase" as const,
                  cursor: "pointer",
                  transition: "border-color 0.2s, color 0.2s",
                  alignSelf: "flex-start",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.borderColor = "#7b5ea7";
                  (e.currentTarget as HTMLAnchorElement).style.color = "#b89de0";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.borderColor = "#333";
                  (e.currentTarget as HTMLAnchorElement).style.color = "#888";
                }}
              >
                ▶ OPEN IN STREMIO
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
