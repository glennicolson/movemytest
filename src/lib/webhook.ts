import crypto from "crypto";

export interface WebhookPayload {
  event: string;
  timestamp: string;
  webhookId: string;
  data: Record<string, unknown>;
}

export interface WebhookResult {
  success: boolean;
  statusCode?: number;
  error?: string;
  retryAfter?: number;
}

/**
 * Generate HMAC-SHA256 signature for webhook payload
 */
export function signWebhookPayload(secret: string, payload: WebhookPayload): string {
  const timestamp = payload.timestamp;
  const body = JSON.stringify(payload);
  const signedPayload = `${timestamp}.${body}`;
  return crypto
    .createHmac("sha256", secret)
    .update(signedPayload)
    .digest("hex");
}

/**
 * Verify webhook signature
 */
export function verifyWebhookSignature(
  secret: string,
  signature: string,
  payload: WebhookPayload
): boolean {
  const expected = signWebhookPayload(secret, payload);
  // Constant-time comparison to prevent timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(signature, "hex"),
    Buffer.from(expected, "hex")
  );
}

/**
 * Send webhook with retry logic
 */
export async function sendWebhook(
  url: string,
  secret: string,
  payload: WebhookPayload,
  attempt = 1,
  maxRetries = 5
): Promise<WebhookResult> {
  const signature = signWebhookPayload(secret, payload);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Webhook-Signature": `sha256=${signature}`,
        "X-Webhook-ID": payload.webhookId,
        "X-Webhook-Event": payload.event,
        "X-Webhook-Timestamp": payload.timestamp,
        "User-Agent": "MoveMyTest-Webhook/1.0",
      },
      body: JSON.stringify(payload),
      // 10 second timeout
      signal: AbortSignal.timeout(10000),
    });

    if (response.ok || response.status === 202) {
      return { success: true, statusCode: response.status };
    }

    // Don't retry on 400, 401, 404, 410
    if ([400, 401, 404, 410].includes(response.status)) {
      return {
        success: false,
        statusCode: response.status,
        error: `Webhook rejected: ${response.status} ${response.statusText}`,
      };
    }

    // Retry with backoff for 429, 500+
    if (attempt < maxRetries) {
      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 16000);
      const retryAfter = response.headers.get("Retry-After");
      const waitMs = retryAfter ? parseInt(retryAfter) * 1000 : delay;

      console.log(`[Webhook] Retry ${attempt}/${maxRetries} after ${waitMs}ms`);
      await new Promise((resolve) => setTimeout(resolve, waitMs));
      return sendWebhook(url, secret, payload, attempt + 1, maxRetries);
    }

    return {
      success: false,
      statusCode: response.status,
      error: `Max retries exceeded. Last status: ${response.status}`,
    };
  } catch (error) {
    const err = error instanceof Error ? error.message : String(error);

    if (attempt < maxRetries) {
      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 16000);
      console.log(`[Webhook] Retry ${attempt}/${maxRetries} after ${delay}ms (error: ${err})`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      return sendWebhook(url, secret, payload, attempt + 1, maxRetries);
    }

    return {
      success: false,
      error: `Max retries exceeded. Last error: ${err}`,
    };
  }
}

/**
 * Generate unique webhook ID
 */
export function generateWebhookId(): string {
  return `wh_${crypto.randomBytes(12).toString("hex")}`;
}

/**
 * Validate webhook timestamp (prevent replay attacks)
 * Returns true if timestamp is within ±5 minutes of now
 */
export function isWebhookTimestampValid(timestamp: string): boolean {
  const webhookTime = new Date(timestamp).getTime();
  const now = Date.now();
  const fiveMinutes = 5 * 60 * 1000;
  return Math.abs(now - webhookTime) < fiveMinutes;
}
