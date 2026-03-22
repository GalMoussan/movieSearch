# /build-route — Add a New API Route

## Steps
1. Create `app/api/{name}/route.ts`
2. Add Zod schema to `types/index.ts`
3. Validate input with `schema.safeParse(body)`
4. Use `prisma.$queryRaw` for any vector operations
5. Return consistent envelope: `{ results, query, count }` or `{ data, error }`
6. Add error handling with structured error response

## Template
```typescript
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const Schema = z.object({ /* ... */ });

export async function POST(req: NextRequest) {
  const parsed = Schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  }
  try {
    // ... logic
    return NextResponse.json({ data: result });
  } catch (err) {
    console.error("[/api/{name}]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
```
