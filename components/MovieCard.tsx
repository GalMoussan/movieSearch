"use client";

import { useState } from "react";
import type { SearchResult } from "@/types";

const IMG_BASE = "https://image.tmdb.org/t/p/w500";

interface MovieCardProps {
  result: SearchResult;
  index: number;
  onClick: () => void;
}

export default function MovieCard({ result, index, onClick }: MovieCardProps) {
  const [hovered, setHovered] = useState(false);

  const { title, year, posterPath, rating, overview, reason, score, similarity } = result;
  const displayScore = score !== undefined ? score : similarity;
  const displayRating = rating?.toFixed(1) ?? "—";

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
      style={{
        display: "flex",
        flexDirection: "column",
        background: hovered ? "#111" : "#0c0c0c",
        border: hovered ? "1px solid #c8a832" : "1px solid #1e1e1e",
        cursor: "pointer",
        overflow: "hidden",
        transition: "border-color 0.2s, background 0.2s, transform 0.2s",
        transform: hovered ? "translateY(-3px)" : "translateY(0)",
        animation: "fadeSlideIn 0.4s ease both",
        animationDelay: `${index * 0.06}s`,
      }}
    >
      {/* Poster wrapper — 2:3 ratio */}
      <div
        style={{
          position: "relative",
          width: "100%",
          paddingBottom: "150%",
          overflow: "hidden",
        }}
      >
        {posterPath ? (
          <img
            src={`${IMG_BASE}${posterPath}`}
            alt={title}
            loading="lazy"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              filter: hovered
                ? "grayscale(0%) contrast(1.05)"
                : "grayscale(25%) contrast(1.05)",
              transition: "filter 0.3s",
            }}
          />
        ) : (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "#111",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <span style={{ fontSize: 32, color: "#2a2a2a" }}>◻</span>
            <span
              style={{
                fontSize: 9,
                fontFamily: "'Courier New', monospace",
                color: "#2a2a2a",
                letterSpacing: "0.2em",
              }}
            >
              NO POSTER
            </span>
          </div>
        )}

        {/* Score badge */}
        <div
          style={{
            position: "absolute",
            bottom: 8,
            right: 8,
            background: "rgba(8,8,8,0.85)",
            color: "#c8a832",
            border: "1px solid rgba(200,168,50,0.3)",
            fontSize: 11,
            padding: "3px 7px",
            fontFamily: "'Courier New', monospace",
            fontWeight: "bold",
            letterSpacing: "0.05em",
          }}
        >
          {Math.round(displayScore * 100)}%
        </div>
      </div>

      {/* Info section */}
      <div
        style={{
          padding: "14px 14px 16px",
          display: "flex",
          flexDirection: "column",
          gap: 6,
          flex: 1,
        }}
      >
        {/* Title */}
        <div
          style={{
            fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif",
            fontSize: 15,
            color: "#e8e0d0",
            fontWeight: 700,
            lineHeight: 1.25,
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}
        >
          {title}
        </div>

        {/* Year + rating */}
        <div
          style={{
            fontFamily: "'Courier New', monospace",
            fontSize: 11,
            color: "#888",
            display: "flex",
            gap: 8,
          }}
        >
          <span>{year ?? "?"}</span>
          <span>·</span>
          <span>★ {displayRating}</span>
        </div>

        {/* Reason */}
        {reason && (
          <div
            style={{
              fontFamily: "'Courier New', monospace",
              fontSize: 11,
              color: "#c8a832",
              fontStyle: "italic",
              lineHeight: 1.5,
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            ↳ {reason}
          </div>
        )}

        {/* Overview tease */}
        {overview && (
          <div
            style={{
              fontFamily: "Georgia, serif",
              fontSize: 12,
              color: "#666",
              lineHeight: 1.5,
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: 1,
              WebkitBoxOrient: "vertical",
            }}
          >
            {overview}
          </div>
        )}
      </div>
    </div>
  );
}
