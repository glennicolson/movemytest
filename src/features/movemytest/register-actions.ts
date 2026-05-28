"use server";

import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { hashPassword } from "@/lib/auth/password";
import { createMoveMyTestSession } from "./session";

export type MoveMyTestRegisterState = { status: "idle" | "error"; message?: string };

const registerSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  confirmPassword: z.string().min(8, "Confirm your password."),
  acceptTerms: z.literal("on", { message: "You must agree to the Terms of Service." }),
  acceptPrivacy: z.literal("on", { message: "You must agree to the Privacy Policy." }),
  acknowledgeOfficialProcess: z.literal("on", { message: "You must acknowledge that the official swap happens with DVSA by phone." }),
  marketingConsent: z.string().optional(),
  from: z.string().optional(),
  inviteToken: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, { path: ["confirmPassword"], message: "Passwords do not match." });

function hashInviteToken(token?: string | null) {
  if (!token) return null;
  return createHash("sha256").update(token).digest("hex");
}

function safeRedirectTarget(value?: string) {
  if (!value || !value.startsWith("/")) return "/start";
  return value;
}

export async function registerMoveMyTestLearnerAction(_: MoveMyTestRegisterState, formData: FormData): Promise<MoveMyTestRegisterState> {
  const parsed = registerSchema.safeParse({
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
    confirmPassword: String(formData.get("confirmPassword") ?? ""),
    acceptTerms: formData.get("acceptTerms") ? "on" : undefined,
    acceptPrivacy: formData.get("acceptPrivacy") ? "on" : undefined,
    acknowledgeOfficialProcess: formData.get("acknowledgeOfficialProcess") ? "on" : undefined,
    marketingConsent: formData.get("marketingConsent") ? "on" : undefined,
    from: String(formData.get("from") ?? ""),
    inviteToken: String(formData.get("inviteToken") ?? "") || undefined,
  });

  if (!parsed.success) return { status: "error", message: parsed.error.issues[0]?.message ?? "Please check the form and try again." };

  const inviteTokenHash = hashInviteToken(parsed.data.inviteToken);
  const invite = inviteTokenHash
    ? await prisma.learnerInvite.findFirst({ where: { tokenHash: inviteTokenHash, status: { in: ["PENDING", "SENT", "EMAIL_FAILED"] } } })
    : null;
  if (parsed.data.inviteToken && !invite) return { status: "error", message: "This MoveMyTest invite link is no longer valid. Ask your instructor to send a fresh invite." };
  if (invite && invite.email.toLowerCase() !== parsed.data.email) return { status: "error", message: "Use the email address this invite was sent to, or ask your instructor to send a fresh invite." };

  const existing = await prisma.learnerAccount.findUnique({ where: { email: parsed.data.email } });
  if (existing) {
    if (invite) {
      await prisma.learnerInvite.update({ where: { id: invite.id }, data: { claimedByAccountId: existing.id, claimedAt: new Date(), status: "CLAIMED" } });
    }
    return { status: "error", message: "An account already exists for this email. Please sign in to your MoveMyTest account instead." };
  }

  const now = new Date();
  const headerStore = await headers();
  const ipAddress = headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() || headerStore.get("x-real-ip") || null;
  const userAgent = headerStore.get("user-agent") || null;
  const account = await prisma.learnerAccount.create({
    data: {
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
      email: parsed.data.email,
      passwordHash: await hashPassword(parsed.data.password),
      termsAcceptedAt: now,
      privacyAcceptedAt: now,
      officialProcessAcknowledgedAt: now,
      marketingConsentAt: parsed.data.marketingConsent === "on" ? now : null,
      lastLoginAt: now,
      consents: {
        create: [
          { id: crypto.randomUUID(), consentType: "TERMS_OF_SERVICE", consentVersion: "2026-05-13", acceptedAt: now, ipAddress, userAgent },
          { id: crypto.randomUUID(), consentType: "PRIVACY_POLICY", consentVersion: "2026-05-13", acceptedAt: now, ipAddress, userAgent },
          { id: crypto.randomUUID(), consentType: "DVSA_OFFICIAL_PHONE_PROCESS", consentVersion: "2026-05-13", acceptedAt: now, ipAddress, userAgent },
          ...(parsed.data.marketingConsent === "on" ? [{ id: crypto.randomUUID(), consentType: "TEST_SWAP_UPDATES", consentVersion: "2026-05-13", acceptedAt: now, ipAddress, userAgent }] : []),
        ],
      },
    },
  });

  if (invite) {
    await prisma.learnerInvite.update({ where: { id: invite.id }, data: { claimedByAccountId: account.id, claimedAt: now, status: "CLAIMED" } });
  }

  await createMoveMyTestSession(account);
  redirect(`/account-setup?from=${encodeURIComponent(safeRedirectTarget(parsed.data.from))}`);
}
