import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE_NAME, SESSION_TTL_SECONDS } from "@/lib/auth/constants";
import { buildLoginRedirect, sanitizeRedirectTarget } from "@/lib/auth/navigation";
import { roleToSurface, type AppRole, type AppSurface } from "@/lib/auth/roles";

export type AppSession = {
  userId: string;
  name: string;
  email: string;
  role: AppRole;
  surface: AppSurface;
  branchId: string | null;
};

type SessionPayload = {
  userId: string;
  name: string;
  email: string;
  role: AppRole;
  branchId: string | null;
  exp: number;
};

const SESSION_TTL_MS = SESSION_TTL_SECONDS * 1000;

function getSessionSecret(): string {
  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "AUTH_SECRET is not set. Session security requires a strong random secret in production. " +
        "Set the AUTH_SECRET environment variable to at least 48 characters."
      );
    }
    console.warn(
      "⚠️ AUTH_SECRET is not set. Using insecure dev fallback. Set AUTH_SECRET before deploying."
    );
    return "dtc-dev-secret-change-me";
  }
  return secret;
}

function signPayload(payload: string) {
  return createHmac("sha256", getSessionSecret()).update(payload).digest("hex");
}

function encodePayload(payload: SessionPayload) {
  const json = JSON.stringify(payload);
  const base64 = Buffer.from(json, "utf8").toString("base64url");
  const signature = signPayload(base64);
  return `${base64}.${signature}`;
}

function decodePayload(value: string): SessionPayload | null {
  const [base64, signature] = value.split(".");
  if (!base64 || !signature) return null;

  const expected = signPayload(base64);
  const a = Buffer.from(signature, "hex");
  const b = Buffer.from(expected, "hex");
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  try {
    const parsed = JSON.parse(Buffer.from(base64, "base64url").toString("utf8")) as SessionPayload;
    if (!parsed.exp || parsed.exp < Date.now()) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function createSessionCookieValue(input: Omit<SessionPayload, "exp">) {
  return encodePayload({
    ...input,
    exp: Date.now() + SESSION_TTL_MS,
  });
}

export async function getCurrentSession(): Promise<AppSession | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!raw) return null;

  const payload = decodePayload(raw);
  if (!payload) return null;

  return {
    userId: payload.userId,
    name: payload.name,
    email: payload.email,
    role: payload.role,
    branchId: payload.branchId,
    surface: roleToSurface[payload.role],
  };
}

async function getCurrentRequestTarget() {
  const headerStore = await headers();
  const pathname = headerStore.get("x-request-path") ?? "";
  const search = headerStore.get("x-request-search") ?? "";
  return sanitizeRedirectTarget(`${pathname}${search}`);
}

export async function requireSession() {
  const session = await getCurrentSession();
  if (!session) {
    const currentTarget = await getCurrentRequestTarget();
    redirect(buildLoginRedirect(currentTarget, "session-expired") as never);
  }
  return session;
}
