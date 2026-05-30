"use client";

import { useState, useEffect } from "react";

// Google Analytics Measurement ID
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID || "G-ZLF60F38FQ";

type ConsentState = {
  analytics: boolean;
  accepted: boolean;
};

function getStoredConsent(): ConsentState | null {
  try {
    const raw = localStorage.getItem("cookie-consent");
    if (!raw) return null;
    return JSON.parse(raw) as ConsentState;
  } catch {
    return null;
  }
}

function storeConsent(state: ConsentState) {
  localStorage.setItem("cookie-consent", JSON.stringify(state));
}

function loadGoogleAnalytics() {
  if (typeof window === "undefined") return;
  if (window.gtag) return;

  const script = document.createElement("script");
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  script.async = true;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function (...args: any[]) {
    window.dataLayer.push(args);
  };
  window.gtag("js", new Date());
  window.gtag("config", GA_MEASUREMENT_ID, { anonymize_ip: true });
}

function updateConsent(consent: boolean) {
  if (typeof window === "undefined" || !window.gtag) return;
  window.gtag("consent", "update", {
    analytics_storage: consent ? "granted" : "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
}

export function CookieConsentBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const stored = getStoredConsent();
    if (!stored) {
      setShow(true);
    } else {
      if (stored.analytics) {
        loadGoogleAnalytics();
      }
      updateConsent(stored.analytics);
    }
  }, []);

  function acceptAll() {
    const state: ConsentState = { analytics: true, accepted: true };
    storeConsent(state);
    loadGoogleAnalytics();
    updateConsent(true);
    setShow(false);
  }

  function acceptEssential() {
    const state: ConsentState = { analytics: false, accepted: true };
    storeConsent(state);
    updateConsent(false);
    setShow(false);
  }

  if (!show) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white shadow-lg">
      <div className="mx-auto max-w-7xl px-6 py-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-slate-700">
            <p className="font-semibold text-slate-900">We use cookies</p>
            <p className="mt-1">
              We use essential cookies for the site to function and optional analytics cookies to help us improve MoveMyTest.{" "}
              <a href="/cookies-policy" className="text-[var(--brand)] underline hover:text-[var(--brand-strong)]">
                Learn more
              </a>
            </p>
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

// Extend Window interface for gtag
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}
