/**
 * MoveMyTest consent audit log helper.
 *
 * Phase 8.4 (2026-06-07). Writes per-event consent rows to the
 * LearnerConsent table — the schema already has a model for this
 * with (accountId, consentType, consentVersion, acceptedAt, ipAddress,
 * userAgent) — designed exactly for GDPR accountability of
 * consent changes.
 *
 * Each row is a single consent event: granted, withdrawn, re-granted.
 * To reconstruct the current state, query the latest row per
 * (accountId, consentType). To prove the audit trail, query all rows.
 *
 * Mirrors the pattern in DTC's audit log but uses the MMT-specific
 * LearnerConsent model.
 */

import { prisma } from "@/lib/db/prisma";

export type ConsentEventType = "SMS_OPT_IN" | "SMS_OPT_OUT" | "MARKETING_OPT_IN" | "MARKETING_OPT_OUT" | "TERMS_ACCEPT" | "PRIVACY_ACCEPT";

export interface WriteConsentLogInput {
  accountId: string;
  eventType: ConsentEventType;
  consentVersion?: string;
  ipAddress?: string | null;
  userAgent?: string | null;
}

/**
 * Write a consent event log entry. Best-effort — never throws.
 * Returns true on success, false on failure.
 */
export async function writeMoveMyTestConsentLog(input: WriteConsentLogInput): Promise<boolean> {
  try {
    await prisma.learnerConsent.create({
      data: {
        accountId: input.accountId,
        consentType: input.eventType,
        consentVersion: input.consentVersion ?? "1",
        ipAddress: input.ipAddress ?? null,
        userAgent: input.userAgent ?? null,
      },
    });
    return true;
  } catch (err) {
    console.error("[mmt-consent-log] Failed to write consent log:", err);
    return false;
  }
}
