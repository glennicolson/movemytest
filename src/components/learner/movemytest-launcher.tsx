"use client";

import { useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";

export function MoveMyTestLauncher() {
  const [loading, setLoading] = useState(false);

  async function handleLaunch() {
    setLoading(true);
    try {
      const response = await fetch("/api/movemytest/launch", {
        method: "POST",
        credentials: "same-origin",
      });

      if (response.ok) {
        const data = await response.json();
        window.location.href = data.redirectUrl || "/dashboard";
      } else {
        window.location.href = "/dashboard";
      }
    } catch {
      window.location.href = "/dashboard";
    }
  }

  return (
    <button
      onClick={handleLaunch}
      disabled={loading}
      className="rounded-full bg-[var(--brand)] px-4 py-2 text-xs font-semibold text-white hover:bg-[var(--brand-strong)] transition-colors flex items-center gap-1 disabled:opacity-50"
    >
      {loading ? (
        <>
          <Loader2 className="h-3 w-3 animate-spin" />
          Opening...
        </>
      ) : (
        <>
          Open MoveMyTest
          <ArrowRight className="h-3 w-3" />
        </>
      )}
    </button>
  );
}
