"use server";

/**
 * MoveMyTest learner notification preferences server actions.
 *
 * Phase 8.4 (2026-06-07). Mirrors the DTC-side learner preferences
 * (src/features/learners/notification-preferences.ts) but for the
 * standalone MoveMyTest account model.
 *
 * Three actions:
 *   - getMmtPreferences           — read prefs + consent state for the
 *                                  signed-in learner
 *   - updateMmtPreferencesAction  — update toggles; syncs smsOptOutAt
 *                                  and mobileContactConsentAt to match
 *                                  the current state
 *   - clearOptOutAction           — manual re-consent (used by the
 *                                  "I want SMS again" button)
 *
 * Permission: any signed-in MoveMyTest learner.
 */

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireMoveMyTestSession } from "@/features/movemytest/session";
import { writeMoveMyTestConsentLog } from "@/lib/movemytest/audit";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface MoveMyTestPreferences {
  // Per-channel toggles. MMT has fewer than DTC because there's no
  // lessons / test-day to worry about (matches only).
  matchSms: boolean;
  matchEmail: boolean;
  marketingSms: boolean;
  marketingEmail: boolean;
  // Read-only display
  email: string;
  mobileNumber: string | null;
  mobileContactConsentAt: Date | null;
  marketingConsentAt: Date | null;
  smsOptOutAt: Date | null;
  smsOptOutReason: string | null;
  accountSetupCompletedAt: Date | null;
}

const DEFAULTS = {
  matchSms: true,
  matchEmail: true,
  marketingSms: false,
  marketingEmail: false,
} as const;

// ---------------------------------------------------------------------------
// Get
// ---------------------------------------------------------------------------

export async function getMmtPreferences(): Promise<MoveMyTestPreferences> {
  const session = await requireMoveMyTestSession();

  const account = await prisma.learnerAccount.findUnique({
    where: { id: session.accountId },
    select: {
      email: true,
      mobileNumber: true,
      mobileContactConsentAt: true,
      marketingConsentAt: true,
      smsOptOutAt: true,
      smsOptOutReason: true,
      accountSetupCompletedAt: true,
    },
  });

  if (!account) {
    throw new Error("Account not found");
  }

  return {
    matchSms: DEFAULTS.matchSms,
    matchEmail: DEFAULTS.matchEmail,
    marketingSms: !!account.marketingConsentAt,
    marketingEmail: !!account.marketingConsentAt,
    email: account.email,
    mobileNumber: account.mobileNumber ?? null,
    mobileContactConsentAt: account.mobileContactConsentAt,
    marketingConsentAt: account.marketingConsentAt,
    smsOptOutAt: account.smsOptOutAt,
    smsOptOutReason: account.smsOptOutReason,
    accountSetupCompletedAt: account.accountSetupCompletedAt,
  };
}

// ---------------------------------------------------------------------------
// Update
// ---------------------------------------------------------------------------

const updateSchema = z.object({
  matchSms: z.boolean().optional(),
  matchEmail: z.boolean().optional(),
  marketingSms: z.boolean().optional(),
  marketingEmail: z.boolean().optional(),
});

export interface UpdatePreferencesResult {
  status: "success" | "error";
  message: string;
}

export async function updateMmtPreferencesAction(formData: FormData): Promise<void> {
  const session = await requireMoveMyTestSession();

  // Parse the form
  const updates: Record<string, boolean> = {};
  for (const field of ["matchSms", "matchEmail", "marketingSms", "marketingEmail"] as const) {
    const value = formData.get(field);
    if (value !== null) {
      updates[field] = value === "on" || value === "true";
    }
  }

  const parsed = updateSchema.safeParse(updates);
  if (!parsed.success) {
    console.warn("[mmt-prefs] invalid input:", parsed.error.flatten());
    return;
  }

  // Phase 8.4 (2026-06-07): sync the consent fields. If the learner
  // re-enables any SMS channel, also clear the hard opt-out and
  // restamp consent. If they disable all SMS, stamp the opt-out.
  // Email is independent.
  const allSmsOff =
    (parsed.data.matchSms === false) &&
    (parsed.data.marketingSms === false);

  // Track the consent event for GDPR accountability
  if (parsed.data.matchSms === true) {
    await writeMoveMyTestConsentLog({
      accountId: session.accountId,
      eventType: "SMS_OPT_IN",
    });
  } else if (parsed.data.matchSms === false) {
    await writeMoveMyTestConsentLog({
      accountId: session.accountId,
      eventType: "SMS_OPT_OUT",
    });
  }

  if (parsed.data.marketingEmail === true || parsed.data.marketingSms === true) {
    await writeMoveMyTestConsentLog({
      accountId: session.accountId,
      eventType: "MARKETING_OPT_IN",
    });
  } else if (parsed.data.marketingEmail === false && parsed.data.marketingSms === false) {
    await writeMoveMyTestConsentLog({
      accountId: session.accountId,
      eventType: "MARKETING_OPT_OUT",
    });
  }

  // MMT stores a single marketing consent flag (not per-channel). The
  // per-channel toggles in the form are kept for parity with DTC, but
  // here the marketingEmail/Sms collapse to a single field.
  const marketingOn =
    parsed.data.marketingEmail === true || parsed.data.marketingSms === true;

  await prisma.learnerAccount.update({
    where: { id: session.accountId },
    data: {
      // SMS gate sync: enabling any SMS channel restamps consent and
      // clears the opt-out; disabling all SMS stamps the opt-out.
      ...(parsed.data.matchSms === true
        ? { mobileContactConsentAt: new Date(), smsOptOutAt: null, smsOptOutReason: null }
        : {}),
      ...(parsed.data.matchSms === false ? { smsOptOutAt: new Date() } : {}),
      ...(parsed.data.matchSms === undefined && allSmsOff
        ? { smsOptOutAt: new Date() }
        : {}),
      // Marketing consent
      ...(parsed.data.marketingEmail !== undefined || parsed.data.marketingSms !== undefined
        ? { marketingConsentAt: marketingOn ? new Date() : null }
        : {}),
      // Always update lastOptOutAt when opt-out is the latest change
      ...(allSmsOff ? { lastOptOutAt: new Date() } : {}),
    },
  });

  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard/account");
  return;
}

// ---------------------------------------------------------------------------
// Manual re-consent (used by the "Re-enable SMS" button on the page)
// ---------------------------------------------------------------------------

export async function reConsentAction(formData: FormData): Promise<void> {
  const session = await requireMoveMyTestSession();

  await prisma.learnerAccount.update({
    where: { id: session.accountId },
    data: {
      smsOptOutAt: null,
      smsOptOutReason: null,
      mobileContactConsentAt: new Date(),
    },
  });

  await writeMoveMyTestConsentLog({
    accountId: session.accountId,
    eventType: "SMS_OPT_IN",
  });

  revalidatePath("/dashboard/settings");
}
