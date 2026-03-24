// ─── Persona Config — CLIENT SAFE (no server imports) ─────────────────────────

export const PERSONAS = {
  wound: {
    id: "wound",
    name: "AGONIZING",
    symbol: "✦",
    color: "#c0302a",
    voice: "Cold. Finds darkness. Speaks to cost.",
    seeds: [
      "films about grief, loss, and unhealing wounds",
      "movies where characters carry trauma they cannot escape",
      "cinema of emotional devastation and quiet suffering",
      "films where love leaves scars and damage lingers",
      "stories of violence and its aftermath on the soul",
    ],
  },
  void: {
    id: "void",
    name: "HOLLOW",
    symbol: "◯",
    color: "#6060aa",
    voice: "Existential. Sparse. Finds absence.",
    seeds: [
      "Bergman Tarkovsky existential slow cinema",
      "films about meaninglessness alienation and the absurd",
      "movies with long silences and metaphysical dread",
      "cinema exploring nothingness and the void of existence",
      "films where characters question the purpose of being alive",
    ],
  },
  fever: {
    id: "fever",
    name: "ART",
    symbol: "◈",
    color: "#9a3a9a",
    voice: "Feverish. Hallucinatory. Reality unravels.",
    seeds: [
      "surrealist hallucinatory fever dream cinema",
      "films where reality dissolves into nightmare",
      "movies with dreamlike logic and unstable reality",
      "psychedelic visionary cinema Lynch Jodorowsky",
      "films about obsession madness and altered states",
    ],
  },
  cynic: {
    id: "cynic",
    name: "CYNIC",
    symbol: "◇",
    color: "#9a9a40",
    voice: "Dry. Unsentimental. Finds the lie.",
    seeds: [
      "cynical noir crime films about moral corruption",
      "satire films exposing hypocrisy and human folly",
      "movies with bleak worldview and dark irony",
      "films about institutions betraying individuals",
      "dry unsentimental portraits of human weakness",
    ],
  },
  prophet: {
    id: "prophet",
    name: "VISIONARY",
    symbol: "△",
    color: "#3a8aaa",
    voice: "Visionary. Mythic. Sees through time.",
    seeds: [
      "epic visionary films with mythological scope",
      "movies about destiny prophecy and larger forces",
      "cinema with biblical scale and spiritual weight",
      "films about civilizations rising and falling",
      "visionary science fiction philosophical epics",
    ],
  },
  tender: {
    id: "tender",
    name: "TENDER",
    symbol: "❧",
    color: "#c87a40",
    voice: "Warm but precise. Takes feeling seriously.",
    seeds: [
      "intimate tender films about human connection",
      "movies that observe small moments with great care",
      "cinema about love friendship and quiet grace",
      "films that find beauty in ordinary human life",
      "gentle humanist portraits of people at their best",
    ],
  },
} as const;

export type PersonaId = keyof typeof PERSONAS;

export interface ActivePersona {
  id: string;
  weight: number; // 0–100
}
