const POSTMARK_API_URL = "https://api.postmarkapp.com/email";

function env(key: string) {
  return process.env[key] || "";
}

/**
 * Send a support response email to a learner.
 * Uses the same Postmark configuration as enquiry notifications.
 */
export async function sendSupportEmail(data: {
  to: string;
  subject: string;
  body: string;
}) {
  const serverToken = env("AUTH_POSTMARK_SERVER_TOKEN");
  const fromEmail = env("AUTH_POSTMARK_FROM_EMAIL");
  const fromName = env("AUTH_POSTMARK_FROM_NAME") || "MoveMyTest";

  if (!serverToken || !fromEmail) {
    console.warn("[support-email] Postmark not configured — skipping support email");
    return;
  }

  try {
    const response = await fetch(POSTMARK_API_URL, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-Postmark-Server-Token": serverToken,
      },
      body: JSON.stringify({
        From: `${fromName} <${fromEmail}>`,
        To: data.to,
        Subject: data.subject,
        TextBody: data.body,
        MessageStream: env("AUTH_POSTMARK_MESSAGE_STREAM") || undefined,
        Tag: "support-response",
      }),
    });

    if (!response.ok) {
      const responseText = await response.text();
      console.error(`[support-email] Postmark support email failed: ${response.status} ${responseText}`);
    }
  } catch (error) {
    console.error("[support-email] Postmark support email error:", error instanceof Error ? error.message : error);
  }
}
