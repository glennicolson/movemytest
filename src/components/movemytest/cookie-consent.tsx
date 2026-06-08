"use client";

import { useState, useEffect, useCallback } from "react";

// ── EDITABLE CONFIG ──
// Change this to your GA4 Measurement ID (e.g. "G-ZLF60F38FQ")
const GA_MEASUREMENT_ID = "G-ZLF60F38FQ";

// Set to true to see debug logs in browser console
const DEBUG = true;

// ── TYPES ──
type ConsentState = {
  analytics: boolean;
  accepted: boolean;
};

// ── STORAGE HELPERS ──
const STORAGE_KEY = "cookie-consent-v2";

function getStoredConsent(): ConsentState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ConsentState;
  } catch {
    return null;
  }
}

function storeConsent(state: ConsentState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function clearConsent() {
  localStorage.removeItem(STORAGE_KEY);
}

// ── LOGGING ──
function log(...args: any[]) {
  if (DEBUG) console.log("[CookieConsent]", ...args);
}

// ── GA LOADER ──
function loadGoogleAnalytics(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      log("window undefined — skipping GA load");
      resolve(false);
      return;
    }

    // Already loaded
    if (window.__gaLoaded) {
      log("GA already loaded");
      resolve(true);
      return;
    }

    // Initialise dataLayer and gtag function first
    window.dataLayer = window.dataLayer ?? [];
    window.gtag = function (...args: any[]) {
      (window.dataLayer ?? (window.dataLayer = [])).push(args);
    };

    // Set default consent to denied
    window.gtag("consent", "default", {
      analytics_storage: "denied",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
    });

    log("Creating GA script tag for", GA_MEASUREMENT_ID);

    const script = document.createElement("script");
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    script.async = true;
    script.onload = () => {
      log("GA script loaded successfully");
      window.__gaLoaded = true;

      // Now it's safe to call config
      window.gtag!("js", new Date());
      window.gtag!("config", GA_MEASUREMENT_ID, {
        send_page_view: true,
        cookie_flags: "SameSite=None;Secure",
      });

      log("GA config sent");
      resolve(true);
    };
    script.onerror = () => {
      log("GA script FAILED to load");
      resolve(false);
    };

    document.head.appendChild(script);
  });
}

function grantConsent() {
  if (typeof window === "undefined" || !window.gtag) {
    log("Cannot grant consent — gtag not available");
    return;
  }
  window.gtag("consent", "update", {
    analytics_storage: "granted",
  });
  log("Consent granted for analytics_storage");
}

function denyConsent() {
  if (typeof window === "undefined" || !window.gtag) {
    log("Cannot deny consent — gtag not available");
    return;
  }
  window.gtag("consent", "update", {
    analytics_storage: "denied",
  });
  log("Consent denied for analytics_storage");
}

// ── COMPONENT ──
export function CookieConsentBanner() {
  const [show, setShow] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const stored = getStoredConsent();
    log("Initial consent state:", stored);

    if (!stored) {
      setShow(true);
    } else {
      setLoaded(true);
      if (stored.analytics) {
        loadGoogleAnalytics().then((ok) => {
          if (ok) grantConsent();
        });
      } else {
        denyConsent();
      }
    }
  }, []);

  async function acceptAll() {
    log("User clicked Accept All");
    const state: ConsentState = { analytics: true, accepted: true };
    storeConsent(state);
    setLoaded(true);

    const ok = await loadGoogleAnalytics();
    if (ok) grantConsent();

    setShow(false);
  }

  function acceptEssential() {
    log("User clicked Essential Only");
    const state: ConsentState = { analytics: false, accepted: true };
    storeConsent(state);
    setLoaded(true);
    denyConsent();
    setShow(false);
  }

  function resetConsent() {
    log("Resetting consent");
    clearConsent();
    window.location.reload();
  }

  // Debug panel — visible only in development or when DEBUG is true
  const showDebug = DEBUG && loaded;

  if (!show) {
    return showDebug ? (
      <div className="fixed bottom-0 right-0 z-50 p-2">
        <button
          onClick={resetConsent}
          className="rounded bg-slate-200 px-2 py-1 text-xs text-slate-600 hover:bg-slate-300"
          title="Clear cookie consent and reload"
        >
          🍪 Reset consent
        </button>
      </div>
    ) : null;
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white shadow-lg">
      <div className="mx-auto max-w-7xl px-6 py-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-slate-700">
            <p className="font-semibold text-slate-900">We use cookies</p>
            <p className="mt-1">
              We use essential cookies for the site to function and optional analytics cookies to help us improve MoveMyTest.{" "}
              <a
                href="/cookies-policy"
                className="text-[var(--brand)] underline hover:text-[var(--brand-strong)]"
              >
                Learn more
              </a>
            </p>
            {DEBUG && (
              <p className="mt-1 text-xs text-slate-400">
                GA ID: {GA_MEASUREMENT_ID}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={acceptEssential}
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Essential only
            </button>
            <button
              onClick={acceptAll}
              className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Accept all
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── GLOBAL TYPE EXTENSION ──
// These MUST match the declarations in
// src/lib/cookies/consent-provider.tsx and
// src/components/marketing/google-analytics.tsx. TS doesn't
// allow merging interface Window with conflicting types, so we
// keep them all aligned on `unknown[]` (more type-safe than `any[]`).
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
    __gaLoaded?: boolean;
  }
}
