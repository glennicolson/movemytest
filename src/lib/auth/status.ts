export function getAuthDeliveryStatus() {
  const provider = process.env.AUTH_POSTMARK_SERVER_TOKEN && process.env.AUTH_POSTMARK_FROM_EMAIL
    ? "postmark"
    : "manual";

  return {
    provider,
    configured: provider === "postmark",
    fromEmail: process.env.AUTH_POSTMARK_FROM_EMAIL || null,
    fromName: process.env.AUTH_POSTMARK_FROM_NAME || null,
    messageStream: process.env.AUTH_POSTMARK_MESSAGE_STREAM || "outbound",
  } as const;
}
