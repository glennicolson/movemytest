/**
 * Twilio inbound SMS webhook — handles STOP / UNSUBSCRIBE / CANCEL replies
 * and re-opt-in messages (START, UNSTOP) from MoveMyTest learners.
 *
 * Phase 8.4 (2026-06-07). Mirrors the DTC's /api/twilio/sms-webhook handler
 * but writes to LearnerAccount (not LearnerProfile) since MMT has its own
 * account model. The gate (smsOptOutAt) is the same pattern.
 *
 * Public endpoint. Secured by Twilio signature validation when the
 * TWILIO_AUTH_TOKEN env var is configured; otherwise the route is open
 * (dev convenience — not recommended for production).
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import crypto from "node:crypto";
import { writeMoveMyTestConsentLog } from "@/lib/movemytest/audit";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STOP_KEYWORDS = ["STOP", "STOPALL", "UNSUBSCRIBE", "CANCEL", "END", "QUIT"];
const START_KEYWORDS = ["START", "YES", "UNSTOP"];
const HELP_KEYWORDS = ["HELP", "INFO"];

// ---------------------------------------------------------------------------
// Signature verification (per Twilio docs)
// https://www.twilio.com/docs/usage/webhooks/webhooks-security
// ---------------------------------------------------------------------------

function verifyTwilioSignature(req: NextRequest, rawBody: string): boolean {
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (!authToken) {
    // Dev fallback: no token configured means no signature check.
    // In production this should be enforced; fail closed if token is set
    // but signature is missing.
    return true;
  }

  const signature = req.headers.get("x-twilio-signature");
  if (!signature) return false;

  const url = new URL(req.url);
  // Twilio signs against the full URL (proto + host + path + query).
  const fullUrl = url.toString();

  // Sort the form params alphabetically by key
  const params: Record<string, string> = {};
  const form = new URLSearchParams(rawBody);
  for (const [k, v] of form.entries()) params[k] = v;
  const sortedKeys = Object.keys(params).sort();
  let dataToSign = fullUrl;
  for (const k of sortedKeys) {
    dataToSign += k + params[k];
  }

  const expected = crypto
    .createHmac("sha1", authToken)
    .update(dataToSign)
    .digest("base64");

  try {
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Intent parser (mirrors the DTC-side rule set)
// ---------------------------------------------------------------------------

type Intent = "OPT_OUT" | "OPT_IN" | "HELP" | "QUESTION" | "UNKNOWN";

function parseIntent(body: string): Intent {
  const text = body.trim().toUpperCase();
  if (STOP_KEYWORDS.includes(text)) return "OPT_OUT";
  if (START_KEYWORDS.includes(text)) return "OPT_IN";
  if (HELP_KEYWORDS.includes(text)) return "HELP";
  // Question mark
  if (text.endsWith("?")) return "QUESTION";
  return "UNKNOWN";
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  const rawBody = await req.text();

  if (!verifyTwilioSignature(req, rawBody)) {
    console.warn("[mmt-sms-webhook] Invalid or missing Twilio signature");
    return new NextResponse("Forbidden", { status: 403 });
  }

  const form = new URLSearchParams(rawBody);
  const from = form.get("From") || "";
  const body = form.get("Body") || "";
  const messageSid = form.get("MessageSid") || "";

  // Strip leading + and country code digits for lookup
  const normalizedFrom = from.replace(/^\+/, "").replace(/^44/, "0");

  // Find the learner account by mobile
  const account = await prisma.learnerAccount.findFirst({
    where: {
      OR: [
        { mobileNumber: { contains: normalizedFrom.slice(-10) } },
        { mobileNumber: from },
      ],
    },
    select: { id: true, email: true, mobileNumber: true, smsOptOutAt: true },
  });

  if (!account) {
    // Twilio expects TwiML even for unknown numbers. Reply with a
    // generic "we couldn't find your account" message but don't fail.
    console.warn(`[mmt-sms-webhook] No account found for from=${from}`);
    return twimlResponse(
      "MoveMyTest: we couldn't find your account. Visit movemytest.co.uk to sign in.",
    );
  }

  const intent = parseIntent(body);
  const now = new Date();

  if (intent === "OPT_OUT") {
    await prisma.learnerAccount.update({
      where: { id: account.id },
      data: {
        smsOptOutAt: now,
        smsOptOutReason: body.trim().toUpperCase(),
        lastOptOutAt: now,
      },
    });
    // Audit log entry for GDPR accountability (Phase 8.4: writes to
    // LearnerConsent table — the schema's purpose-built consent log)
    await writeMoveMyTestConsentLog({
      accountId: account.id,
      eventType: "SMS_OPT_OUT",
    });
    console.log(`[mmt-sms-webhook] Opted out: account=${account.id} from=${from} body=${body}`);
    return twimlResponse(
      "MoveMyTest: you've been unsubscribed from SMS. You can re-enable in your dashboard at movemytest.co.uk/dashboard/settings. Reply STOP to confirm.",
    );
  }

  if (intent === "OPT_IN") {
    // Re-enable SMS — clear opt-out, restamp consent.
    await prisma.learnerAccount.update({
      where: { id: account.id },
      data: {
        smsOptOutAt: null,
        smsOptOutReason: null,
        mobileContactConsentAt: now,
      },
    });
    await writeMoveMyTestConsentLog({
      accountId: account.id,
      eventType: "SMS_OPT_IN",
    });
    console.log(`[mmt-sms-webhook] Opted back in: account=${account.id} from=${from} body=${body}`);
    return twimlResponse(
      "MoveMyTest: you're re-subscribed. You'll get SMS alerts again. Reply STOP at any time to opt out.",
    );
  }

  if (intent === "HELP") {
    return twimlResponse(
      "MoveMyTest: text STOP to opt out, START to opt back in. Manage preferences at movemytest.co.uk/dashboard/settings. Reply HELP for this message.",
    );
  }

  // QUESTION or UNKNOWN — generic reply.
  return twimlResponse(
    "MoveMyTest: reply STOP to opt out of SMS, START to opt back in, or visit movemytest.co.uk/dashboard/settings to manage preferences.",
  );
}

// ---------------------------------------------------------------------------
// TwiML helper
// ---------------------------------------------------------------------------

function twimlResponse(message: string) {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>${escapeXml(message)}</Message>
</Response>`;
  return new NextResponse(xml, {
    status: 200,
    headers: { "Content-Type": "text/xml; charset=utf-8" },
  });
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
