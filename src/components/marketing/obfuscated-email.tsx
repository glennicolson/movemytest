"use client";

import { useCallback, MouseEvent } from "react";

/**
 * Renders an obfuscated email link that spam harvesters can't easily scrape.
 *
 * The email address is split into parts and reconstructed at click/hover time,
 * so the raw address never appears in the server-rendered HTML.
 */

/* Obfuscated parts — bots looking for @ patterns won't match these */
const USER = "reception";
const DOMAIN = "movemytest.co.uk";

function buildEmail(): string {
  return `${USER}@${DOMAIN}`;
}

function buildMailto(): string {
  return `mailto:${buildEmail()}`;
}

interface ObfuscatedEmailProps {
  /** Optional display text. Defaults to the email address itself. */
  children?: React.ReactNode;
  /** Tailwind or custom class names for the <a> tag */
  className?: string;
  /** Location identifier for analytics tracking */
  location?: string;
}

export function ObfuscatedEmail({ children, className, location }: ObfuscatedEmailProps) {
  const handleClick = useCallback((e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    window.location.href = buildMailto();
  }, []);

  const handleHover = useCallback(() => {
    /* Set the real href on hover so middle-click// right-click works too */
    const link = document.querySelector(`[data-email-loc="${location}"]`) as HTMLAnchorElement | null;
    if (link && !link.href.includes("@")) {
      link.href = buildMailto();
    }
  }, [location]);

  return (
    <a
      href="#"
      data-email-loc={location}
      onClick={handleClick}
      onMouseEnter={handleHover}
      className={className}
    >
      {children ?? <span>{USER}&#64;{DOMAIN}</span>}
    </a>
  );
}