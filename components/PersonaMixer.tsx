"use client";

import { useState } from "react";
import { PERSONAS } from "@/lib/personas";
import type { ActivePersona } from "@/lib/personas";

interface PersonaMixerProps {
  onChange: (active: ActivePersona[]) => void;
}

export default function PersonaMixer({ onChange }: PersonaMixerProps) {
  const [weights, setWeights] = useState<Record<string, number>>(
    Object.fromEntries(Object.keys(PERSONAS).map((id) => [id, 0]))
  );
  const [warning, setWarning] = useState(false);

  function handleWeightChange(id: string, raw: number) {
    const activeCount = Object.entries(weights).filter(
      ([k, v]) => k !== id && v > 0
    ).length;

    if (raw > 0 && weights[id] === 0 && activeCount >= 3) {
      setWarning(true);
      setTimeout(() => setWarning(false), 2000);
      return;
    }

    setWarning(false);
    const next = { ...weights, [id]: raw };
    setWeights(next);

    const active = Object.entries(next)
      .filter(([, v]) => v > 0)
      .map(([id, weight]) => ({ id, weight }));
    onChange(active);
  }

  return (
    <div
      style={{
        marginBottom: 20,
        padding: "16px 0",
        borderTop: "1px solid #1a1a1a",
        borderBottom: "1px solid #1a1a1a",
      }}
    >
      <div style={{ marginBottom: 20 }}>
        <div
          style={{
            fontFamily: "'Courier New', monospace",
            fontSize: 9,
            color: "#c8a832",
            letterSpacing: "0.3em",
            textTransform: "uppercase",
          }}
        >
          ◈ PERSONA BLEND
        </div>
        <div
          style={{
            fontFamily: "Courier New",
            fontSize: 9,
            color: "#444",
            fontStyle: "italic",
            marginTop: 4,
          }}
        >
          tune the critical voice
        </div>
      </div>

      <div
        className="persona-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "12px",
        }}
      >
        {Object.values(PERSONAS).map((persona) => (
          <div
            key={persona.id}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
              padding: "16px 16px 14px",
              border:
                weights[persona.id] > 0
                  ? `1px solid ${persona.color}`
                  : "1px solid #1e1e1e",
              background: weights[persona.id] > 0 ? "#111" : "#0c0c0c",
              transition: "border-color 0.2s, background 0.2s",
            }}
          >
            {/* Symbol + Name */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span
                style={{
                  fontFamily: "Courier New",
                  fontSize: 20,
                  color: persona.color,
                }}
              >
                {persona.symbol}
              </span>
              <span
                style={{
                  fontFamily: "Courier New",
                  fontSize: 11,
                  letterSpacing: "0.2em",
                  color: weights[persona.id] > 0 ? "#e8e0d0" : "#555",
                  fontWeight: weights[persona.id] > 0 ? "bold" : "normal",
                  transition: "color 0.2s",
                }}
              >
                {persona.name}
              </span>
            </div>

            {/* Voice */}
            <div
              style={{
                fontFamily: "Courier New",
                fontSize: 9,
                color: weights[persona.id] > 0 ? "#666" : "#2e2e2e",
                fontStyle: "italic",
                lineHeight: 1.4,
                transition: "color 0.2s",
              }}
            >
              {persona.voice}
            </div>

            {/* Slider */}
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={weights[persona.id]}
              onChange={(e) =>
                handleWeightChange(persona.id, Number(e.target.value))
              }
              style={{
                width: "100%",
                height: 2,
                appearance: "none",
                background:
                  weights[persona.id] > 0
                    ? `linear-gradient(to right, ${persona.color} ${weights[persona.id]}%, #222 ${weights[persona.id]}%, #222 100%)`
                    : "#1a1a1a",
                outline: "none",
                cursor: "pointer",
                transition: "background 0.15s",
              }}
            />

            {/* Weight display */}
            <div
              style={{
                textAlign: "right",
                fontFamily: "Courier New",
                fontSize: 10,
                color: weights[persona.id] > 0 ? persona.color : "#333",
              }}
            >
              {weights[persona.id] > 0 ? weights[persona.id] : "—"}
            </div>
          </div>
        ))}
      </div>

      {warning && (
        <div
          style={{
            marginTop: 10,
            fontFamily: "'Courier New', monospace",
            fontSize: 9,
            color: "#ff4444",
            letterSpacing: "0.15em",
          }}
        >
          max 3 personas active
        </div>
      )}
    </div>
  );
}
