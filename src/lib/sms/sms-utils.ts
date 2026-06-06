/**
 * SMS phone number utilities — validation, sanitization, E.164 formatting.
 * Used by Twilio client, SMS queue, and notification dispatcher.
 */

const UK_MOBILE_PREFIX = /^(\+44|0)7\d{9}$/;
const UK_LANDLINE_REGEX = /^(\+44|0)(1|2|3)\d{9,10}$/;

/** Sanitize a raw phone number to E.164 format. Returns null if invalid. */
export function sanitizePhoneNumber(input: string | null | undefined): string | null {
  if (!input) return null;

  // Strip everything except digits and leading +
  let cleaned = input.replace(/[^\d+]/g, "");

  // Remove leading zeros for E.164
  if (cleaned.startsWith("00")) {
    cleaned = cleaned.replace(/^00/, "+");
  }

  if (cleaned.startsWith("0")) {
    cleaned = "+44" + cleaned.slice(1);
  }

  if (!cleaned.startsWith("+")) {
    cleaned = "+44" + cleaned;
  }

  // Basic validity: must look like a phone number
  if (!/^\+\d{7,15}$/.test(cleaned)) return null;

  return cleaned;
}

/** Returns true if the number is a UK mobile (07xxxxxxxxx pattern). */
export function isUkMobile(phone: string | null | undefined): boolean {
  if (!phone) return false;
  const sanitized = sanitizePhoneNumber(phone);
  if (!sanitized) return false;
  return UK_MOBILE_PREFIX.test(sanitized);
}

/** Returns true if the number is a UK landline. */
export function isUkLandline(phone: string | null | undefined): boolean {
  if (!phone) return false;
  const sanitized = sanitizePhoneNumber(phone);
  if (!sanitized) return false;
  return UK_LANDLINE_REGEX.test(sanitized);
}

/** Returns true if the number looks like a valid UK phone number of any kind. */
export function isUkPhone(phone: string | null | undefined): boolean {
  return isUkMobile(phone) || isUkLandline(phone);
}

/** Full validation result. */
export interface PhoneValidation {
  valid: boolean;
  sanitized: string | null;
  error?: string;
}

export function validateMobileNumber(input: string | null | undefined): PhoneValidation {
  if (!input || input.trim() === "") {
    return { valid: false, sanitized: null, error: "No phone number provided" };
  }

  const sanitized = sanitizePhoneNumber(input);
  if (!sanitized) {
    return { valid: false, sanitized: null, error: "Invalid phone number format" };
  }

  if (!UK_MOBILE_PREFIX.test(sanitized)) {
    return { valid: false, sanitized, error: "Number is not a UK mobile — SMS can only be sent to UK mobile numbers" };
  }

  return { valid: true, sanitized };
}

/** Truncate SMS body to fit within a reasonable segment count. 160 chars per segment. */
export function truncateSmsBody(body: string, maxChars = 480): string {
  if (body.length <= maxChars) return body;
  return body.slice(0, maxChars - 3) + "...";
}
