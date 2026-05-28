import type { Report, ReportResponse, LearnerAccount } from "@prisma/client";

export type ReportWithDetails = Report & {
  responses: (ReportResponse & { author: { email: string } | null })[];
  reporter: { email: string; mobileNumber: string | null } | null;
  listing: { currentCentre: { name: string } } | null;
  match: { id: string } | null;
};

export type LearnerSupportTicketResponse = {
  reports: ReportWithDetails[];
  unreadCount: number;
};
