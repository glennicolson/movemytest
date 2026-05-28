import { formatDate, formatDateTime } from "@/lib/formatters/date";

export function formatPortalEnum(value: string | null | undefined) {
  if (!value) return "Not recorded";
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function formatPortalDate(value: Date | null | undefined) {
  return value ? formatDate(value) : "Not recorded";
}

export function formatPortalDateTime(value: Date | null | undefined) {
  return value ? formatDateTime(value) : "Not recorded";
}

export function getPortalDocumentAttention(input: { dueAt?: Date | null; expiresAt?: Date | null; workflowState?: string | null }) {
  const now = Date.now();
  const dueAt = input.dueAt?.getTime() ?? null;
  const expiresAt = input.expiresAt?.getTime() ?? null;

  if (input.workflowState === "REQUESTED" && dueAt && dueAt < now) {
    return "Overdue for upload";
  }

  if (expiresAt && expiresAt < now) {
    return "Expired";
  }

  if (expiresAt && expiresAt - now <= 14 * 24 * 60 * 60 * 1000) {
    return "Expiring soon";
  }

  if (dueAt && dueAt - now <= 7 * 24 * 60 * 60 * 1000) {
    return "Due soon";
  }

  return null;
}
