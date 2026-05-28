import type { AppRole } from "@/lib/auth/roles";
import { staffRoles } from "@/lib/auth/roles";

export type AuthReason = "auth-required" | "session-expired" | "signed-out";
export type AuthSurfaceKind = "staff" | "learner";

function isSafeInternalPath(value: string) {
  return value.startsWith("/") && !value.startsWith("/");
}

export function sanitizeRedirectTarget(value: string | null | undefined) {
  if (!value) return null;
  if (!isSafeInternalPath(value)) return null;
  return value;
}

export function getLoginPathForTarget(target: string | null | undefined) {
  const safeTarget = sanitizeRedirectTarget(target);
  return safeTarget?.startsWith("/portal") ? "/learner-login" : "/login";
}

export function getDefaultRouteForRole(role: AppRole) {
  switch (role) {
    case "MANAGER":
    case "TECHNICAL_SUPPORT":
    case "OFFICE_STAFF":
      return "/learners";
    case "INSTRUCTOR":
      return "/instructor/dashboard";
    case "LEARNER":
      return "/portal/dashboard";
    default:
      return "/dashboard";
  }
}

const staffRoleSet = new Set<AppRole>(staffRoles);
const staffSelfServicePrefixes = ["/dashboard/security"];
const staffPeopleOperationPrefixes = ["/learners", "/instructors"];
const staffDeniedRedirectPrefixes = ["/portal", "/instructor", "/learner-login"];

function getPathnameOnly(target: string) {
  return target.split(/[?#]/)[0] || "/";
}

function pathMatchesPrefix(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export function canRoleAccessStaffPath(role: AppRole, target: string) {
  if (!staffRoleSet.has(role)) return false;

  const pathname = getPathnameOnly(target);

  if (staffSelfServicePrefixes.some((prefix) => pathMatchesPrefix(pathname, prefix))) {
    return true;
  }

  if (role === "ADMIN") {
    return !staffDeniedRedirectPrefixes.some((prefix) => pathMatchesPrefix(pathname, prefix));
  }

  return staffPeopleOperationPrefixes.some((prefix) => pathMatchesPrefix(pathname, prefix));
}

function canRoleAccessTarget(role: AppRole, target: string) {
  const pathname = getPathnameOnly(target);
  if (role === "LEARNER") return pathMatchesPrefix(pathname, "/portal");
  if (role === "INSTRUCTOR") return pathMatchesPrefix(pathname, "/instructor");
  if (staffRoleSet.has(role)) return canRoleAccessStaffPath(role, target);
  return false;
}

export function resolvePostAuthRedirect(role: AppRole, target: string | null | undefined) {
  const safeTarget = sanitizeRedirectTarget(target);
  if (!safeTarget) return getDefaultRouteForRole(role);
  return canRoleAccessTarget(role, safeTarget) ? safeTarget : getDefaultRouteForRole(role);
}

export function buildLoginRedirect(target: string | null | undefined, reason: AuthReason) {
  const safeTarget = sanitizeRedirectTarget(target);
  const pathname = getLoginPathForTarget(safeTarget);
  const searchParams = new URLSearchParams();
  searchParams.set("reason", reason);
  if (safeTarget) {
    searchParams.set("from", safeTarget);
  }
  const query = searchParams.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export function buildRecoveryHref(basePath: string, from: string | null | undefined) {
  const safeTarget = sanitizeRedirectTarget(from);
  if (!safeTarget) return basePath;
  return `${basePath}?from=${encodeURIComponent(safeTarget)}`;
}

export function getAuthNotice(surface: AuthSurfaceKind, reason: string | null | undefined, from: string | null | undefined) {
  const safeTarget = sanitizeRedirectTarget(from);

  if (reason === "session-expired") {
    return {
      title: "Your session expired",
      message: safeTarget
        ? `Please sign in again to continue to ${safeTarget}.`
        : "Please sign in again to continue.",
    };
  }

  if (reason === "auth-required") {
    return {
      title: surface === "learner" ? "Learner sign-in required" : "Sign-in required",
      message: safeTarget
        ? `Sign in to continue to ${safeTarget}.`
        : "Sign in to continue.",
    };
  }

  if (reason === "signed-out") {
    return {
      title: "Signed out",
      message: safeTarget
        ? `You can sign back in to return to ${safeTarget}.`
        : "You have been signed out safely.",
    };
  }

  return null;
}
