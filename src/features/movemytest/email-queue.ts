"use server";

import nodemailer from "nodemailer";
import { prisma } from "@/lib/db/prisma";
import { getMailboxConfig } from "@/lib/communications/config";
import { TRUSTPILOT_BCC } from "@/lib/trustpilot";

type MoveMyTestEmailQueueKind = "MATCH_FOUND" | "MATCH_ACCEPTANCE_REMINDER" | "MATCH_FINAL_WARNING" | "SWAP_INCOMPLETE_REMINDER" | "SWAP_COMPLETED_NOT_CLOSED" | "INSTRUCTOR_INVITE" | "SWAP_COMPLETED_CONFIRMATION" | "MATCH_DECLINED";

const TRUSTPILOT_REVIEW_URL = "https://uk.trustpilot.com/review/movemytest.co.uk";
// Phase 8.4 (2026-06-07): used in the email footer opt-out link. The
// settings page will exist by the time this email goes out (it's in
// the same commit).
const PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://movemytest.co.uk";

interface EmailQueueRow {
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
  createdAt: string;
  updatedAt: string;
}

function mailer() {
  const config = getMailboxConfig();
  return nodemailer.createTransport({ host: config.smtpHost, port: config.smtpPort, secure: config.smtpSecure, auth: { user: config.username, pass: config.password } });
}

function fromAddress() {
  return getMailboxConfig().username || "support@movemytest.co.uk";
}

function subjectForKind(kind: MoveMyTestEmailQueueKind) {
  const map: Record<MoveMyTestEmailQueueKind, string> = {
    MATCH_FOUND: "ACTION REQUIRED: MoveMyTest match found — 2 business days to accept",
    MATCH_ACCEPTANCE_REMINDER: "Reminder: Your MoveMyTest match expires soon",
    MATCH_FINAL_WARNING: "FINAL WARNING: Your MoveMyTest match expires in hours",
    SWAP_INCOMPLETE_REMINDER: "URGENT: Call DVSA NOW — time left to complete your swap",
    SWAP_COMPLETED_NOT_CLOSED: "URGENT: Mark your swap complete — your match partner is waiting",
    INSTRUCTOR_INVITE: "A learner has linked you to a MoveMyTest request",
    SWAP_COMPLETED_CONFIRMATION: "Your MoveMyTest is confirmed",
    MATCH_DECLINED: "MoveMyTest match declined",
  };
  return map[kind] ?? "MoveMyTest update";
}

