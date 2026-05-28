/**
 * Simple in-memory rate limiter for MFA challenge attempts.
 * Limits per-user attempts to prevent brute-force attacks on TOTP codes.
 * 
 * In a production deployment with multiple instances this should be
 * replaced with a Redis-backed or database-backed rate limiter.
 * For a single-instance Hostinger deployment this is adequate.
 */

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 5 * 60 * 1000;// 5 minutes

type AttemptRecord = {
  count: number;
  windowStart: number;
};

const attempts = new Map<string, AttemptRecord>();

// Periodic cleanup to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of attempts.entries()) {
    if (now - record.windowStart > WINDOW_MS * 2) {
      attempts.delete(key);
    }
  }
}, WINDOW_MS);

export function checkMfaRateLimit(userId: string): { allowed: boolean; remainingAttempts: number } {
  const now = Date.now();
  const record = attempts.get(userId);

  if (!record || now - record.windowStart > WINDOW_MS) {
    attempts.set(userId, { count: 1, windowStart: now });
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS - 1 };
  }

  if (record.count >= MAX_ATTEMPTS) {
    return { allowed: false, remainingAttempts: 0 };
  }

  record.count += 1;
  return { allowed: true, remainingAttempts: MAX_ATTEMPTS - record.count };
}

export function resetMfaRateLimit(userId: string) {
  attempts.delete(userId);
}