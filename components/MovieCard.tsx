"use client";

import { useState } from "react";
import type { SearchResult } from "@/types";

const IMG_BASE = "https://image.tmdb.org/t/p/w500";

interface MovieCardProps {
  result: SearchResult;
  index: number;
}

export default function MovieCard({ result, index }: MovieCardProps) {
  const [hovered, setHovered] = useState(false);

  const { title, year, posterPath, rating, overview, reason, score, similarity } = result;
  const displayScore = score ?? similarity;
  const displayRating = rating?.toFixed(1) ?? "—";

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        gap: "20px",
        padding: "20px",
        borderBottom: "1px solid #1a1a1a",
        transition: "background 0.2s",
        background: hovered ? "rgba(200,168,50,0.03)" : "transparent",
        cursor: "default",
        animation: `fadeSlideIn 0.4s ease both`,
        animationDelay: `${index * 0.08}s`,
      }}
    >
      {/* Poster */}
      <div style={{ flexShrink: 0, position: "relative" }}>
        {posterPath ? (
          <img
            src={`${IMG_BASE}${posterPath}`}
            alt={title}
            style={{
              width: 72,
              height: 108,
              objectFit: "cover",
              display: "block",
              filter: "grayscale(20%) contrast(1.05)",
              border: hovered ? "1px solid #c8a832" : "1px solid #222",
              transition: "border 0.2s",
            }}
          />
        ) : (
          <div
            style={{
              width: 72,
              height: 108,
              background: "#111",
              border: hovered ? "1px solid #c8a832" : "1px solid #222",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "border 0.2s",
            }}
          >
            <span style={{ color: "#333", fontSize: 10, fontFamily: "monospace" }}>
              NO IMG
            </span>
          </div>
        )}
        <div
          style={{
            position: "absolute",
            top: 4,
            left: 4,
            background: "#0a0a0a",
            color: "#c8a832",
            fontFamily: "'Courier New', monospace",
            fontSize: 10,
            padding: "2px 5px",
            fontWeight: "bold",
            letterSpacing: "0.05em",
          }}
        >
          {Math.round(displayScore * 100)}%
        </div>
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 10,
            marginBottom: 6,
          }}
        >
          <span
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 17,
              color: "#e8e0d0",
              fontWeight: 700,
              letterSpacing: "-0.01em",
            }}
          >
            {title}
          </span>
          <span
            style={{
              fontFamily: "'Courier New', monospace",
              fontSize: 11,
              color: "#555",
              flexShrink: 0,
            }}
          >
            {year ?? "?"} · ★ {displayRating}
          </span>
        </div>

        {reason && (
          <p
            style={{
              margin: "0 0 8px 0",
              fontFamily: "'Courier New', monospace",
              fontSize: 11,
              color: "#c8a832",
              fontStyle: "italic",
              lineHeight: 1.5,
            }}
          >
            ↳ {reason}
          </p>
        )}

        <p
          style={{
            margin: 0,
            fontFamily: "Georgia, serif",
            fontSize: 12,
            color: "#4a4a4a",
            lineHeight: 1.6,
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}
        >
          {overview}
        </p>
      </div>
    </div>
  );
}