function bodyForKind(
  kind: MoveMyTestEmailQueueKind,
  remaining: string | null,
  swapContext?: { fromCentre: string; fromDateTime: string; toCentre: string; toDateTime: string; matchId?: string },
  matchExpiry?: string | null,
) {
  if (kind === "MATCH_FOUND" && swapContext) {
    return `Hello,

Great news — we've found a learner who wants to swap test slots with you.

YOUR CURRENT SLOT:
${swapContext.fromCentre} on ${swapContext.fromDateTime}

THEIR OFFERED SLOT:
${swapContext.toCentre} on ${swapContext.toDateTime}

WHAT HAPPENS NEXT:
1. Review the match at https://movemytest.co.uk/matches/${swapContext.matchId ?? ""}
2. Click "Accept match" if you're happy with the swap
3. Once both learners accept, you'll privately share booking references
4. Then call DVSA on 0300 200 1122 (Mon–Fri, 8am–5pm) to complete the official swap

IMPORTANT:
• You have ${matchExpiry ?? "2 business days"} to accept this match or it expires
• Your booking reference stays private until both learners accept
• DVSA requires at least 10 full days notice to change your test date
• This is your highest-scoring match — but you may have others

REVIEW AND ACCEPT NOW:
https://movemytest.co.uk/matches/${swapContext.matchId ?? ""}

Many thanks,
MoveMyTest Team`;
  }

  if (kind === "MATCH_ACCEPTANCE_REMINDER" && swapContext) {
    return `Hello,

You have a pending MoveMyTest match that needs your acceptance.

YOUR SWAP:
${swapContext.fromCentre} on ${swapContext.fromDateTime}  ↔  ${swapContext.toCentre} on ${swapContext.toDateTime}

TIME REMAINING: ${remaining ?? "limited time"}

If this match expires, both listings return to the matching pool and you'll need to wait for a new match.

Accept here: https://movemytest.co.uk/matches/${swapContext.matchId ?? ""}

Many thanks,
MoveMyTest Team`;
  }

  if (kind === "MATCH_FINAL_WARNING" && swapContext) {
    return `Hello,

FINAL WARNING — your MoveMyTest match expires in ${remaining ?? "hours"}.

YOUR SWAP:
${swapContext.fromCentre} on ${swapContext.fromDateTime}  ↔  ${swapContext.toCentre} on ${swapContext.toDateTime}

This is your LAST CHANCE to accept this match.

If you don't accept before the deadline, this match will be cancelled and both listings will return to the matching pool. You'll need to wait for a new match to be found.

Remember: DVSA requires at least 10 full days notice to change your test date. Every day you wait reduces your options.

ACCEPT NOW: https://movemytest.co.uk/matches/${swapContext.matchId ?? ""}

Many thanks,
MoveMyTest Team`;
  }

  if (kind === "SWAP_INCOMPLETE_REMINDER") {
    return `Hello,

You have ${remaining ?? "limited time"} left to complete your DVSA phone swap.

CALL DVSA NOW:
📞 0300 200 1122
Monday–Friday, 8am–5pm

AFTER THE CALL:
One learner clicks "Complete match" on the dashboard — that's it, done for both of you.

WHAT HAPPENS IF TIME RUNS OUT:
• This match is cancelled
• Both listings return to the matching pool
• You'll need to wait for a new match
• Your test date is getting closer

Complete now: https://movemytest.co.uk/dashboard#call-dvsa

Many thanks,
MoveMyTest Team`;
  }

  if (kind === "SWAP_COMPLETED_NOT_CLOSED") {
    return `Hello,

Your match partner has already marked the swap as complete. They're waiting on you.

All that's left is for YOU to click "Complete match" on your dashboard.

This confirms both of you are done and closes the match for good.

Mark complete: https://movemytest.co.uk/dashboard

Many thanks,
MoveMyTest Team`;
  }

  if (kind === "SWAP_COMPLETED_CONFIRMATION" && swapContext) {
    return `Hello,

Thank you for using MoveMyTest. Your swap has been marked complete.

MoveMyTest helped match your original test slot with another learner, kept the booking references private until both learners were ready, and guided you through the DVSA phone-swap stage.

YOUR COMPLETED SWAP:
• From: ${swapContext.fromCentre} on ${swapContext.fromDateTime}
• To: ${swapContext.toCentre} on ${swapContext.toDateTime}

DVSA completes the official booking change. Please keep your DVSA booking reference safe and check your GOV.UK booking confirmation for the final test details.

If MoveMyTest helped you, consider a one-off contribution to help keep it free for everyone at https://movemytest.co.uk/support-us

We would love to hear about your experience. Leave a review on Trustpilot: ${TRUSTPILOT_REVIEW_URL}

Many thanks,
MoveMyTest Team`;
  }

  if (kind === "MATCH_DECLINED" && swapContext) {
    return `Hello,

We're sorry — your match partner has declined the proposed test swap.

THE PROPOSED SWAP WAS:
• From: ${swapContext.fromCentre} on ${swapContext.fromDateTime}
• To: ${swapContext.toCentre} on ${swapContext.toDateTime}

WHAT HAPPENS NOW:
• This match is now closed
• Your listing is still active and back in the matching pool
• MoveMyTest will continue looking for compatible matches
• You do not need to do anything — just wait for the next match notification

Your current test booking has NOT been changed. DVSA has not been contacted about this match.

Dashboard: https://movemytest.co.uk/dashboard

Many thanks,
MoveMyTest Team`;
  }

// INSTRUCTOR_INVITE
  return `Hello,

A learner driver has linked you to a MoveMyTest request and provided your ADI number and contact details.

The learner would like you to be able to view and manage MoveMyTest requests linked to your ADI number.

Register for free at https://movemytest.co.uk/instructor/register to see upcoming tests, manage swap requests, and use the instructor calendar. Once registered, all learners linked to your ADI number will appear on your dashboard.

If you believe this was sent in error, please ignore this email or contact support@movemytest.co.uk.

Many thanks,
MoveMyTest Team`;
}

