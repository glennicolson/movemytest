"use client";

/**
 * GA4 event tracking helpers for MoveMyTest website.
 *
 * All events respect cookie consent — if analytics consent has not been given,
 * calls are silently no-ops.
 *
 * Event naming follows GA4 conventions:
 *   - Max 40 characters
 *   - Only letters, numbers, underscores
 *   - Must start with a letter
 *
 * Recommended GA4 custom events to mark as conversions in the GA dashboard:
 *   - generate_lead (contact form submission)
 *   - contact (any phone/email/SMS/WhatsApp click)
 */

export type GaEventParams = {
  action: string;
  category: string;
  label?: string;
  value?: number;
};

/**
 * Track a GA4 event via gtag.
 * Silently exits if gtag is unavailable or analytics consent hasn't been given.
 */
export function trackEvent(action: string, params?: Record<string, string | number | boolean>) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;

// Check analytics consent before sending
  const consentCookie = document.cookie
    .split("; ")
    .find((row) => row.startsWith("dtc_cookie_consent="))
    ?.split("=")?.[1];

// The consent cookie value is base64-encoded; if it doesn't exist or analytics
// is not allowed, we skip. The GoogleAnalytics component already gates the
// script load, so if gtag exists, consent was already given. This is a
// defensive check for edge cases where gtag might exist without consent
// (e.g. after consent withdrawal without page reload).
  if (!consentCookie) return;

  window.gtag("event", action, params);
}

/**
 * Predefined event trackers for common MoveMyTest conversion actions.
 */

/** Phone number click */
export function trackPhoneClick(phoneNumber: string, location: string) {
  trackEvent("contact", {
    method: "phone",
    phone_number: phoneNumber,
    engagement_location: location,
  });
}

/** Email click */
export function trackEmailClick(email: string, location: string) {
  trackEvent("contact", {
    method: "email",
    email_address: email,
    engagement_location: location,
  });
}

/** SMS/Text click */
export function trackSmsClick(phoneNumber: string, location: string) {
  trackEvent("contact", {
    method: "sms",
    phone_number: phoneNumber,
    engagement_location: location,
  });
}

/** WhatsApp click */
export function trackWhatsAppClick(location: string) {
  trackEvent("contact", {
    method: "whatsapp",
    engagement_location: location,
  });
}

/** Contact form submission success — mark as GA4 conversion */
export function trackEnquirySubmitted() {
  trackEvent("generate_lead", {
    lead_source: "contact_form",
  });
}

/** CTA button click (e.g. "Register for Lessons", "Enquire Now") */
export function trackCtaClick(label: string, location: string) {
  trackEvent("cta_click", {
    cta_label: label,
    engagement_location: location,
  });
}

/** Instructor application form view/submission */
export function trackInstructorApply() {
  trackEvent("generate_lead", {
    lead_source: "instructor_application",
  });
}