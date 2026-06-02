import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { MFA_CHALLENGE_COOKIE_NAME, MFA_CHALLENGE_TTL_SECONDS } from "@/lib/auth/constants";
import type { AppRole } from "@/lib/auth/roles";
import { getSecret } from "@/lib/auth/secret";

type MfaChallengePayload = {
  userId: string;
  email: string;
  role: AppRole;
  branchId: string | null;
  name: string;
  exp: number;
};

function getChallengeSecret(): string {
  return getSecret(
    "AUTH_SECRET (MFA challenge)",
    ["AUTH_SECRET", "NEXTAUTH_SECRET"],
    { devFallback: "dtc-dev-secret-change-me", minLength: 48 },
  );
}

function signPayload(payload: string) {
  return createHmac("sha256", getChallengeSecret()).update(payload).digest("hex");
}

function encodePayload(payload: MfaChallengePayload) {
  const json = JSON.stringify(payload);
  const base64 = Buffer.from(json, "utf8").toString("base64url");
  const signature = signPayload(base64);
  return `${base64}.${signature}`;
}

function decodePayload(value: string): MfaChallengePayload | null {
  const [base64, signature] = value.split(".");
  if (!base64 || !signature) return null;

  const expected = signPayload(base64);
  const a = Buffer.from(signature, "hex");
  const b = Buffer.from(expected, "hex");
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  try {
    const parsed = JSON.parse(Buffer.from(base64, "base64url").toString("utf8")) as MfaChallengePayload;
    if (!parsed.exp || parsed.exp < Date.now()) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function createMfaChallengeCookieValue(input: Omit<MfaChallengePayload, "exp">) {
  return encodePayload({
    ...input,
    exp: Date.now() + MFA_CHALLENGE_TTL_SECONDS * 1000,
  });
}

export async function setMfaChallengeCookie(input: Omit<MfaChallengePayload, "exp">) {
  const cookieStore = await cookies();
  const value = await createMfaChallengeCookieValue(input);
  cookieStore.set(MFA_CHALLENGE_COOKIE_NAME, value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MFA_CHALLENGE_TTL_SECONDS,
  });
}

export async function getMfaChallenge() {
  const cookieStore = await cookies();
  const raw = cookieStore.get(MFA_CHALLENGE_COOKIE_NAME)?.value;
  if (!raw) return null;
  return decodePayload(raw);
}

export async function clearMfaChallengeCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(MFA_CHALLENGE_COOKIE_NAME);
}
