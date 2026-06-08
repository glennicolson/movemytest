"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import {
  type CookieConsent,
  type CookieCategory,
  parseConsent,
  buildConsentPayload,
  encodeConsent,
  getConsentCookieName,
  getConsentMaxAge,
  isConsentGiven,
  hasConsented,
  getDefaultConsent,
  toGoogleConsentMode,
  DEFAULT_GOOGLE_CONSENT,
} from "@/lib/cookies/consent";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

function gtagConsentUpdate(consent: CookieConsent) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("consent", "update", toGoogleConsentMode(consent));
  }
}

function gtagConsentDefault() {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("consent", "default", DEFAULT_GOOGLE_CONSENT);
  }
}

interface CookieConsentContextValue {
  consent: CookieConsent;
  hasDecided: boolean;
  acceptAll: () => void;
  rejectNonEssential: () => void;
  savePreferences: (analytics: boolean) => void;
  isCategoryAllowed: (category: CookieCategory) => boolean;
  showPreferences: boolean;
  openPreferences: () => void;
  closePreferences: () => void;
}

const CookieConsentContext = createContext<CookieConsentContextValue | null>(null);

export function useCookieConsent(): CookieConsentContextValue {
  const ctx = useContext(CookieConsentContext);
  if (!ctx) throw new Error("useCookieConsent must be used within CookieConsentProvider");
  return ctx;
}

function setConsentCookie(consent: CookieConsent) {
  document.cookie = `${getConsentCookieName()}=${encodeConsent(consent)}; path=/; max-age=${getConsentMaxAge()}; SameSite=Lax`;
}

const defaultContextValue: CookieConsentContextValue = {
  consent: getDefaultConsent(),
  hasDecided: false,
  acceptAll: () => {},
  rejectNonEssential: () => {},
  savePreferences: () => {},
  isCategoryAllowed: () => false,
  showPreferences: false,
  openPreferences: () => {},
  closePreferences: () => {},
};

export function CookieConsentProvider({ children }: { children: ReactNode }) {
  const [consent, setConsent] = useState<CookieConsent>(getDefaultConsent());
  const [hasDecided, setHasDecided] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const raw = document.cookie
      .split("; ")
      .find((row) => row.startsWith(`${getConsentCookieName()}=`))
      ?.split("=")?.[1];

    const parsed = parseConsent(raw);
    setConsent(parsed);
    setHasDecided(isConsentGiven(parsed));
    setMounted(true);

// Initialise default consent before any tags fire
    gtagConsentDefault();

// If the user has already decided, update consent state
    if (isConsentGiven(parsed)) {
      gtagConsentUpdate(parsed);
    }
  }, []);

  const acceptAll = useCallback(() => {
    const next = buildConsentPayload(true);
    setConsentCookie(next);
    setConsent(next);
    setHasDecided(true);
    setShowPreferences(false);
    gtagConsentUpdate(next);
  }, []);

  const rejectNonEssential = useCallback(() => {
    const next = buildConsentPayload(false);
    setConsentCookie(next);
    setConsent(next);
    setHasDecided(true);
    setShowPreferences(false);
    gtagConsentUpdate(next);
  }, []);

  const savePreferences = useCallback((analytics: boolean) => {
    const next = buildConsentPayload(analytics);
    setConsentCookie(next);
    setConsent(next);
    setHasDecided(true);
    setShowPreferences(false);
    gtagConsentUpdate(next);
  }, []);

  const isCategoryAllowed = useCallback(
    (category: CookieCategory) => {
      if (!mounted) return false;// Don't allow analytics until we've read the cookie
      return hasConsented(consent, category);
    },
    [consent, mounted],
  );

  const openPreferences = useCallback(() => setShowPreferences(true), []);
  const closePreferences = useCallback(() => setShowPreferences(false), []);

// Always provide the context — never remove it from the tree.
// Before mount, use safe defaults (no consent given, analytics off).
  const value: CookieConsentContextValue = mounted
    ? {
        consent,
        hasDecided,
        acceptAll,
        rejectNonEssential,
        savePreferences,
        isCategoryAllowed,
        showPreferences,
        openPreferences,
        closePreferences,
      }
    : defaultContextValue;

  return (
    <CookieConsentContext.Provider value={value}>
      {children}
    </CookieConsentContext.Provider>
  );
}