function htmlBody(body: string) {
  // Phase 8.4 (2026-06-07): added an opt-out link in the footer so
  // recipients have a one-tap way to manage their preferences
  // (PECR / GDPR requirement for non-transactional email).
  return `<html><body style="font-family:sans-serif;max-width:580px;margin:0 auto;padding:20px;color:#1e293b;line-height:1.6;"><main style="background:#fff;border:1px solid #e2e8f0;border-radius:16px;padding:24px;">${body.replace(/\n{2}/g, '</p><p style="margin:0 0 12px 0;">').replace(/\n/g, '<br>')}</p></main><footer style="margin-top:16px;font-size:12px;color:#94a3b8;"><p>This is an automated message from MoveMyTest. Reply to support@movemytest.co.uk for help.</p><p style="margin-top:8px;">Don't want these emails? <a href="${PUBLIC_BASE_URL}/dashboard/settings" style="color:#0284c7;">Manage your notification preferences</a>.</p></footer></body></html>`;
}

function formatRemaining(expiresAt: Date | null, now: Date) {
  if (!expiresAt) return null;
  const diff = Math.ceil((expiresAt.getTime() - now.getTime()) / 60000);
  if (diff <= 0) return "No time remaining";
  const days = Math.floor(diff / (24 * 60));
  const hours = Math.floor((diff % (24 * 60)) / 60);
  const mins = diff % 60;
  const parts: string[] = [];
  if (days) parts.push(`${days}d`);
  if (hours || days) parts.push(`${hours}h`);
  parts.push(`${mins}m`);
  return parts.join(" ");
}

