import { createCipheriv, createDecipheriv, createHash, randomBytes, timingSafeEqual } from "node:crypto";
import * as OTPAuth from "otpauth";

const MFA_ENCRYPTION_PREFIX = "mfa1";
const MFA_BACKUP_CODE_BYTES = 5;

function getMfaEncryptionKey(): Buffer {
  const source = process.env.MFA_ENCRYPTION_KEY || process.env.AUTH_SECRET;
  if (!source) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "MFA_ENCRYPTION_KEY (or AUTH_SECRET) is not set. MFA encryption requires a strong secret in production. " +
        "Set MFA_ENCRYPTION_KEY to a strong random value (at least 48 characters)."
      );
    }
    console.warn(
      "⚠️ MFA_ENCRYPTION_KEY is not set. Using AUTH_SECRET or dev fallback. Set a dedicated MFA_ENCRYPTION_KEY before deploying."
    );
  }
  return createHash("sha256").update(source || "dtc-dev-secret-change-me").digest();
}

export function encryptMfaSecret(value: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getMfaEncryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [MFA_ENCRYPTION_PREFIX, iv.toString("base64url"), tag.toString("base64url"), encrypted.toString("base64url")].join(".");
}

export function decryptMfaSecret(value: string) {
  const [prefix, ivRaw, tagRaw, encryptedRaw] = value.split(".");
  if (prefix !== MFA_ENCRYPTION_PREFIX || !ivRaw || !tagRaw || !encryptedRaw) {
    throw new Error("Invalid MFA secret payload.");
  }

  const decipher = createDecipheriv("aes-256-gcm", getMfaEncryptionKey(), Buffer.from(ivRaw, "base64url"));
  decipher.setAuthTag(Buffer.from(tagRaw, "base64url"));
  const decrypted = Buffer.concat([decipher.update(Buffer.from(encryptedRaw, "base64url")), decipher.final()]);
  return decrypted.toString("utf8");
}

export function createTotpSetup(input: { issuer: string; label: string }) {
  const secret = new OTPAuth.Secret();
  const totp = new OTPAuth.TOTP({
    issuer: input.issuer,
    label: input.label,
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret,
  });

  return {
    secretBase32: secret.base32,
    otpAuthUrl: totp.toString(),
  };
}

export function verifyTotpToken(input: { secretBase32: string; token: string }) {
  const normalizedToken = input.token.replace(/\s+/g, "");
  if (!/^\d{6}$/.test(normalizedToken)) {
    return false;
  }

  const totp = new OTPAuth.TOTP({
    issuer: "MoveMyTest",
    label: "mfa",
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret: OTPAuth.Secret.fromBase32(input.secretBase32),
  });

  return totp.validate({ token: normalizedToken, window: 1 }) !== null;
}

function formatBackupCodePart(bytes: Buffer) {
  return bytes.toString("hex").slice(0, MFA_BACKUP_CODE_BYTES).toUpperCase();
}

export function generateBackupCodes(count = 8) {
  return Array.from({ length: count }, () => {
    const left = formatBackupCodePart(randomBytes(4));
    const right = formatBackupCodePart(randomBytes(4));
    return `${left}-${right}`;
  });
}

export function hashBackupCode(code: string) {
  return createHash("sha256").update(code.trim().toUpperCase()).digest("hex");
}

export function normalizeBackupCode(code: string) {
  return code.trim().toUpperCase();
}

export function safeCompareBackupCode(input: string, expectedHash: string) {
  const inputHash = Buffer.from(hashBackupCode(input), "hex");
  const storedHash = Buffer.from(expectedHash, "hex");
  return inputHash.length === storedHash.length && timingSafeEqual(inputHash, storedHash);
}

/** Check whether a user has any active MFA factor (TOTP or WebAuthn). */
export async function userHasActiveMfa(userId: string): Promise<boolean> {
  const { prisma } = await import("@/lib/db/prisma");
  const count = await prisma.mfaFactor.count({
    where: { userId, status: "ACTIVE" },
  });
  return count > 0;
}
