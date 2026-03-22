"use client";

const EXAMPLE_QUERIES = [
  "a movie with a philosophical edge about identity and memory",
  "something slow and melancholic set in rural Japan",
  "a film that makes you feel existential dread but beautiful",
  "dark comedy about bureaucracy and death",
  "a heist movie with an unreliable narrator",
];

interface ExampleQueriesProps {
  onSelect: (query: string) => void;
}

export default function ExampleQueries({ onSelect }: ExampleQueriesProps) {
  return (
    <div style={{ marginBottom: 48, animation: "fadeSlideIn 0.6s ease 0.25s both" }}>
      <div
        style={{
          fontFamily: "'Courier New', monospace",
          fontSize: 10,
          color: "#2a2a2a",
          letterSpacing: "0.2em",
          marginBottom: 10,
        }}
      >
        TRY THESE //
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {EXAMPLE_QUERIES.map((query) => (
          <ExampleButton key={query} query={query} onSelect={onSelect} />
        ))}
      </div>
    </div>
  );
}

function ExampleButton({
  query,
  onSelect,
}: {
  query: string;
  onSelect: (q: string) => void;
}) {
  return (
    <button
      onClick={() => onSelect(query)}
      style={{
        background: "transparent",
        border: "none",
        textAlign: "left",
        color: "#3a3a3a",
        fontFamily: "Georgia, serif",
        fontStyle: "italic",
        fontSize: 13,
        cursor: "pointer",
        padding: "4px 0",
        transition: "color 0.15s",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.color = "#888";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.color = "#3a3a3a";
      }}
    >
      &ldquo;{query}&rdquo;
    </button>
  );
}
