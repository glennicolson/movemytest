"use server";

import { createHash, randomBytes } from "node:crypto";
import nodemailer from "nodemailer";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { createSessionCookieValue } from "@/lib/auth/session";
import { SESSION_COOKIE_NAME, SESSION_TTL_SECONDS } from "@/lib/auth/constants";
import { createMoveMyTestInstructorSession } from "./instructor-session";
import { requireMoveMyTestInstructorSession, TEST_SWAP_INSTRUCTOR_SESSION_COOKIE } from "./instructor-session";
import { requireReadyMoveMyTestSession } from "./session";
import { getMailboxConfig } from "@/lib/communications/config";
import { appConfig } from "@/lib/config/app";
import { ensureinstructorAccountForCrmInstructor } from "./crm-bridge";
import type { PasswordResetEmailRequestActionState } from "@/lib/auth/form-state";

function generateInviteToken() {
  return randomBytes(32).toString("base64url");
}

function hashInviteToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function htmlBody(body: string) {
  return `<html><body style="font-family:sans-serif;max-width:580px;margin:0 auto;padding:20px;color:#1e293b;line-height:1.6;"><main style="background:#fff;border:1px solid #e2e8f0;border-radius:16px;padding:24px;">${body.replace(/\n{2}/g, '</p><p style="margin:0 0 12px 0;">').replace(/\n/g, "<br>")}</p></main><footer style="margin-top:16px;font-size:12px;color:#94a3b8;"><p>This invite was sent by an instructor using MoveMyTest. Reply to ${appConfig.supportEmail} if you need help.</p></footer></body></html>`;
}

async function sendLearnerInviteEmail(params: { to: string; learnerName?: string | null; instructorName: string; inviteUrl: string }) {
  const config = getMailboxConfig();
  const greeting = params.learnerName ? `Hi ${params.learnerName},` : "Hello,";
  const lines = [
    greeting,
    "",
    `${params.instructorName} has invited you to use MoveMyTest.`,
    "",
    "MoveMyTest is separate from the main DTC learner system. It lets you create a free test swap listing and manage possible learner-to-learner matches safely.",
    "",
    `Accept your invite here: ${params.inviteUrl}`,
    "",
    "You will create a MoveMyTest-only learner account. This does not create a DTC driving lesson account.",
    "",
    "MoveMyTest is not DVSA, DVLA, DVA, nidirect or GOV.UK. If a compatible match is found, both learners must still complete the official swap by phone with DVSA.",
    "",
    "Many thanks,",
    "MoveMyTest Team",
  ];
  const body = lines.join("\n");

  await nodemailer.createTransport({
    host: config.smtpHost, port: config.smtpPort, secure: config.smtpSecure,
    auth: { user: config.username, pass: config.password },
  }).sendMail({
    from: config.username || appConfig.supportEmail,
    to: params.to,
    subject: `${params.instructorName} invited you to MoveMyTest`,
    text: body,
    html: htmlBody(body),
  });
}

export type MoveMyTestInstructorLookupState =
  | { status: "idle" }
  | { status: "found"; assignedInstructor: { firstName: string; lastName: string; email: string; mobileNumber: string | null; adiNumber: string } }
  | { status: "not_found"; message: string }
  | { status: "error"; message: string };

export type MoveMyTestInstructorRegistrationLookupState =
  | { status: "idle" }
  | { status: "found"; assignedInstructor: { firstName: string; lastName: string; email: string; mobileNumber: string | null; adiNumber: string }; message: string }
  | { status: "already_registered"; message: string }
  | { status: "not_found"; message: string }
  | { status: "error"; message: string };

export type MoveMyTestInstructorAuthState = { status: "idle" | "error" | "success"; message?: string };

function normalizeAdiNumber(value: string) {
  return value.trim().toUpperCase().replace(/\s+/g, "");
}

const lookupSchema = z.object({ adiNumber: z.string().trim().min(3, "Enter the ADI number.").max(30) });

