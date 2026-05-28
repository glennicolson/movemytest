"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { SESSION_COOKIE_NAME, SESSION_TTL_SECONDS } from "@/lib/auth/constants";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { createSessionCookieValue } from "@/lib/auth/session";
import type { SignInActionState, RegistrationActionState, PasswordResetEmailRequestActionState, PasswordSetActionState } from "@/lib/auth/form-state";

/* ── Helpers ── */

async function establishInstructorSession(instructor: { id: string; email: string; firstName: string; lastName: string }) {
  const cookieStore = await cookies();
  const value = await createSessionCookieValue({
    userId: instructor.id,
    email: instructor.email,
    role: "INSTRUCTOR",
    branchId: null,
    name: `${instructor.firstName} ${instructor.lastName}`,
  });

  cookieStore.set(SESSION_COOKIE_NAME, value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

function validateNewPassword(password: string, confirmPassword: string) {
  if (password.length < 10) return "Choose a password with at least 10 characters.";
  if (password !== confirmPassword) return "Password confirmation does not match.";
  return null;
}

/* ── Staff Sign In ── */

export async function signInStaffAction(_prevState: SignInActionState | void, formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  const instructor = await prisma.instructorAccount.findUnique({
    where: { email },
    select: { id: true, email: true, firstName: true, lastName: true, passwordHash: true, status: true },
  });

  if (!instructor) {
    return { status: "error" as const, error: "Invalid credentials." };
  }

  if (instructor.status !== "ACTIVE") {
    return { status: "error" as const, error: "This account is not currently active." };
  }

  const valid = await verifyPassword(password, instructor.passwordHash);
  if (!valid) {
    return { status: "error" as const, error: "Invalid credentials." };
  }

  await prisma.instructorAccount.update({
    where: { id: instructor.id },
    data: { lastLoginAt: new Date() },
  });

  await establishInstructorSession(instructor);
  redirect("/instructor/dashboard");
}

/* ── Sign Out ── */

export async function signOutAction() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  redirect("/login");
}

/* ── Password Reset Request ── */

export async function passwordResetEmailRequestAction(_prevState: PasswordResetEmailRequestActionState | void, formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();

  const instructor = await prisma.instructorAccount.findUnique({
    where: { email },
    select: { id: true },
  });

  if (!instructor) {
    // Return success even if not found to prevent email enumeration
    return { status: "success" as const, message: "If an account exists, a reset email has been sent." };
  }

  const resetToken = crypto.randomUUID();
  await prisma.instructorAccount.update({
    where: { id: instructor.id },
    data: {
      resetToken,
      resetTokenExpiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    },
  });

  // TODO: Send actual email
  return { status: "success" as const, message: "If an account exists, a reset email has been sent." };
}

/* ── Password Set ── */

export async function passwordSetAction(_prevState: PasswordSetActionState | void, formData: FormData) {
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  const validationError = validateNewPassword(password, confirmPassword);
  if (validationError) {
    return { status: "error" as const, error: validationError };
  }

  const instructor = await prisma.instructorAccount.findFirst({
    where: {
      resetToken: token,
      resetTokenExpiresAt: { gt: new Date() },
    },
  });

  if (!instructor) {
    return { status: "error" as const, error: "Invalid or expired reset token." };
  }

  const passwordHash = await hashPassword(password);
  await prisma.instructorAccount.update({
    where: { id: instructor.id },
    data: {
      passwordHash,
      resetToken: null,
      resetTokenExpiresAt: null,
    },
  });

  return { status: "success" as const, message: "Password updated successfully." };
}

/* ── Instructor Registration ── */

export async function instructorRegisterAction(_prevState: RegistrationActionState | void, formData: FormData) {
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const adiNumber = String(formData.get("adiNumber") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const mobileNumber = String(formData.get("mobileNumber") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!firstName || !lastName || !adiNumber || !email) {
    return { status: "error" as const, error: "All required fields must be filled." };
  }

  const validationError = validateNewPassword(password, confirmPassword);
  if (validationError) {
    return { status: "error" as const, error: validationError };
  }

  const existing = await prisma.instructorAccount.findFirst({
    where: { OR: [{ email }, { adiNumber }] },
  });

  if (existing) {
    return { status: "error" as const, error: "An instructor with this email or ADI number already exists." };
  }

  const passwordHash = await hashPassword(password);
  const instructor = await prisma.instructorAccount.create({
    data: {
      firstName,
      lastName,
      adiNumber,
      email,
      mobileNumber: mobileNumber || null,
      passwordHash,
      status: "ACTIVE",
    },
  });

  await establishInstructorSession(instructor);
  redirect("/instructor/dashboard");
}
