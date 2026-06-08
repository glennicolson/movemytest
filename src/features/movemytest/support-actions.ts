"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireMoveMyTestSession } from "./session";
import { requirePermission } from "@/lib/auth/guards";
import { sendSupportEmail } from "@/lib/email/support-email";
import { TEST_SWAP_BASE_PATH } from "./constants";
import type { MoveMyTestActionState } from "./action-state";

const supportMessageSchema = z.object({
  detail: z.string().trim().min(10, "Please write at least 10 characters.").max(2000, "Keep your message under 2000 characters."),
  category: z.enum(["GENERAL", "MATCH_HELP", "DVSA_CALL", "TECHNICAL", "ACCOUNT"]).default("GENERAL"),
});

export async function submitMoveMyTestSupportAction(_: MoveMyTestActionState, formData: FormData): Promise<MoveMyTestActionState> {
  const session = await requireMoveMyTestSession();
  const account = await prisma.learnerAccount.findUnique({
    where: { id: session.accountId },
    select: { email: true, mobileNumber: true },
  });
  if (!account) return { status: "error", message: "Account not found." };

  const parsed = supportMessageSchema.safeParse({
    detail: String(formData.get("detail") ?? ""),
    category: String(formData.get("category") ?? "GENERAL"),
  });
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0]?.message ?? "Check your message and try again." };

  const listingId = String(formData.get("listingId") ?? "");
  const matchId = String(formData.get("matchId") ?? "");

  await prisma.report.create({
    data: {
      reporterAccountId: session.accountId,
      reason: parsed.data.category,
      detail: parsed.data.detail,
      status: "OPEN",
      mobileNumber: account.mobileNumber ?? null,
      listingId: listingId || null,
      matchId: matchId || null,
    },
  });

  revalidatePath("/dashboard/support");
  return { status: "success", message: "Your support message has been sent. MoveMyTest will respond as soon as possible." };
}

export async function getLearnerSupportTickets() {
  const session = await requireMoveMyTestSession();
  const reports = await prisma.report.findMany({
    where: { reporterAccountId: session.accountId },
    orderBy: [{ createdAt: "desc" }],
    include: {
      responses: { orderBy: { createdAt: "asc" }, include: { author: { select: { email: true } } } },
      reporter: { select: { email: true, mobileNumber: true } },
      listing: { select: { currentCentre: { select: { name: true } } } },
      match: true,
    },
  });
  const unreadCount = await prisma.learnerNotification.count({
    where: { learnerAccountId: session.accountId, readAt: null },
  });
  return { reports, unreadCount };
}

export async function markNotificationsReadAction() {
  const session = await requireMoveMyTestSession();
  await prisma.learnerNotification.updateMany({
    where: { learnerAccountId: session.accountId, readAt: null },
    data: { readAt: new Date() },
  });
  revalidatePath("/dashboard/support");
}

const adminReplySchema = z.object({
  message: z.string().trim().min(1, "Enter a response.").max(3000, "Keep the response under 3000 characters."),
  channel: z.enum(["PORTAL_REPLY", "EMAIL_SENT", "PHONE_CALL_NOTE"]),
});