export async function lookupMoveMyTestInstructorByAdiAction(_: MoveMyTestInstructorLookupState, formData: FormData): Promise<MoveMyTestInstructorLookupState> {
  await requireReadyMoveMyTestSession("/start");
  const parsed = lookupSchema.safeParse({ adiNumber: String(formData.get("instructorAdiNumber") ?? "") });
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0]?.message ?? "Enter the ADI number." };

  const adiNumber = normalizeAdiNumber(parsed.data.adiNumber);
  const instructor = await prisma.instructorAccount.findFirst({
    where: { adiNumber, status: "ACTIVE" },
    select: { firstName: true, lastName: true, email: true, mobileNumber: true, adiNumber: true },
  });

  if (!instructor) return { status: "not_found", message: "No registered MoveMyTest instructor was found for that ADI number. You can enter the details manually and we’ll invite them to register." };
  return { status: "found", assignedInstructor: instructor };
}

export async function lookupMoveMyTestInstructorRegistrationPrefillAction(_: MoveMyTestInstructorRegistrationLookupState, formData: FormData): Promise<MoveMyTestInstructorRegistrationLookupState> {
  const parsed = lookupSchema.safeParse({ adiNumber: String(formData.get("adiNumber") ?? "") });
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0]?.message ?? "Enter the ADI number." };

  const adiNumber = normalizeAdiNumber(parsed.data.adiNumber);
  const existingAccount = await prisma.instructorAccount.findFirst({
    where: { adiNumber, status: { in: ["ACTIVE", "PENDING"] } },
    select: { email: true, status: true },
  });
  if (existingAccount?.status === "ACTIVE") {
    return { status: "already_registered", message: "An instructor account already exists for that ADI number. Use instructor login instead." };
  }
  if (existingAccount?.status === "PENDING") {
    return { status: "already_registered", message: "A registration for that ADI number is pending email verification. Check your inbox or contact DTC for help." };
  }

// Look up learner-provided instructor records (unclaimed) to prefill the form
  const unclaimedLink = await prisma.listingInstructor.findFirst({
    where: { adiNumber, instructorAccountId: null },
    select: { firstName: true, lastName: true, email: true, mobileNumber: true },
  });

  if (unclaimedLink) {
    return {
      status: "found",
      assignedInstructor: { firstName: unclaimedLink.firstName || "", lastName: unclaimedLink.lastName || "", email: unclaimedLink.email || "", mobileNumber: unclaimedLink.mobileNumber, adiNumber },
      message: "We found learner-provided details for this ADI number. Please review and correct if needed.",
    };
  }

  return { status: "not_found", message: "No learner-provided details were found for that ADI number. You can still register — fill in all fields below." };
}

const registrationSchema = z.object({
  adiNumber: z.string().trim().min(3, "Enter your ADI number.").max(30),
  firstName: z.string().trim().min(1, "Enter your first name.").max(80),
  lastName: z.string().trim().min(1, "Enter your last name.").max(80),
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  mobileNumber: z.string().trim().min(7, "Enter your mobile number.").max(30),
  password: z.string().min(8, "Password must be at least 8 characters."),
  confirmPassword: z.string(),
}).refine((val) => val.password === val.confirmPassword, { message: "Passwords do not match.", path: ["confirmPassword"] });

function hashVerificationToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

async function sendInstructorVerificationEmail(params: { to: string; firstName: string; verifyUrl: string }) {
  const config = getMailboxConfig();
  await nodemailer.createTransport({
    host: config.smtpHost, port: config.smtpPort, secure: config.smtpSecure,
    auth: { user: config.username, pass: config.password },
  }).sendMail({
    from: config.username || appConfig.supportEmail,
    to: params.to,
    subject: "Verify your MoveMyTest instructor email",
    text: `Hi ${params.firstName},\n\nPlease verify your email address to activate your MoveMyTest instructor account.\n\nVerify your email: ${params.verifyUrl}\n\nThis link expires in 24 hours. If you did not create this account, ignore this email.\n\nMoveMyTest Team`,
    html: `<html><body style="font-family:sans-serif;max-width:580px;margin:0 auto;padding:20px;color:#1e293b;line-height:1.6;"><main style="background:#fff;border:1px solid #e2e8f0;border-radius:16px;padding:24px;"><p>Hi ${params.firstName},</p><p>Please verify your email address to activate your MoveMyTest instructor account.</p><p><a href="${params.verifyUrl}" style="display:inline-block;background:#111;color:#fff;padding:12px 24px;border-radius:9999px;text-decoration:none;font-weight:600;">Verify your email</a></p><p style="margin-top:16px;">This link expires in 24 hours. If you did not create this account, ignore this email.</p></main><footer style="margin-top:16px;font-size:12px;color:#94a3b8;"><p>MoveMyTest Team</p></footer></body></html>`,
  });
}

