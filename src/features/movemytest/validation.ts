import { z } from "zod";

const forbiddenSensitivePattern = /\b([A-Z]{5}\d{6}[A-Z]{2}\d[A-Z]{2}|\d{4}[ -]?\d{4}[ -]?\d{4}[ -]?\d{4}|\d{3,4}[ -]?\d{3,4}[ -]?\d{3,4}[ -]?\d{3,4})\b/i;

export function containsForbiddenSensitiveValue(value: string) {
  return forbiddenSensitivePattern.test(value);
}

export const movemytestListingSchema = z.object({
  currentCentreId: z.string().min(1, "Choose your current test centre."),
  originalCentreId: z.string().optional(),
  currentDate: z.string().min(1, "Enter your current test date."),
  currentTime: z.string().min(1, "Enter your current test time."),
  bookingReference: z.string().trim().max(40, "Enter the DVSA booking reference only.").optional(),
  testType: z.enum([
    "WEEKDAY_STANDARD_CAR",
    "EVENING_WEEKEND_BANK_HOLIDAY_STANDARD_CAR",
    "EXTRA_TIME_SPECIAL_REQUIREMENTS",
    "EXTENDED_WEEKDAY",
    "EXTENDED_EVENING_WEEKEND_BANK_HOLIDAY",
  ]),
  hasRemainingChange: z.literal("on", {
    errorMap: () => ({ message: "You need at least 1 remaining allowed change to use MoveMyTest." }),
  }),
  desiredDateFrom: z.string().min(1, "Enter the first date you would consider."),
  desiredDateTo: z.string().min(1, "Enter the last date you would consider."),
  desiredTimePreference: z.enum(["ANY", "MORNING", "AFTERNOON", "EVENING"]),
  desiredCentreIds: z.array(z.string()).min(1, "Choose at least one centre you would consider."),
  desiredDirection: z.enum(["EARLIER", "LATER", "EITHER"]),
  instructorAdiNumber: z.string().trim().max(30).optional(),
  instructorFirstName: z.string().trim().max(80).optional(),
  instructorLastName: z.string().trim().max(80).optional(),
  instructorMobileNumber: z.string().trim().max(30).optional(),
  instructorEmail: z.string().trim().toLowerCase().email().or(z.literal("")).optional(),
  hasInstructor: z.string().optional(),
  knowsInstructorDetails: z.string().optional(),
  instructorPermission: z.string().optional(),
  instructorAvailabilityCheck: z.string().optional(),
  complianceOwnTest: z.literal("on", { errorMap: () => ({ message: "Confirm this is your own car driving test." }) }),
  complianceDvsaPhone: z.literal("on", { errorMap: () => ({ message: "Confirm you understand the official swap is completed by phone with DVSA." }) }),
  complianceNoSensitiveSharing: z.literal("on", { errorMap: () => ({ message: "Confirm you will not share licence, card, address or GOV.UK login details." }) }),
}).superRefine((data, ctx) => {
  const current = new Date(`${data.currentDate}T${data.currentTime}:00.000Z`);
  const from = new Date(`${data.desiredDateFrom}T00:00:00.000Z`);
  const to = new Date(`${data.desiredDateTo}T23:59:59.000Z`);

  if (Number.isNaN(current.getTime())) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["currentDate"], message: "Enter a valid current test date and time." });
  }

// DVSA rule: at least 10 full calendar days notice required
  const now = new Date();
  const tenDaysFromNow = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000);
  tenDaysFromNow.setUTCHours(0, 0, 0, 0);
  if (!Number.isNaN(current.getTime()) && current < tenDaysFromNow) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["currentDate"], message: "Your test is too soon to swap. DVSA requires at least 10 full days notice to change a driving test. You can still create a listing, but your test date must be at least 10 days away for a swap to be possible." });
  }

  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()) || from > to) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["desiredDateFrom"], message: "Enter a valid desired date range." });
  }
  if (data.bookingReference && containsForbiddenSensitiveValue(data.bookingReference)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["bookingReference"], message: "Only enter your DVSA booking reference. Do not enter licence numbers or card details." });
  }
});

