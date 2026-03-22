"use client";

import { useState, useRef, useEffect } from "react";

type SearchStatus = "idle" | "searching" | "done" | "error";

interface SearchBoxProps {
  onSearch: (query: string) => void;
  status: SearchStatus;
  statusMessage: string;
}

export default function SearchBox({ onSearch, status, statusMessage }: SearchBoxProps) {
  const [query, setQuery] = useState("");
  const [blink, setBlink] = useState(true);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const isSearching = status === "searching";

  useEffect(() => {
    const interval = setInterval(() => setBlink((b) => !b), 530);
    return () => clearInterval(interval);
  }, []);

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (query.trim() && !isSearching) {
        onSearch(query);
      }
    }
  }

  function handleSubmit() {
    if (query.trim() && !isSearching) {
      onSearch(query);
    }
  }

  // Allow parent to set query via custom event (for example queries)
  function setExternalQuery(q: string) {
    setQuery(q);
  }

  // Expose setQuery so parent can call it
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;

    const handler = (e: Event) => {
      const custom = e as CustomEvent<string>;
      setExternalQuery(custom.detail);
    };

    el.addEventListener("set-query", handler);
    return () => el.removeEventListener("set-query", handler);
  }, []);

  return (
    <div style={{ marginBottom: 28, animation: "fadeSlideIn 0.6s ease 0.15s both" }}>
      <div
        style={{
          border: `1px solid ${isSearching ? "#c8a832" : "#2a2a2a"}`,
          transition: "border-color 0.3s",
          background: "#0e0e0e",
          padding: "16px 20px",
          position: "relative",
        }}
      >
        <div
          style={{
            fontFamily: "'Courier New', monospace",
            fontSize: 10,
            color: "#333",
            letterSpacing: "0.2em",
            marginBottom: 10,
          }}
        >
          QUERY //
        </div>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
          <span
            style={{
              color: "#c8a832",
              fontFamily: "'Courier New', monospace",
              fontSize: 14,
              marginTop: 2,
              flexShrink: 0,
            }}
          >
            ›
          </span>
          <textarea
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="describe what you're looking for..."
            rows={2}
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              color: "#e8e0d0",
              fontFamily: "'Special Elite', Georgia, serif",
              fontSize: 16,
              lineHeight: 1.6,
              letterSpacing: "0.02em",
              resize: "none",
              outline: "none",
            }}
          />
          {blink && status === "idle" && (
            <span
              style={{
                width: 2,
                height: 18,
                background: "#c8a832",
                display: "inline-block",
                marginTop: 4,
                flexShrink: 0,
              }}
            />
          )}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 12,
        }}
      >
        <span style={{ fontFamily: "'Courier New', monospace", fontSize: 10, color: "#333" }}>
          {isSearching ? (
            <span style={{ color: "#c8a832", animation: "pulse 1.2s infinite" }}>
              ⬡ {statusMessage}
            </span>
          ) : status === "done" ? (
            <span style={{ color: "#4a7a4a" }}>✓ {statusMessage}</span>
          ) : status === "error" ? (
            <span style={{ color: "#7a3a3a" }}>✗ {statusMessage}</span>
          ) : (
            <span>ENTER to search</span>
          )}
        </span>
        <button
          onClick={handleSubmit}
          disabled={isSearching || !query.trim()}
          style={{
            background: "transparent",
            border: "1px solid #c8a832",
            color: "#c8a832",
            fontFamily: "'Courier New', monospace",
            fontSize: 11,
            letterSpacing: "0.15em",
            padding: "7px 18px",
            cursor: isSearching || !query.trim() ? "not-allowed" : "pointer",
            opacity: isSearching || !query.trim() ? 0.4 : 1,
            transition: "all 0.2s",
          }}
        >
          {isSearching ? "SEARCHING..." : "SEARCH →"}
        </button>
      </div>
    </div>
  );
}

export type { SearchBoxProps };
