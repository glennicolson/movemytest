import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { getSecret } from "@/lib/auth/secret";

export const TEST_SWAP_INSTRUCTOR_SESSION_COOKIE = "movemytest_instructor_session";
const TEST_SWAP_INSTRUCTOR_SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

type MoveMyTestInstructorSessionPayload = {
  instructorId: string;
  email: string;
  adiNumber: string;
  exp: number;
};

export type MoveMyTestInstructorSession = {
  instructorId: string;
  email: string;
  adiNumber: string;
};

function getSessionSecret() {
  const base = getSecret(
    "MoveMyTest instructor session secret",
    ["TEST_SWAP_SECRET_KEY", "AUTH_SECRET", "NEXTAUTH_SECRET"],
    { devFallback: "dtc-movemytest-dev-secret-change-me", minLength: 32 },
  );
  return `${base}:instructor`;
}

function signPayload(payload: string) {
  return createHmac("sha256", getSessionSecret()).update(payload).digest("hex");
}

function encodePayload(payload: MoveMyTestInstructorSessionPayload) {
  const base64 = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  return `${base64}.${signPayload(base64)}`;
}

function decodePayload(value: string): MoveMyTestInstructorSessionPayload | null {
  const [base64, signature] = value.split(".");
  if (!base64 || !signature) return null;
  const expected = signPayload(base64);
  const a = Buffer.from(signature, "hex");
  const b = Buffer.from(expected, "hex");
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  try {
    const parsed = JSON.parse(Buffer.from(base64, "base64url").toString("utf8")) as MoveMyTestInstructorSessionPayload;
    if (!parsed.instructorId || !parsed.email || !parsed.adiNumber || !parsed.exp || parsed.exp < Date.now()) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function createMoveMyTestInstructorSession(account: { id: string; email: string; adiNumber: string }) {
  const cookieStore = await cookies();
  cookieStore.set(TEST_SWAP_INSTRUCTOR_SESSION_COOKIE, encodePayload({ instructorId: account.id, email: account.email, adiNumber: account.adiNumber, exp: Date.now() + TEST_SWAP_INSTRUCTOR_SESSION_TTL_MS }), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/instructor",
    maxAge: Math.floor(TEST_SWAP_INSTRUCTOR_SESSION_TTL_MS / 1000),
  });
}

export async function getMoveMyTestInstructorSession(): Promise<MoveMyTestInstructorSession | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(TEST_SWAP_INSTRUCTOR_SESSION_COOKIE)?.value;
  if (!raw) return null;
  const payload = decodePayload(raw);
  if (!payload) return null;
  return { instructorId: payload.instructorId, email: payload.email, adiNumber: payload.adiNumber };
}

export async function requireMoveMyTestInstructorSession() {
  const session = await getMoveMyTestInstructorSession();
  if (!session) redirect("/instructor/login");
  const account = await prisma.instructorAccount.findUnique({
    where: { id: session.instructorId },
    select: { status: true },
  });
  if (!account || account.status !== "ACTIVE") {
    const reason = account?.status === "PENDING" ? "email-not-verified" : "session-expired";
    redirect(`/instructor/login?reason=${reason}`);
  }
  return session;
}