export async function registerMoveMyTestInstructorAction(_: MoveMyTestInstructorAuthState, formData: FormData): Promise<MoveMyTestInstructorAuthState> {
  const parsed = registrationSchema.safeParse({
    adiNumber: String(formData.get("adiNumber") ?? ""),
    firstName: String(formData.get("firstName") ?? ""),
    lastName: String(formData.get("lastName") ?? ""),
    email: String(formData.get("email") ?? ""),
    mobileNumber: String(formData.get("mobileNumber") ?? ""),
    password: String(formData.get("password") ?? ""),
    confirmPassword: String(formData.get("confirmPassword") ?? ""),
  });
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0]?.message ?? "Please check the form and try again." };

  const { adiNumber: rawAdi, email, firstName, lastName, mobileNumber, password } = parsed.data;
  const adiNumber = normalizeAdiNumber(rawAdi);

// Check for existing account (any status)
  const existing = await prisma.instructorAccount.findFirst({
    where: { OR: [{ adiNumber }, { email }] },
    select: { id: true, adiNumber: true, email: true, status: true },
  });
  if (existing) {
    if (existing.status === "ACTIVE") {
      return { status: "error", message: "An instructor account already exists for that ADI number or email. Use instructor login instead." };
    }
    if (existing.status === "PENDING") {
      return { status: "error", message: "A registration is already pending verification. Check your inbox for the verification email." };
    }
  }

// Create PENDING account
  const verificationToken = randomBytes(32).toString("hex");
  const now = new Date();

  const account = await prisma.instructorAccount.create({
    data: {
      adiNumber,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email,
      mobileNumber: mobileNumber.trim(),
      passwordHash: await hashPassword(password),
      status: "PENDING",
      verificationToken: hashVerificationToken(verificationToken),
      verificationTokenExpiresAt: new Date(now.getTime() + 24 * 60 * 60 * 1000),
    },
  });

// Link any existing unclaimed learner-provided instructor records to this account
  await prisma.listingInstructor.updateMany({
    where: { adiNumber, instructorAccountId: null },
    data: { instructorAccountId: account.id },
  });
  await prisma.instructorInvite.updateMany({
    where: { adiNumber, instructorAccountId: null },
    data: { instructorAccountId: account.id, status: "CLAIMED" },
  });

// Send verification email
  const verifyUrl = `${appConfig.publicAppUrl}/movemytest/instructor/verify-email?token=${encodeURIComponent(verificationToken)}`;
  try {
    await sendInstructorVerificationEmail({ to: email, firstName, verifyUrl });
  } catch {
// Account is created PENDING even if email fails — they can resend from login
  }

  return { status: "idle" };// success — handled by client redirect
}

const instructorLoginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
});

export async function loginMoveMyTestInstructorAction(_: MoveMyTestInstructorAuthState, formData: FormData): Promise<MoveMyTestInstructorAuthState> {
  const parsed = instructorLoginSchema.safeParse({
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  });
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0]?.message ?? "Please check the form and try again." };

