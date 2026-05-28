import { appConfig } from "@/lib/config/app";
import type { AuthDeliveryDispatchInput, AuthDeliveryDispatchResult, AuthDeliveryTransport } from "@/lib/auth/transport";

const POSTMARK_API_URL = "https://api.postmarkapp.com/email";

export class PostmarkAuthDeliveryTransport implements AuthDeliveryTransport {
  provider = "postmark" as const;

  async send(input: AuthDeliveryDispatchInput): Promise<AuthDeliveryDispatchResult> {
    const serverToken = process.env.AUTH_POSTMARK_SERVER_TOKEN;
    const fromEmail = process.env.AUTH_POSTMARK_FROM_EMAIL;
    const fromName = process.env.AUTH_POSTMARK_FROM_NAME;

    if (!serverToken || !fromEmail) {
      return {
        provider: this.provider,
        status: "failed",
        message: "Postmark transport is selected but missing required configuration.",
        error: "Missing AUTH_POSTMARK_SERVER_TOKEN or AUTH_POSTMARK_FROM_EMAIL.",
      };
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
          From: fromName ? `${fromName} <${fromEmail}>` : fromEmail,
          To: input.recipientEmail,
          Subject: input.delivery.emailSubject,
          TextBody: input.delivery.emailBody,
          HtmlBody: input.delivery.emailHtml,
          ReplyTo: appConfig.supportEmail,
          MessageStream: process.env.AUTH_POSTMARK_MESSAGE_STREAM || undefined,
          Tag: input.purpose === "INVITE" ? "account-invite" : "password-reset",
          Metadata: {
            recipientUserId: input.recipientUserId,
            purpose: input.purpose,
          },
        }),
      });

      if (!response.ok) {
        const responseText = await response.text();
        return {
          provider: this.provider,
          status: "failed",
          message: "Automatic email delivery failed. Use the delivery package below for manual handoff.",
          error: `Postmark responded with ${response.status}: ${responseText}`,
        };
      }

      return {
        provider: this.provider,
        status: "sent",
        message: `Email sent automatically via Postmark to ${input.recipientEmail}.`,
      };
    } catch (error) {
      return {
        provider: this.provider,
        status: "failed",
        message: "Automatic email delivery failed. Use the delivery package below for manual handoff.",
        error: error instanceof Error ? error.message : "Unknown Postmark transport error.",
      };
    }
  }
}