export const bookingReferenceConsentSchema = z.object({
  bookingReference: z.string().min(6, "Enter the booking reference only when both learners are ready to call DVSA.").max(40),
  volunteerDvsaCaller: z.string().optional(),
  consentReadyNow: z.literal("on", { errorMap: () => ({ message: "Confirm both learners are available for the DVSA phone process now." }) }),
  consentSecurity: z.literal("on", { errorMap: () => ({ message: "Confirm you understand DVSA completes security checks with each learner." }) }),
  consentNoSensitiveSharing: z.literal("on", { errorMap: () => ({ message: "Confirm you will not share licence, card, address, theory certificate or GOV.UK login details." }) }),
}).superRefine((data, ctx) => {
  if (containsForbiddenSensitiveValue(data.bookingReference)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["bookingReference"], message: "Only enter the booking reference. Do not enter licence numbers or card details." });
  }
});

export const movemytestListingEditSchema = z.object({
  currentCentreId: z.string().min(1, "Choose your current test centre."),
  originalCentreId: z.string().optional(),
  currentDate: z.string().min(1, "Enter your current test date."),
  currentTime: z.string().min(1, "Enter your current test time."),
  testType: z.enum([
    "WEEKDAY_STANDARD_CAR",
    "EVENING_WEEKEND_BANK_HOLIDAY_STANDARD_CAR",
    "EXTRA_TIME_SPECIAL_REQUIREMENTS",
    "EXTENDED_WEEKDAY",
    "EXTENDED_EVENING_WEEKEND_BANK_HOLIDAY",
  ]),
  desiredDateFrom: z.string().min(1, "Enter the first date you would consider."),
  desiredDateTo: z.string().min(1, "Enter the last date you would consider."),
  desiredTimePreference: z.enum(["ANY", "MORNING", "AFTERNOON", "EVENING"]),
  desiredCentreIds: z.array(z.string()).min(1, "Choose at least one centre you would consider."),
  desiredDirection: z.enum(["EARLIER", "LATER", "EITHER"]),
}).superRefine((data, ctx) => {
  const current = new Date(`${data.currentDate}T${data.currentTime}:00.000Z`);
  const from = new Date(`${data.desiredDateFrom}T00:00:00.000Z`);
  const to = new Date(`${data.desiredDateTo}T23:59:59.000Z`);

  if (Number.isNaN(current.getTime())) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["currentDate"], message: "Enter a valid current test date and time." });
  }

// DVSA rule: at least 10 full calendar days notice required
  const now = new Date();
  const tenDaysFromNow = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000);
  tenDaysFromNow.setUTCHours(0, 0, 0, 0);
  if (!Number.isNaN(current.getTime()) && current < tenDaysFromNow) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["currentDate"], message: "Your test is too soon to swap. DVSA requires at least 10 full days notice to change a driving test. You can still create a listing, but your test date must be at least 10 days away for a swap to be possible." });
  }

  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()) || from > to) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["desiredDateFrom"], message: "Enter a valid desired date range." });
  }
});

export const movemytestInstructorSchema = z.object({
  listingId: z.string().min(1, "Listing ID is required."),
  hasInstructor: z.string().optional(),
  knowsInstructorDetails: z.string().optional(),
  instructorAdiNumber: z.string().trim().max(30).optional(),
  instructorFirstName: z.string().trim().max(80).optional(),
  instructorLastName: z.string().trim().max(80).optional(),
  instructorMobileNumber: z.string().trim().max(30).optional(),
  instructorEmail: z.string().trim().toLowerCase().email().or(z.literal("")).optional(),
  instructorPermission: z.string().optional(),
  instructorAvailabilityCheck: z.string().optional(),
});
