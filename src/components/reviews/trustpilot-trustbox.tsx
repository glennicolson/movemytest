"use client";

import { useEffect, useState } from "react";

// Official Trustpilot credentials
const BUSINESS_UNIT_ID = "6913681e3ef46c785bd324e6";
const PROFILE_URL = "https://uk.trustpilot.com/review/movemytest.co.uk";

type TrustpilotTrustBoxProps = {
  /** TrustBox template ID from Trustpilot Business. Default: Review Collector */
  templateId?: string;
  height?: string;
  theme?: "light" | "dark";
  className?: string;
};

/**
 * Trustpilot TrustBox widget for MoveMyTest.
 * The Trustpilot bootstrap script is loaded globally via the root layout.
 */
export function TrustpilotTrustBox({
  templateId = "56278e9abfbbba0bdcd568bc", // Review Collector
  height = "52px",
  theme = "light",
  className,
}: TrustpilotTrustBoxProps) {
  // Prevent SSR of inner content — Trustpilot script handles rendering client-side.
  // A <a> fallback is not rendered to avoid hydration mismatches with the iframe
  // that Trustpilot injects after page load.
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    // Render an empty placeholder during SSR to avoid hydration mismatch.
    // Trustpilot script will handle rendering client-side after hydration.
    return (
      <div className={className} style={{ height, minHeight: height }} />
    );
  }

  return (
    <div className={className}>
      <div
        className="trustpilot-widget"
        data-locale="en-GB"
        data-template-id={templateId}
        data-businessunit-id={BUSINESS_UNIT_ID}
        data-style-height={height}
        data-style-width="100%"
        data-theme={theme}
        data-review-languages="en"
      >
        <a href={PROFILE_URL} target="_blank" rel="noopener noreferrer">
          Trustpilot
        </a>
      </div>
    </div>
  );
}
