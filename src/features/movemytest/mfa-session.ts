import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { getSecret } from "@/lib/auth/secret";

export const TEST_SWAP_MFA_CHALLENGE_COOKIE = "movemytest_mfa_challenge";
const TEST_SWAP_MFA_CHALLENGE_TTL_SECONDS = 60 * 10;

type MoveMyTestMfaChallengePayload = {
  accountId: string;
  email: string;
  from: string;
  exp: number;
};

function getChallengeSecret() {
  return getSecret(
    "MoveMyTest MFA challenge secret",
    ["TEST_SWAP_SECRET_KEY", "AUTH_SECRET", "NEXTAUTH_SECRET"],
    { devFallback: "dtc-movemytest-mfa-dev-secret-change-me", minLength: 32 },
  );
}

function signPayload(payload: string) {
  return createHmac("sha256", getChallengeSecret()).update(payload).digest("hex");
}

function encodePayload(payload: MoveMyTestMfaChallengePayload) {
  const base64 = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  return `${base64}.${signPayload(base64)}`;
}

function decodePayload(value: string): MoveMyTestMfaChallengePayload | null {
  const [base64, signature] = value.split(".");
  if (!base64 || !signature) return null;
  const expected = signPayload(base64);
  const a = Buffer.from(signature, "hex");
  const b = Buffer.from(expected, "hex");
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  try {
    const parsed = JSON.parse(Buffer.from(base64, "base64url").toString("utf8")) as MoveMyTestMfaChallengePayload;
    if (!parsed.accountId || !parsed.email || !parsed.exp || parsed.exp < Date.now()) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function setMoveMyTestMfaChallengeCookie(input: Omit<MoveMyTestMfaChallengePayload, "exp">) {
  const cookieStore = await cookies();
  cookieStore.set(TEST_SWAP_MFA_CHALLENGE_COOKIE, encodePayload({ ...input, exp: Date.now() + TEST_SWAP_MFA_CHALLENGE_TTL_SECONDS * 1000 }), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: TEST_SWAP_MFA_CHALLENGE_TTL_SECONDS,
  });
}

export async function getMoveMyTestMfaChallenge() {
  const cookieStore = await cookies();
  const raw = cookieStore.get(TEST_SWAP_MFA_CHALLENGE_COOKIE)?.value;
  if (!raw) return null;
  return decodePayload(raw);
}

export async function clearMoveMyTestMfaChallengeCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(TEST_SWAP_MFA_CHALLENGE_COOKIE);
}
