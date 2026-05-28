export const SESSION_COOKIE_NAME = "dtc_session";
export const SESSION_TTL_SECONDS = 60 * 60 * 4; /// 4 hours — reduced from 12h for production security
export const MFA_CHALLENGE_COOKIE_NAME = "dtc_mfa_challenge";
export const MFA_CHALLENGE_TTL_SECONDS = 60 * 10;

/**
 * Roles that must have an active MFA factor before accessing the CRM dashboard.
 * Controlled by MFA_ENFORCE_ROLES env var: comma-separated role list, or "none" to disable.
 * Defaults to empty (no enforcement) for safety — enable explicitly when ready.
 */
function getMfaRequiredRoles(): readonly string[] {
  const envVal = process.env.MFA_ENFORCE_ROLES?.trim();
  if (!envVal || envVal.toLowerCase() === "none" || envVal === "") return [];
  return envVal.split(",").map((r) => r.trim().toUpperCase());
}

export const MFA_REQUIRED_ROLES = getMfaRequiredRoles() as readonly string[];
export type MfaRequiredRole = string;

export function isMfaRequiredRole(role: string): boolean {
  return (MFA_REQUIRED_ROLES as readonly string[]).includes(role);
}

function isTruthyEnvFlag(value: string | undefined) {
  if (!value) return false;
  const normalized = value.trim().toLowerCase();
  return normalized === "1" || normalized === "true" || normalized === "yes" || normalized === "on";
}

export function isDevMfaDisabled() {
  return process.env.NODE_ENV !== "production" && isTruthyEnvFlag(process.env.DEV_DISABLE_MFA);
}
