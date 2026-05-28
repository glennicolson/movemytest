"use client";

import { useMatchAutoRefresh } from "@/hooks/use-match-auto-refresh";

export function MatchPageAutoRefresh({ active }: { active: boolean }) {
  useMatchAutoRefresh({ active });
  return null;
}
