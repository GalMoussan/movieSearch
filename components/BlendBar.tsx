"use client";

import { PERSONAS } from "@/lib/personas";
import type { ActivePersona } from "@/lib/personas";

interface BlendBarProps {
  active: ActivePersona[];
}

export default function BlendBar({ active }: BlendBarProps) {
  const filtered = active.filter((p) => p.weight > 0);

  if (filtered.length === 0) {
    return (
      <div
        style={{
          height: 4,
          background: "#1a1a1a",
          marginBottom: 20,
          borderRadius: 2,
        }}
      />
    );
  }

  const totalWeight = filtered.reduce((sum, p) => sum + p.weight, 0);

  return (
    <div
      style={{
        height: 4,
        display: "flex",
        marginBottom: 20,
        borderRadius: 2,
        overflow: "hidden",
      }}
    >
      {filtered.map((p) => {
        if (!(p.id in PERSONAS)) return null;
        const persona = PERSONAS[p.id as keyof typeof PERSONAS];
        const pct = (p.weight / totalWeight) * 100;
        return (
          <div
            key={p.id}
            style={{
              width: `${pct}%`,
              background: persona.color,
              transition: "width 0.3s ease",
            }}
          />
        );
      })}
    </div>
  );
}
