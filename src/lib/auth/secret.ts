/**
 * Centralised secret resolution.
 *
 * Reads from any of the named environment variables (in order). If none are set
 * AND we are in production, throws — never falls back to a known string. In
 * development, logs a warning and returns a hard-coded dev fallback so the app
 * still boots without a full .env.
 *
 * Every place that previously inlined `process.env.X || "dev-fallback"` should
 * call this helper instead.
 */
export function getSecret(name: string, envKeys: string[], options: { devFallback?: string; minLength?: number } = {}): string {
  const { devFallback, minLength } = options;
  const value = envKeys
    .map((key) => process.env[key])
    .find((candidate): candidate is string => typeof candidate === "string" && candidate.length > 0);

  if (value) {
    if (minLength && value.length < minLength) {
      throw new Error(
        `${name} is set but shorter than the required ${minLength} characters. ` +
        `Rotate the secret to a strong random value.`
      );
    }
    return value;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      `${name} is required in production. Set one of: ${envKeys.join(", ")}. ` +
      `The dev fallback is intentionally not used in production.`
    );
  }

  // Development path: warn loudly and use the dev fallback if provided.
  const fallback = devFallback ?? "insecure-dev-fallback";
  console.warn(
    `⚠️ ${name} is not set. Using insecure dev fallback. ` +
    `Set one of (${envKeys.join(", ")}) before deploying.`,
  );
  return fallback;
}
