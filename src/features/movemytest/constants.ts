export const TEST_SWAP_BASE_PATH = "/";
export const DVSA_SWAP_PHONE = "0300 200 1122";
export const DVSA_LOCATION_RULE_START = new Date("2026-06-09T00:00:00.000Z");
export const BOOKING_REFERENCE_TTL_MINUTES = 60;

export const TEST_SWAP_OFFICIAL_SOURCES = {
  dvsaSwapGuidance: "https://www.gov.uk/guidance/swapping-your-driving-test-with-another-learner-driver",
  dvsaCentreMoveRules:
    "https://www.gov.uk/government/publications/check-which-driving-test-centres-you-can-move-your-test-to/check-which-driving-test-centres-you-can-move-your-test-to",
  govUkCentreFinder: "https://www.gov.uk/find-driving-test-centre",
  dvsaCarData: "https://www.gov.uk/government/statistical-data-sets/driving-test-and-theory-test-data-cars",
  niDirectCentres: "https://www.nidirect.gov.uk/articles/driving-and-vehicle-test-centres",
};

export function isNiMoveMyTestEnabled() {
  return process.env.ENABLE_NI_TEST_SWAP === "true";
}

export const TEST_TYPE_LABELS = {
  WEEKDAY_STANDARD_CAR: "Weekday standard car test",
  EVENING_WEEKEND_BANK_HOLIDAY_STANDARD_CAR: "Evening, weekend or bank holiday standard car test",
  EXTRA_TIME_SPECIAL_REQUIREMENTS: "Extra-time or special-requirements test",
  EXTENDED_WEEKDAY: "Extended weekday test",
  EXTENDED_EVENING_WEEKEND_BANK_HOLIDAY: "Extended evening, weekend or bank holiday test",
} as const;

export const TIME_PREFERENCE_LABELS = {
  ANY: "Any time",
  MORNING: "Morning",
  AFTERNOON: "Afternoon",
  EVENING: "Evening",
} as const;

export const DIRECTION_LABELS = {
  EARLIER: "Earlier date",
  LATER: "Later date",
  EITHER: "Earlier or later",
} as const;
