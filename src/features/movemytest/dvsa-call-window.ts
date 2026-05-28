// DVSA driving test phone opening hours: Monday-Friday 8am-5pm UK time.
// DVSA call window: 16 DVSA-open-hours.
const DVSA_OPEN_HOUR = 8;
const DVSA_CLOSE_HOUR = 17;
const CALL_WINDOW_OPEN_MINUTES = 16 * 60;

function isWeekend(date: Date) {
  const day = date.getUTCDay();
  return day === 0 || day === 6;
}

function startOfDvsaDay(date: Date) {
  const next = new Date(date);
  next.setUTCHours(DVSA_OPEN_HOUR, 0, 0, 0);
  return next;
}

function endOfDvsaDay(date: Date) {
  const next = new Date(date);
  next.setUTCHours(DVSA_CLOSE_HOUR, 0, 0, 0);
  return next;
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function nextDvsaOpening(from: Date) {
  let cursor = new Date(from);
  cursor.setUTCSeconds(0, 0);

  while (true) {
    if (isWeekend(cursor)) {
      cursor = startOfDvsaDay(addDays(cursor, 1));
      continue;
    }

    const open = startOfDvsaDay(cursor);
    const close = endOfDvsaDay(cursor);
    if (cursor < open) return open;
    if (cursor >= close) {
      cursor = startOfDvsaDay(addDays(cursor, 1));
      continue;
    }
    return cursor;
  }
}

export function calculateDvsaCallWindow(now = new Date()) {
  const startedAt = nextDvsaOpening(now);
  let cursor = new Date(startedAt);
  let remainingMinutes = CALL_WINDOW_OPEN_MINUTES;

  while (remainingMinutes > 0) {
    if (isWeekend(cursor)) {
      cursor = nextDvsaOpening(cursor);
      continue;
    }

    const close = endOfDvsaDay(cursor);
    const availableMinutes = Math.max(0, Math.floor((close.getTime() - cursor.getTime()) / 60000));
    if (availableMinutes >= remainingMinutes) {
      return { startedAt, expiresAt: new Date(cursor.getTime() + remainingMinutes * 60000) };
    }

    remainingMinutes -= availableMinutes;
    cursor = nextDvsaOpening(addDays(close, 1));
  }

  return { startedAt, expiresAt: cursor };
}

export function hasDvsaCallWindowExpired(expiresAt: Date | null, now = new Date()) {
  return Boolean(expiresAt && expiresAt.getTime() <= now.getTime());
}

export function formatDvsaCallWindow(expiresAt: Date | null) {
  if (!expiresAt) return null;
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "full", timeStyle: "short", timeZone: "Europe/London" }).format(expiresAt);
}

export function calculateDvsaCallWindowExpiryString(now = new Date()) {
  const { expiresAt } = calculateDvsaCallWindow(now);
  return formatDvsaCallWindow(expiresAt);
}