async function lookupLearnerEmail(accountId: string | null) {
  if (!accountId) return null;
  const account = await prisma.learnerAccount.findUnique({ where: { id: accountId }, select: { email: true } });
  return account?.email ?? null;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export async function sendQueuedMoveMyTestEmailsAction(matchId?: string) {
  const now = new Date();
  const pending = matchId
    ? await (prisma as any).$queryRawUnsafe(
        "SELECT * FROM `EmailQueue` WHERE status = 'PENDING' AND scheduledFor <= ? AND matchId = ?",
        now.toISOString(),
        matchId,
      ) as EmailQueueRow[]
    : await (prisma as any).$queryRawUnsafe(
        "SELECT * FROM `EmailQueue` WHERE status = 'PENDING' AND scheduledFor <= ?",
        now.toISOString(),
      ) as EmailQueueRow[];

  for (const item of pending) {
    if ((item.retryCount ?? 0) >= (item.maxRetries ?? 3)) continue;
    try {
      const matchResult = await (prisma as any).$queryRawUnsafe(
        "SELECT status, callWindowExpiresAt, listingAId, listingBId FROM MoveMyTestMatch WHERE id = ? LIMIT 1",
        item.matchId,
      ) as Array<{ status: string; callWindowExpiresAt: string | null; listingAId: string; listingBId: string }>;
      const matchStatus = matchResult[0]?.status;

// Skip reminders if match is already completed or expired
      if ((item.kind === "SWAP_INCOMPLETE_REMINDER" || item.kind === "SWAP_COMPLETED_NOT_CLOSED" || item.kind === "MATCH_ACCEPTANCE_REMINDER" || item.kind === "MATCH_FINAL_WARNING") && ["COMPLETED", "EXPIRED"].includes(matchStatus ?? "")) {
        await (prisma as any).$executeRawUnsafe(
          "UPDATE `EmailQueue` SET status = 'SKIPPED', updatedAt = ? WHERE id = ?",
          now.toISOString(),
          item.id,
        );
        continue;
      }

// Skip MATCH_FOUND if match is no longer proposed
      if (item.kind === "MATCH_FOUND" && matchStatus !== "PROPOSED") {
        await (prisma as any).$executeRawUnsafe(
          "UPDATE `EmailQueue` SET status = 'SKIPPED', updatedAt = ? WHERE id = ?",
          now.toISOString(),
          item.id,
        );
        continue;
      }

// Skip decline notification if match is no longer declined
      if (item.kind === "MATCH_DECLINED" && matchStatus !== "DECLINED") {
        await (prisma as any).$executeRawUnsafe(
          "UPDATE `EmailQueue` SET status = 'SKIPPED', updatedAt = ? WHERE id = ?",
          now.toISOString(),
          item.id,
        );
        continue;
      }

      const callWindowExpiresAt = matchResult[0]?.callWindowExpiresAt ? new Date(matchResult[0].callWindowExpiresAt) : null;
      const remaining = formatRemaining(callWindowExpiresAt, now);

// Build swap context for emails that need match details
      let swapContext: { fromCentre: string; fromDateTime: string; toCentre: string; toDateTime: string; matchId?: string } | undefined;
      if (["SWAP_COMPLETED_CONFIRMATION", "MATCH_FOUND", "MATCH_ACCEPTANCE_REMINDER", "MATCH_FINAL_WARNING"].includes(item.kind)) {
        const match = await prisma.match.findUnique({
          where: { id: item.matchId },
          include: {
            listingA: { include: { currentCentre: { select: { name: true } } } },
            listingB: { include: { currentCentre: { select: { name: true } } } },
          },
        });
        const isRecipientA = match?.listingA.accountId && await lookupLearnerEmail(match.listingA.accountId) === item.recipient;
        if (match && isRecipientA) {
          swapContext = {
            fromCentre: match.listingA.currentCentre.name,
            fromDateTime: new Date(match.listingA.currentDateTime).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/London" }),
            toCentre: match.listingB.currentCentre.name,
            toDateTime: new Date(match.listingB.currentDateTime).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/London" }),
            matchId: match.id,
          };
        } else if (match) {
          swapContext = {
            fromCentre: match.listingB.currentCentre.name,
            fromDateTime: new Date(match.listingB.currentDateTime).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/London" }),
            toCentre: match.listingA.currentCentre.name,
            toDateTime: new Date(match.listingA.currentDateTime).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/London" }),
            matchId: match.id,
          };
        }
      }

      const body = bodyForKind(item.kind as MoveMyTestEmailQueueKind, remaining, swapContext);
      const subject = subjectForKind(item.kind as MoveMyTestEmailQueueKind);
      // Phase 8.4 (2026-06-07): List-Unsubscribe header so email clients
      // (Gmail, Outlook, etc.) show a one-click "Unsubscribe" link. Per
      // RFC 8058, this is the standard way to provide a one-click opt-out.
      await mailer().sendMail({
        from: fromAddress(),
        to: item.recipient,
        bcc: TRUSTPILOT_BCC,
        subject,
        html: htmlBody(body),
        headers: {
          "List-Unsubscribe": `<${PUBLIC_BASE_URL}/dashboard/settings>`,
          "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
        },
      });
      await (prisma as any).$executeRawUnsafe(
        "UPDATE `EmailQueue` SET status = 'SENT', sentAt = ?, updatedAt = ? WHERE id = ?",
        now.toISOString(), now.toISOString(), item.id,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      await (prisma as any).$executeRawUnsafe(
        "UPDATE `EmailQueue` SET retryCount = retryCount + 1, status = ?, error = ?, updatedAt = ? WHERE id = ?",
        (item.retryCount ?? 0) >= 2 ? "FAILED" : "PENDING",
        message.slice(0, 500),
        now.toISOString(),
        item.id,
      );
    }
  }
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export async function scheduleMatchEmailQueue(matchId: string, now = new Date()) {
  const match = await prisma.match.findUnique({ where: { id: matchId }, include: { listingA: true, listingB: true } });
  if (!match) return 0;

  const learnerAEmail = await lookupLearnerEmail(match.listingA.accountId);
  const learnerBEmail = await lookupLearnerEmail(match.listingB.accountId);

  const emails: Array<{ kind: MoveMyTestEmailQueueKind; recipient: string; recipientRole: string; scheduledFor: Date }> = [];

// 4-hour reminder if match exists but not yet completed
  if (match.status !== "COMPLETED") {
    const fourHoursFromNow = new Date(now.getTime() + 4 * 60 * 60 * 1000);
    if (learnerAEmail) {
      emails.push({ kind: "SWAP_INCOMPLETE_REMINDER", recipient: learnerAEmail, recipientRole: "LEARNER", scheduledFor: fourHoursFromNow });
    }
    if (learnerBEmail) {
      emails.push({ kind: "SWAP_INCOMPLETE_REMINDER", recipient: learnerBEmail, recipientRole: "LEARNER", scheduledFor: fourHoursFromNow });
    }
  }

// Legacy safety: old queued jobs may still exist from before one completion closed the match for both learners.
  const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);
  if (match.learnerACompletedAt && !match.learnerBCompletedAt && learnerBEmail) {
    emails.push({ kind: "SWAP_COMPLETED_NOT_CLOSED", recipient: learnerBEmail, recipientRole: "LEARNER", scheduledFor: twoHoursFromNow });
  }
  if (match.learnerBCompletedAt && !match.learnerACompletedAt && learnerAEmail) {
    emails.push({ kind: "SWAP_COMPLETED_NOT_CLOSED", recipient: learnerAEmail, recipientRole: "LEARNER", scheduledFor: twoHoursFromNow });
  }

// Instructor invite once swap is completed
  if (match.status === "COMPLETED") {
    for (const listing of [match.listingA, match.listingB]) {
      const instructorLink = await prisma.listingInstructor.findUnique({ where: { listingId: listing.id } });
      if (instructorLink?.email) {
        emails.push({ kind: "INSTRUCTOR_INVITE", recipient: instructorLink.email, recipientRole: "INSTRUCTOR", scheduledFor: now });
      }
    }
  }

// Swap completion confirmation — send immediately when swap is completed
  if (match.status === "COMPLETED") {
    if (learnerAEmail) emails.push({ kind: "SWAP_COMPLETED_CONFIRMATION", recipient: learnerAEmail, recipientRole: "LEARNER", scheduledFor: now });
    if (learnerBEmail) emails.push({ kind: "SWAP_COMPLETED_CONFIRMATION", recipient: learnerBEmail, recipientRole: "LEARNER", scheduledFor: now });
  }

  /* eslint-disable @typescript-eslint/no-explicit-any */
  for (const email of emails) {
    await (prisma as any).$executeRawUnsafe(
      "INSERT INTO `EmailQueue` (id, matchId, kind, recipient, recipientRole, scheduledFor, retryCount, maxRetries, status) VALUES (?, ?, ?, ?, ?, ?, 0, 3, 'PENDING')",
      `email_${matchId}_${email.kind}_${email.recipient}_${Date.now()}`.slice(0, 191),
      matchId,
      email.kind,
      email.recipient,
      email.recipientRole,
      email.scheduledFor.toISOString(),
    );
  }
  /* eslint-enable @typescript-eslint/no-explicit-any */

  return emails.length;
}

// New function: send MATCH_FOUND email immediately and queue reminders
export async function scheduleMatchProposedEmails(matchId: string, now = new Date()) {
  const match = await prisma.match.findUnique({ where: { id: matchId }, include: { listingA: { include: { currentCentre: { select: { name: true } } } }, listingB: { include: { currentCentre: { select: { name: true } } } } } });
  if (!match) return 0;

  const learnerAEmail = await lookupLearnerEmail(match.listingA.accountId);
  const learnerBEmail = await lookupLearnerEmail(match.listingB.accountId);

  const emails: Array<{ kind: MoveMyTestEmailQueueKind; recipient: string; recipientRole: string; scheduledFor: Date }> = [];

// MATCH_FOUND: send immediately
  if (learnerAEmail) {
    emails.push({ kind: "MATCH_FOUND", recipient: learnerAEmail, recipientRole: "LEARNER", scheduledFor: now });
  }
  if (learnerBEmail) {
    emails.push({ kind: "MATCH_FOUND", recipient: learnerBEmail, recipientRole: "LEARNER", scheduledFor: now });
  }

// MATCH_ACCEPTANCE_REMINDER: 24 hours later
  const reminderTime = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  if (learnerAEmail) {
    emails.push({ kind: "MATCH_ACCEPTANCE_REMINDER", recipient: learnerAEmail, recipientRole: "LEARNER", scheduledFor: reminderTime });
  }
  if (learnerBEmail) {
    emails.push({ kind: "MATCH_ACCEPTANCE_REMINDER", recipient: learnerBEmail, recipientRole: "LEARNER", scheduledFor: reminderTime });
  }

// MATCH_FINAL_WARNING: near expiry (2 business days - 4 hours)
// For simplicity, schedule at 36 hours (between 24h reminder and 48h expiry)
  const warningTime = new Date(now.getTime() + 36 * 60 * 60 * 1000);
  if (learnerAEmail) {
    emails.push({ kind: "MATCH_FINAL_WARNING", recipient: learnerAEmail, recipientRole: "LEARNER", scheduledFor: warningTime });
  }
  if (learnerBEmail) {
    emails.push({ kind: "MATCH_FINAL_WARNING", recipient: learnerBEmail, recipientRole: "LEARNER", scheduledFor: warningTime });
  }

  /* eslint-disable @typescript-eslint/no-explicit-any */
  for (const email of emails) {
    await (prisma as any).$executeRawUnsafe(
      "INSERT INTO `EmailQueue` (id, matchId, kind, recipient, recipientRole, scheduledFor, retryCount, maxRetries, status) VALUES (?, ?, ?, ?, ?, ?, 0, 3, 'PENDING')",
      `email_${matchId}_${email.kind}_${email.recipient}_${Date.now()}`.slice(0, 191),
      matchId,
      email.kind,
      email.recipient,
      email.recipientRole,
      email.scheduledFor.toISOString(),
    );
  }
  /* eslint-enable @typescript-eslint/no-explicit-any */

  return emails.length;
}
