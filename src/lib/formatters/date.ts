export function formatDateTime(value: Date | string | null | undefined) {
  if (!value) return "Not set";
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/London",
  }).format(date);
}

export function formatDate(value: Date | string | null | undefined) {
  if (!value) return "Not set";
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeZone: "Europe/London",
  }).format(date);
}

export function formatTime(value: Date | string | null | undefined) {
  if (!value) return "";
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/London",
  }).format(date);
}

export function formatDurationMinutes(value: number | null | undefined) {
  if (!value) return "";
  const hours = Math.floor(value / 60);
  const minutes = value % 60;
  if (hours && minutes) return `${hours}h ${minutes}m`;
  if (hours) return `${hours}h`;
  return `${minutes}m`;
}

export function formatTimeRange(value: Date | string | null | undefined, durationMinutes: number | null | undefined) {
  if (!value || !durationMinutes) return "";
  const start = typeof value === "string" ? new Date(value) : new Date(value);
  const end = new Date(start.getTime() + durationMinutes * 60_000);
  return `${formatTime(start)}-${formatTime(end)}`;
}

export function formatRelativeTime(value: Date | string | null | undefined) {
  if (!value) return "";
  const date = typeof value === "string" ? new Date(value) : value;
  const diff = Date.now() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return formatDate(value);
}

/**
 * Produces a YYYY-MM-DD date key in the given timezone (default Europe/London).
 * Used for grouping entries by calendar day regardless of server timezone.
 */
export function formatDateKey(value: Date | string, timeZone = "Europe/London") {
  const date = typeof value === "string" ? new Date(value) : value;
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  if (!year || !month || !day) {
    throw new Error("Unable to format date key.");
  }

  return `${year}-${month}-${day}`;
}

/**
 * Convert a Date to a local time string suitable for HTML time input (HH:MM).
 * Uses Europe/London timezone for consistent display regardless of server location.
 */
export function toLocalTimeInputValue(value: Date | string): string {
  const date = typeof value === "string" ? new Date(value) : value;
// Use London timezone to get the correct hour, regardless of server timezone
  const parts = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/London",
    hour12: false,
  }).formatToParts(date);
  const hours = parts.find((p) => p.type === "hour")?.value || "00";
  const minutes = parts.find((p) => p.type === "minute")?.value || "00";
  return `${hours}:${minutes}`;
}
