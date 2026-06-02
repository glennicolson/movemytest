"use server";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { getSecret } from "@/lib/auth/secret";

const SESSION_TTL_SECONDS = 8 * 60 * 60; // 8 hours

function getAdminSessionSecret(): string {
  return getSecret(
    "AUTH_SECRET (admin session)",
    ["AUTH_SECRET", "NEXTAUTH_SECRET"],
    { devFallback: "movemytest-dev-secret-change-me", minLength: 48 },
  );
}

function signSession(payload: string): string {
  const secret = getAdminSessionSecret();
  return createHmac("sha256", secret).update(payload).digest("hex");
}

function createSessionToken(staffId: string, role: string): string {
  const exp = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const payload = JSON.stringify({ staffId, role, exp });
  const signature = signSession(payload);
  return `${Buffer.from(payload).toString("base64url")}.${signature}`;
}

function verifySessionToken(token: string): { staffId: string; role: string } | null {
  const [payloadB64, signature] = token.split(".");
  if (!payloadB64 || !signature) return null;

  const payload = Buffer.from(payloadB64, "base64url").toString("utf8");
  const expectedSig = signSession(payload);

  if (!timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))) {
    return null;
  }

  try {
    const data = JSON.parse(payload) as { staffId: string; role: string; exp: number };
    if (Date.now() >= data.exp * 1000) return null;
    return { staffId: data.staffId, role: data.role };
  } catch {
    return null;
  }
}

export async function staffLogin(email: string, password: string) {
  const staff = await prisma.staffAccount.findUnique({
    where: { email: email.toLowerCase().trim() },
  });

  if (!staff) {
    return { success: false, error: "Invalid email or password" };
  }

  const crypto = await import("node:crypto");
  const [salt, hash] = staff.passwordHash.split(".");
  if (!salt || !hash) {
    return { success: false, error: "Invalid credentials format" };
  }

  const verifyHash = crypto.scryptSync(password, salt, 64).toString("hex");
  if (!timingSafeEqual(Buffer.from(hash), Buffer.from(verifyHash))) {
    return { success: false, error: "Invalid email or password" };
  }

  await prisma.staffAccount.update({
    where: { id: staff.id },
    data: { lastLoginAt: new Date() },
  });

  const token = createSessionToken(staff.id, staff.role);
  const cookieStore = await cookies();
  cookieStore.set("staff_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_TTL_SECONDS,
    path: "/",
  });

  return { success: true, error: null };
}

export async function requireStaffSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("staff_session")?.value;

  if (!token) {
    redirect("/admin/login");
  }

  const session = verifySessionToken(token);
  if (!session) {
    cookieStore.delete("staff_session");
    redirect("/admin/login");
  }

  const staff = await prisma.staffAccount.findUnique({
    where: { id: session.staffId },
    select: { id: true, email: true, name: true, role: true },
  });

  if (!staff) {
    cookieStore.delete("staff_session");
    redirect("/admin/login");
  }

  return staff;
}

export async function staffLogout() {
  const cookieStore = await cookies();
  cookieStore.delete("staff_session");
  redirect("/admin/login");
}
