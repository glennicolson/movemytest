"use server";

import { createHash, randomBytes } from "node:crypto";
import nodemailer from "nodemailer";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requirePermission } from "@/lib/auth/guards";
import { getMailboxConfig } from "@/lib/communications/config";
import { appConfig } from "@/lib/config/app";
import { hashPassword } from "@/lib/auth/password";
import { createMoveMyTestSession } from "./session";
import { createMoveMyTestInstructorSession } from "./instructor-session";

function normalizeAdiNumber(value?: string | null) {
  return (value ?? "").trim().toUpperCase().replace(/\s+/g, "");
}

function bridgePasswordSeed() {
  return `crm-bridge-${randomBytes(24).toString("hex")}`;
}

function generateInviteToken() {
  return randomBytes(32).toString("base64url");
}

function hashInviteToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function mailer() {
  const config = getMailboxConfig();
  return nodemailer.createTransport({ host: config.smtpHost, port: config.smtpPort, secure: config.smtpSecure, auth: { user: config.username, pass: config.password } });
}

function htmlBody(body: string) {
  return `<html><body style="font-family:sans-serif;max-width:580px;margin:0 auto;padding:20px;color:#1e293b;line-height:1.6;"><main style="background:#fff;border:1px solid #e2e8f0;border-radius:16px;padding:24px;">${body.replace(/\n{2}/g, '</p><p style="margin:0 0 12px 0;">').replace(/\n/g, "<br>")}</p></main><footer style="margin-top:16px;font-size:12px;color:#94a3b8;"><p>This invite was sent by an instructor using MoveMyTest. Reply to ${appConfig.supportEmail} if you need help.</p></footer></body></html>`;
}

async function sendLearnerInviteEmail(params: { to: string; learnerName?: string | null; instructorName: string; inviteUrl: string }) {
  const config = getMailboxConfig();
  const greeting = params.learnerName ? `Hi ${params.learnerName},` : "Hello,";
  const body = `${greeting}

${params.instructorName} has invited you to use MoveMyTest.

MoveMyTest is separate from the main DTC learner system. It lets you create a free test swap listing and manage possible learner-to-learner matches safely.

Accept your invite here:
${params.inviteUrl}

You will create a MoveMyTest-only learner account. This does not create a DTC driving lesson account.

MoveMyTest is not DVSA, DVLA, DVA, nidirect or GOV.UK. If a compatible match is found, both learners must still complete the official swap by phone with DVSA.

Many thanks,
MoveMyTest Team`;

  await mailer().sendMail({
    from: config.username || appConfig.supportEmail,
    to: params.to,
    subject: `${params.instructorName} invited you to MoveMyTest`,
    text: body,
    html: htmlBody(body),
  });
}

export async function getPendingLearnerInviteForToken(token?: string | null) {
  if (!token) return null;
  const tokenHash = hashInviteToken(token);
  return prisma.learnerInvite.findFirst({
    where: { tokenHash, status: { in: ["PENDING", "SENT", "EMAIL_FAILED"] } },
    select: { learnerName: true, email: true, mobileNumber: true, instructorAdiNumber: true, status: true },
  });
}

export async function ensuremovemytestAccountForCrmUser(userId: string) {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId }, include: { learnerProfile: true } });
  const existingByCrm = await prisma.learnerAccount.findUnique({ where: { crmUserId: user.id } });
  if (existingByCrm) return existingByCrm;

  const existingByEmail = await prisma.learnerAccount.findUnique({ where: { email: user.email } });
  if (existingByEmail) {
    return prisma.learnerAccount.update({ where: { id: existingByEmail.id }, data: { crmUserId: user.id } });
  }

  const now = new Date();
  const account = await prisma.learnerAccount.create({
    data: {
      crmUserId: user.id,
      email: user.email,
      mobileNumber: user.phone ?? user.learnerProfile?.homePhone ?? null,
      passwordHash: await hashPassword(bridgePasswordSeed()),
      termsAcceptedAt: now,
      privacyAcceptedAt: now,
      officialProcessAcknowledgedAt: now,
      accountSetupCompletedAt: user.phone || user.learnerProfile?.homePhone ? now : null,
      emailVerifiedAt: now,
      lastLoginAt: now,
    },
  });

  await prisma.learnerInvite.updateMany({
    where: { email: user.email, claimedByAccountId: null },
    data: { claimedByAccountId: account.id, claimedAt: now, status: "CLAIMED" },
  });
  return account;
}

