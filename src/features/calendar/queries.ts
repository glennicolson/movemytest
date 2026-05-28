import { prisma } from "@/lib/db/prisma";

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

/**
 * Fetch lessons for the calendar, optionally filtered by instructor.
 */
export async function getCalendarLessons(instructorId?: string): Promise<CalendarLessonEvent[]> {
  const where = instructorId ? { instructorId } : {};
  const lessons = await prisma.lesson.findMany({
    where,
    include: {
      learner: { include: { user: { select: { firstName: true, lastName: true } } } },
      instructor: { include: { user: { select: { firstName: true, lastName: true } } } },
    },
    orderBy: { startsAt: "asc" },
  });

  return lessons.map((lesson) => ({
    id: lesson.id,
    title: `${lesson.learner.user.firstName} ${lesson.learner.user.lastName}`,
    start: lesson.startsAt,
    end: lesson.endsAt,
    status: lesson.status,
    pupilName: `${lesson.learner.user.firstName} ${lesson.learner.user.lastName}`,
    learnerId: lesson.learnerId,
    instructorName: `${lesson.instructor.user.firstName} ${lesson.instructor.user.lastName}`,
    instructorId: lesson.instructorId,
    pickupLocation: lesson.pickupLocation,
    dropoffLocation: lesson.dropoffLocation,
    learnerNotes: lesson.learnerNotes,
    internalNotes: lesson.internalNotes,
    type: "lesson" as const,
  }));
}

/**
 * Fetch theory and practical test bookings for the calendar,
 * optionally filtered by instructor (via their assigned learners).
 */
export async function getCalendarTests(instructorId?: string): Promise<CalendarTestEvent[]> {
  const learnerFilter = instructorId
    ? { assignedInstructorId: instructorId }
    : {};

  const [theoryTests, practicalTests] = await Promise.all([
    prisma.theoryTest.findMany({
      where: { learner: learnerFilter, testDate: { not: null } },
      include: {
        learner: {
          include: {
            user: { select: { firstName: true, lastName: true } },
            assignedInstructor: {
              include: { user: { select: { firstName: true, lastName: true } } },
            },
          },
        },
      },
      orderBy: { testDate: "asc" },
    }),
    prisma.practicalTest.findMany({
      where: { learner: learnerFilter, testDate: { not: null } },
      include: {
        learner: {
          include: {
            user: { select: { firstName: true, lastName: true } },
            assignedInstructor: {
              include: { user: { select: { firstName: true, lastName: true } } },
            },
          },
        },
      },
      orderBy: { testDate: "asc" },
    }),
  ]);

  const theory: CalendarTestEvent[] = theoryTests.map((t) => ({
    id: `theory-${t.id}`,
    title: `Theory: ${t.learner.user.firstName} ${t.learner.user.lastName}`,
    start: t.testDate!,
    end: null,
    status: t.status,
    pupilName: `${t.learner.user.firstName} ${t.learner.user.lastName}`,
    learnerId: t.learnerId,
    instructorName: t.learner.assignedInstructor
      ? `${t.learner.assignedInstructor.user.firstName} ${t.learner.assignedInstructor.user.lastName}`
      : null,
    instructorId: t.learner.assignedInstructorId ?? null,
    testCentre: t.testCentre,
    testKind: "theory" as const,
    type: "test" as const,
  }));

  const practical: CalendarTestEvent[] = practicalTests.map((t) => ({
    id: `practical-${t.id}`,
    title: `Practical: ${t.learner.user.firstName} ${t.learner.user.lastName}`,
    start: t.testDate!,
    end: null,
    status: t.status,
    pupilName: `${t.learner.user.firstName} ${t.learner.user.lastName}`,
    learnerId: t.learnerId,
    instructorName: t.learner.assignedInstructor
      ? `${t.learner.assignedInstructor.user.firstName} ${t.learner.assignedInstructor.user.lastName}`
      : null,
    instructorId: t.learner.assignedInstructorId ?? null,
    testCentre: t.testCentre,
    testKind: "practical" as const,
    type: "test" as const,
    instructorTakingToTest: t.instructorTakingToTest ?? false,
    preTestLessonId: t.preTestLessonId ?? null,
  }));

  return [...theory, ...practical];
}

/**
 * Fetch unavailability blocks for the calendar, optionally filtered by instructor.
 */
export async function getCalendarUnavailabilities(instructorId?: string): Promise<CalendarUnavailabilityEvent[]> {
  const where = instructorId ? { instructorId } : {};
  const blocks = await prisma.instructorUnavailability.findMany({
    where,
    include: {
      instructor: { include: { user: { select: { firstName: true, lastName: true } } } },
    },
    orderBy: { startsAt: "asc" },
  });

  return blocks.map((block) => ({
    id: `unavail-${block.id}`,
    title: block.reason || "Unavailable",
    start: block.startsAt,
    end: block.endsAt,
    reason: block.reason,
    instructorId: block.instructorId,
    instructorName: `${block.instructor.user.firstName} ${block.instructor.user.lastName}`,
    type: "unavailability" as const,
  }));
}

/**
 * Combined calendar events (lessons + tests + unavailabilities) with optional instructor filter.
 */
export async function getCalendarEvents(instructorId?: string): Promise<CalendarEvent[]> {
  const [lessons, tests, unavailabilities] = await Promise.all([
    getCalendarLessons(instructorId),
    getCalendarTests(instructorId),
    getCalendarUnavailabilities(instructorId),
  ]);
  return [...lessons, ...tests, ...unavailabilities];
}

/**
 * List all instructors for the admin filter dropdown.
 */
export async function getInstructorList() {
  const instructors = await prisma.instructorProfile.findMany({
    where: { user: { status: "ACTIVE" } },
    include: { user: { select: { id: true, firstName: true, lastName: true } } },
    orderBy: { user: { lastName: "asc" } },
  });
// Map PascalCase Prisma names back to camelCase for existing consumers
  return instructors.map((i) => ({ ...i, user: i.user }));
}