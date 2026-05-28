export const staffRoles = ["ADMIN", "MANAGER", "OFFICE_STAFF", "TECHNICAL_SUPPORT"] as const;
export const instructorRoles = ["INSTRUCTOR"] as const;
export const learnerRoles = ["LEARNER"] as const;

export const appRoles = [
  ...staffRoles,
  ...instructorRoles,
  ...learnerRoles,
] as const;

export type AppRole = (typeof appRoles)[number];
export type AppSurface = "staff" | "instructor" | "portal" | "public";

export const roleToSurface: Record<AppRole, AppSurface> = {
  ADMIN: "staff",
  MANAGER: "staff",
  OFFICE_STAFF: "staff",
  TECHNICAL_SUPPORT: "staff",
  INSTRUCTOR: "instructor",
  LEARNER: "portal",
};
