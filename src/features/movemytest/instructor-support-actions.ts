"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireMoveMyTestInstructorSession } from "./instructor-session";
import type { MoveMyTestActionState } from "./action-state";

const instructorSupportMessageSchema = z.object({
  detail: z.string().trim().min(10, "Please write at least 10 characters.").max(2000, "Keep your message under 2000 characters."),
  category: z.enum(["INSTRUCTOR_GENERAL", "INSTRUCTOR_MATCH", "INSTRUCTOR_LEARNER_LINK", "INSTRUCTOR_TECHNICAL", "INSTRUCTOR_ACCOUNT"]).default("INSTRUCTOR_GENERAL"),
});

export async function submitInstructorSupportAction(_: MoveMyTestActionState, formData: FormData): Promise<MoveMyTestActionState> {
  const session = await requireMoveMyTestInstructorSession();
  const instructor = await prisma.instructorAccount.findUnique({
    where: { id: session.instructorId },
    select: { id: true, email: true, adiNumber: true, firstName: true, lastName: true },
  });
  if (!instructor) return { status: "error", message: "Instructor account not found." };

  const parsed = instructorSupportMessageSchema.safeParse({
    detail: String(formData.get("detail") ?? ""),
    category: String(formData.get("category") ?? "INSTRUCTOR_GENERAL"),
  });
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0]?.message ?? "Check your message and try again." };

// Store instructor identity in reporterUserId field (VARCHAR, nullable) and
// detail field so staff can identify the sender until reporterInstructorAccountId migration runs.
// Also store instructor email in mobileNumber field so we can query by it.
  await prisma.report.create({
    data: {
      reason: parsed.data.category,
      detail: `[From: ${instructor.firstName} ${instructor.lastName} | ADI: ${instructor.adiNumber} | Email: ${instructor.email}]\n\n${parsed.data.detail}`,
      mobileNumber: instructor.email,// Store email here so we can query instructor tickets
      status: "OPEN",
    },
  });

  revalidatePath("/instructor/dashboard/support");
  revalidatePath("/instructor/dashboard/help");
  return { status: "success", message: "Your support message has been sent. MoveMyTest will respond as soon as possible." };
}

export async function getInstructorSupportTickets() {
  const session = await requireMoveMyTestInstructorSession();
  const instructor = await prisma.instructorAccount.findUniqueOrThrow({
    where: { id: session.instructorId },
    select: { email: true },
  });

// Query by mobileNumber field (which stores instructor email) AND reason starts with INSTRUCTOR_
  const reports = await prisma.report.findMany({
    where: {
      mobileNumber: instructor.email,
      reason: { startsWith: "INSTRUCTOR_" },
    },
    orderBy: [{ createdAt: "desc" }],
    include: {
      responses: { orderBy: { createdAt: "asc" }, include: { author: { select: { email: true } } } },
      reporterMoveMyTestAccount: { select: { email: true } },
      listing: { select: { currentCentre: { select: { name: true } } } },
      match: true,
    },
  });
  return reports;
}
