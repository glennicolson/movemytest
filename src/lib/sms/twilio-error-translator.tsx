/**
 * Twilio error translator
 *
 * Turns raw Twilio error codes (e.g. 63024) into short, plain-English
 * guidance for non-technical staff using the admin messaging portal.
 *
 * Two entry points:
 *
 *   translateTwilioError(input)
 *     — pure function, returns { title, explanation, whatToDo, severity, known }
 *       Use this in any code path that has a Twilio error code or message.
 *
 *   <TwilioErrorGuidance input ... />
 *     — presentational helper. Renders the translated guidance as a small
 *       block with a coloured border, the title, the explanation, and a
 *       "What to do" line. Use this in any UI surface.
 *
 * Design goals:
 *   - One short sentence per field. No jargon.
 *   - Always tell the user whether this is their fault, the recipient's
 *     situation, or a system problem.
 *   - Always include a concrete "What to do" so the user has a next step.
 *   - When the error code is unknown, fall back to "we couldn't match this
 *     to a known issue — copy the code and check with the team" rather
 *     than dumping the raw exception.
 *
 * Codes covered (2026-06-06):
 *   SMS    : 21211, 21408, 21610, 21614, 21611
 *   WhatsApp: 63016, 63024, 30007, 30008
 *   Account : 20003
 */

import { AlertTriangle, Info } from "lucide-react";

export type TwilioErrorSeverity = "info" | "warning" | "error";

export interface TwilioErrorGuidance {
  /** Short headline. E.g. "WhatsApp session not open". */
  title: string;
  /** One sentence explaining what happened, in plain English. */
  explanation: string;
  /** One sentence telling the user what to do next. */
  whatToDo: string;
  /** Visual tone for UI. */
  severity: TwilioErrorSeverity;
  /** True if this is a recognised Twilio code; false for a generic fallback. */
  known: boolean;
}

export interface TwilioErrorInput {
  /** Numeric error code from Twilio, e.g. 63024. Optional. */
  code?: number | string | null;
  /** Raw error message from Twilio. Used to detect codes that arrive in text. */
  message?: string | null;
}

// ---------------------------------------------------------------------------
// Catalog
// ---------------------------------------------------------------------------

type Catalog = Record<string, Omit<TwilioErrorGuidance, "known">>;

