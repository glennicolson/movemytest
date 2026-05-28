"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Generic fetch wrapper for API calls
async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(error.error || `HTTP ${res.status}`);
  }
  return res.json();
}

// Hook for GET requests with caching
export function useApiQuery<T>(key: string[], url: string, options?: { enabled?: boolean; staleTime?: number }) {
  return useQuery<T>({
    queryKey: key,
    queryFn: () => fetchJson<T>(url),
    enabled: options?.enabled ?? true,
    staleTime: options?.staleTime ?? 60 * 1000,
  });
}

// Hook for POST/PUT/DELETE mutations with automatic cache invalidation
export function useApiMutation<T, V = unknown>(
  mutationKey: string[],
  url: string,
  invalidateKeys?: string[][],
  method: "POST" | "PUT" | "DELETE" | "PATCH" = "POST"
) {
  const queryClient = useQueryClient();

  return useMutation<T, Error, V>({
    mutationKey,
    mutationFn: (variables) =>
      fetchJson<T>(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(variables),
      }),
    onSuccess: () => {
// Invalidate related queries after mutation
      invalidateKeys?.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key });
      });
    },
  });
}

// Prefetch helper for server components
export function prefetchQuery(queryClient: ReturnType<typeof useQueryClient>, key: string[], url: string) {
  return queryClient.prefetchQuery({
    queryKey: key,
    queryFn: () => fetchJson(url),
  });
}
