import { NextRequest, NextResponse } from "next/server";

// In-memory rate limit store (per-process; resets on cold start)
// Limit: 20 requests per IP per 60-second window
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 20;

const ipMap = new Map<string, { count: number; resetAt: number }>();

export function middleware(req: NextRequest) {
  if (!req.nextUrl.pathname.startsWith("/api/search")) {
    return NextResponse.next();
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";

  const now = Date.now();
  const entry = ipMap.get(ip);

  if (!entry || now > entry.resetAt) {
    ipMap.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return NextResponse.next();
  }

  entry.count += 1;

  if (entry.count > MAX_REQUESTS) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((entry.resetAt - now) / 1000)),
        },
      }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/api/search",
};
