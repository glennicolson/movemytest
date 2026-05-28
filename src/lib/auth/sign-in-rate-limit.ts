/**
 * In-memory rate limiter for sign-in attempts.
 * Prevents credential stuffing and brute-force attacks on the login flow.
 *
 * In a production deployment with multiple instances this should be
 * replaced with a Redis-backed or database-backed rate limiter.
 * For a single-instance Hostinger deployment this is adequate.
 */

const MAX_ATTEMPTS = 10;
const WINDOW_MS = 15 * 60 * 1000;// 15 minutes
const LOCKOUT_MS = 30 * 60 * 1000;// 30-minute lockout after exceeding limit

type AttemptRecord = {
  count: number;
  windowStart: number;
  lockedUntil: number | null;
};

const attempts = new Map<string, AttemptRecord>();

// Periodic cleanup to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of attempts.entries()) {
    if (record.lockedUntil && now > record.lockedUntil) {
      attempts.delete(key);
    } else if (!record.lockedUntil && now - record.windowStart > WINDOW_MS * 2) {
      attempts.delete(key);
    }
  }
}, WINDOW_MS);

export function checkSignInRateLimit(identifier: string): { allowed: boolean; remainingAttempts: number; lockedUntil: number | null } {
  const now = Date.now();
  const record = attempts.get(identifier);

// If locked out, check if lockout has expired
  if (record?.lockedUntil) {
    if (now < record.lockedUntil) {
      return { allowed: false, remainingAttempts: 0, lockedUntil: record.lockedUntil };
    }
// Lockout expired — reset
    attempts.delete(identifier);
  }

// No record or expired window — start fresh
  if (!record || now - record.windowStart > WINDOW_MS) {
    attempts.set(identifier, { count: 1, windowStart: now, lockedUntil: null });
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS - 1, lockedUntil: null };
  }

// Within window and at limit — apply lockout
  if (record.count >= MAX_ATTEMPTS) {
    const lockedUntil = now + LOCKOUT_MS;
    record.lockedUntil = lockedUntil;
    return { allowed: false, remainingAttempts: 0, lockedUntil };
  }

  record.count += 1;
  return { allowed: true, remainingAttempts: MAX_ATTEMPTS - record.count, lockedUntil: null };
}

export function resetSignInRateLimit(identifier: string) {
  attempts.delete(identifier);
}