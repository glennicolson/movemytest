import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { getSecret } from "@/lib/auth/secret";

export function getMoveMyTestSecretKey() {
  const source = getSecret(
    "TEST_SWAP_SECRET_KEY/AUTH_SECRET",
    ["TEST_SWAP_SECRET_KEY", "AUTH_SECRET"],
    { devFallback: "dtc-dev-movemytest-secret-change-me", minLength: 32 },
  );
  return createHash("sha256").update(source).digest();
}

export function encryptBookingReference(value: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getMoveMyTestSecretKey(), iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return { encryptedValue: encrypted.toString("base64"), iv: iv.toString("base64"), authTag: authTag.toString("base64") };
}

export function decryptBookingReference(secret: { encryptedValue: string; iv: string; authTag: string }) {
  const decipher = createDecipheriv("aes-256-gcm", getMoveMyTestSecretKey(), Buffer.from(secret.iv, "base64"));
  decipher.setAuthTag(Buffer.from(secret.authTag, "base64"));
  return Buffer.concat([decipher.update(Buffer.from(secret.encryptedValue, "base64")), decipher.final()]).toString("utf8");
}

export function bookingReferenceExpiresAt(now = new Date(), ttlMinutes: number) {
  return new Date(now.getTime() + ttlMinutes * 60 * 1000);
}

export function isBookingReferenceVisible(secret: { ownerUserId?: string | null; ownerAccountId?: string | null; expiresAt: Date; deletedAt: Date | null }, viewerAccountId: string, now = new Date()) {
  const ownerId = secret.ownerAccountId ?? secret.ownerUserId;
  return ownerId !== viewerAccountId && !secret.deletedAt && secret.expiresAt > now;
}
