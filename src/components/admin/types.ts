// Convenience re-export of admin types for components
export type {
  AdminLearner as Learner,
  AdminListing as Listing,
  AdminMatch as Match,
  AdminReport as Report,
  AdminInstructor as Instructor,
  AdminAuditLog as AuditLog,
  AdminEmail as Email,
  AdminNote as Note,
  AdminCentre as Centre,
  ListingStatusCount,
  MatchStatusCount,
} from "@/features/admin/types";

// Dashboard data bundle
export interface AdminDashboardData {
  listingCounts: { status: string; _count: { _all: number } }[];
  matchCounts: { status: string; _count: { _all: number } }[];
  openReportCount: number;
  pendingEmailCount: number;
  learnerAccountCount: number;
  instructorAccountCount: number;
  learnerAccounts: import("@/features/admin/types").AdminLearner[];
  listings: import("@/features/admin/types").AdminListing[];
  matches: import("@/features/admin/types").AdminMatch[];
  reports: import("@/features/admin/types").AdminReport[];
  instructors: import("@/features/admin/types").AdminInstructor[];
  auditLogs: import("@/features/admin/types").AdminAuditLog[];
  emailQueue: import("@/features/admin/types").AdminEmail[];
  adminNotes: import("@/features/admin/types").AdminNote[];
  centres: import("@/features/admin/types").AdminCentre[];
}
