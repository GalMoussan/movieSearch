# /build-component — Add a New React Component

## Steps
1. Create `components/{ComponentName}.tsx`
2. Add `"use client"` if it uses hooks or event handlers
3. Use inline styles only — no CSS modules, no Tailwind classes
4. Follow color tokens from `skills/project-conventions.md`
5. Export as default function

## Template
```typescript
"use client";

interface Props {
  // ...
}

export default function ComponentName({ }: Props) {
  return (
    <div style={{ /* inline styles only */ }}>
      {/* ... */}
    </div>
  );
}
```

## Animation Pattern
Global keyframes are defined in `app/page.tsx` via `<style>` tag:
- `fadeSlideIn`: opacity 0→1, translateY 10→0
- `pulse`: opacity 1→0.3→1

Reference in inline style: `animation: "fadeSlideIn 0.4s ease both"`
