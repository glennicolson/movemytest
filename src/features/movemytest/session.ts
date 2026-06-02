import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { getSecret } from "@/lib/auth/secret";

export const TEST_SWAP_SESSION_COOKIE = "movemytest_session";
const TEST_SWAP_SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

type MoveMyTestSessionPayload = {
  accountId: string;
  email: string;
  exp: number;
};

export type MoveMyTestSession = {
  accountId: string;
  email: string;
};

function getSessionSecret() {
  return getSecret(
    "MoveMyTest session secret",
    ["TEST_SWAP_SECRET_KEY", "AUTH_SECRET", "NEXTAUTH_SECRET"],
    { devFallback: "dtc-movemytest-dev-secret-change-me", minLength: 32 },
  );
}

function signPayload(payload: string) {
  return createHmac("sha256", getSessionSecret()).update(payload).digest("hex");
}

function encodePayload(payload: MoveMyTestSessionPayload) {
  const base64 = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  return `${base64}.${signPayload(base64)}`;
}

function decodePayload(value: string): MoveMyTestSessionPayload | null {
  const [base64, signature] = value.split(".");
  if (!base64 || !signature) return null;
  const expected = signPayload(base64);
  const a = Buffer.from(signature, "hex");
  const b = Buffer.from(expected, "hex");
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  try {
    const parsed = JSON.parse(Buffer.from(base64, "base64url").toString("utf8")) as MoveMyTestSessionPayload;
    if (!parsed.accountId || !parsed.email || !parsed.exp || parsed.exp < Date.now()) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function createMoveMyTestSession(account: { id: string; email: string }) {
  const cookieStore = await cookies();
  cookieStore.set(TEST_SWAP_SESSION_COOKIE, encodePayload({ accountId: account.id, email: account.email, exp: Date.now() + TEST_SWAP_SESSION_TTL_MS }), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: Math.floor(TEST_SWAP_SESSION_TTL_MS / 1000),
  });
}

export async function getMoveMyTestSession(): Promise<MoveMyTestSession | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(TEST_SWAP_SESSION_COOKIE)?.value;
  if (!raw) return null;
  const payload = decodePayload(raw);
  if (!payload) return null;
  return { accountId: payload.accountId, email: payload.email };
}

export async function requireMoveMyTestSession(from = "/start") {
  const session = await getMoveMyTestSession();
  if (!session) redirect(`/login?from=${encodeURIComponent(from)}`);
  const account = await prisma.learnerAccount.findUnique({
    where: { id: session.accountId },
    select: { status: true },
  });
  if (account?.status !== "ACTIVE") redirect(`/login?from=${encodeURIComponent(from)}&reason=session-expired`);
  return session;
}

export async function requireReadyMoveMyTestSession(from = "/start") {
  const session = await requireMoveMyTestSession(from);
  const account = await prisma.learnerAccount.findUnique({ where: { id: session.accountId }, select: { status: true, accountSetupCompletedAt: true, mobileNumber: true } });
  if (account?.status !== "ACTIVE") redirect(`/login?from=${encodeURIComponent(from)}&reason=session-expired`);
  if (!account?.accountSetupCompletedAt || !account.mobileNumber) redirect(`/account-setup?from=${encodeURIComponent(from)}`);
  return session;
}
