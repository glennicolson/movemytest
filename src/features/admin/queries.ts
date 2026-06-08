"use server";

import { prisma } from "@/lib/db/prisma";
import type {
  AdminLearner,
  AdminListing,
  AdminMatch,
  AdminReport,
  AdminInstructor,
  AdminAuditLog,
  AdminEmail,
  AdminNote,
  AdminCentre,
} from "./types";

export type ListingStatusCount = { status: string; _count: { _all: number } };
export type MatchStatusCount = { status: string; _count: { _all: number } };

export async function getAdminDashboardData(): Promise<{
  listingCounts: ListingStatusCount[];
  matchCounts: MatchStatusCount[];
  openReportCount: number;
  pendingEmailCount: number;
  learnerAccountCount: number;
  instructorAccountCount: number;
  learnerAccounts: AdminLearner[];
  listings: AdminListing[];
  matches: AdminMatch[];
  reports: AdminReport[];
  instructors: AdminInstructor[];
  auditLogs: AdminAuditLog[];
  emailQueue: AdminEmail[];
  adminNotes: AdminNote[];
  centres: AdminCentre[];
}> {
  const now = new Date();

  // Expire all overdue PROPOSED matches
  await prisma.match.updateMany({
    where: { status: "PROPOSED", expiresAt: { lt: now } },
    data: {
      status: "EXPIRED",
      cancelledAt: now,
      cancelReason: "Match expired after 2 business days with no acceptance.",
    },
  }).catch(() => null);

  const [
    listingCounts,
    matchCounts,
    openReportCount,
    pendingEmailCount,
    learnerAccountCount,
    instructorAccountCount,
    learnerAccounts,
    listings,
    matches,
    reports,
    instructors,
    auditLogs,
    emailQueue,
    adminNotes,
    centres,
  ] = await Promise.all([
    // Listing counts by status
    // Cast around the Prisma groupBy strict union: the result type is
    // { by: 'status'; _count: { _all: number } }[] in practice; the
    // library types include the array methods on the return which
    // doesn't match a TS groupBy return shape. This is a known Prisma
    // typing quirk; the cast is safe at runtime.
    (prisma.listing.groupBy as unknown as (args: unknown) => Promise<ListingStatusCount[]>)(
      { by: ["status"], _count: { _all: true } }
    ),

    // Match counts by status
    (prisma.match.groupBy as unknown as (args: unknown) => Promise<MatchStatusCount[]>)(
      { by: ["status"], _count: { _all: true } }
    ),

    // Open reports
    prisma.report.count({ where: { status: "OPEN" } }),

    // Pending emails
    prisma.emailQueue.count({ where: { status: "PENDING" } }),

    // Total learner accounts
    prisma.learnerAccount.count(),

    // Total instructor accounts
    prisma.instructorAccount.count(),

    // Recent learner accounts
    prisma.learnerAccount.findMany({
      take: 60,
      orderBy: { updatedAt: "desc" },
      include: {
        listings: {
          take: 5,
          orderBy: { createdAt: "desc" },
          select: { id: true, status: true, currentCentre: { select: { name: true } } },
        },
        reports: {
          take: 3,
          orderBy: { createdAt: "desc" },
          select: { id: true, status: true },
        },
      },
    }),

    // Recent listings
    prisma.listing.findMany({
      take: 60,
      orderBy: { createdAt: "desc" },
      include: {
        account: {
          select: { id: true, email: true, mobileNumber: true, accountSetupCompletedAt: true },
        },
        currentCentre: { select: { name: true } },
        originalCentre: { select: { name: true } },
        instructorDetails: {
          include: {
            instructorAccount: { select: { id: true } },
            availabilityDecisions: {
              orderBy: { decidedAt: "desc" },
              take: 5,
              select: { id: true, status: true, slotType: true, matchId: true, decidedAt: true },
            },
          },
        },
      },
    }),

    // Recent matches
    prisma.match.findMany({
      take: 60,
      orderBy: { updatedAt: "desc" },
      include: {
        listingA: {
          include: {
            currentCentre: { select: { name: true } },
            account: { select: { email: true } },
            instructorDetails: {
              select: { firstName: true, lastName: true, adiNumber: true },
            },
          },
        },
        listingB: {
          include: {
            currentCentre: { select: { name: true } },
            account: { select: { email: true } },
            instructorDetails: {
              select: { firstName: true, lastName: true, adiNumber: true },
            },
          },
        },
        secrets: {
          select: { id: true, ownerAccountId: true, revealedAt: true, expiresAt: true, deletedAt: true, createdAt: true },
        },
        events: { orderBy: { createdAt: "desc" }, take: 5, select: { id: true } },
        instructorAvailabilityDecisions: {
          orderBy: { decidedAt: "desc" },
          take: 6,
          include: {
            instructorAccount: { select: { firstName: true, lastName: true } },
          },
        },
      },
    }),

    // Recent reports
    prisma.report.findMany({
      take: 50,
      orderBy: { createdAt: "desc" },
      include: {
        reporter: { select: { email: true } },
        listing: {
          select: { currentCentre: { select: { name: true } } },
        },
        match: { select: { id: true } },
        responses: {
          orderBy: { createdAt: "asc" },
          select: { id: true, message: true, channel: true, createdAt: true },
        },
      },
    }),

    // Recent instructors
    prisma.instructorAccount.findMany({
      take: 60,
      orderBy: { updatedAt: "desc" },
      include: {
        listingLinks: {
          take: 8,
          orderBy: { updatedAt: "desc" },
          include: {
            listing: {
              select: {
                currentCentre: { select: { name: true } },
                account: { select: { email: true } },
              },
            },
            availabilityDecisions: {
              orderBy: { decidedAt: "desc" },
              take: 3,
              select: { status: true },
            },
          },
        },
        invites: {
          orderBy: { createdAt: "desc" },
          take: 3,
          select: { id: true, status: true },
        },
      },
    }),

    // Recent audit logs
    prisma.instructorAuditLog.findMany({
      take: 60,
      orderBy: { createdAt: "desc" },
      include: {
        instructorAccount: {
          select: { firstName: true, lastName: true, adiNumber: true },
        },
        listingInstructor: {
          include: {
            listing: {
              select: {
                currentCentre: { select: { name: true } },
                account: { select: { email: true } },
              },
            },
          },
        },
      },
    }),

    // Email queue
    prisma.emailQueue.findMany({
      take: 100,
      orderBy: [{ updatedAt: "desc" }],
    }),

    // Admin notes
    prisma.adminNote.findMany({
      take: 25,
      orderBy: { createdAt: "desc" },
    }),

    // Recent centres
    prisma.testCentre.findMany({
      orderBy: [{ updatedAt: "desc" }],
      take: 16,
      select: { id: true, name: true, slug: true, region: true, updatedAt: true },
    }),
  ]);

  return {
    listingCounts,
    matchCounts,
    openReportCount,
    pendingEmailCount,
    learnerAccountCount,
    instructorAccountCount,
    learnerAccounts: learnerAccounts as unknown as AdminLearner[],
    listings: listings as unknown as AdminListing[],
    matches: matches as unknown as AdminMatch[],
    reports: reports as unknown as AdminReport[],
    instructors: instructors as unknown as AdminInstructor[],
    auditLogs: auditLogs as unknown as AdminAuditLog[],
    emailQueue: emailQueue as unknown as AdminEmail[],
    adminNotes: adminNotes as unknown as AdminNote[],
    centres: centres as unknown as AdminCentre[],
  };
}
