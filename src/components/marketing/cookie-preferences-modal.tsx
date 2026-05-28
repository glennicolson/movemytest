"use client";

import { useState, useEffect } from "react";
import { useCookieConsent } from "@/lib/cookies/consent-provider";

export function CookiePreferencesModal() {
  const { showPreferences, closePreferences, consent, savePreferences } = useCookieConsent();
  const [analytics, setAnalytics] = useState(consent.analytics);

// Keep local toggle state in sync with the actual consent context
// (the modal is always mounted, so useState only initialises once)
  useEffect(() => {
    setAnalytics(consent.analytics);
  }, [consent.analytics]);

  if (!showPreferences) return null;

  const handleSave = () => {
    savePreferences(analytics);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="mx-4 w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8">
        <h2 className="text-lg font-semibold text-slate-900">Cookie preferences</h2>
        <p className="mt-2 text-sm text-slate-600">
          Choose which cookies you allow. Essential cookies are always active as the site cannot function without them.
        </p>

        <div className="mt-6 space-y-4">
          {/* Essential — always on */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900">Essential cookies</p>
                <p className="text-xs text-slate-500">Required for sign-in, security, and site functionality.</p>
              </div>
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700">Always on</span>
            </div>
          </div>

          {/* Analytics — toggle */}
          <div className="rounded-xl border border-slate-200 px-4 py-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900">Analytics cookies</p>
                <p className="text-xs text-slate-500">
                  Help us understand how visitors use the site. Data is anonymised.
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={analytics}
                onClick={() => setAnalytics(!analytics)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  analytics ? "bg-[var(--brand)]" : "bg-slate-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                    analytics ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={closePreferences}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="rounded-lg bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--brand-strong)]"
          >
            Save preferences
          </button>
        </div>
      </div>
    </div>
  );
}