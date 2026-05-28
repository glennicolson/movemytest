"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Auto-refreshes the page every `intervalMs` while the match is in an active state.
 * Calls router.refresh() to re-fetch server components without losing client state.
 * Stops when the component unmounts.
 */
export function useMatchAutoRefresh({
  active,
  intervalMs = 10000,
}: {
  active: boolean;
  intervalMs?: number;
}) {
  const router = useRouter();

  useEffect(() => {
    if (!active) return;

    const timer = setInterval(() => {
      router.refresh();
    }, intervalMs);

    return () => clearInterval(timer);
  }, [active, intervalMs, router]);
}
