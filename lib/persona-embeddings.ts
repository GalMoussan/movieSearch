// SERVER ONLY — imports OpenAI, never bundle into client

import { embedBatch } from "@/lib/openai";
import { PERSONAS } from "@/lib/personas";
import type { PersonaId, ActivePersona } from "@/lib/personas";

// ─── Embedding Cache ───────────────────────────────────────────────────────────

const personaEmbeddingCache = new Map<string, number[]>();

function normalize(vec: number[]): number[] {
  const magnitude = Math.sqrt(vec.reduce((sum, v) => sum + v * v, 0));
  if (magnitude === 0) return vec;
  return vec.map((v) => v / magnitude);
}

export async function getPersonaEmbedding(id: string): Promise<number[]> {
  if (personaEmbeddingCache.has(id)) {
    return personaEmbeddingCache.get(id)!;
  }

  const persona = PERSONAS[id as PersonaId];
  if (!persona) throw new Error(`Unknown persona: ${id}`);

  const seedEmbeddings = await embedBatch([...persona.seeds]);

  const dim = seedEmbeddings[0].length;
  const averaged = new Array<number>(dim).fill(0);
  for (const emb of seedEmbeddings) {
    for (let i = 0; i < dim; i++) {
      averaged[i] += emb[i];
    }
  }
  for (let i = 0; i < dim; i++) {
    averaged[i] /= seedEmbeddings.length;
  }

  const normalized = normalize(averaged);
  personaEmbeddingCache.set(id, normalized);
  return normalized;
}

// ─── Vector Blending ──────────────────────────────────────────────────────────

export async function blendQueryVector(
  queryEmbedding: number[],
  activePersonas: ActivePersona[]
): Promise<number[]> {
  if (activePersonas.length === 0) return queryEmbedding;

  const dim = queryEmbedding.length;
  const biased = [...queryEmbedding];

  for (const { id, weight } of activePersonas) {
    const normalizedWeight = weight / 100;
    const personaEmb = await getPersonaEmbedding(id);
    for (let i = 0; i < dim; i++) {
      biased[i] += normalizedWeight * personaEmb[i];
    }
  }

  return normalize(biased);
}