// 1. Try MoveMyTest instructor account first
  const tsAccount = await prisma.instructorAccount.findUnique({ where: { email: parsed.data.email } });
  if (tsAccount) {
    if (tsAccount.status === "PENDING") {
      return { status: "error", message: "Your email hasn't been verified yet. Check your inbox for the verification link." };
    }
    if (tsAccount.status !== "ACTIVE") {
      return { status: "error", message: "This account is not active. Contact MoveMyTest for help." };
    }
    if (await verifyPassword(parsed.data.password, tsAccount.passwordHash)) {
// MFA bypass — skip challenge even if active factor exists
      const activeFactor = await prisma.instructorMfaFactor.findFirst({ where: { accountId: tsAccount.id, method: "TOTP", status: "ACTIVE" } });
      if (activeFactor) {
// Skip MFA: log in directly
      }
      await prisma.instructorAccount.update({ where: { id: tsAccount.id }, data: { lastLoginAt: new Date() } });
      await createMoveMyTestInstructorSession(tsAccount);
      redirect("/instructor/dashboard" as never);
    }
  }

// 2. Fall back: check if they are a DTC CRM instructor
  const crmInstructor = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    include: { instructorProfile: true },
  });
  if (crmInstructor?.instructorProfile && await verifyPassword(parsed.data.password, crmInstructor.passwordHash)) {
    const account = await ensureinstructorAccountForCrmInstructor(crmInstructor.instructorProfile.id);
    await createMoveMyTestInstructorSession(account);

// Also create a DTC staff session so the "MoveMyTest instructor dashboard" link works without re-login
    const cookieStore = await cookies();
    const staffCookie = await createSessionCookieValue({
      userId: crmInstructor.id,
      email: crmInstructor.email,
      role: crmInstructor.role,
      branchId: crmInstructor.branchId,
      name: `${crmInstructor.firstName} ${crmInstructor.lastName}`,
    });
    cookieStore.set(SESSION_COOKIE_NAME, staffCookie, {
      httpOnly: true,
      sameSite: "lax" as const,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: SESSION_TTL_SECONDS,
    });

    redirect("/instructor/dashboard" as never);
  }

  return { status: "error", message: "Email or password is incorrect." };
}

export async function logoutMoveMyTestInstructorAction() {
  const cookieStore = await cookies();
  cookieStore.set(TEST_SWAP_INSTRUCTOR_SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/instructor",
    maxAge: 0,
  });
  redirect("/instructor" as never);
}

const availabilitySchema = z.object({
  listingInstructorId: z.string().min(1),
  matchId: z.string().optional(),
  slotType: z.enum(["CURRENT_TEST", "PROPOSED_SWAP"]),
  status: z.enum(["AVAILABLE", "UNAVAILABLE", "NEEDS_DISCUSSION"]),
  note: z.string().trim().max(1000, "Keep notes under 1000 characters.").optional(),
});

const instructorProfileSchema = z.object({
  adiNumber: z.string().trim().min(3, "Enter your ADI number.").max(30),
  firstName: z.string().trim().min(1, "Enter your first name.").max(80),
  lastName: z.string().trim().min(1, "Enter your last name.").max(80),
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  mobileNumber: z.string().trim().min(7, "Enter your mobile number.").max(30),
});