export async function adminReplyToReportAction(formData: FormData) {
  const user = await requirePermission("adminWorkspace");
  const reportId = String(formData.get("reportId") ?? "");
  const parsed = adminReplySchema.safeParse({
    message: String(formData.get("message") ?? ""),
    channel: String(formData.get("channel") ?? "PORTAL_REPLY"),
  });
  if (!parsed.success || !reportId) throw new Error("Invalid reply");

  const report = await prisma.report.findUnique({
    where: { id: reportId },
    select: { reporterAccountId: true, status: true, detail: true, reason: true, mobileNumber: true, reporter: { select: { email: true } } },
  });
  if (!report) throw new Error("Report not found");

  const isInstructorTicket = report.reason.startsWith("INSTRUCTOR_");

  const [response] = await prisma.$transaction([
    prisma.reportResponse.create({
      data: {
        reportId,
        authorAccountId: user.userId,
        message: parsed.data.message,
        channel: parsed.data.channel,
      },
    }),
    prisma.report.update({
      where: { id: reportId },
      data: { status: "IN_PROGRESS", updatedAt: new Date() },
    }),
    ...(isInstructorTicket || !report.reporterAccountId
      ? []// No learner notification for instructor or anonymous tickets
      : [prisma.learnerNotification.create({
          data: {
            learnerAccountId: report.reporterAccountId,
            title: `MoveMyTest responded to your ${report.reason.toLowerCase().replaceAll("_", " ")} request`,
            message: parsed.data.message.slice(0, 300),
            relatedReportId: reportId,
          },
        })]),
  ]);

// Send email for non-instructor tickets where reporter email exists
  if (parsed.data.channel === "EMAIL_SENT" && report.reporter?.email) {
    await sendSupportEmail({
      to: report.reporter.email,
      subject: "MoveMyTest Support Response",
      body: `Hello,\n\nDTC has responded to your support request:\n\n"${parsed.data.message}"\n\nYou can also view this response in your MoveMyTest portal under My Support Tickets.\n\nRegards,\nDTC Support Team`,
    });
  } else if (parsed.data.channel === "EMAIL_SENT" && isInstructorTicket && report.mobileNumber) {
// Instructor email is stored in mobileNumber field
    await sendSupportEmail({
      to: report.mobileNumber,
      subject: "MoveMyTest Instructor Support Response",
      body: `Hello,\n\nDTC has responded to your instructor support request:\n\n"${parsed.data.message}"\n\nYou can view this response in your instructor dashboard under Help & Support.\n\nRegards,\nDTC Support Team`,
    });
  }

  revalidatePath("/dashboard/movemytest");
  return response;
}

const updateStatusSchema = z.object({
  status: z.enum(["OPEN", "IN_PROGRESS", "AWAITING_LEARNER", "RESOLVED"]),
});

export async function adminUpdateReportStatusAction(formData: FormData) {
  const user = await requirePermission("adminWorkspace");
  const reportId = String(formData.get("reportId") ?? "");
  const parsed = updateStatusSchema.safeParse({ status: String(formData.get("status") ?? "") });
  if (!parsed.success || !reportId) throw new Error("Invalid status update");

  await prisma.report.update({
    where: { id: reportId },
    data: {
      status: parsed.data.status,
      updatedAt: new Date(),
    },
  });

  revalidatePath("/dashboard/movemytest");
}

export async function adminCloseReportAction(formData: FormData) {
  const user = await requirePermission("adminWorkspace");
  const reportId = String(formData.get("reportId") ?? "");
  const reason = String(formData.get("closeReason") ?? "").trim();
  if (!reportId) throw new Error("Invalid report");

  const report = await prisma.report.findUnique({
    where: { id: reportId },
    select: { reporterAccountId: true, reason: true },
  });

  const isInstructorTicket = report?.reason.startsWith("INSTRUCTOR_") ?? false;

  await prisma.$transaction([
    prisma.report.update({
      where: { id: reportId },
      data: {
        status: "RESOLVED",
        closedAt: new Date(),
        closedReason: reason || null,
        updatedAt: new Date(),
      },
    }),
    ...(isInstructorTicket || !report?.reporterAccountId
      ? []
      : [prisma.learnerNotification.create({
          data: {
            learnerAccountId: report.reporterAccountId,
            title: "Your support request has been resolved",
            message: reason ? `DTC has closed your support request. Reason: ${reason.slice(0, 300)}` : "DTC has closed your support request.",
            relatedReportId: reportId,
          },
        })]),
  ]);

  revalidatePath("/dashboard/movemytest");
}

export async function getAdminSupportTickets() {
  await requirePermission("adminWorkspace");
  const reports = await prisma.report.findMany({
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    take: 100,
    include: {
      reporter: { select: { email: true, mobileNumber: true } },
      responses: { orderBy: { createdAt: "asc" }, include: { author: { select: { email: true } } } },
      listing: { select: { currentCentre: { select: { name: true } } } },
      match: true,
    },
  });
  return reports;
}
