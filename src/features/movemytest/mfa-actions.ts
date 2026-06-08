"use server";

import QRCode from "qrcode";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { createTotpSetup, decryptMfaSecret, encryptMfaSecret, generateBackupCodes, hashBackupCode, normalizeBackupCode, safeCompareBackupCode, verifyTotpToken } from "@/lib/auth/mfa";
import { verifyPassword } from "@/lib/auth/password";
import type { MfaSetupActionState, MfaVerifyActionState } from "@/lib/auth/mfa-state";
import type { SignInActionState } from "@/lib/auth/form-state";
import { createMoveMyTestSession, requireMoveMyTestSession } from "./session";
import { clearMoveMyTestMfaChallengeCookie, getMoveMyTestMfaChallenge } from "./mfa-session";

async function activeTotpFactor(accountId: string) {
  return prisma.learnerMfaFactor.findFirst({
    where: { accountId, method: "TOTP", status: "ACTIVE" },
    orderBy: { activatedAt: "desc" },
  });
}

export async function beginMoveMyTestTotpSetupAction(_prevState: MfaSetupActionState, formData: FormData): Promise<MfaSetupActionState> {
  const session = await requireMoveMyTestSession("/security");
  const labelInput = String(formData.get("label") ?? "").trim();

  const existingActive = await activeTotpFactor(session.accountId);
  if (existingActive) {
    return { status: "success", message: "TOTP MFA is already active for this MoveMyTest account.", hasActiveTotp: true, activeFactorLabel: existingActive.label };
  }

  await prisma.learnerMfaFactor.deleteMany({ where: { accountId: session.accountId, method: "TOTP", status: "PENDING" } });

  const setup = createTotpSetup({ issuer: "MoveMyTest", label: session.email });
  await prisma.learnerMfaFactor.create({
    data: {
      accountId: session.accountId,
      method: "TOTP",
      status: "PENDING",
      label: labelInput || "Authenticator app",
      totpSecretEncrypted: encryptMfaSecret(setup.secretBase32),
    },
  });

  const qrDataUrl = await QRCode.toDataURL(setup.otpAuthUrl, { margin: 1, width: 240 });
  return { status: "success", message: "Scan the QR code in your authenticator app, then enter a 6-digit code to activate MFA.", secretBase32: setup.secretBase32, qrDataUrl, hasActiveTotp: false, activeFactorLabel: null };
}

export async function confirmMoveMyTestTotpSetupAction(_prevState: MfaVerifyActionState, formData: FormData): Promise<MfaVerifyActionState> {
  const session = await requireMoveMyTestSession("/security");
  const token = String(formData.get("token") ?? "").trim();

  const pendingFactor = await prisma.learnerMfaFactor.findFirst({ where: { accountId: session.accountId, method: "TOTP", status: "PENDING" }, orderBy: { createdAt: "desc" } });
  if (!pendingFactor?.totpSecretEncrypted) return { status: "error", message: "Start TOTP setup first so there is a pending factor to verify." };

  const valid = verifyTotpToken({ secretBase32: decryptMfaSecret(pendingFactor.totpSecretEncrypted), token });
  if (!valid) return { status: "error", message: "That code was not valid. Check the clock on your device and try again." };

  const backupCodes = generateBackupCodes();
  await prisma.$transaction(async (tx) => {
    await tx.learnerMfaFactor.updateMany({ where: { accountId: session.accountId, method: "TOTP", status: "ACTIVE" }, data: { isPrimary: false } });
    await tx.learnerMfaFactor.update({ where: { id: pendingFactor.id }, data: { status: "ACTIVE", isPrimary: true, activatedAt: new Date() } });
    await tx.learnerBackupCode.deleteMany({ where: { accountId: session.accountId } });
    await tx.learnerBackupCode.createMany({ data: backupCodes.map((code) => ({ accountId: session.accountId, codeHash: hashBackupCode(code) })) });
  });

  return { status: "success", message: "TOTP MFA is now active. Save these backup codes somewhere safe before you leave this page.", backupCodes, hasActiveTotp: true, activeFactorLabel: pendingFactor.label };
}