export async function updateMoveMyTestInstructorProfileAction(formData: FormData) {
  const session = await requireMoveMyTestInstructorSession();
  const current = await prisma.instructorAccount.findUniqueOrThrow({ where: { id: session.instructorId } });
  const parsed = instructorProfileSchema.safeParse({
    adiNumber: String(formData.get("adiNumber") ?? ""),
    firstName: String(formData.get("firstName") ?? ""),
    lastName: String(formData.get("lastName") ?? ""),
    email: String(formData.get("email") ?? ""),
    mobileNumber: String(formData.get("mobileNumber") ?? ""),
  });
  if (!parsed.success) redirect("/instructor/dashboard/profile?profile=invalid" as never);

  const adiNumber = normalizeAdiNumber(parsed.data.adiNumber);
  const email = parsed.data.email;
  const existing = await prisma.instructorAccount.findFirst({ where: { id: { not: current.id }, OR: [{ adiNumber }, { email }] }, select: { id: true } });
  if (existing) redirect("/instructor/dashboard/profile?profile=duplicate" as never);

  const adiChanged = adiNumber !== current.adiNumber;
  const emailChanged = email !== current.email;
  const linkedCount = await prisma.listingInstructor.count({ where: { instructorAccountId: current.id } });
  if (adiChanged && linkedCount > 0) redirect("/instructor/dashboard/profile?profile=adi-locked" as never);

  await prisma.$transaction([
    prisma.instructorAccount.update({
      where: { id: current.id },
      data: {
        adiNumber,
        firstName: parsed.data.firstName.trim(),
        lastName: parsed.data.lastName.trim(),
        email,
        mobileNumber: parsed.data.mobileNumber.trim(),
        emailVerifiedAt: emailChanged ? null : current.emailVerifiedAt,
      },
    }),
    ...(adiChanged
      ? [
          prisma.listingInstructor.updateMany({ where: { adiNumber, instructorAccountId: null }, data: { instructorAccountId: current.id } }),
          prisma.instructorInvite.updateMany({ where: { adiNumber, instructorAccountId: null }, data: { instructorAccountId: current.id, status: "CLAIMED" } }),
        ]
      : []),
    prisma.instructorAuditLog.create({
      data: {
        instructorAccountId: current.id,
        action: "PROFILE_UPDATED",
        detail: { adiChanged, emailChanged, linkedCount, previousAdiNumber: adiChanged ? current.adiNumber : null, newAdiNumber: adiChanged ? adiNumber : null },
      },
    }),
  ]);

  revalidatePath("/instructor/dashboard");
  redirect("/instructor/dashboard/profile?profile=updated" as never);
}

export async function recordMoveMyTestInstructorAvailabilityAction(formData: FormData) {
  const session = await requireMoveMyTestInstructorSession();
  const instructor = await prisma.instructorAccount.findUniqueOrThrow({ where: { id: session.instructorId } });
  const parsed = availabilitySchema.safeParse({
    listingInstructorId: String(formData.get("listingInstructorId") ?? ""),
    matchId: String(formData.get("matchId") ?? "") || undefined,
    slotType: String(formData.get("slotType") ?? ""),
    status: String(formData.get("status") ?? ""),
    note: String(formData.get("note") ?? "") || undefined,
  });
  if (!parsed.success) return;

  const link = await prisma.listingInstructor.findFirst({
    where: { id: parsed.data.listingInstructorId, OR: [{ instructorAccountId: instructor.id }, { adiNumber: instructor.adiNumber }] },
    include: { listing: { select: { id: true, listingAMatches: { select: { id: true } }, listingBMatches: { select: { id: true } } } } },
  });
  if (!link) return;

  const allowedMatchIds = new Set([...link.listing.listingAMatches, ...link.listing.listingBMatches].map((match) => match.id));
  if (parsed.data.slotType === "PROPOSED_SWAP" && (!parsed.data.matchId || !allowedMatchIds.has(parsed.data.matchId))) return;
  if (parsed.data.slotType === "CURRENT_TEST" && parsed.data.matchId) return;

  await prisma.$transaction([
    prisma.instructorAvailabilityDecision.create({
      data: {
        listingInstructorId: link.id,
        instructorAccountId: instructor.id,
        matchId: parsed.data.slotType === "PROPOSED_SWAP" ? parsed.data.matchId : null,
        slotType: parsed.data.slotType,
        status: parsed.data.status,
        note: parsed.data.note?.trim() || null,
      },
    }),
    prisma.instructorAuditLog.create({
      data: {
        instructorAccountId: instructor.id,
        listingInstructorId: link.id,
        matchId: parsed.data.slotType === "PROPOSED_SWAP" ? parsed.data.matchId : null,
        action: "AVAILABILITY_RECORDED",
        detail: { slotType: parsed.data.slotType, status: parsed.data.status, note: parsed.data.note?.trim() || null },
      },
    }),
  ]);

  revalidatePath("/instructor/dashboard");
  revalidatePath("/instructor/dashboard/action-centre");
  revalidatePath("/instructor/dashboard/linked-learners");
  revalidatePath("/dashboard");
}

