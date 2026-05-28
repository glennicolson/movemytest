"use client";

import { useState, useEffect } from "react";
import { useCookieConsent } from "@/lib/cookies/consent-provider";

export function CookiePreferencesLink() {
  const { openPreferences } = useCookieConsent();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
// Render a placeholder with the same visual to avoid layout shift
    return <span className="text-slate-400">Cookie Preferences</span>;
  }

  return (
    <button
      type="button"
      onClick={openPreferences}
      className="text-slate-400 transition hover:text-[var(--brand-accent)]"
    >
      Cookie Preferences
    </button>
  );
}