export async function regenerateMoveMyTestBackupCodesAction(_prevState: MfaSetupActionState, formData: FormData): Promise<MfaSetupActionState> {
  const session = await requireMoveMyTestSession("/security");
  const currentPassword = String(formData.get("currentPassword") ?? "");
  const account = await prisma.learnerAccount.findUnique({ where: { id: session.accountId }, select: { passwordHash: true } });
  if (!account || !(await verifyPassword(currentPassword, account.passwordHash))) return { status: "error", message: "The password you entered is incorrect. Backup codes have not been regenerated.", hasActiveTotp: true };

  const activeFactor = await activeTotpFactor(session.accountId);
  if (!activeFactor) return { status: "error", message: "Activate TOTP MFA before regenerating backup codes.", hasActiveTotp: false };

  const backupCodes = generateBackupCodes();
  await prisma.$transaction(async (tx) => {
    await tx.learnerBackupCode.deleteMany({ where: { accountId: session.accountId } });
    await tx.learnerBackupCode.createMany({ data: backupCodes.map((code) => ({ accountId: session.accountId, codeHash: hashBackupCode(code) })) });
  });

  return { status: "success", message: "Backup codes regenerated. Replace any copies you stored before.", backupCodes, hasActiveTotp: true, activeFactorLabel: activeFactor.label };
}

export async function disableMoveMyTestTotpAction(_prevState: MfaSetupActionState, formData: FormData): Promise<MfaSetupActionState> {
  const session = await requireMoveMyTestSession("/security");
  const currentPassword = String(formData.get("currentPassword") ?? "");
  const account = await prisma.learnerAccount.findUnique({ where: { id: session.accountId }, select: { passwordHash: true } });
  if (!account || !(await verifyPassword(currentPassword, account.passwordHash))) return { status: "error", message: "The password you entered is incorrect. MFA has not been disabled.", hasActiveTotp: true };

  const activeFactor = await activeTotpFactor(session.accountId);
  if (!activeFactor) return { status: "error", message: "No active TOTP factor to disable.", hasActiveTotp: false };

  await prisma.$transaction(async (tx) => {
    await tx.learnerMfaFactor.update({ where: { id: activeFactor.id }, data: { status: "DISABLED", isPrimary: false } });
    await tx.learnerBackupCode.deleteMany({ where: { accountId: session.accountId } });
  });

  return { status: "success", message: "TOTP MFA has been disabled. Your MoveMyTest account now uses password-only sign-in.", hasActiveTotp: false };
}

export async function completeMoveMyTestMfaChallengeAction(_prevState: SignInActionState | void, formData: FormData): Promise<SignInActionState> {
  const challenge = await getMoveMyTestMfaChallenge();
  if (!challenge) return { status: "error", error: "Your MFA challenge expired. Please sign in again." };

  const token = String(formData.get("token") ?? "").trim();
  const backupCode = String(formData.get("backupCode") ?? "").trim();
  if (!token && !backupCode) return { status: "error", error: "Enter either a 6-digit authenticator code or a backup code." };

  const account = await prisma.learnerAccount.findUnique({ where: { id: challenge.accountId }, select: { id: true, email: true, status: true } });
  if (!account || account.status !== "ACTIVE") {
    await clearMoveMyTestMfaChallengeCookie();
    return { status: "error", error: "This MoveMyTest account is no longer available for sign-in." };
  }

  let verified = false;
  if (token) {
    const factor = await activeTotpFactor(account.id);
    if (!factor?.totpSecretEncrypted) return { status: "error", error: "No active authenticator factor was found for this account." };
    verified = verifyTotpToken({ secretBase32: decryptMfaSecret(factor.totpSecretEncrypted), token });
  } else if (backupCode) {
    const codes = await prisma.learnerBackupCode.findMany({ where: { accountId: account.id, usedAt: null }, select: { id: true, codeHash: true } });
    const match = codes.find((code) => safeCompareBackupCode(normalizeBackupCode(backupCode), code.codeHash));
    if (match) {
      await prisma.learnerBackupCode.update({ where: { id: match.id }, data: { usedAt: new Date() } });
      verified = true;
    }
  }

  if (!verified) return { status: "error", error: "That authenticator or backup code was not valid." };

  await clearMoveMyTestMfaChallengeCookie();
  await prisma.learnerAccount.update({ where: { id: account.id }, data: { lastLoginAt: new Date() } });
  await createMoveMyTestSession(account);
  redirect(challenge.from as never);
}
