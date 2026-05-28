/**
 * Production-safe seed script for Hostinger.
 * No TypeScript, no path aliases — just plain ESM + relative imports.
 */
import { PrismaClient } from "@prisma/client";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback);
const KEY_LENGTH = 64;
const HASH_PREFIX = "scrypt";

async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scrypt(password, salt, KEY_LENGTH));
  return `${HASH_PREFIX}$${salt}$${derived.toString("hex")}`;
}

const prisma = new PrismaClient();

async function ensureDemoDocument(pathSegments, content) {
  const fullPath = join(process.cwd(), "var", "documents", ...pathSegments);
  await mkdir(dirname(fullPath), { recursive: true });
  await writeFile(fullPath, content, "utf8");
}

async function main() {
  const demoPasswordHash = await hashPassword("dtc-demo-2026");
  await ensureDemoDocument(["demo", "chloe-provisional-licence.txt"], "Seeded DTC demo document: Chloe provisional licence.\n");
  await ensureDemoDocument(["demo", "chloe-consent-form.txt"], "Seeded DTC demo document: Chloe consent form awaiting follow-up.\n");
  await ensureDemoDocument(["demo", "ben-provisional-licence.txt"], "Seeded DTC demo document: Ben provisional licence.\n");
  await ensureDemoDocument(["demo", "ben-theory-pass-certificate.txt"], "Seeded DTC demo document: Ben theory certificate.\n");
  await ensureDemoDocument(["demo", "ben-consent-form.txt"], "Seeded DTC demo document: Ben consent form.\n");
  await ensureDemoDocument(["demo", "isla-id-check.txt"], "Seeded DTC demo document: Isla identity check.\n");

  const edinburghBranch = await prisma.branch.upsert({
    where: { code: "EDI" },
    update: {
      name: "Edinburgh HQ",
      city: "Edinburgh",
      postcode: "EH1 1AA",
      phone: "0131 555 4134",
      email: "reception@thedtc.co.uk",
    },
    create: {
      code: "EDI",
      name: "Edinburgh HQ",
      city: "Edinburgh",
      postcode: "EH1 1AA",
      phone: "0131 555 4134",
      email: "reception@thedtc.co.uk",
    },
  });

  const westBranch = await prisma.branch.upsert({
    where: { code: "WLN" },
    update: {
      name: "West Lothian Outreach",
      city: "Livingston",
      postcode: "EH54 6FF",
      phone: "0800 011 2122",
      email: "west@thedtc.co.uk",
    },
    create: {
      code: "WLN",
      name: "West Lothian Outreach",
      city: "Livingston",
      postcode: "EH54 6FF",
      phone: "0800 011 2122",
      email: "west@thedtc.co.uk",
    },
  });

  const adminUser = await prisma.user.upsert({
    where: { email: "operations@thedtc.co.uk" },
    update: {
      firstName: "Olivia",
      lastName: "Morgan",
      phone: "0131 555 4134",
      userType: "STAFF",
      role: "ADMIN",
      status: "ACTIVE",
      branchId: edinburghBranch.id,
      passwordHash: demoPasswordHash,
    },
    create: {
      email: "operations@thedtc.co.uk",
      firstName: "Olivia",
      lastName: "Morgan",
      phone: "0131 555 4134",
      userType: "STAFF",
      role: "ADMIN",
      status: "ACTIVE",
      branchId: edinburghBranch.id,
      passwordHash: demoPasswordHash,
      staffProfile: {
        create: {
          title: "Operations Lead",
          notes: "Seeded DTC demo administrator.",
        },
      },
    },
  });

  await prisma.user.upsert({
    where: { email: "office@thedtc.co.uk" },
    update: {
      firstName: "Megan",
      lastName: "Ross",
      phone: "0131 555 4134",
      userType: "STAFF",
      role: "OFFICE_STAFF",
      status: "ACTIVE",
      branchId: edinburghBranch.id,
      passwordHash: demoPasswordHash,
    },
    create: {
      email: "office@thedtc.co.uk",
      firstName: "Megan",
      lastName: "Ross",
      phone: "0131 555 4134",
      userType: "STAFF",
      role: "OFFICE_STAFF",
      status: "ACTIVE",
      branchId: edinburghBranch.id,
      passwordHash: demoPasswordHash,
      staffProfile: {
        create: {
          title: "Office Coordinator",
          notes: "Seeded DTC demo staff account.",
        },
      },
    },
  });

  const instructorAUser = await prisma.user.upsert({
    where: { email: "aisha.khan@thedtc.co.uk" },
    update: {
      firstName: "Aisha",
      lastName: "Khan",
      phone: "07850 907770",
      userType: "INSTRUCTOR",
      role: "INSTRUCTOR",
      status: "ACTIVE",
      branchId: edinburghBranch.id,
      passwordHash: demoPasswordHash,
    },
    create: {
      email: "aisha.khan@thedtc.co.uk",
      firstName: "Aisha",
      lastName: "Khan",
      phone: "07850 907770",
      userType: "INSTRUCTOR",
      role: "INSTRUCTOR",
      status: "ACTIVE",
      branchId: edinburghBranch.id,
      passwordHash: demoPasswordHash,
    },
  });

  const instructorBUser = await prisma.user.upsert({
    where: { email: "lewis.grant@thedtc.co.uk" },
    update: {
      firstName: "Lewis",
      lastName: "Grant",
      phone: "07700 900222",
      userType: "INSTRUCTOR",
      role: "INSTRUCTOR",
      status: "ACTIVE",
      branchId: westBranch.id,
      passwordHash: demoPasswordHash,
    },
    create: {
      email: "lewis.grant@thedtc.co.uk",
      firstName: "Lewis",
      lastName: "Grant",
      phone: "07700 900222",
      userType: "INSTRUCTOR",
      role: "INSTRUCTOR",
      status: "ACTIVE",
      branchId: westBranch.id,
      passwordHash: demoPasswordHash,
    },
  });

  const instructorA = await prisma.instructorProfile.upsert({
    where: { userId: instructorAUser.id },
    update: {
      branchId: edinburghBranch.id,
      adiNumber: "ADI-EDI-20481",
      vehicleMake: "Toyota",
      vehicleModel: "Yaris Hybrid",
      vehicleRegistration: "DT24 EDC",
      bio: "Manual specialist covering Edinburgh city routes, nervous learners, and test preparation.",
    },
    create: {
      userId: instructorAUser.id,
      branchId: edinburghBranch.id,
      adiNumber: "ADI-EDI-20481",
      vehicleMake: "Toyota",
      vehicleModel: "Yaris Hybrid",
      vehicleRegistration: "DT24 EDC",
      bio: "Manual specialist covering Edinburgh city routes, nervous learners, and test preparation.",
    },
  });

  const instructorB = await prisma.instructorProfile.upsert({
    where: { userId: instructorBUser.id },
    update: {
      branchId: westBranch.id,
      adiNumber: "ADI-WLN-11973",
      vehicleMake: "Ford",
      vehicleModel: "Puma Auto",
      vehicleRegistration: "DT24 WLN",
      bio: "Automatic lessons across West Lothian with a focus on confidence building and flexible family scheduling.",
    },
    create: {
      userId: instructorBUser.id,
      branchId: westBranch.id,
      adiNumber: "ADI-WLN-11973",
      vehicleMake: "Ford",
      vehicleModel: "Puma Auto",
      vehicleRegistration: "DT24 WLN",
      bio: "Automatic lessons across West Lothian with a focus on confidence building and flexible family scheduling.",
    },
  });

  const chloeUser = await prisma.user.upsert({
    where: { email: "chloe.fraser@example.com" },
    update: {
      firstName: "Chloe",
      lastName: "Fraser",
      phone: "07700 111111",
      userType: "LEARNER",
      role: "LEARNER",
      status: "ACTIVE",
      passwordHash: demoPasswordHash,
    },
    create: {
      email: "chloe.fraser@example.com",
      firstName: "Chloe",
      lastName: "Fraser",
      phone: "07700 111111",
      userType: "LEARNER",
      role: "LEARNER",
      status: "ACTIVE",
      passwordHash: demoPasswordHash,
    },
  });

  const benUser = await prisma.user.upsert({
    where: { email: "ben.mcleod@example.com" },
    update: {
      firstName: "Ben",
      lastName: "McLeod",
      phone: "07700 222222",
      userType: "LEARNER",
      role: "LEARNER",
      status: "ACTIVE",
      passwordHash: demoPasswordHash,
    },
    create: {
      email: "ben.mcleod@example.com",
      firstName: "Ben",
      lastName: "McLeod",
      phone: "07700 222222",
      userType: "LEARNER",
      role: "LEARNER",
      status: "ACTIVE",
      passwordHash: demoPasswordHash,
    },
  });

  const islaUser = await prisma.user.upsert({
    where: { email: "isla.campbell@example.com" },
    update: {
      firstName: "Isla",
      lastName: "Campbell",
      phone: "07700 333333",
      userType: "LEARNER",
      role: "LEARNER",
      status: "ACTIVE",
      passwordHash: demoPasswordHash,
    },
    create: {
      email: "isla.campbell@example.com",
      firstName: "Isla",
      lastName: "Campbell",
      phone: "07700 333333",
      userType: "LEARNER",
      role: "LEARNER",
      status: "ACTIVE",
      passwordHash: demoPasswordHash,
    },
  });

  const invitedLearnerUser = await prisma.user.upsert({
    where: { email: "sophie.reid@example.com" },
    update: {
      firstName: "Sophie",
      lastName: "Reid",
      phone: "07700 666666",
      userType: "LEARNER",
      role: "LEARNER",
      status: "INVITED",
      passwordHash: null,
    },
    create: {
      email: "sophie.reid@example.com",
      firstName: "Sophie",
      lastName: "Reid",
      phone: "07700 666666",
      userType: "LEARNER",
      role: "LEARNER",
      status: "INVITED",
      passwordHash: null,
    },
  });

  const chloe = await prisma.learnerProfile.upsert({
    where: { userId: chloeUser.id },
    update: {
      branchId: edinburghBranch.id,
      assignedInstructorId: instructorA.id,
      licenceNumber: "FRASE851101CF9AB",
      provisionalExpiry: new Date("2028-11-30T00:00:00.000Z"),
      onboardingStatus: "active",
      balancePence: 18500,
      targetTestDate: new Date("2026-07-03T09:40:00.000Z"),
    },
    create: {
      userId: chloeUser.id,
      branchId: edinburghBranch.id,
      assignedInstructorId: instructorA.id,
      licenceNumber: "FRASE851101CF9AB",
      provisionalExpiry: new Date("2028-11-30T00:00:00.000Z"),
      onboardingStatus: "active",
      balancePence: 18500,
      targetTestDate: new Date("2026-07-03T09:40:00.000Z"),
    },
  });

  const ben = await prisma.learnerProfile.upsert({
    where: { userId: benUser.id },
    update: {
      branchId: edinburghBranch.id,
      assignedInstructorId: instructorA.id,
      licenceNumber: "MCLEO900220BM3CD",
      provisionalExpiry: new Date("2029-02-20T00:00:00.000Z"),
      onboardingStatus: "test_ready",
      balancePence: 0,
      targetTestDate: new Date("2026-05-28T13:20:00.000Z"),
    },
    create: {
      userId: benUser.id,
      branchId: edinburghBranch.id,
      assignedInstructorId: instructorA.id,
      licenceNumber: "MCLEO900220BM3CD",
      provisionalExpiry: new Date("2029-02-20T00:00:00.000Z"),
      onboardingStatus: "test_ready",
      balancePence: 0,
      targetTestDate: new Date("2026-05-28T13:20:00.000Z"),
    },
  });

  const isla = await prisma.learnerProfile.upsert({
    where: { userId: islaUser.id },
    update: {
      branchId: westBranch.id,
      assignedInstructorId: instructorB.id,
      licenceNumber: "CAMPL910615IC6EF",
      provisionalExpiry: new Date("2028-06-15T00:00:00.000Z"),
      onboardingStatus: "active",
      balancePence: 24200,
      targetTestDate: new Date("2026-08-14T11:10:00.000Z"),
    },
    create: {
      userId: islaUser.id,
      branchId: westBranch.id,
      assignedInstructorId: instructorB.id,
      licenceNumber: "CAMPL910615IC6EF",
      provisionalExpiry: new Date("2028-06-15T00:00:00.000Z"),
      onboardingStatus: "active",
      balancePence: 24200,
      targetTestDate: new Date("2026-08-14T11:10:00.000Z"),
    },
  });

  await prisma.learnerProfile.upsert({
    where: { userId: invitedLearnerUser.id },
    update: {
      branchId: edinburghBranch.id,
      assignedInstructorId: instructorA.id,
      onboardingStatus: "invited",
      balancePence: 0,
      targetTestDate: new Date("2026-09-18T10:00:00.000Z"),
    },
    create: {
      userId: invitedLearnerUser.id,
      branchId: edinburghBranch.id,
      assignedInstructorId: instructorA.id,
      onboardingStatus: "invited",
      balancePence: 0,
      targetTestDate: new Date("2026-09-18T10:00:00.000Z"),
    },
  });

  await prisma.lead.upsert({
    where: { id: "seed-lead-converted" },
    update: {
      firstName: "Mia",
      lastName: "Douglas",
      email: "mia.douglas@example.com",
      phone: "07700 444444",
      status: "CONVERTED",
      source: "website",
      notes: "Converted after requesting a female instructor and evening tuition in Edinburgh.",
      preferredBranchId: edinburghBranch.id,
      convertedLearnerId: chloe.id,
    },
    create: {
      id: "seed-lead-converted",
      firstName: "Mia",
      lastName: "Douglas",
      email: "mia.douglas@example.com",
      phone: "07700 444444",
      status: "CONVERTED",
      source: "website",
      notes: "Converted after requesting a female instructor and evening tuition in Edinburgh.",
      preferredBranchId: edinburghBranch.id,
      convertedLearnerId: chloe.id,
    },
  });

  await prisma.lead.upsert({
    where: { id: "seed-lead-new" },
    update: {
      firstName: "Euan",
      lastName: "Stewart",
      email: "euan.stewart@example.com",
      phone: "07700 555555",
      status: "CONTACTED",
      source: "referral",
      notes: "Interested in automatic lessons around Livingston and can only do school hours.",
      preferredBranchId: westBranch.id,
      convertedLearnerId: null,
    },
    create: {
      id: "seed-lead-new",
      firstName: "Euan",
      lastName: "Stewart",
      email: "euan.stewart@example.com",
      phone: "07700 555555",
      status: "CONTACTED",
      source: "referral",
      notes: "Interested in automatic lessons around Livingston and can only do school hours.",
      preferredBranchId: westBranch.id,
      convertedLearnerId: null,
    },
  });

  for (const availability of [
    { id: "seed-availability-a1", instructorId: instructorA.id, dayOfWeek: "MONDAY", startTime: "09:00", endTime: "17:00", notes: "City route block." },
    { id: "seed-availability-a2", instructorId: instructorA.id, dayOfWeek: "WEDNESDAY", startTime: "12:00", endTime: "20:00", notes: "After-work learner slots." },
    { id: "seed-availability-b1", instructorId: instructorB.id, dayOfWeek: "TUESDAY", startTime: "09:30", endTime: "15:30", notes: "Livingston automatic route coverage." },
    { id: "seed-availability-b2", instructorId: instructorB.id, dayOfWeek: "SATURDAY", startTime: "10:00", endTime: "14:00", notes: "Weekend family bookings." },
  ]) {
    await prisma.instructorAvailability.upsert({
      where: { id: availability.id },
      update: { ...availability, isAvailable: true },
      create: { ...availability, isAvailable: true },
    });
  }

  for (const skill of [
    { id: "seed-skill-chloe-1", learnerId: chloe.id, skillCode: "junctions", skillLabel: "Junction judgement", level: "DEVELOPING", note: "Still hesitates on busy right turns." },
    { id: "seed-skill-chloe-2", learnerId: chloe.id, skillCode: "bay_parking", skillLabel: "Bay parking", level: "INTRODUCED", note: "Can complete manoeuvre but needs steadier final alignment." },
    { id: "seed-skill-ben-1", learnerId: ben.id, skillCode: "independent_drive", skillLabel: "Independent driving", level: "TEST_READY", note: "Comfortable on sat-nav routes and lane planning." },
    { id: "seed-skill-ben-2", learnerId: ben.id, skillCode: "roundabouts", skillLabel: "Roundabouts", level: "CONSISTENT", note: "Confident and controlled on multi-lane entries." },
    { id: "seed-skill-isla-1", learnerId: isla.id, skillCode: "confidence", skillLabel: "Traffic confidence", level: "DEVELOPING", note: "Progressing well, but needs more repetition at busy junctions." },
  ]) {
    await prisma.skillProgress.upsert({
      where: { learnerId_skillCode: { learnerId: skill.learnerId, skillCode: skill.skillCode } },
      update: { skillLabel: skill.skillLabel, level: skill.level, note: skill.note },
      create: { learnerId: skill.learnerId, skillCode: skill.skillCode, skillLabel: skill.skillLabel, level: skill.level, note: skill.note },
    });
  }

  for (const theory of [
    { id: "seed-theory-chloe", learnerId: chloe.id, status: "BOOKED", testDate: new Date("2026-04-22T10:15:00.000Z"), testCentre: "Edinburgh Theory Test Centre", bookingReference: "TH-CHLOE-01", score: null },
    { id: "seed-theory-ben", learnerId: ben.id, status: "PASSED", testDate: new Date("2026-03-05T09:00:00.000Z"), testCentre: "Currie Theory Test Centre", bookingReference: "TH-BEN-01", score: 48 },
    { id: "seed-theory-isla", learnerId: isla.id, status: "PASSED", testDate: new Date("2026-02-27T11:30:00.000Z"), testCentre: "Livingston Theory Test Centre", bookingReference: "TH-ISLA-01", score: 45 },
  ]) {
    await prisma.theoryTest.upsert({
      where: { id: theory.id },
      update: theory,
      create: theory,
    });
  }

  for (const practical of [
    { id: "seed-practical-chloe", learnerId: chloe.id, status: "NOT_BOOKED", testDate: null, testCentre: null, bookingReference: null, resultSummary: null },
    { id: "seed-practical-ben", learnerId: ben.id, status: "BOOKED", testDate: new Date("2026-05-28T13:20:00.000Z"), testCentre: "Currie Test Centre", bookingReference: "PR-BEN-01", resultSummary: null },
    { id: "seed-practical-isla", learnerId: isla.id, status: "NOT_BOOKED", testDate: null, testCentre: null, bookingReference: null, resultSummary: null },
  ]) {
    await prisma.practicalTest.upsert({
      where: { id: practical.id },
      update: practical,
      create: practical,
    });
  }

  const chloeLesson = await prisma.lesson.upsert({
    where: { id: "seed-lesson-chloe-upcoming" },
    update: {
      branchId: edinburghBranch.id,
      learnerId: chloe.id,
      instructorId: instructorA.id,
      status: "CONFIRMED",
      transmission: "MANUAL",
      startsAt: new Date("2026-04-15T15:30:00.000Z"),
      endsAt: new Date("2026-04-15T17:00:00.000Z"),
      pickupLocation: "Haymarket Station",
      dropoffLocation: "Morningside",
      learnerNotes: "Focus on busy-city junctions before theory date.",
      internalNotes: "Likely to be test-ready later in summer once confidence improves.",
    },
    create: {
      id: "seed-lesson-chloe-upcoming",
      branchId: edinburghBranch.id,
      learnerId: chloe.id,
      instructorId: instructorA.id,
      status: "CONFIRMED",
      transmission: "MANUAL",
      startsAt: new Date("2026-04-15T15:30:00.000Z"),
      endsAt: new Date("2026-04-15T17:00:00.000Z"),
      pickupLocation: "Haymarket Station",
      dropoffLocation: "Morningside",
      learnerNotes: "Focus on busy-city junctions before theory date.",
      internalNotes: "Likely to be test-ready later in summer once confidence improves.",
    },
  });

  const benLesson = await prisma.lesson.upsert({
    where: { id: "seed-lesson-ben-completed" },
    update: {
      branchId: edinburghBranch.id,
      learnerId: ben.id,
      instructorId: instructorA.id,
      status: "COMPLETED",
      transmission: "MANUAL",
      startsAt: new Date("2026-04-07T13:00:00.000Z"),
      endsAt: new Date("2026-04-07T14:30:00.000Z"),
      pickupLocation: "Corstorphine Retail Park",
      dropoffLocation: "Currie Test Routes",
      attendanceStatus: "ATTENDED",
      taughtMinutes: 90,
      completedAt: new Date("2026-04-07T14:30:00.000Z"),
      completionSummary: "Strong mock-test drive with only minor hesitation on lane discipline.",
      learnerNotes: "Wanted extra test-centre route rehearsal.",
      internalNotes: "Good candidate for final readiness review.",
    },
    create: {
      id: "seed-lesson-ben-completed",
      branchId: edinburghBranch.id,
      learnerId: ben.id,
      instructorId: instructorA.id,
      status: "COMPLETED",
      transmission: "MANUAL",
      startsAt: new Date("2026-04-07T13:00:00.000Z"),
      endsAt: new Date("2026-04-07T14:30:00.000Z"),
      pickupLocation: "Corstorphine Retail Park",
      dropoffLocation: "Currie Test Routes",
      attendanceStatus: "ATTENDED",
      taughtMinutes: 90,
      completedAt: new Date("2026-04-07T14:30:00.000Z"),
      completionSummary: "Strong mock-test drive with only minor hesitation on lane discipline.",
      learnerNotes: "Wanted extra test-centre route rehearsal.",
      internalNotes: "Good candidate for final readiness review.",
    },
  });

  const islaLesson = await prisma.lesson.upsert({
    where: { id: "seed-lesson-isla-upcoming" },
    update: {
      branchId: westBranch.id,
      learnerId: isla.id,
      instructorId: instructorB.id,
      status: "SCHEDULED",
      transmission: "AUTOMATIC",
      startsAt: new Date("2026-04-18T10:00:00.000Z"),
      endsAt: new Date("2026-04-18T11:30:00.000Z"),
      pickupLocation: "Livingston North Station",
      dropoffLocation: "Almondvale Centre",
      learnerNotes: "Prefers quieter routes at the start of the session.",
      internalNotes: "Tie lesson progress to finance follow-up before issuing the next package.",
    },
    create: {
      id: "seed-lesson-isla-upcoming",
      branchId: westBranch.id,
      learnerId: isla.id,
      instructorId: instructorB.id,
      status: "SCHEDULED",
      transmission: "AUTOMATIC",
      startsAt: new Date("2026-04-18T10:00:00.000Z"),
      endsAt: new Date("2026-04-18T11:30:00.000Z"),
      pickupLocation: "Livingston North Station",
      dropoffLocation: "Almondvale Centre",
      learnerNotes: "Prefers quieter routes at the start of the session.",
      internalNotes: "Tie lesson progress to finance follow-up before issuing the next package.",
    },
  });

  for (const note of [
    {
      id: "seed-note-chloe-1",
      lessonId: chloeLesson.id,
      summary: "Urban awareness session prepared for theory week.",
      strengths: "Mirror discipline improving steadily.",
      focusAreas: "More confidence when filtering into busier traffic.",
      shareWithLearner: true,
    },
    {
      id: "seed-note-ben-1",
      lessonId: benLesson.id,
      summary: "Mock practical rehearsal around likely test routes.",
      strengths: "Very strong observation routine and independent driving.",
      focusAreas: "Keep first roundabout lane choice calm under pressure.",
      shareWithLearner: true,
    },
    {
      id: "seed-note-isla-1",
      lessonId: islaLesson.id,
      summary: "Confidence-focused automatic session planned for next visit.",
      strengths: "Good steering control and calm town driving.",
      focusAreas: "Continue building speed judgement at busier junctions.",
      shareWithLearner: false,
    },
  ]) {
    await prisma.lessonNote.upsert({
      where: { id: note.id },
      update: note,
      create: note,
    });
  }

  const chloeInvoice = await prisma.invoice.upsert({
    where: { invoiceNumber: "INV-DTC-1001" },
    update: {
      learnerId: chloe.id,
      branchId: edinburghBranch.id,
      status: "PART_PAID",
      issuedAt: new Date("2026-04-02T09:00:00.000Z"),
      dueAt: new Date("2026-04-09T17:00:00.000Z"),
      subtotalPence: 24500,
      totalPence: 24500,
      balancePence: 18500,
    },
    create: {
      learnerId: chloe.id,
      branchId: edinburghBranch.id,
      invoiceNumber: "INV-DTC-1001",
      status: "PART_PAID",
      issuedAt: new Date("2026-04-02T09:00:00.000Z"),
      dueAt: new Date("2026-04-09T17:00:00.000Z"),
      subtotalPence: 24500,
      totalPence: 24500,
      balancePence: 18500,
    },
  });

  const benInvoice = await prisma.invoice.upsert({
    where: { invoiceNumber: "INV-DTC-1002" },
    update: {
      learnerId: ben.id,
      branchId: edinburghBranch.id,
      status: "PAID",
      issuedAt: new Date("2026-03-20T09:30:00.000Z"),
      dueAt: new Date("2026-03-27T09:30:00.000Z"),
      subtotalPence: 16000,
      totalPence: 16000,
      balancePence: 0,
    },
    create: {
      learnerId: ben.id,
      branchId: edinburghBranch.id,
      invoiceNumber: "INV-DTC-1002",
      status: "PAID",
      issuedAt: new Date("2026-03-20T09:30:00.000Z"),
      dueAt: new Date("2026-03-27T09:30:00.000Z"),
      subtotalPence: 16000,
      totalPence: 16000,
      balancePence: 0,
    },
  });

  const islaInvoice = await prisma.invoice.upsert({
    where: { invoiceNumber: "INV-DTC-1003" },
    update: {
      learnerId: isla.id,
      branchId: westBranch.id,
      status: "ISSUED",
      issuedAt: new Date("2026-03-28T10:00:00.000Z"),
      dueAt: new Date("2026-04-05T10:00:00.000Z"),
      subtotalPence: 24200,
      totalPence: 24200,
      balancePence: 24200,
    },
    create: {
      learnerId: isla.id,
      branchId: westBranch.id,
      invoiceNumber: "INV-DTC-1003",
      status: "ISSUED",
      issuedAt: new Date("2026-03-28T10:00:00.000Z"),
      dueAt: new Date("2026-04-05T10:00:00.000Z"),
      subtotalPence: 24200,
      totalPence: 24200,
      balancePence: 24200,
    },
  });

  for (const line of [
    { id: "seed-line-chloe-1", invoiceId: chloeInvoice.id, description: "8 lesson starter package", quantity: 1, unitAmountPence: 24500, lineTotalPence: 24500 },
    { id: "seed-line-ben-1", invoiceId: benInvoice.id, description: "Final test prep block", quantity: 1, unitAmountPence: 16000, lineTotalPence: 16000 },
    { id: "seed-line-isla-1", invoiceId: islaInvoice.id, description: "Automatic lesson package", quantity: 1, unitAmountPence: 24200, lineTotalPence: 24200 },
  ]) {
    await prisma.invoiceLine.upsert({
      where: { id: line.id },
      update: line,
      create: line,
    });
  }

  for (const payment of [
    { id: "seed-payment-chloe-1", invoiceId: chloeInvoice.id, status: "SUCCEEDED", provider: "manual", providerReference: "BANK-CHLOE-01", amountPence: 6000, receivedAt: new Date("2026-04-03T16:20:00.000Z") },
    { id: "seed-payment-ben-1", invoiceId: benInvoice.id, status: "SUCCEEDED", provider: "manual", providerReference: "BANK-BEN-01", amountPence: 16000, receivedAt: new Date("2026-03-21T12:00:00.000Z") },
    { id: "seed-payment-isla-1", invoiceId: islaInvoice.id, status: "PENDING", provider: "payment-link", providerReference: "PAY-ISLA-01", amountPence: 12100, receivedAt: null },
  ]) {
    await prisma.payment.upsert({
      where: { id: payment.id },
      update: payment,
      create: payment,
    });
  }

  for (const collectionsCase of [
    {
      learnerId: chloe.id,
      ownerName: "Edinburgh HQ office",
      nextFollowUpAt: new Date("2026-04-10T09:00:00.000Z"),
      status: "ACTIVE",
      note: "Part-paid package, keep chasing before more lessons are released.",
      lastActionType: "CHASE_OVERDUE",
      lastActionAt: new Date("2026-04-08T15:00:00.000Z"),
    },
    {
      learnerId: isla.id,
      ownerName: null,
      nextFollowUpAt: new Date("2026-04-09T09:00:00.000Z"),
      status: "ACTIVE",
      note: "Pending payment link needs review and likely call-back from office.",
      lastActionType: "SEND_PENDING_PAYMENT_REMINDER",
      lastActionAt: new Date("2026-04-06T11:30:00.000Z"),
    },
  ]) {
    await prisma.collectionsCase.upsert({
      where: { learnerId: collectionsCase.learnerId },
      update: collectionsCase,
      create: collectionsCase,
    });
  }

  for (const document of [
    {
      id: "seed-document-chloe-licence",
      learnerId: chloe.id,
      uploadedById: chloeUser.id,
      title: "Provisional licence",
      category: "LICENCE",
      workflowState: "APPROVED",
      fileName: "chloe-provisional-licence.txt",
      storagePath: "private:learner-documents/demo/chloe-provisional-licence.txt",
      mimeType: "text/plain",
      audience: "LEARNER",
      notes: "Verified by office during onboarding.",
      requestedAt: new Date("2026-04-01T09:00:00.000Z"),
      dueAt: new Date("2026-04-04T17:00:00.000Z"),
      reviewedAt: new Date("2026-04-03T09:15:00.000Z"),
      expiresAt: new Date("2028-11-30T00:00:00.000Z"),
    },
    {
      id: "seed-document-chloe-consent",
      learnerId: chloe.id,
      uploadedById: chloeUser.id,
      title: "Learner consent form",
      category: "CONSENT_FORM",
      workflowState: "REQUESTED",
      fileName: "chloe-consent-form.txt",
      storagePath: "private:learner-documents/demo/chloe-consent-form.txt",
      mimeType: "text/plain",
      audience: "SHARED",
      notes: "Reminder due before moving deeper into onboarding.",
      requestedAt: new Date("2026-04-05T09:30:00.000Z"),
      dueAt: new Date("2026-04-09T17:00:00.000Z"),
      reviewedAt: null,
      expiresAt: null,
    },
    {
      id: "seed-document-ben-licence",
      learnerId: ben.id,
      uploadedById: benUser.id,
      title: "Provisional licence",
      category: "LICENCE",
      workflowState: "APPROVED",
      fileName: "ben-provisional-licence.txt",
      storagePath: "private:learner-documents/demo/ben-provisional-licence.txt",
      mimeType: "text/plain",
      audience: "LEARNER",
      notes: "Approved and visible in portal.",
      requestedAt: new Date("2026-02-10T09:00:00.000Z"),
      dueAt: new Date("2026-02-12T17:00:00.000Z"),
      reviewedAt: new Date("2026-02-11T10:00:00.000Z"),
      expiresAt: new Date("2029-02-20T00:00:00.000Z"),
    },
    {
      id: "seed-document-ben-theory",
      learnerId: ben.id,
      uploadedById: benUser.id,
      title: "Theory pass certificate",
      category: "THEORY_CERTIFICATE",
      workflowState: "APPROVED",
      fileName: "ben-theory-pass-certificate.txt",
      storagePath: "private:learner-documents/demo/ben-theory-pass-certificate.txt",
      mimeType: "text/plain",
      audience: "SHARED",
      notes: "Cleared for practical booking workflow.",
      requestedAt: new Date("2026-03-05T12:00:00.000Z"),
      dueAt: new Date("2026-03-07T17:00:00.000Z"),
      reviewedAt: new Date("2026-03-06T09:30:00.000Z"),
      expiresAt: null,
    },
    {
      id: "seed-document-ben-consent",
      learnerId: ben.id,
      uploadedById: benUser.id,
      title: "Learner consent form",
      category: "CONSENT_FORM",
      workflowState: "APPROVED",
      fileName: "ben-consent-form.txt",
      storagePath: "private:learner-documents/demo/ben-consent-form.txt",
      mimeType: "text/plain",
      audience: "SHARED",
      notes: "Complete onboarding pack on file.",
      requestedAt: new Date("2026-02-12T10:00:00.000Z"),
      dueAt: new Date("2026-02-13T17:00:00.000Z"),
      reviewedAt: new Date("2026-02-13T11:00:00.000Z"),
      expiresAt: null,
    },
    {
      id: "seed-document-ben-identity",
      learnerId: ben.id,
      uploadedById: benUser.id,
      title: "Identity check",
      category: "IDENTITY",
      workflowState: "APPROVED",
      fileName: "ben-consent-form.txt",
      storagePath: "private:learner-documents/demo/ben-consent-form.txt",
      mimeType: "text/plain",
      audience: "INTERNAL",
      notes: "Address check completed by office.",
      requestedAt: new Date("2026-02-12T10:15:00.000Z"),
      dueAt: new Date("2026-02-13T17:00:00.000Z"),
      reviewedAt: new Date("2026-02-13T11:10:00.000Z"),
      expiresAt: null,
    },
    {
      id: "seed-document-isla-identity",
      learnerId: isla.id,
      uploadedById: islaUser.id,
      title: "Identity check",
      category: "IDENTITY",
      workflowState: "UNDER_REVIEW",
      fileName: "isla-id-check.txt",
      storagePath: "private:learner-documents/demo/isla-id-check.txt",
      mimeType: "text/plain",
      audience: "SHARED",
      notes: "Waiting for office review after recent upload.",
      requestedAt: new Date("2026-04-01T09:00:00.000Z"),
      dueAt: new Date("2026-04-04T17:00:00.000Z"),
      reviewedAt: null,
      expiresAt: null,
    },
  ]) {
    await prisma.document.upsert({
      where: { id: document.id },
      update: document,
      create: document,
    });
  }

  for (const audit of [
    { id: "seed-audit-chloe-1", userId: adminUser.id, action: "UPDATED", entityType: "LearnerProfile", entityId: chloe.id, detail: "Onboarding kept active while consent form and finance follow-up remain open.", createdAt: new Date("2026-04-08T10:00:00.000Z") },
    { id: "seed-audit-chloe-2", userId: adminUser.id, action: "UPDATED", entityType: "Collections", entityId: chloe.id, detail: "Overdue balance chased and next follow-up set for 2026-04-10.", createdAt: new Date("2026-04-08T15:00:00.000Z") },
    { id: "seed-audit-chloe-3", userId: adminUser.id, action: "UPDATED", entityType: "Document", entityId: "seed-document-chloe-consent", detail: "Consent form reminder sent after due date approached.", createdAt: new Date("2026-04-08T09:30:00.000Z") },
    { id: "seed-audit-ben-1", userId: adminUser.id, action: "UPDATED", entityType: "LearnerProfile", entityId: ben.id, detail: "Learner marked test ready after theory pass, approved core documents, and recent mock test review.", createdAt: new Date("2026-04-07T15:00:00.000Z") },
    { id: "seed-audit-ben-2", userId: adminUser.id, action: "UPDATED", entityType: "Lesson", entityId: benLesson.id, detail: "Completed test-prep lesson with strong mock-test result and minor roundabout feedback.", createdAt: new Date("2026-04-07T14:35:00.000Z") },
    { id: "seed-audit-ben-3", userId: adminUser.id, action: "UPDATED", entityType: "Payment", entityId: "seed-payment-ben-1", detail: "Invoice settled in full ahead of practical preparation block.", createdAt: new Date("2026-03-21T12:10:00.000Z") },
    { id: "seed-audit-isla-1", userId: adminUser.id, action: "UPDATED", entityType: "Collections", entityId: isla.id, detail: "Pending payment reminder sent with office callback requested.", createdAt: new Date("2026-04-06T11:30:00.000Z") },
    { id: "seed-audit-isla-2", userId: adminUser.id, action: "UPDATED", entityType: "Invoice", entityId: islaInvoice.id, detail: "Automatic package invoice remains open and overdue pending payment review.", createdAt: new Date("2026-04-05T10:15:00.000Z") },
    { id: "seed-audit-isla-3", userId: adminUser.id, action: "UPDATED", entityType: "Document", entityId: "seed-document-isla-identity", detail: "Identity upload received and moved into staff review.", createdAt: new Date("2026-04-02T14:00:00.000Z") },
  ]) {
    await prisma.auditLog.upsert({
      where: { id: audit.id },
      update: audit,
      create: audit,
    });
  }

  console.log({
    branchCodes: [edinburghBranch.code, westBranch.code],
    instructors: [
      `${instructorAUser.firstName} ${instructorAUser.lastName}`,
      `${instructorBUser.firstName} ${instructorBUser.lastName}`,
    ],
    learners: [
      `${chloeUser.firstName} ${chloeUser.lastName} - onboarding + part-paid finance`,
      `${benUser.firstName} ${benUser.lastName} - test ready`,
      `${islaUser.firstName} ${islaUser.lastName} - overdue / pending payment follow-up`,
    ],
    invoices: ["INV-DTC-1001", "INV-DTC-1002", "INV-DTC-1003"],
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });