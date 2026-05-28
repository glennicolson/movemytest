"use client";

import { useCallback, type AnchorHTMLAttributes, type ReactNode } from "react";
import {
  trackPhoneClick,
  trackSmsClick,
  trackWhatsAppClick,
  trackEmailClick,
  trackCtaClick,
} from "@/lib/analytics/events";

type TrackedLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  children: ReactNode;
  /** Where on the site this link appears (e.g. "hero", "footer", "contact_sidebar") */
  location: string;
  /** Type of tracking — auto-detected from href if not specified */
  trackAs?: "phone" | "sms" | "whatsapp" | "email" | "cta";
};

/**
 * An anchor tag that automatically fires GA4 events on click.
 *
 * Auto-detects the tracking type from the href:
 *   - tel: → phone click
 *   - sms: → SMS click
 *   - wa.me → WhatsApp click
 *   - mailto: → email click
 *   - everything else → CTA click (use trackAs="cta" explicitly)
 */
export function TrackedLink({ children, location, trackAs, href, onClick, ...rest }: TrackedLinkProps) {
  const resolvedTrackAs = trackAs ?? detectTrackType(href);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      switch (resolvedTrackAs) {
        case "phone": {
          const number = href?.replace("tel:", "") ?? "";
          trackPhoneClick(number, location);
          break;
        }
        case "sms": {
          const number = href?.replace("sms:", "").split("?")[0] ?? "";
          trackSmsClick(number, location);
          break;
        }
        case "whatsapp": {
          trackWhatsAppClick(location);
          break;
        }
        case "email": {
          const email = href?.replace("mailto:", "").split("?")[0] ?? "";
          trackEmailClick(email, location);
          break;
        }
        case "cta": {
          trackCtaClick(typeof children === "string" ? children : href ?? "cta", location);
          break;
        }
      }
      onClick?.(e);
    },
    [resolvedTrackAs, href, location, children, onClick],
  );

  return (
    <a href={href} onClick={handleClick} {...rest}>
      {children}
    </a>
  );
}

function detectTrackType(href?: string): TrackedLinkProps["trackAs"] {
  if (!href) return "cta";
  if (href.startsWith("tel:")) return "phone";
  if (href.startsWith("sms:")) return "sms";
  if (href.includes("wa.me")) return "whatsapp";
  if (href.startsWith("mailto:")) return "email";
  return "cta";
}