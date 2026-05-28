"use server";

import { randomBytes } from "node:crypto";
import nodemailer from "nodemailer";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { verifyPassword } from "@/lib/auth/password";
import { createMoveMyTestSession } from "./session";
import { setMoveMyTestMfaChallengeCookie } from "./mfa-session";
import { getMailboxConfig } from "@/lib/communications/config";
import { appConfig } from "@/lib/config/app";
import type { PasswordResetEmailRequestActionState } from "@/lib/auth/form-state";

export type MoveMyTestLoginState = { status: "idle" | "error"; message?: string };

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
  from: z.string().optional(),
});

function safeRedirectTarget(value?: string) {
// Always land on the dashboard (account overview) after login.
// Only preserve a specific match page redirect if the learner
// was mid-match before logging in.
  if (value?.startsWith("/matches/")) return value;
  return "/dashboard";
}

export async function loginMoveMyTestLearnerAction(_: MoveMyTestLoginState, formData: FormData): Promise<MoveMyTestLoginState> {
  const parsed = loginSchema.safeParse({
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
    from: String(formData.get("from") ?? ""),
  });

  if (!parsed.success) return { status: "error", message: parsed.error.issues[0]?.message ?? "Please check the form and try again." };

  const account = await prisma.learnerAccount.findUnique({ where: { email: parsed.data.email } });
  if (!account || account.status !== "ACTIVE") return { status: "error", message: "Email or password is incorrect." };

  const validPassword = await verifyPassword(parsed.data.password, account.passwordHash);
  if (!validPassword) return { status: "error", message: "Email or password is incorrect." };

  const target = safeRedirectTarget(parsed.data.from);
  const activeFactor = await prisma.learnerMfaFactor.findFirst({
    where: { accountId: account.id, method: "TOTP", status: "ACTIVE" },
    select: { id: true },
  });
  if (activeFactor) {
    await setMoveMyTestMfaChallengeCookie({ accountId: account.id, email: account.email, from: !account.accountSetupCompletedAt || !account.mobileNumber ? `/account-setup?from=${encodeURIComponent(target)}` : target });
    redirect("/mfa" as never);
  }

  await prisma.learnerAccount.update({ where: { id: account.id }, data: { lastLoginAt: new Date() } });
  await createMoveMyTestSession(account);

  if (!account.accountSetupCompletedAt || !account.mobileNumber) redirect(`/account-setup?from=${encodeURIComponent(target)}`);
  redirect(target as never);
}

export async function requestMoveMyTestLearnerPasswordResetAction(
  _prevState: PasswordResetEmailRequestActionState,
  formData: FormData,
): Promise<PasswordResetEmailRequestActionState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email) return { status: "error", message: "Enter your MoveMyTest learner email address." };

  const account = await prisma.learnerAccount.findUnique({ where: { email } });
// Always return success to prevent email enumeration
  if (!account || account.status !== "ACTIVE") {
    return { status: "success", message: "If a MoveMyTest account exists for that email, a reset link has been sent." };
  }

  const token = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 60 * 60 * 1000);// 1 hour

  await prisma.learnerAccount.update({
    where: { id: account.id },
    data: { resetToken: token, resetTokenExpiresAt: expires },
  });

  const config = getMailboxConfig();
  const resetUrl = `${appConfig.publicAppUrl}/movemytest/reset-password?token=${encodeURIComponent(token)}`;

  try {
    await nodemailer.createTransport({
      host: config.smtpHost, port: config.smtpPort, secure: config.smtpSecure,
      auth: { user: config.username, pass: config.password },
    }).sendMail({
      from: config.username || appConfig.supportEmail,
      to: email,
      subject: "Reset your MoveMyTest password",
      text: `Use this link to reset your MoveMyTest password: ${resetUrl}\n\nThis link expires in 1 hour. If you did not request this, ignore this email.`,
    });
  } catch {
// Don't expose email delivery failures
  }

  return { status: "success", message: "If a MoveMyTest account exists for that email, a reset link has been sent." };
}

import { PasswordSetActionState } from "@/lib/auth/form-state";
import { hashPassword } from "@/lib/auth/password";

export async function completeMoveMyTestPasswordResetAction(
  _: PasswordSetActionState,
  formData: FormData,
): Promise<PasswordSetActionState> {
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!token) return { status: "error", message: "Reset token is missing." };
  if (password.length < 10) return { status: "error", message: "Password must be at least 10 characters." };
  if (password !== confirmPassword) return { status: "error", message: "Passwords do not match." };

  const account = await prisma.learnerAccount.findFirst({
    where: {
      resetToken: token,
      resetTokenExpiresAt: { gt: new Date() },
      status: "ACTIVE",
    },
  });

  if (!account) return { status: "error", message: "This reset link is invalid or has expired." };

  const passwordHash = await hashPassword(password);

  await prisma.learnerAccount.update({
    where: { id: account.id },
    data: {
      passwordHash,
      resetToken: null,
      resetTokenExpiresAt: null,
      lastLoginAt: new Date(),
    },
  });

  await createMoveMyTestSession(account);

  redirect("/dashboard" as never);
}