export async function requestMoveMyTestInstructorPasswordResetAction(
  _prevState: PasswordResetEmailRequestActionState,
  formData: FormData,
): Promise<PasswordResetEmailRequestActionState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email) return { status: "error", message: "Enter your instructor email address." };

  const account = await prisma.instructorAccount.findUnique({ where: { email } });
  if (!account || account.status !== "ACTIVE") {
    return { status: "success", message: "If an instructor account exists for that email, a reset link has been sent." };
  }

  const token = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 60 * 60 * 1000);

  await prisma.instructorAccount.update({
    where: { id: account.id },
    data: { resetToken: token, resetTokenExpiresAt: expires },
  });

  const config = getMailboxConfig();
  const resetUrl = `${appConfig.publicAppUrl}/movemytest/instructor/reset-password?token=${encodeURIComponent(token)}`;

  try {
    await nodemailer.createTransport({
      host: config.smtpHost, port: config.smtpPort, secure: config.smtpSecure,
      auth: { user: config.username, pass: config.password },
    }).sendMail({
      from: config.username || appConfig.supportEmail,
      to: email,
      subject: "Reset your MoveMyTest instructor password",
      text: `Use this link to reset your MoveMyTest instructor password: ${resetUrl}\n\nThis link expires in 1 hour. If you did not request this, ignore this email.`,
    });
  } catch {
// Don't expose email delivery failures
  }

  return { status: "success", message: "If an instructor account exists for that email, a reset link has been sent." };
}

export async function verifyMoveMyTestInstructorEmailAction(token: string) {
  const tokenHash = hashVerificationToken(token);

  const account = await prisma.instructorAccount.findFirst({
    where: { verificationToken: tokenHash, status: "PENDING" },
  });

  if (!account) {
    return { status: "invalid", message: "This verification link is invalid or has already been used." } as const;
  }

  const now = new Date();
  if (account.verificationTokenExpiresAt && account.verificationTokenExpiresAt < now) {
    return { status: "expired", message: "This verification link has expired." } as const;
  }

  await prisma.instructorAccount.update({
    where: { id: account.id },
    data: {
      status: "ACTIVE",
      emailVerifiedAt: now,
      verificationToken: null,
      verificationTokenExpiresAt: null,
      lastLoginAt: now,
    },
  });

  await prisma.instructorAuditLog.create({
    data: {
      instructorAccountId: account.id,
      action: "EMAIL_VERIFIED",
      detail: { email: account.email },
    },
  });

// Do NOT create a session here — Server Components cannot set cookies.
// The instructor will sign in manually on the login page.
  return { status: "verified", message: "Your email has been verified." } as const;
}

export async function resendMoveMyTestInstructorVerificationAction(
  _prevState: { status: string; message: string },
  formData: FormData,
): Promise<{ status: string; message: string }> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email) return { status: "error", message: "Enter your email address." };

  const account = await prisma.instructorAccount.findFirst({
    where: { email, status: "PENDING" },
  });

  if (!account || !account.verificationToken) {
// Don't reveal whether account exists
    return { status: "success", message: "If a pending account exists for that email, a new verification link has been sent." };
  }

// Generate a fresh token
  const verificationToken = randomBytes(32).toString("hex");
  const now = new Date();

  await prisma.instructorAccount.update({
    where: { id: account.id },
    data: {
      verificationToken: hashVerificationToken(verificationToken),
      verificationTokenExpiresAt: new Date(now.getTime() + 24 * 60 * 60 * 1000),
    },
  });

  const verifyUrl = `${appConfig.publicAppUrl}/movemytest/instructor/verify-email?token=${encodeURIComponent(verificationToken)}`;
  try {
    await sendInstructorVerificationEmail({ to: email, firstName: account.firstName, verifyUrl });
  } catch {
    return { status: "error", message: "We couldn't send the verification email right now. Please try again later." };
  }

  return { status: "success", message: "If a pending account exists for that email, a new verification link has been sent." };
}

