"use client";

import { useMutation } from "@tanstack/react-query";
import type { SearchResponse } from "@/types";

async function searchMovies(query: string): Promise<SearchResponse> {
  const res = await fetch("/api/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });

  if (!res.ok) {
    const error = (await res.json().catch(() => ({ error: "Unknown error" }))) as {
      error?: string;
    };
    throw new Error(error.error ?? `Search failed: ${res.status}`);
  }

  return res.json() as Promise<SearchResponse>;
}

export type SearchStatus = "idle" | "searching" | "done" | "error";

export function useSearch() {
  const mutation = useMutation({
    mutationFn: searchMovies,
  });

  const status: SearchStatus = mutation.isPending
    ? "searching"
    : mutation.isSuccess
      ? "done"
      : mutation.isError
        ? "error"
        : "idle";

  const statusMessage =
    status === "searching"
      ? "scanning the archive..."
      : status === "done"
        ? `${mutation.data?.count ?? 0} match${(mutation.data?.count ?? 0) !== 1 ? "es" : ""} found`
        : status === "error"
          ? (mutation.error?.message ?? "something broke in the projection booth.")
          : "";

  return {
    search: mutation.mutate,
    results: mutation.data?.results ?? [],
    status,
    statusMessage,
    error: mutation.error,
    reset: mutation.reset,
  };
}
