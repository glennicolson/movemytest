import type { AuthDeliveryPackage } from "@/lib/auth/delivery";
import type { AuthTokenPurpose } from "@/lib/auth/tokens";
import { PostmarkAuthDeliveryTransport } from "@/lib/auth/transports/postmark";

export type AuthDeliveryTransportProvider = "manual" | "postmark";
export type AuthDeliveryTransportStatus = "skipped" | "sent" | "failed";

export type AuthDeliveryDispatchInput = {
  purpose: AuthTokenPurpose;
  recipientUserId: string;
  recipientEmail: string;
  delivery: AuthDeliveryPackage;
};

export type AuthDeliveryDispatchResult = {
  provider: AuthDeliveryTransportProvider;
  status: AuthDeliveryTransportStatus;
  message: string;
  error?: string;
};

export interface AuthDeliveryTransport {
  provider: AuthDeliveryTransportProvider;
  send(input: AuthDeliveryDispatchInput): Promise<AuthDeliveryDispatchResult>;
}

class ManualAuthDeliveryTransport implements AuthDeliveryTransport {
  provider: AuthDeliveryTransportProvider = "manual";

  async send(): Promise<AuthDeliveryDispatchResult> {
    return {
      provider: this.provider,
      status: "skipped",
      message: "Automatic email delivery is not configured yet. Use the delivery package below for manual handoff.",
    };
  }
}

export function getAuthDeliveryTransport(): AuthDeliveryTransport {
  if (process.env.AUTH_POSTMARK_SERVER_TOKEN && process.env.AUTH_POSTMARK_FROM_EMAIL) {
    return new PostmarkAuthDeliveryTransport();
  }

  return new ManualAuthDeliveryTransport();
}

export async function dispatchAuthDelivery(input: AuthDeliveryDispatchInput) {
  return getAuthDeliveryTransport().send(input);
}
