// Calendar event types — used by the MMT instructor dashboard to
// render a unified calendar of lessons / test slots / unavailabilities.
// The runtime functions that originally lived in this file were
// deleted in 2026-06 because they referenced DTC-only models
// (Lesson, TheoryTest, PracticalTest, etc.) that don't exist on
// the MMT schema. The actual calendar data the instructor needs
// is rendered by the dashboard from Listing + Match data directly.

export type CalendarLessonEvent = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  status: string;
  pupilName: string;
  learnerId: string;
  instructorName: string;
  instructorId: string;
  pickupLocation: string | null;
  dropoffLocation: string | null;
  learnerNotes: string | null;
  internalNotes: string | null;
  type: "lesson";
};

export type CalendarTestEvent = {
  id: string;
  title: string;
  start: Date;
  end: Date | null;
  status: string;
  pupilName: string;
  learnerId: string;
  instructorName: string | null;
  instructorId: string | null;
  testCentre: string | null;
  testKind: "theory" | "practical";
  type: "test";
// Practical test: is the instructor taking the pupil to the test?
  instructorTakingToTest?: boolean;
// Practical test: pre-test lesson linked to this test
  preTestLessonId?: string | null;
  bookingReference?: string | null;
};

export type CalendarUnavailabilityEvent = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  reason: string | null;
  instructorId: string;
  instructorName: string;
  type: "unavailability";
};

export type CalendarEvent = CalendarLessonEvent | CalendarTestEvent | CalendarUnavailabilityEvent;
