import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import type { AccountStatus, AppRole } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { appConfig } from "@/lib/config/app";

const INVITE_TTL_HOURS = 72;
const PASSWORD_RESET_TTL_HOURS = 24;

export type AuthTokenPurpose = "INVITE" | "PASSWORD_RESET" | "LESSON_CONFIRMATION";

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function getExpiryDate(purpose: AuthTokenPurpose) {
  const expiresAt = new Date();
  const hours = purpose === "INVITE" ? INVITE_TTL_HOURS : PASSWORD_RESET_TTL_HOURS;
  expiresAt.setHours(expiresAt.getHours() + hours);
  return expiresAt;
}

export function buildAuthTokenPath(purpose: AuthTokenPurpose, token: string, useRegisterPath = false) {
  const path = purpose === "INVITE" ? (useRegisterPath ? "/register" : "/activate-account") : "/reset-password";
  return `${path}?token=${encodeURIComponent(token)}`;
}

export function buildAbsoluteAuthTokenUrl(purpose: AuthTokenPurpose, token: string, useRegisterPath = false) {
  return new URL(buildAuthTokenPath(purpose, token, useRegisterPath), appConfig.publicAppUrl).toString();
}

export async function issueAuthToken(userId: string, purpose: AuthTokenPurpose) {
  const rawToken = randomBytes(24).toString("base64url");
  const tokenHash = hashToken(rawToken);

  await prisma.authToken.deleteMany({
    where: {
      userId,
      purpose,
      consumedAt: null,
    },
  });

  await prisma.authToken.create({
    data: {
      userId,
      purpose,
      tokenHash,
      expiresAt: getExpiryDate(purpose),
    },
  });

  return {
    token: rawToken,
    path: buildAuthTokenPath(purpose, rawToken, purpose === "INVITE"),
    url: buildAbsoluteAuthTokenUrl(purpose, rawToken, purpose === "INVITE"),
  };
}

type AuthTokenUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: AppRole;
  status: AccountStatus;
  branchId: string | null;
};

export type AuthTokenRecord = {
  id: string;
  userId: string;
  purpose: AuthTokenPurpose;
  tokenHash: string;
  expiresAt: Date;
  consumedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  user: AuthTokenUser;
};

export type AuthTokenLookupResult =
  | { status: "missing" }
  | { status: "wrong-purpose" }
  | { status: "consumed"; record: AuthTokenRecord }
  | { status: "expired"; record: AuthTokenRecord }
  | { status: "valid"; record: AuthTokenRecord };

export async function inspectAuthToken(rawToken: string, purpose: AuthTokenPurpose): Promise<AuthTokenLookupResult> {
  const tokenHash = hashToken(rawToken);

  const record = await prisma.authToken.findUnique({
    where: { tokenHash },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          status: true,
          branchId: true,
        },
      },
    },
  });

  if (!record) return { status: "missing" };
  if (record.purpose !== purpose) return { status: "wrong-purpose" };

  const a = Buffer.from(record.tokenHash, "hex");
  const b = Buffer.from(tokenHash, "hex");
  if (a.length !== b.length || !timingSafeEqual(a, b)) return { status: "missing" };

  if (record.consumedAt) return { status: "consumed", record };
  if (record.expiresAt.getTime() < Date.now()) return { status: "expired", record };

  return { status: "valid", record };
}

export async function getValidAuthToken(rawToken: string, purpose: AuthTokenPurpose): Promise<AuthTokenRecord | null> {
  const result = await inspectAuthToken(rawToken, purpose);
  return result.status === "valid" ? result.record : null;
}

export function getAuthTokenInvalidReasonCopy(purpose: AuthTokenPurpose, state: "missing" | "wrong-purpose" | "consumed" | "expired") {
  if (state === "consumed") {
    return purpose === "INVITE"
      ? "This invite link has already been used. Generate a fresh invite from the staff access page if the user still needs access."
      : "This reset link has already been used. Generate a new reset link from the login recovery page if another reset is needed.";
  }

  if (state === "expired") {
    return purpose === "INVITE"
      ? "This invite link has expired. Generate a fresh invite from the staff access page."
      : "This reset link has expired. Generate a new reset link from the login recovery page.";
  }

  return purpose === "INVITE"
    ? "This invite link is invalid. Generate a fresh invite from the staff access page."
    : "This reset link is invalid. Generate a new reset link from the login recovery page.";
}

export async function consumeAuthToken(id: string) {
  await prisma.authToken.update({
    where: { id },
    data: {
      consumedAt: new Date(),
    },
  });
}

export function getAuthTokenExpiryCopy(purpose: AuthTokenPurpose) {
  return purpose === "INVITE"
    ? `Invite links stay active for ${INVITE_TTL_HOURS} hours.`
    : `Reset links stay active for ${PASSWORD_RESET_TTL_HOURS} hours.`;
}

export function getAuthTokenAudienceCopy(purpose: AuthTokenPurpose) {
  return purpose === "INVITE"
    ? `Use this link to let the user set their first password and activate their ${appConfig.companyName} account.`
    : `Use this link to let the user choose a new password for their ${appConfig.companyName} account.`;
}