const CATALOG: Catalog = {
  // -- WhatsApp -------------------------------------------------------------
  "63016": {
    title: "WhatsApp session has closed",
    explanation:
      "WhatsApp only allows you to send a freeform message to someone within 24 hours of their last message to you. After that, the session closes and Twilio can't deliver freeform messages.",
    whatToDo:
      "Ask the recipient to send you a WhatsApp message first, or send a pre-approved template message instead.",
    severity: "warning",
  },
  "63024": {
    title: "WhatsApp session has closed",
    explanation:
      "WhatsApp only allows you to send a freeform message to someone within 24 hours of their last message to you. After that, the session closes and Twilio can't deliver freeform messages.",
    whatToDo:
      "Ask the recipient to send you a WhatsApp message first, or send a pre-approved template message instead.",
    severity: "warning",
  },
  "30007": {
    title: "Recipient has blocked your business on WhatsApp",
    explanation:
      "The person you tried to message has blocked your business number on WhatsApp, so Twilio can't deliver the message.",
    whatToDo:
      "Try reaching them by SMS instead, or ask them to unblock your number in their WhatsApp settings.",
    severity: "warning",
  },
  "30008": {
    title: "WhatsApp could not deliver this message",
    explanation:
      "WhatsApp refused to deliver the message. This is usually a temporary issue on the recipient's side — for example their phone is off, out of signal, or they have not opted in to receive messages from your business.",
    whatToDo:
      "Wait a few minutes and try again, or contact the recipient by another method to check they are receiving messages.",
    severity: "warning",
  },

  // -- SMS ------------------------------------------------------------------
  "21211": {
    title: "Recipient phone number is not valid",
    explanation:
      "The phone number you entered is not a recognised mobile number. It may be missing the country code, or contain a typo.",
    whatToDo:
      "Check the number starts with a country code (for example +44 for the UK, +1 for the US) and doesn't have any spaces or extra characters, then try again.",
    severity: "error",
  },
  "21408": {
    title: "You don't have permission to send to this number",
    explanation:
      "Your Twilio account is not set up to send messages to this country or this number. This is an account-level setting, not something you can change from the portal.",
    whatToDo:
      "Get in touch with the team — they'll need to update the Twilio account's geographic permissions before you can send here.",
    severity: "error",
  },
  "21610": {
    title: "Recipient has unsubscribed",
    explanation:
      "The person you tried to message has previously replied STOP to one of our messages. UK rules mean we are not allowed to send them any more texts until they text START again.",
    whatToDo:
      "Don't send any more messages to this number. If they want to receive messages again, they can text START to our number from their phone.",
    severity: "warning",
  },
  "21611": {
    title: "Recipient has not opted in",
    explanation:
      "The person you tried to message has not given us permission to send them text messages. UK rules mean we cannot send to them until they opt in.",
    whatToDo:
      "Don't send any more messages to this number. Ask the recipient to opt in (for example by replying YES to a previous message or via the website signup).",
    severity: "warning",
  },
  "21614": {
    title: "Recipient phone number is not valid",
    explanation:
      "The phone number you entered is not a real, reachable number. It may be a landline, a typo, or a number that has been disconnected.",
    whatToDo:
      "Double-check the number with the recipient, including the country code, and try again.",
    severity: "error",
  },

  // -- Account / auth -------------------------------------------------------
  "20003": {
    title: "Twilio account authentication failed",
    explanation:
      "Twilio could not verify the username and password used to send this message. This usually means the account credentials on the server are wrong or have been rotated.",
    whatToDo:
      "Get in touch with the team — they'll need to update the Twilio credentials in the server's environment settings.",
    severity: "error",
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Pull a Twilio error code out of a raw error message if the code
 * wasn't passed in directly. Twilio's exception text usually contains
 * `[Code: 63024]` or `(HTTP 400)`. We handle the most common shapes.
 */
function extractCode(message?: string | null): string | null {
  if (!message) return null;
  const m = message.match(/Code:\s*(\d+)/i) || message.match(/\[(\d{4,6})\]/);
  return m ? m[1] : null;
}

function normaliseCode(code: number | string | null | undefined): string | null {
  if (code === null || code === undefined) return null;
  return String(code);
}

// ---------------------------------------------------------------------------
// Pure API
// ---------------------------------------------------------------------------

/**
 * Look up a Twilio error in the catalog and return plain-English guidance.
 * If the code isn't recognised, returns a generic fallback that asks the
 * user to share the code with the team — never dumps the raw exception.
 */
export function translateTwilioError(input: TwilioErrorInput): TwilioErrorGuidance {
  const codeFromInput = normaliseCode(input.code);
  const codeFromMessage = extractCode(input.message);
  const code = codeFromInput ?? codeFromMessage;

  if (code && CATALOG[code]) {
    return { ...CATALOG[code], known: true };
  }

  // Generic fallback. Always actionable; never leaks the raw exception.
  return {
    title: "Message could not be sent",
    explanation:
      "Twilio did not accept this message. The most common reasons are an invalid number, the recipient has unsubscribed, or a temporary issue on Twilio's side.",
    whatToDo:
      "Check the phone number is correct (with country code), wait a minute, and try again. If it keeps failing, share the error code below with the team.",
    severity: "error",
    known: false,
  };
}

// ---------------------------------------------------------------------------
// Presentational helper
// ---------------------------------------------------------------------------

/**
 * Renders translated Twilio error guidance as a small block suitable for
 * the admin portal. Designed to be used in place of dumping the raw error
 * string. Pass either an errorCode, an errorMessage, or both.
 */
export function TwilioErrorGuidance({
  code,
  message,
  className,
}: {
  code?: number | string | null;
  message?: string | null;
  className?: string;
}) {
  const guidance = translateTwilioError({ code, message });

  // Colours picked to match the existing design system (slate + emerald + rose).
  const styles: Record<TwilioErrorSeverity, { wrap: string; Icon: typeof Info }> = {
    info: {
      wrap: "border-slate-200 bg-slate-50 text-slate-800",
      Icon: Info,
    },
    warning: {
      wrap: "border-amber-200 bg-amber-50 text-amber-900",
      Icon: AlertTriangle,
    },
    error: {
      wrap: "border-rose-200 bg-rose-50 text-rose-900",
      Icon: AlertTriangle,
    },
  };
  const { wrap, Icon } = styles[guidance.severity];

  return (
    <div className={`rounded-md border p-3 text-sm ${wrap} ${className ?? ""}`}>
      <div className="flex items-start gap-2">
        <Icon className="h-4 w-4 mt-0.5 shrink-0" />
        <div className="min-w-0 flex-1 space-y-1.5">
          <p className="font-semibold">{guidance.title}</p>
          <p className="text-[13px] leading-snug opacity-90">{guidance.explanation}</p>
          <p className="text-[13px] leading-snug">
            <span className="font-semibold">What to do: </span>
            {guidance.whatToDo}
          </p>
          {/* Show the raw code so the team can match it to the catalog
              and so users have a reference if they need to ask for help. */}
          {(code || message) && (
            <p className="text-[11px] font-mono opacity-60 break-all">
              {code ? `Code: ${code}` : message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