export async function reportMoveMyTestInstructorAction(formData: FormData) {
  const session = await requireMoveMyTestInstructorSession();
  const instructor = await prisma.instructorAccount.findUniqueOrThrow({
    where: { id: session.instructorId },
    select: { id: true, adiNumber: true, email: true, firstName: true, lastName: true },
  });

  const detail = String(formData.get("detail") || "").trim();
  if (!detail) return;

  await prisma.report.create({
    data: {
      reason: "INSTRUCTOR_SUPPORT",
      detail: `From: ${instructor.firstName} ${instructor.lastName} (ADI ${instructor.adiNumber}, ${instructor.email})\n\n${detail}`,
      mobileNumber: instructor.email,
      listingId: String(formData.get("listingId") || "") || null,
      matchId: String(formData.get("matchId") || "") || null,
    },
  });

  revalidatePath("/instructor/dashboard/help");
}

export async function inviteLearnerToMoveMyTestAction(_: MoveMyTestInstructorAuthState, formData: FormData): Promise<MoveMyTestInstructorAuthState> {
  const session = await requireMoveMyTestInstructorSession();
  const instructor = await prisma.instructorAccount.findUniqueOrThrow({
    where: { id: session.instructorId },
    select: { id: true, adiNumber: true, email: true, firstName: true, lastName: true },
  });

  const parsed = z.object({
    learnerName: z.string().trim().max(120).optional(),
    email: z.string().trim().toLowerCase().email("Enter a valid learner email."),
    mobileNumber: z.string().trim().max(30).optional(),
  }).safeParse({
    learnerName: String(formData.get("learnerName") ?? "") || undefined,
    email: String(formData.get("email") ?? ""),
    mobileNumber: String(formData.get("mobileNumber") ?? "") || undefined,
  });

  if (!parsed.success) return { status: "error", message: parsed.error.issues[0]?.message ?? "Check the form and try again." };

// Check for existing learner account
  const existingLearner = await prisma.learnerAccount.findUnique({ where: { email: parsed.data.email } });

  const now = new Date();
  const inviteToken = generateInviteToken();
  const inviteUrl = `${appConfig.publicAppUrl}/movemytest/register?invite=${encodeURIComponent(inviteToken)}`;

  const invite = await prisma.learnerInvite.create({
    data: {
      invitedByInstructorAccountId: instructor.id,
      claimedByAccountId: existingLearner?.id ?? null,
      learnerName: parsed.data.learnerName?.trim() || null,
      email: parsed.data.email,
      mobileNumber: parsed.data.mobileNumber?.trim() || null,
      instructorAdiNumber: instructor.adiNumber,
      tokenHash: existingLearner ? null : hashInviteToken(inviteToken),
      status: existingLearner ? "CLAIMED" : "PENDING",
      claimedAt: existingLearner ? now : null,
    },
  });

  if (existingLearner) {
    return { status: "success", message: "This learner already has a MoveMyTest account — they have been linked to your ADI number." };
  }

  try {
    await sendLearnerInviteEmail({
      to: parsed.data.email,
      learnerName: parsed.data.learnerName?.trim() || null,
      instructorName: `${instructor.firstName} ${instructor.lastName}`.trim() || "Your instructor",
      inviteUrl,
    });
    await prisma.learnerInvite.update({ where: { id: invite.id }, data: { status: "SENT", inviteSentAt: now, inviteError: null } });
    return { status: "success", message: `Invite sent to ${parsed.data.email}. They will see your name and ADI number when they register.` };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await prisma.learnerInvite.update({ where: { id: invite.id }, data: { status: "EMAIL_FAILED", inviteError: message.slice(0, 1000) } });
    return { status: "error", message: "Failed to send the invite email. Please try again or contact MoveMyTest support." };
  }
}

export async function getInstructorSentInvites() {
  const session = await requireMoveMyTestInstructorSession();
  return prisma.learnerInvite.findMany({
    where: { invitedByInstructorAccountId: session.instructorId },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      claimedByMoveMyTestAccount: { select: { email: true } },
    },
  });
}
