"use server";

/**
 * SMS queue for MoveMyTest notifications — mirrors the email queue pattern.
 *
 * The queue uses lazy processing (no cron, Hostinger-compatible):
 * - SMS entries are created alongside email entries when matches are created
 * - Processing happens on dashboard/match-page loads
 * - Only sends SMS if the learner has mobile consent
 */

import { prisma } from "@/lib/db/prisma";
import { sendSms } from "@/lib/sms/twilio-client";
import { sanitizePhoneNumber, truncateSmsBody } from "@/lib/sms/sms-utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type SmsQueueKind =
  | "MATCH_FOUND"
  | "MATCH_ACCEPTANCE_REMINDER"
  | "MATCH_FINAL_WARNING"
  | "SWAP_INCOMPLETE_REMINDER"
  | "SWAP_COMPLETED_NOT_CLOSED"
  | "SWAP_COMPLETED_CONFIRMATION"
  | "MATCH_DECLINED";

interface SmsQueueRow {
  id: string;
  matchId: string;
  kind: string;
  recipient: string;
  recipientRole: string;
  scheduledFor: string;
  sentAt: string | null;
  error: string | null;
  retryCount: number;
  maxRetries: number;
  status: string;
  twilioSid: string | null;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// SMS body templates (160-char limit, mobile-optimized)
// ---------------------------------------------------------------------------

function smsBodyForKind(
  kind: SmsQueueKind,
  remaining: string | null,
  swapContext?: { fromCentre: string; fromDateTime: string; toCentre: string; toDateTime: string; matchId?: string },
): string {
  const matchId = swapContext?.matchId ?? "";
  const shortUrl = `https://movemytest.co.uk/m/${matchId}`;

  switch (kind) {
    case "MATCH_FOUND":
      return `MoveMyTest — Match found! ${swapContext?.fromCentre ?? "Your test"} ↔ ${swapContext?.toCentre ?? "their test"}. Accept in 2 business days: ${shortUrl}`;

    case "MATCH_ACCEPTANCE_REMINDER":
      return `MoveMyTest reminder: Match expires soon. ${swapContext?.fromCentre ?? "Your swap"} has ${remaining ?? "limited time"} left. Review: ${shortUrl}`;

    case "MATCH_FINAL_WARNING":
      return `FINAL WARNING: Your MoveMyTest match expires in ${remaining ?? "hours"}. Last chance: ${shortUrl}`;

    case "SWAP_INCOMPLETE_REMINDER":
      return `URGENT: Call DVSA now on 0300 200 1122 to complete your test swap. Time running out: ${shortUrl}`;

    case "SWAP_COMPLETED_NOT_CLOSED":
      return `Your swap partner has marked complete. You still need to mark it: ${shortUrl}`;

    case "SWAP_COMPLETED_CONFIRMATION":
      return `MoveMyTest — Your swap is confirmed! ${swapContext?.fromCentre ?? ""} → ${swapContext?.toCentre ?? ""}. Thanks for using MoveMyTest!`;

    case "MATCH_DECLINED":
      return `MoveMyTest — Your match for ${swapContext?.fromCentre ?? "your test"} has been declined. Your listing is still active.`;

    default:
      return "MoveMyTest update. Check your dashboard for details.";
  }
}

// ---------------------------------------------------------------------------
// Learner mobile lookup
// ---------------------------------------------------------------------------

async function lookupLearnerMobile(accountId: string | null): Promise<string> {
  if (!accountId) return "";
  const account = await prisma.learnerAccount.findUnique({
    where: { id: accountId },
    select: { mobileNumber: true, mobileContactConsentAt: true, smsOptOutAt: true },
  });
  if (!account?.mobileNumber || !account?.mobileContactConsentAt) return "";
  // Phase 8.4 (2026-06-07): hard STOP-reply opt-out gate. Mirrors the
  // DTC-side pattern. If the learner has texted STOP at any point,
  // their phone is excluded from the queue regardless of any other
  // preference. The /dashboard/settings page is where they re-consent.
  if (account.smsOptOutAt) return "";
  const sanitized = sanitizePhoneNumber(account.mobileNumber);
  if (!sanitized) return "";
  return sanitized;
}

// ---------------------------------------------------------------------------
// Format remaining time helper (human-readable)
// ---------------------------------------------------------------------------

function formatRemaining(expiresAt: Date | null, now: Date): string {
  if (!expiresAt) return "limited time";
  const diffMs = expiresAt.getTime() - now.getTime();
  if (diffMs <= 0) return "expired";
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  if (hours >= 1) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

// ---------------------------------------------------------------------------
// Processor — called via lazy expiry on dashboard/match pages
// ---------------------------------------------------------------------------

export async function processDueSms(): Promise<{ sent: number; skipped: number; failed: number }> {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const now = new Date();

  const pending = await (prisma as any).$queryRawUnsafe(
    "SELECT * FROM SmsQueue WHERE status = 'PENDING' AND scheduledFor <= ? LIMIT 50",
    now,
  ) as SmsQueueRow[];

  let sent = 0;
  let skipped = 0;
  let failed = 0;

  for (const item of pending) {
    if ((item.retryCount ?? 0) >= (item.maxRetries ?? 3)) continue;

    try {
      const matchResult = await (prisma as any).$queryRawUnsafe(
        "SELECT status, callWindowExpiresAt FROM \`Match\` WHERE id = ? LIMIT 1",
        item.matchId,
      ) as Array<{ status: string; callWindowExpiresAt: string | null }>;

      const matchStatus = matchResult[0]?.status;

      // Skip reminders if match is already completed or expired
      if (
        (item.kind === "SWAP_INCOMPLETE_REMINDER" ||
          item.kind === "SWAP_COMPLETED_NOT_CLOSED" ||
          item.kind === "MATCH_ACCEPTANCE_REMINDER" ||
          item.kind === "MATCH_FINAL_WARNING") &&
        ["COMPLETED", "EXPIRED"].includes(matchStatus ?? "")
      ) {
        await (prisma as any).$executeRawUnsafe(
          "UPDATE SmsQueue SET status = 'SKIPPED', updatedAt = ? WHERE id = ?",
          now,
          item.id,
        );
        skipped++;
        continue;
      }

      // Skip MATCH_FOUND if match is no longer proposed
      if (item.kind === "MATCH_FOUND" && matchStatus !== "PROPOSED") {
        await (prisma as any).$executeRawUnsafe(
          "UPDATE SmsQueue SET status = 'SKIPPED', updatedAt = ? WHERE id = ?",
          now,
          item.id,
        );
        skipped++;
        continue;
      }

      // Skip decline notification if match is no longer declined
      if (item.kind === "MATCH_DECLINED" && matchStatus !== "DECLINED") {
        await (prisma as any).$executeRawUnsafe(
          "UPDATE SmsQueue SET status = 'SKIPPED', updatedAt = ? WHERE id = ?",
          now,
          item.id,
        );
        skipped++;
        continue;
      }

      const callWindowExpiresAt = matchResult[0]?.callWindowExpiresAt
        ? new Date(matchResult[0].callWindowExpiresAt)
        : null;
      const remaining = formatRemaining(callWindowExpiresAt, now);

      // Build swap context for SMS that need match details
      let swapContext:
        | { fromCentre: string; fromDateTime: string; toCentre: string; toDateTime: string; matchId?: string }
        | undefined;
      if (
        ["SWAP_COMPLETED_CONFIRMATION", "MATCH_FOUND", "MATCH_ACCEPTANCE_REMINDER", "MATCH_FINAL_WARNING"].includes(
          item.kind,
        )
      ) {
        const match = await prisma.match.findUnique({
          where: { id: item.matchId },
          include: {
            listingA: { include: { currentCentre: { select: { name: true } } } },
            listingB: { include: { currentCentre: { select: { name: true } } } },
          },
        });
        if (!match) continue;
        const isRecipientA =
          (await lookupLearnerMobile(match.listingA.accountId)) === item.recipient;
        if (isRecipientA) {
          swapContext = {
            fromCentre: match.listingA.currentCentre.name,
            fromDateTime: new Date(match.listingA.currentDateTime).toLocaleString("en-GB", {
              dateStyle: "medium",
              timeStyle: "short",
              timeZone: "Europe/London",
            }),
            toCentre: match.listingB.currentCentre.name,
            toDateTime: new Date(match.listingB.currentDateTime).toLocaleString("en-GB", {
              dateStyle: "medium",
              timeStyle: "short",
              timeZone: "Europe/London",
            }),
            matchId: match.id,
          };
        } else if (match) {
          swapContext = {
            fromCentre: match.listingB.currentCentre.name,
            fromDateTime: new Date(match.listingB.currentDateTime).toLocaleString("en-GB", {
              dateStyle: "medium",
              timeStyle: "short",
              timeZone: "Europe/London",
            }),
            toCentre: match.listingA.currentCentre.name,
            toDateTime: new Date(match.listingA.currentDateTime).toLocaleString("en-GB", {
              dateStyle: "medium",
              timeStyle: "short",
              timeZone: "Europe/London",
            }),
            matchId: match.id,
          };
        }
      }

      const body = smsBodyForKind(item.kind as SmsQueueKind, remaining, swapContext);
      const result = await sendSms(item.recipient, truncateSmsBody(body));

      if (result.success) {
        await (prisma as any).$executeRawUnsafe(
          "UPDATE SmsQueue SET status = 'SENT', sentAt = ?, twilioSid = ?, updatedAt = ? WHERE id = ?",
          now,
          result.sid ?? null,
          now,
          item.id,
        );
        sent++;
      } else {
        await (prisma as any).$executeRawUnsafe(
          "UPDATE SmsQueue SET retryCount = retryCount + 1, status = ?, error = ?, updatedAt = ? WHERE id = ?",
          (item.retryCount ?? 0) >= 2 ? "FAILED" : "PENDING",
          result.error?.slice(0, 500) ?? "Unknown error",
          now,
          item.id,
        );
        failed++;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      await (prisma as any).$executeRawUnsafe(
        "UPDATE SmsQueue SET retryCount = retryCount + 1, status = ?, error = ?, updatedAt = ? WHERE id = ?",
        (item.retryCount ?? 0) >= 2 ? "FAILED" : "PENDING",
        message.slice(0, 500),
        now,
        item.id,
      );
      failed++;
    }
  }
  /* eslint-enable @typescript-eslint/no-explicit-any */

  return { sent, skipped, failed };
}

// ---------------------------------------------------------------------------
// Scheduler — called when matches are created
// ---------------------------------------------------------------------------

export async function scheduleMatchSmsQueue(matchId: string, now = new Date()) {
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: { listingA: true, listingB: true },
  });
  if (!match) return 0;

  const learnerAMobile = await lookupLearnerMobile(match.listingA.accountId);
  const learnerBMobile = await lookupLearnerMobile(match.listingB.accountId);

  const smsEntries: Array<{ kind: SmsQueueKind; recipient: string | null; recipientRole: string; scheduledFor: Date }> = [];

  // 4-hour reminder if match exists but not yet completed
  if (match.status !== "COMPLETED") {
    const fourHoursFromNow = new Date(now.getTime() + 4 * 60 * 60 * 1000);
    if (learnerAMobile) {
      smsEntries.push({ kind: "SWAP_INCOMPLETE_REMINDER", recipient: learnerAMobile!, recipientRole: "LEARNER", scheduledFor: fourHoursFromNow });
    }
    if (learnerBMobile) {
      smsEntries.push({ kind: "SWAP_INCOMPLETE_REMINDER", recipient: learnerBMobile!, recipientRole: "LEARNER", scheduledFor: fourHoursFromNow });
    }
  }

  // Legacy safety: one partner completed, the other hasn't
  const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);
  if (match.learnerACompletedAt && !match.learnerBCompletedAt && learnerBMobile) {
    smsEntries.push({ kind: "SWAP_COMPLETED_NOT_CLOSED", recipient: learnerBMobile!, recipientRole: "LEARNER", scheduledFor: twoHoursFromNow });
  }
  if (match.learnerBCompletedAt && !match.learnerACompletedAt && learnerAMobile) {
    smsEntries.push({ kind: "SWAP_COMPLETED_NOT_CLOSED", recipient: learnerAMobile!, recipientRole: "LEARNER", scheduledFor: twoHoursFromNow });
  }

