import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const TEST_SWAP_INSTRUCTOR_MFA_CHALLENGE_COOKIE = "movemytest_instructor_mfa_challenge";
const MFA_CHALLENGE_TTL_SECONDS = 60 * 10;

type InstructorMfaChallengePayload = {
  accountId: string;
  email: string;
  from: string;
  exp: number;
};

function getSecret() {
  const secret = process.env.TEST_SWAP_SECRET_KEY || process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") throw new Error("TEST_SWAP_SECRET_KEY or AUTH_SECRET is required for instructor MFA challenges.");
    return "dtc-movemytest-instructor-mfa-dev-secret-change-me";
  }
  return secret;
}

function signPayload(payload: string) {
  return createHmac("sha256", getSecret()).update(payload).digest("hex");
}

function encodePayload(payload: InstructorMfaChallengePayload) {
  const base64 = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  return `${base64}.${signPayload(base64)}`;
}

function decodePayload(value: string): InstructorMfaChallengePayload | null {
  const [base64, signature] = value.split(".");
  if (!base64 || !signature) return null;
  const expected = signPayload(base64);
  const a = Buffer.from(signature, "hex");
  const b = Buffer.from(expected, "hex");
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  try {
    const parsed = JSON.parse(Buffer.from(base64, "base64url").toString("utf8")) as InstructorMfaChallengePayload;
    if (!parsed.accountId || !parsed.email || !parsed.exp || parsed.exp < Date.now()) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function setInstructorMfaChallengeCookie(input: Omit<InstructorMfaChallengePayload, "exp">) {
  const cookieStore = await cookies();
  cookieStore.set(TEST_SWAP_INSTRUCTOR_MFA_CHALLENGE_COOKIE, encodePayload({ ...input, exp: Date.now() + MFA_CHALLENGE_TTL_SECONDS * 1000 }), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/instructor",
    maxAge: MFA_CHALLENGE_TTL_SECONDS,
  });
}

export async function getInstructorMfaChallenge() {
  const cookieStore = await cookies();
  const raw = cookieStore.get(TEST_SWAP_INSTRUCTOR_MFA_CHALLENGE_COOKIE)?.value;
  if (!raw) return null;
  return decodePayload(raw);
}

export async function clearInstructorMfaChallengeCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(TEST_SWAP_INSTRUCTOR_MFA_CHALLENGE_COOKIE);
}
