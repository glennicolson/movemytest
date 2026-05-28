// Business day calculations for MoveMyTest match expiry.
// Business days = Monday–Friday (skip weekends).
// DVSA phone hours are Mon–Fri 8am–5pm, so business days align.

function isWeekend(date: Date) {
  const day = date.getUTCDay();
  return day === 0 || day === 6;
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

/**
 * Add N business days to a date.
 * Example: Monday + 2 business days = Wednesday.
 * Friday + 2 business days = Tuesday (skips weekend).
 */
export function addBusinessDays(from: Date, businessDays: number): Date {
  let cursor = new Date(from);
  let remaining = businessDays;

  while (remaining > 0) {
    cursor = addDays(cursor, 1);
    if (!isWeekend(cursor)) {
      remaining--;
    }
  }

  return cursor;
}

/**
 * Calculate match expiry: 2 business days from creation.
 * Preserves the time-of-day from the creation date.
 */
export function calculateMatchExpiry(createdAt: Date): Date {
  return addBusinessDays(createdAt, 2);
}

/**
 * Check if a match has expired based on 2-business-day window.
 */
export function hasMatchExpired(expiresAt: Date | null, now = new Date()): boolean {
  return Boolean(expiresAt && expiresAt.getTime() <= now.getTime());
}

/**
 * Format remaining business days/time for display.
 */
export function formatMatchExpiryRemaining(expiresAt: Date | null, now = new Date()): string | null {
  if (!expiresAt) return null;
  const diff = Math.ceil((expiresAt.getTime() - now.getTime()) / 60000);
  if (diff <= 0) return "Expired";

  const days = Math.floor(diff / (24 * 60));
  const hours = Math.floor((diff % (24 * 60)) / 60);
  const mins = diff % 60;
  const parts: string[] = [];
  if (days) parts.push(`${days} business day${days > 1 ? "s" : ""}`);
  if (hours || days) parts.push(`${hours}h`);
  parts.push(`${mins}m`);
  return parts.join(" ");
}
