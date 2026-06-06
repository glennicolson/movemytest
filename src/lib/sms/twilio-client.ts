"use server";

/**
 * Twilio client factory — SMS message sending.
 *
 * MoveMyTest branding. Adapted from DTC's twilio-client.ts.
 *
 * Features:
 * - Lazy-initialized singleton Twilio client
 * - SMS sending with alphanumeric Sender ID support
 * - Graceful degradation when Twilio is not configured (TWILIO_SMS_ENABLED=false)
 */

import twilio from "twilio";
import type { MessageListInstanceCreateOptions } from "twilio/lib/rest/api/v2010/account/message";

// ---------------------------------------------------------------------------
// Environment helpers
// ---------------------------------------------------------------------------

function env(key: string): string {
  return process.env[key] ?? "";
}

function isEnabled(): boolean {
  return env("TWILIO_SMS_ENABLED") === "true";
}

// ---------------------------------------------------------------------------
// Lazy Twilio client
// ---------------------------------------------------------------------------

let _client: ReturnType<typeof twilio> | null = null;

function client(): ReturnType<typeof twilio> | null {
  if (_client) return _client;

  const accountSid = env("TWILIO_ACCOUNT_SID");
  const authToken = env("TWILIO_AUTH_TOKEN");

  if (!accountSid || !authToken) {
    console.warn("[twilio] TWILIO_ACCOUNT_SID or TWILIO_AUTH_TOKEN not set — SMS disabled");
    return null;
  }

  _client = twilio(accountSid, authToken);
  return _client;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SmsResult {
  success: boolean;
  sid?: string;
  status?: string;
  /** Numeric Twilio error code (e.g. 21614) when the call fails. */
  errorCode?: number;
  error?: string;
}

// ---------------------------------------------------------------------------
// SMS
// ---------------------------------------------------------------------------

/**
 * Send an SMS message.
 *
 * Uses an alphanumeric Sender ID ("MoveMyTest") for one-way messages
 * when no dedicated Twilio phone number is configured. Falls back to
 * the from number when TWILIO_PHONE_NUMBER is set.
 */
export async function sendSms(
  to: string,
  body: string,
): Promise<SmsResult> {
  if (!isEnabled()) {
    return { success: false, error: "SMS is disabled (TWILIO_SMS_ENABLED not true)" };
  }

  const twilioClient = client();
  if (!twilioClient) {
    return { success: false, error: "Twilio client not configured" };
  }

  const fromNumber = env("TWILIO_PHONE_NUMBER") || env("TWILIO_ALPHANUMERIC_SENDER_ID") || "MoveMyTest";
  const messagingServiceSid = env("TWILIO_MESSAGING_SERVICE_SID") || undefined;

  try {
    const params: MessageListInstanceCreateOptions = {
      to,
      body,
      ...(messagingServiceSid
        ? { messagingServiceSid }
        : { from: fromNumber }),
    };

    const msg = await twilioClient.messages.create(params);
    console.log(`[twilio] SMS sent to ${to} — SID: ${msg.sid}, status: ${msg.status}`);
    return { success: true, sid: msg.sid, status: msg.status };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const code =
      typeof error === "object" && error !== null && "code" in error
        ? (error as { code?: number }).code
        : undefined;
    console.error(`[twilio] SMS send failed to ${to}${code ? ` [code ${code}]` : ""}: ${message}`);
    return { success: false, error: message, errorCode: code };
  }
}

// ---------------------------------------------------------------------------
// Status check
// ---------------------------------------------------------------------------

/**
 * Check if the Twilio client is properly configured and ready for use.
 * Returns a status object suitable for admin dashboard display.
 */
export async function twilioStatus(): Promise<{
  configured: boolean;
  smsEnabled: boolean;
  hasPhoneNumber: boolean;
  hasMessagingService: boolean;
  accountSidMasked: string;
}> {
  const sid = env("TWILIO_ACCOUNT_SID");
  return {
    configured: !!client(),
    smsEnabled: isEnabled(),
    hasPhoneNumber: !!env("TWILIO_PHONE_NUMBER"),
    hasMessagingService: !!env("TWILIO_MESSAGING_SERVICE_SID"),
    accountSidMasked: sid ? sid.slice(0, 4) + "..." + sid.slice(-4) : "not set",
  };
}
