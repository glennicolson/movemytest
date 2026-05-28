export type MailboxConfig = {
  mailbox: string;
  smtpHost: string;
  smtpPort: number;
  smtpSecure: boolean;
  imapHost: string;
  imapPort: number;
  imapSecure: boolean;
  username: string;
  password: string;
  syncLimit: number;
  syncIntervalMinutes: number;
};

const MAILBOX_DEFAULTS = {
  CRM_MAILBOX_ADDRESS: "support@thedtc.co.uk",
  CRM_MAILBOX_USERNAME: "support@thedtc.co.uk",
  CRM_SMTP_HOST: "smtp.hostinger.com",
  CRM_SMTP_PORT: "465",
  CRM_SMTP_SECURE: "true",
  CRM_IMAP_HOST: "imap.hostinger.com",
  CRM_IMAP_PORT: "993",
  CRM_IMAP_SECURE: "true",
  CRM_INBOX_SYNC_LIMIT: "25",
  CRM_INBOX_SYNC_INTERVAL_MINUTES: "15",
} as const;

function env(key: string): string | undefined {
  return process.env[key];
}

function envWithDefault(key: string, fallback: string): string {
  return process.env[key] ?? fallback;
}

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function getMailboxConfig(): MailboxConfig {
  const mailbox = envWithDefault("CRM_MAILBOX_ADDRESS", MAILBOX_DEFAULTS.CRM_MAILBOX_ADDRESS);

  return {
    mailbox,
    smtpHost: envWithDefault("CRM_SMTP_HOST", MAILBOX_DEFAULTS.CRM_SMTP_HOST),
    smtpPort: Number(envWithDefault("CRM_SMTP_PORT", MAILBOX_DEFAULTS.CRM_SMTP_PORT)),
    smtpSecure: envWithDefault("CRM_SMTP_SECURE", MAILBOX_DEFAULTS.CRM_SMTP_SECURE) !== "false",
    imapHost: envWithDefault("CRM_IMAP_HOST", MAILBOX_DEFAULTS.CRM_IMAP_HOST),
    imapPort: Number(envWithDefault("CRM_IMAP_PORT", MAILBOX_DEFAULTS.CRM_IMAP_PORT)),
    imapSecure: envWithDefault("CRM_IMAP_SECURE", MAILBOX_DEFAULTS.CRM_IMAP_SECURE) !== "false",
    username: envWithDefault("CRM_MAILBOX_USERNAME", mailbox),
    password: requiredEnv("CRM_MAILBOX_PASSWORD"),
    syncLimit: Number(envWithDefault("CRM_INBOX_SYNC_LIMIT", MAILBOX_DEFAULTS.CRM_INBOX_SYNC_LIMIT)),
    syncIntervalMinutes: Number(envWithDefault("CRM_INBOX_SYNC_INTERVAL_MINUTES", MAILBOX_DEFAULTS.CRM_INBOX_SYNC_INTERVAL_MINUTES)),
  };
}

export function getMailboxConfigStatus() {
// Only CRM_MAILBOX_PASSWORD is truly required — everything else has defaults
  const missing: string[] = [];
  if (!process.env.CRM_MAILBOX_PASSWORD) {
    missing.push("CRM_MAILBOX_PASSWORD");
  }

  return {
    configured: missing.length === 0,
    missing,
  };
}