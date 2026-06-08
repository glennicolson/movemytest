import { appConfig } from "@/lib/config/app";
import type { AuthTokenPurpose } from "@/lib/auth/token-types";

export type AuthDeliveryRecipient = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
};

export type AuthDeliveryPackage = {
  recipientName: string;
  recipientEmail: string;
  recipientPhone: string | null;
  emailSubject: string;
  emailBody: string;
  emailHtml: string;
  emailMailto: string;
  smsBody: string | null;
  smsHref: string | null;
};

function buildEmailSubject(purpose: AuthTokenPurpose) {
  return purpose === "INVITE"
    ? `${appConfig.companyName} account setup link`
    : `${appConfig.companyName} password reset link`;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function buildEmailBody(purpose: AuthTokenPurpose, recipient: AuthDeliveryRecipient, linkUrl: string) {
  const greeting = `Hi ${recipient.firstName},`;
  const intro = purpose === "INVITE"
    ? `Your ${appConfig.companyName} account is ready to activate.`
    : `A password reset has been requested for your ${appConfig.companyName} account.`;
  const action = purpose === "INVITE"
    ? "Use the link below to set your first password and access your account:"
    : "Use the link below to choose a new password:";

  return [
    greeting,
    "",
    intro,
    action,
    linkUrl,
    "",
    `If you were not expecting this, please contact ${appConfig.companyName} directly before using the link.`,
    "",
    `${appConfig.companyName}`,
    appConfig.companyWebsite,
  ].join("\n");
}

function buildSmsBody(purpose: AuthTokenPurpose, recipient: AuthDeliveryRecipient, linkUrl: string) {
  if (!recipient.phone) return null;

  const prefix = purpose === "INVITE"
    ? `${appConfig.companyName}: set your account password`
    : `${appConfig.companyName}: reset your password`;

  return `${prefix}: ${linkUrl}`;
}

function buildEmailHtmlBody(purpose: AuthTokenPurpose, recipient: AuthDeliveryRecipient, linkUrl: string) {
  const intro = purpose === "INVITE"
    ? `Your ${appConfig.companyName} account is ready to activate.`
    : `A password reset has been requested for your ${appConfig.companyName} account.`;
  const action = purpose === "INVITE"
    ? "Use the button below to set your first password and access your account."
    : "Use the button below to choose a new password.";

  return `
    <div style="font-family:Arial,sans-serif;line-height:1.5;color:#0f172a;max-width:640px">
      <p>Hi ${escapeHtml(recipient.firstName)},</p>
      <p>${escapeHtml(intro)}</p>
      <p>${escapeHtml(action)}</p>
      <p style="margin:24px 0">
        <a href="${escapeHtml(linkUrl)}" style="display:inline-block;background:#b91c1c;color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:10px;font-weight:600">
          ${purpose === "INVITE" ? "Set password" : "Reset password"}
        </a>
      </p>
      <p>If the button does not work, copy and paste this link into your browser:</p>
      <p><a href="${escapeHtml(linkUrl)}">${escapeHtml(linkUrl)}</a></p>
      <p>If you were not expecting this, please contact ${escapeHtml(appConfig.companyName)} directly before using the link.</p>
      <p style="margin-top:24px">${escapeHtml(appConfig.companyName)}<br/><a href="${escapeHtml(appConfig.companyWebsite)}">${escapeHtml(appConfig.companyWebsite)}</a></p>
    </div>
  `.trim();
}

export function buildAuthDeliveryPackage(
  purpose: AuthTokenPurpose,
  recipient: AuthDeliveryRecipient,
  linkUrl: string,
): AuthDeliveryPackage {
  const recipientName = `${recipient.firstName} ${recipient.lastName}`;
  const emailSubject = buildEmailSubject(purpose);
  const emailBody = buildEmailBody(purpose, recipient, linkUrl);
  const emailHtml = buildEmailHtmlBody(purpose, recipient, linkUrl);
  const smsBody = buildSmsBody(purpose, recipient, linkUrl);

  return {
    recipientName,
    recipientEmail: recipient.email,
    recipientPhone: recipient.phone ?? null,
    emailSubject,
    emailBody,
    emailHtml,
    emailMailto: `mailto:${encodeURIComponent(recipient.email)}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`,
    smsBody,
    smsHref: recipient.phone && smsBody ? `sms:${recipient.phone}?body=${encodeURIComponent(smsBody)}` : null,
  };
}