  // Swap completion confirmation — send immediately
  if (match.status === "COMPLETED") {
    if (learnerAMobile) smsEntries.push({ kind: "SWAP_COMPLETED_CONFIRMATION", recipient: learnerAMobile!, recipientRole: "LEARNER", scheduledFor: now });
    if (learnerBMobile) smsEntries.push({ kind: "SWAP_COMPLETED_CONFIRMATION", recipient: learnerBMobile!, recipientRole: "LEARNER", scheduledFor: now });
  }

  /* eslint-disable @typescript-eslint/no-explicit-any */
  for (const entry of smsEntries) {
    await (prisma as any).$executeRawUnsafe(
      "INSERT INTO SmsQueue (id, matchId, kind, recipient, recipientRole, scheduledFor, retryCount, maxRetries, status) VALUES (?, ?, ?, ?, ?, ?, 0, 3, 'PENDING')",
      `sms_${matchId}_${entry.kind}_${entry.recipient}_${Date.now()}`.slice(0, 191),
      matchId,
      entry.kind,
      entry.recipient,
      entry.recipientRole,
      entry.scheduledFor,
    );
  }
  /* eslint-enable @typescript-eslint/no-explicit-any */

  return smsEntries.length;
}

export async function scheduleMatchProposedSms(matchId: string, now = new Date()) {
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: {
      listingA: { include: { currentCentre: { select: { name: true } } } },
      listingB: { include: { currentCentre: { select: { name: true } } } },
    },
  });
  if (!match) return 0;

  const learnerAMobile = await lookupLearnerMobile(match.listingA.accountId);
  const learnerBMobile = await lookupLearnerMobile(match.listingB.accountId);

  const smsEntries: Array<{ kind: SmsQueueKind; recipient: string | null; recipientRole: string; scheduledFor: Date }> = [];

  // MATCH_FOUND: send immediately
  if (learnerAMobile) {
    smsEntries.push({ kind: "MATCH_FOUND", recipient: learnerAMobile!, recipientRole: "LEARNER", scheduledFor: now });
  }
  if (learnerBMobile) {
    smsEntries.push({ kind: "MATCH_FOUND", recipient: learnerBMobile!, recipientRole: "LEARNER", scheduledFor: now });
  }

  // MATCH_ACCEPTANCE_REMINDER: 24 hours later
  const reminderTime = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  if (learnerAMobile) {
    smsEntries.push({ kind: "MATCH_ACCEPTANCE_REMINDER", recipient: learnerAMobile!, recipientRole: "LEARNER", scheduledFor: reminderTime });
  }
  if (learnerBMobile) {
    smsEntries.push({ kind: "MATCH_ACCEPTANCE_REMINDER", recipient: learnerBMobile!, recipientRole: "LEARNER", scheduledFor: reminderTime });
  }

  // MATCH_FINAL_WARNING: 36 hours (between 24h reminder and 48h expiry)
  const warningTime = new Date(now.getTime() + 36 * 60 * 60 * 1000);
  if (learnerAMobile) {
    smsEntries.push({ kind: "MATCH_FINAL_WARNING", recipient: learnerAMobile!, recipientRole: "LEARNER", scheduledFor: warningTime });
  }
  if (learnerBMobile) {
    smsEntries.push({ kind: "MATCH_FINAL_WARNING", recipient: learnerBMobile!, recipientRole: "LEARNER", scheduledFor: warningTime });
  }

  /* eslint-disable @typescript-eslint/no-explicit-any */
  for (const entry of smsEntries) {
    await (prisma as any).$executeRawUnsafe(
      "INSERT INTO SmsQueue (id, matchId, kind, recipient, recipientRole, scheduledFor, retryCount, maxRetries, status) VALUES (?, ?, ?, ?, ?, ?, 0, 3, 'PENDING')",
      `sms_${matchId}_${entry.kind}_${entry.recipient}_${Date.now()}`.slice(0, 191),
      matchId,
      entry.kind,
      entry.recipient,
      entry.recipientRole,
      entry.scheduledFor,
    );
  }
  /* eslint-enable @typescript-eslint/no-explicit-any */

  return smsEntries.length;
}

/**
 * Export for external callers that want to trigger SMS processing
 * (mirrors sendQueuedMoveMyTestEmailsAction pattern).
 */
export async function sendQueuedSmsAction(_matchId?: string) {
  const result = await processDueSms();
  return result;
}

