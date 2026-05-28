/**
 * WebAuthn// Passkey server helpers for MoveMyTest CRM.
 *
 * Uses @simplewebauthn/server v13 for registration and authentication ceremonies.
 * Credentials are stored in the MfaFactor model (method: "WEBAUTHN") with the
 * credential ID, public key, and counter stored in dedicated fields.
 */

import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
  type RegistrationResponseJSON,
  type AuthenticationResponseJSON,
  type AuthenticatorTransportFuture,
} from "@simplewebauthn/server";
import { prisma } from "@/lib/db/prisma";

function getWebAuthnRpConfig() {
  const origin = process.env.NEXT_PUBLIC_APP_URL?.trim() || "http:/localhost:3000";
  const url = new URL(origin);
  return {
    rpID: url.hostname,
    rpName: "MoveMyTest",
    origin,
  };
}

/**
 * Generate registration options for a new passkey.
 * Excludes already-registered credential IDs to prevent duplicates.
 */
export async function generatePasskeyRegistrationOptions(userId: string) {
  const { rpID, rpName } = getWebAuthnRpConfig();

  const existingCredentials = await prisma.mfaFactor.findMany({
    where: {
      userId,
      method: "WEBAUTHN",
      status: { in: ["ACTIVE", "PENDING"] },
    },
    select: { webauthnCredentialId: true },
  });

  const excludeCredentials = existingCredentials
    .filter((c) => c.webauthnCredentialId)
    .map((c) => ({
      id: c.webauthnCredentialId!,
      type: "public-key" as const,
      transports: undefined as AuthenticatorTransportFuture[] | undefined,
    }));

  const options = await generateRegistrationOptions({
    rpName,
    rpID,
    userID: new TextEncoder().encode(userId),
    userName: userId,// overridden on the action layer with the real email
    attestationType: "none",
    authenticatorSelection: {
      authenticatorAttachment: "platform",
      userVerification: "preferred",
      residentKey: "preferred",
      requireResidentKey: false,
    },
    excludeCredentials,
  });

  return options;
}

/**
 * Verify a registration response and persist the new credential.
 */
export async function verifyPasskeyRegistration(
  userId: string,
  credential: RegistrationResponseJSON,
  expectedChallenge: string,
  label: string,
) {
  const { rpID, origin } = getWebAuthnRpConfig();

  const verification = await verifyRegistrationResponse({
    response: credential,
    expectedChallenge,
    expectedOrigin: origin,
    expectedRPID: rpID,
    requireUserVerification: false,
  });

  if (!verification.verified || !verification.registrationInfo) {
    return { verified: false };
  }

  const info = verification.registrationInfo;
  const cred = info.credential;

  await prisma.mfaFactor.create({
    data: {
      userId,
      method: "WEBAUTHN",
      status: "ACTIVE",
      label: label || "Passkey",
      isPrimary: false,
      activatedAt: new Date(),
      webauthnCredentialId: cred.id,
      webauthnPublicKey: Buffer.from(cred.publicKey).toString("base64url"),
      webauthnCounter: cred.counter,
      webauthnTransports: cred.transports?.join(",") ?? null,
    },
  });

  return { verified: true, credentialId: cred.id };
}

/**
 * Generate authentication options for passkey sign-in.
 */
export async function generatePasskeyAuthenticationOptions(userId: string) {
  const { rpID } = getWebAuthnRpConfig();

  const existingCredentials = await prisma.mfaFactor.findMany({
    where: {
      userId,
      method: "WEBAUTHN",
      status: "ACTIVE",
    },
    select: { webauthnCredentialId: true, webauthnTransports: true },
  });

  const allowCredentials = existingCredentials
    .filter((c) => c.webauthnCredentialId)
    .map((c) => ({
      id: c.webauthnCredentialId!,
      type: "public-key" as const,
      transports: (c.webauthnTransports?.split(",").filter(Boolean) as AuthenticatorTransportFuture[]) || undefined,
    }));

  const options = await generateAuthenticationOptions({
    rpID,
    allowCredentials,
    userVerification: "preferred",
  });

  return options;
}

/**
 * Verify a passkey authentication response during the MFA challenge flow.
 */
export async function verifyPasskeyAuthentication(
  userId: string,
  credential: AuthenticationResponseJSON,
  expectedChallenge: string,
) {
  const { rpID, origin } = getWebAuthnRpConfig();

// Find the matching credential
  const factor = await prisma.mfaFactor.findFirst({
    where: {
      userId,
      method: "WEBAUTHN",
      status: "ACTIVE",
      webauthnCredentialId: credential.id,
    },
    select: {
      id: true,
      webauthnPublicKey: true,
      webauthnCounter: true,
      webauthnTransports: true,
    },
  });

  if (!factor?.webauthnPublicKey) {
    return { verified: false };
  }

  const verification = await verifyAuthenticationResponse({
    response: credential,
    expectedChallenge,
    expectedOrigin: origin,
    expectedRPID: rpID,
    credential: {
      id: credential.id,
      publicKey: new Uint8Array(Buffer.from(factor.webauthnPublicKey, "base64url")),
      counter: factor.webauthnCounter ?? 0,
      transports: (factor.webauthnTransports?.split(",").filter(Boolean) as AuthenticatorTransportFuture[]) || undefined,
    },
    requireUserVerification: false,
  });

  if (!verification.verified) {
    return { verified: false };
  }

// Update the stored counter to prevent replay attacks
  await prisma.mfaFactor.update({
    where: { id: factor.id },
    data: {
      webauthnCounter: verification.authenticationInfo.newCounter,
    },
  });

  return { verified: true };
}

/**
 * Get the effective RP ID for client-side use.
 */
export function getWebAuthnRpId() {
  return getWebAuthnRpConfig().rpID;
}