"use client";

import { useEffect } from "react";
import { useCookieConsent } from "@/lib/cookies/consent-provider";

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * GA4 initialisation.
 *
 * The gtag() function and consent defaults are already defined in the root
 * layout's <head> so that consent mode exists before any Google tag loads.
 *
 * Do not render the config call as a client-side inline <script>: React-added
 * inline script elements are not reliably executed after hydration. Instead,
 * wait until analytics consent is known/granted, then queue the gtag calls
 * imperatively and append the external gtag.js script once.
 */
export function GoogleAnalytics() {
  const { consent, hasDecided } = useCookieConsent();

  useEffect(() => {
    if (
      !GA_MEASUREMENT_ID ||
      !hasDecided ||
      !consent.analytics ||
      typeof window === "undefined" ||
      typeof window.gtag !== "function"
    ) {
      return;
    }

    const scriptId = "dtc-google-analytics";
    const existingScript = document.getElementById(scriptId);

    window.gtag("js", new Date());
    window.gtag("config", GA_MEASUREMENT_ID, {
      anonymize_ip: true,
      cookie_flags: "SameSite=Lax;Secure",
    });

    if (!existingScript) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
      document.head.appendChild(script);
    }
  }, [consent.analytics, hasDecided]);

  return null;
}
