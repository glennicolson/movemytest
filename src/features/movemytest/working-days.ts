type Jurisdiction = "GB_DVSA" | "NI_DVA";

function dateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function startOfUtcDay(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

// Current product launch only needs 2026 awareness for the new DVSA rule and near-term listings.
// Keep this table explicit and refreshable rather than relying on an external API at runtime.
const GB_2026_BANK_HOLIDAYS = new Set([
  "2026-01-01",
  "2026-04-03",
  "2026-04-06",
  "2026-05-04",
  "2026-05-25",
  "2026-08-31",
  "2026-12-25",
  "2026-12-28",
]);

const SCOTLAND_EXTRA_2026_BANK_HOLIDAYS = new Set([
  "2026-01-02",
  "2026-11-30",
]);

const NI_2026_BANK_HOLIDAYS = new Set([
  "2026-01-01",
  "2026-03-17",
  "2026-04-06",
  "2026-04-07",
  "2026-05-04",
  "2026-05-25",
  "2026-07-13",
  "2026-07-14",
  "2026-08-31",
  "2026-12-24",
  "2026-12-25",
  "2026-12-28",
]);

export function isPublicHoliday(date: Date, jurisdiction: Jurisdiction, country?: string) {
  const key = dateKey(date);
  if (jurisdiction === "NI_DVA") return NI_2026_BANK_HOLIDAYS.has(key);
  if (country === "SCOTLAND" && SCOTLAND_EXTRA_2026_BANK_HOLIDAYS.has(key)) return true;
  return GB_2026_BANK_HOLIDAYS.has(key);
}

export function isDvsaWorkingDay(date: Date, jurisdiction: Jurisdiction, country?: string) {
  const day = date.getUTCDay();
  if (day === 0) return false;// Sunday. Monday-Saturday count as working days for DVSA swaps.
  return !isPublicHoliday(date, jurisdiction, country);
}

export function countFullWorkingDaysBeforeTest(from: Date, testDate: Date, jurisdiction: Jurisdiction, country?: string) {
  const cursor = startOfUtcDay(from);
  cursor.setUTCDate(cursor.getUTCDate() + 1);
  const end = startOfUtcDay(testDate);
  let count = 0;

  while (cursor < end) {
    if (isDvsaWorkingDay(cursor, jurisdiction, country)) count += 1;
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return count;
}

export function hasAtLeastTenFullWorkingDays(from: Date, earliestTestDate: Date, jurisdiction: Jurisdiction, country?: string) {
  return countFullWorkingDaysBeforeTest(from, earliestTestDate, jurisdiction, country) >= 10;
}
