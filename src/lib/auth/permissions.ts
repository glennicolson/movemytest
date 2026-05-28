import type { AppRole } from "@/lib/auth/roles";

export const permissionCatalog = {
  dashboardView: ["ADMIN", "MANAGER", "OFFICE_STAFF", "TECHNICAL_SUPPORT", "INSTRUCTOR", "LEARNER"],
  crmAccess: ["ADMIN", "MANAGER", "OFFICE_STAFF", "TECHNICAL_SUPPORT"],
  adminWorkspace: ["ADMIN"],
  staffPeopleOperations: ["ADMIN", "MANAGER", "OFFICE_STAFF", "TECHNICAL_SUPPORT"],
  manageOwnMfa: ["ADMIN", "MANAGER", "OFFICE_STAFF", "TECHNICAL_SUPPORT", "INSTRUCTOR", "LEARNER"],
  manageUsers: ["ADMIN"],
  manageScheduling: ["ADMIN"],
  managePayments: ["ADMIN", "MANAGER", "OFFICE_STAFF", "TECHNICAL_SUPPORT"],
  manageCommunications: ["ADMIN"],
  manageContent: ["ADMIN"],
  instructorWorkspace: ["INSTRUCTOR"],
  learnerPortal: ["LEARNER"],
  complianceReports: ["ADMIN"],
} satisfies Record<string, AppRole[]>;

export type PermissionKey = keyof typeof permissionCatalog;

export function hasPermission(role: AppRole, permission: PermissionKey) {
  const allowedRoles = permissionCatalog[permission] as readonly AppRole[];
  return allowedRoles.includes(role);
}
