/**
 * Cookie consent utilities for UK GDPR// PECR compliance.
 *
 * Categories:
 * - essential: always on (session, auth)
 * - analytics: Google Analytics (requires consent)
 *
 * Storage: a single "dtc_cookie_consent" cookie holds the preferences
 * as a JSON string so it's readable on both client and server.
 */

export type CookieCategory = "essential" | "analytics";

export interface CookieConsent {
  essential: true;// always true
  analytics: boolean;
  consentedAt: string | null;// ISO timestamp
}

const CONSENT_COOKIE_NAME = "dtc_cookie_consent";
const CONSENT_COOKIE_MAX_AGE = 365 * 24 * 60 * 60;// 1 year

const DEFAULT_CONSENT: CookieConsent = {
  essential: true,
  analytics: false,
  consentedAt: null,
};

export function getConsentCookieName(): string {
  return CONSENT_COOKIE_NAME;
}

export function getConsentMaxAge(): number {
  return CONSENT_COOKIE_MAX_AGE;
}

export function getDefaultConsent(): CookieConsent {
  return { ...DEFAULT_CONSENT };
}

export function parseConsent(raw: string | undefined): CookieConsent {
  if (!raw) return getDefaultConsent();
  try {
    const parsed = JSON.parse(decodeURIComponent(raw));
    return {
      essential: true,
      analytics: Boolean(parsed.analytics),
      consentedAt: parsed.consentedAt ?? null,
    };
  } catch {
    return getDefaultConsent();
  }
}

export function hasConsented(consent: CookieConsent, category: CookieCategory): boolean {
  if (category === "essential") return true;
  return consent[category] === true;
}

export function isConsentGiven(consent: CookieConsent): boolean {
  return consent.consentedAt !== null;
}

export function buildConsentPayload(analytics: boolean): CookieConsent {
  return {
    essential: true,
    analytics,
    consentedAt: new Date().toISOString(),
  };
}

export function encodeConsent(consent: CookieConsent): string {
  return encodeURIComponent(JSON.stringify(consent));
}

// Google Consent Mode v2 helpers
export type GtagConsentState = "granted" | "denied";

export interface GoogleConsentModeState {
  ad_storage: GtagConsentState;
  ad_user_data: GtagConsentState;
  ad_personalization: GtagConsentState;
  analytics_storage: GtagConsentState;
}

export function toGoogleConsentMode(consent: CookieConsent): GoogleConsentModeState {
  const state: GtagConsentState = consent.analytics ? "granted" : "denied";
  return {
    ad_storage: state,
    ad_user_data: state,
    ad_personalization: state,
    analytics_storage: state,
  };
}

export const DEFAULT_GOOGLE_CONSENT: GoogleConsentModeState = {
  ad_storage: "denied",
  ad_user_data: "denied",
  ad_personalization: "denied",
  analytics_storage: "denied",
};
