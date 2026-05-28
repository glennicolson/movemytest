"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useCookieConsent } from "@/lib/cookies/consent-provider";

export function CookieConsentBanner() {
  const { hasDecided, acceptAll, rejectNonEssential, openPreferences } = useCookieConsent();
  const [visible, setVisible] = useState(false);

// Only show after mount, and only when no decision has been made yet
  useEffect(() => {
    if (!hasDecided) setVisible(true);
  }, [hasDecided]);

  if (hasDecided || !visible) return null;

  return (
    <div className="fixed bottom-16 left-3 right-3 z-50 rounded-2xl border border-slate-200 bg-white shadow-2xl md:bottom-0 md:left-0 md:right-0 md:rounded-none md:border-x-0 md:border-b-0 md:shadow-lg">
      <div className="mx-auto max-w-6xl px-4 py-3 md:px-6 md:py-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="text-sm text-slate-700">
            <p className="md:hidden">
              Cookies help us improve the site. You choose what to allow.
            </p>
            <p className="hidden md:block">
              We use essential cookies to keep the site working and optional analytics cookies to understand how people use our site.{" "}
              <Link href="/cookies" className="font-medium text-[var(--brand)] underline underline-offset-2 hover:text-[var(--brand-strong)]">
                Cookie policy
              </Link>
            </p>
          </div>
          <div className="grid flex-shrink-0 grid-cols-2 gap-2 md:flex md:items-center">
            <button
              type="button"
              onClick={acceptAll}
              className="min-h-11 rounded-lg bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--brand-strong)]"
            >
              Accept
            </button>
            <button
              type="button"
              onClick={openPreferences}
              className="min-h-11 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Manage
            </button>
            <button
              type="button"
              onClick={rejectNonEssential}
              className="col-span-2 min-h-10 rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50 md:col-span-1 md:text-sm md:text-slate-700"
            >
              Reject non-essential
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}