export async function ensureinstructorAccountForCrmInstructor(instructorProfileId: string) {
  const instructor = await prisma.instructorProfile.findUniqueOrThrow({ where: { id: instructorProfileId }, include: { user: true } });
  const adiNumber = normalizeAdiNumber(instructor.adiNumber);
  if (!adiNumber) throw new Error("Instructor ADI number is required before linking MoveMyTest.");

  const existingByCrm = await prisma.instructorAccount.findUnique({ where: { crmInstructorProfileId: instructor.id } });
  if (existingByCrm) return existingByCrm;

  const existingByAdiOrEmail = await prisma.instructorAccount.findFirst({ where: { OR: [{ adiNumber }, { email: instructor.user.email }] } });
  if (existingByAdiOrEmail) {
    const account = await prisma.instructorAccount.update({
      where: { id: existingByAdiOrEmail.id },
      data: { crmInstructorProfileId: instructor.id },
    });
    await prisma.listingInstructor.updateMany({ where: { adiNumber, instructorAccountId: null }, data: { instructorAccountId: account.id } });
    return account;
  }

  const account = await prisma.instructorAccount.create({
    data: {
      crmInstructorProfileId: instructor.id,
      adiNumber,
      firstName: instructor.user.firstName,
      lastName: instructor.user.lastName,
      email: instructor.user.email,
      mobileNumber: instructor.user.phone,
      passwordHash: await hashPassword(bridgePasswordSeed()),
      emailVerifiedAt: new Date(),
      lastLoginAt: new Date(),
    },
  });
  await prisma.listingInstructor.updateMany({ where: { adiNumber, instructorAccountId: null }, data: { instructorAccountId: account.id } });
  return account;
}

export async function openCrmLearnerMoveMyTestAction() {
  const session = await requirePermission("learnerPortal");
  const account = await ensuremovemytestAccountForCrmUser(session.userId);
  await createMoveMyTestSession(account);
  redirect("/dashboard");
}

export async function openCrmInstructorMoveMyTestAction() {
  const session = await requirePermission("instructorWorkspace");
  const instructor = await prisma.instructorProfile.findFirstOrThrow({ where: { user: { email: session.email } } });
  const adiNumber = normalizeAdiNumber(instructor.adiNumber);
  if (!adiNumber) redirect("/instructor/dashboard?movemytestInvite=missing-adi#movemytest" as never);

  const account = await ensureinstructorAccountForCrmInstructor(instructor.id);
  await createMoveMyTestInstructorSession(account);
  redirect("/instructor/dashboard" as never);
}

const learnerInviteSchema = z.object({
  learnerName: z.string().trim().max(120).optional(),
  email: z.string().trim().toLowerCase().email("Enter a valid learner email."),
  mobileNumber: z.string().trim().max(30).optional(),
});

export async function inviteNonDtcLearnerToMoveMyTestAction(formData: FormData) {
  const session = await requirePermission("instructorWorkspace");
  const instructor = await prisma.instructorProfile.findFirstOrThrow({ where: { user: { email: session.email } }, include: { user: true } });
  const adiNumber = normalizeAdiNumber(instructor.adiNumber);
  if (!adiNumber) redirect("/instructor/dashboard?movemytestInvite=missing-adi#movemytest" as never);

  const parsed = learnerInviteSchema.safeParse({
    learnerName: String(formData.get("learnerName") ?? "") || undefined,
    email: String(formData.get("email") ?? ""),
    mobileNumber: String(formData.get("mobileNumber") ?? "") || undefined,
  });
  if (!parsed.success) redirect("/instructor/dashboard?movemytestInvite=invalid#movemytest" as never);

  const account = await ensureinstructorAccountForCrmInstructor(instructor.id);
  const existingLearner = await prisma.learnerAccount.findUnique({ where: { email: parsed.data.email } });

  const now = new Date();
  const inviteToken = generateInviteToken();
  const inviteUrl = `${appConfig.publicAppUrl}/movemytest/register?invite=${encodeURIComponent(inviteToken)}`;
  const invite = await prisma.learnerInvite.create({
    data: {
      invitedByUserId: session.userId,
      invitedByInstructorProfileId: instructor.id,
      invitedByInstructorAccountId: account.id,
      claimedByAccountId: existingLearner?.id ?? null,
      learnerName: parsed.data.learnerName?.trim() || null,
      email: parsed.data.email,
      mobileNumber: parsed.data.mobileNumber?.trim() || null,
      instructorAdiNumber: adiNumber,
      tokenHash: existingLearner ? null : hashInviteToken(inviteToken),
      status: existingLearner ? "CLAIMED" : "PENDING",
      claimedAt: existingLearner ? now : null,
    },
  });

  if (!existingLearner) {
    try {
      await sendLearnerInviteEmail({
        to: parsed.data.email,
        learnerName: parsed.data.learnerName?.trim() || null,
        instructorName: `${instructor.user.firstName} ${instructor.user.lastName}`.trim() || "Your instructor",
        inviteUrl,
      });
      await prisma.learnerInvite.update({ where: { id: invite.id }, data: { status: "SENT", inviteSentAt: new Date(), inviteError: null } });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      await prisma.learnerInvite.update({ where: { id: invite.id }, data: { status: "EMAIL_FAILED", inviteError: message.slice(0, 1000) } });
    }
  }

  revalidatePath("/instructor/dashboard");
  revalidatePath("/dashboard/movemytest");

  const statusParam = existingLearner ? "existing" : `sent&invitee=${encodeURIComponent(parsed.data.email)}`;
  redirect(`/instructor/dashboard?movemytestInvite=${statusParam}#movemytest` as never);
}
