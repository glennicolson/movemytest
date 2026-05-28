import { redirect } from "next/navigation";
import { getDefaultRouteForRole } from "@/lib/auth/navigation";
import { requireSession } from "@/lib/auth/session";
import { hasPermission, type PermissionKey } from "@/lib/auth/permissions";
import type { AppSurface } from "@/lib/auth/roles";

export async function requireSurface(surface: AppSurface) {
  const session = await requireSession();
  if (surface !== "public" && session.surface !== surface) {
    redirect(getDefaultRouteForRole(session.role));
  }
  return session;
}

export async function requirePermission(permission: PermissionKey) {
  const session = await requireSession();
  if (!hasPermission(session.role, permission)) {
    redirect(getDefaultRouteForRole(session.role));
  }
  return session;
}
