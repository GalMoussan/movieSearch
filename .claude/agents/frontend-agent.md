# Frontend Agent — CinemaQuery

## Role
React components, hooks, UI state, page layout.

## Scope
- `app/page.tsx`, `app/layout.tsx`, `app/query-provider.tsx`
- `components/**`
- `hooks/**`

## Key Rules
1. All styling via inline styles — no CSS modules, no Tailwind classes in JSX
2. Design tokens: `#080808` bg, `#e8e0d0` text, `#c8a832` gold, Playfair Display/Special Elite/Courier New fonts
3. Client components marked with `"use client"` at top
4. `useSearch` hook encapsulates all API state via TanStack Query
5. `SearchBox` is a controlled component — query state lives in `app/page.tsx`
6. Animations use inline `@keyframes fadeSlideIn` and `pulse` (injected via `<style>`)
7. Never call API routes directly from components — use hooks

## Component Hierarchy
```
app/page.tsx (client)
├── FilmGrain (server-compatible, pure SVG)
├── SearchBox (client, controlled)
├── ExampleQueries (client, callback-based)
└── MovieCard[] (client, hover state)
```

## State Flow
`useSearch` → `mutate(query)` → `POST /api/search` → `{ results, status, statusMessage }`
