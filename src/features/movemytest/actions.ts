"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { requireMoveMyTestSession } from "./session";
import { BOOKING_REFERENCE_TTL_MINUTES, isNiMoveMyTestEnabled, TEST_SWAP_BASE_PATH } from "./constants";
import { evaluatePotentialMatch, type MatchCentre, type MatchListing } from "./matching";
import { bookingReferenceExpiresAt, encryptBookingReference } from "./secrets";
import type { MoveMyTestActionState } from "./action-state";
import { bookingReferenceConsentSchema, movemytestInstructorSchema, movemytestListingEditSchema, movemytestListingSchema } from "./validation";
import { calculateDvsaCallWindow, hasDvsaCallWindowExpired } from "./dvsa-call-window";
import { calculateMatchExpiry } from "./business-days";
import { scheduleMatchEmailQueue, sendQueuedMoveMyTestEmailsAction, scheduleMatchProposedEmails } from "./email-queue";

function normalizeAdiNumber(value: string) {
  return value.trim().toUpperCase().replace(/\s+/g, "");
}

function cleanOptionalString(value: string) {
  const trimmed = value.trim();
  return trimmed || null;
}

function dateTime(date: string, time: string) {
  return new Date(`${date}T${time}:00.000Z`);
}

function listingForMatcher(listing: Awaited<ReturnType<typeof prisma.listing.findMany>>[number] & { currentCentre?: { country: string } }): MatchListing {
  const desired = Array.isArray(listing.desiredCentreIds) ? listing.desiredCentreIds.filter((item): item is string => typeof item === "string") : [];
  return {
    id: listing.id,
    userId: listing.accountId ?? listing.userId ?? listing.id,
    status: listing.status,
    currentCentreId: listing.currentCentreId,
    originalCentreId: listing.originalCentreId,
    currentDateTime: listing.currentDateTime,
    testType: listing.testType,
    hasRemainingChange: listing.hasRemainingChange,
    desiredDateFrom: listing.desiredDateFrom,
    desiredDateTo: listing.desiredDateTo,
    desiredTimePreference: listing.desiredTimePreference,
    desiredCentreIds: desired,
    desiredDirection: listing.desiredDirection,
    jurisdiction: listing.jurisdiction,
    country: listing.currentCentre?.country,
  };
}

async function buildCentreMap() {
  const centres = await prisma.testCentre.findMany({ select: { id: true } });
  return new Map<string, MatchCentre>(centres.map((centre) => [centre.id, { id: centre.id, nearestCentreIds: [] }]));
}

export async function createPotentialMatchesForListing(listingId: string) {
  const listing = await prisma.listing.findUnique({ where: { id: listingId }, include: { currentCentre: true } });
  if (!listing || listing.status !== "ACTIVE") return;

  const candidates = await prisma.listing.findMany({
    where: { id: { not: listing.id }, status: "ACTIVE" },
    include: { currentCentre: true },
    take: 100,
  });
  const centres = await buildCentreMap();
  const a = listingForMatcher(listing);

  for (const candidate of candidates) {
    const b = listingForMatcher(candidate);
    const evaluation = evaluatePotentialMatch(a, b, centres);
    if (!evaluation.eligible) continue;
    const [first, second] = [listing.id, candidate.id].sort();
    await prisma.match.upsert({
      where: { listingAId_listingBId: { listingAId: first, listingBId: second } },
      update: { score: evaluation.score, qualitySummary: `Compatibility score ${evaluation.score}/100`, ineligibleReasons: [] },
      create: {
        listingAId: first,
        listingBId: second,
        score: evaluation.score,
        qualitySummary: `Compatibility score ${evaluation.score}/100`,
        ineligibleReasons: [],
        expiresAt: calculateMatchExpiry(new Date()),
        events: { create: { eventType: "MATCH_PROPOSED", detail: { score: evaluation.score } } },
      },
    });
// Schedule match-found emails for the newly created match
    const newMatch = await prisma.match.findUnique({
      where: { listingAId_listingBId: { listingAId: first, listingBId: second } },
    });
    if (newMatch) {
      await scheduleMatchProposedEmails(newMatch.id);
      await sendQueuedMoveMyTestEmailsAction(newMatch.id);
      
      // Send webhook to DTC if matching with DTC listing
      if (candidate.source === "DTC") {
        const { notifyDtcOfMatchProposed } = await import("./webhooks");
        await notifyDtcOfMatchProposed(
          newMatch.id,
          a,
          { ...b, dtcListingId: candidate.dtcListingId },
          evaluation.score
        ).catch(err => {
          console.error("[Matching] Failed to notify DTC of match:", err);
        });
      }
    }
  }
}

export async function createMoveMyTestListingAction(_: MoveMyTestActionState, formData: FormData): Promise<MoveMyTestActionState> {
  const session = await requireMoveMyTestSession();
  const raw = {
    currentCentreId: String(formData.get("currentCentreId") ?? ""),
    originalCentreId: String(formData.get("originalCentreId") ?? ""),
    currentDate: String(formData.get("currentDate") ?? ""),
    currentTime: String(formData.get("currentTime") ?? ""),
    bookingReference: String(formData.get("bookingReference") ?? ""),
    testType: String(formData.get("testType") ?? ""),
    hasRemainingChange: String(formData.get("hasRemainingChange") ?? ""),
    desiredDateFrom: String(formData.get("desiredDateFrom") ?? ""),
    desiredDateTo: String(formData.get("desiredDateTo") ?? ""),
    desiredTimePreference: String(formData.get("desiredTimePreference") ?? "ANY"),
    desiredCentreIds: formData.getAll("desiredCentreIds").map(String).filter(Boolean),
    desiredDirection: String(formData.get("desiredDirection") ?? "EITHER"),
    instructorAdiNumber: String(formData.get("instructorAdiNumber") ?? ""),
    instructorFirstName: String(formData.get("instructorFirstName") ?? ""),
    instructorLastName: String(formData.get("instructorLastName") ?? ""),
    instructorMobileNumber: String(formData.get("instructorMobileNumber") ?? ""),
    instructorEmail: String(formData.get("instructorEmail") ?? ""),
    hasInstructor: String(formData.get("hasInstructor") ?? ""),
    knowsInstructorDetails: String(formData.get("knowsInstructorDetails") ?? ""),
    instructorPermission: String(formData.get("instructorPermission") ?? ""),
    instructorAvailabilityCheck: String(formData.get("instructorAvailabilityCheck") ?? ""),
    complianceOwnTest: String(formData.get("complianceOwnTest") ?? ""),
    complianceDvsaPhone: String(formData.get("complianceDvsaPhone") ?? ""),
    complianceNoSensitiveSharing: String(formData.get("complianceNoSensitiveSharing") ?? ""),
  };

  const parsed = movemytestListingSchema.safeParse(raw);
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0]?.message ?? "Please check the form and try again." };

  const centre = await prisma.testCentre.findUnique({ where: { id: parsed.data.currentCentreId } });
  if (!centre) return { status: "error", message: "Choose a valid current test centre." };
  if (centre.sourceAgency === "DVA" && !isNiMoveMyTestEnabled()) {
    return { status: "error", message: "Northern Ireland centres are listed for browsing, but live DVA swaps are not enabled yet." };
  }

  const account = await prisma.learnerAccount.findUnique({ where: { id: session.accountId }, select: { status: true } });
  if (account?.status !== "ACTIVE") return { status: "error", message: "Please verify your MoveMyTest account before creating a listing." };

  const duplicate = await prisma.listing.findFirst({ where: { accountId: session.accountId, status: { in: ["ACTIVE", "PAUSED", "MATCHED"] } } });
  if (duplicate) return { status: "error", message: "You already have an active test swap listing. Pause or delete it before creating another." };

  const bookingReference = parsed.data.bookingReference?.trim() ? encryptBookingReference(parsed.data.bookingReference.trim()) : null;
  const hasInstructor = parsed.data.hasInstructor === "yes";
  const knowsInstructorDetails = parsed.data.knowsInstructorDetails === "yes";
  const instructorAdiNumber = hasInstructor && knowsInstructorDetails ? normalizeAdiNumber(parsed.data.instructorAdiNumber || "") : "";
  const registeredInstructor = instructorAdiNumber ? await prisma.instructorAccount.findUnique({ where: { adiNumber: instructorAdiNumber }, select: { id: true, status: true } }) : null;
  const now = new Date();

  const instructorDetailsData = !hasInstructor
    ? undefined
    : {
        create: knowsInstructorDetails
          ? {
              instructorAccountId: registeredInstructor?.status === "ACTIVE" ? registeredInstructor.id : null,
              adiNumber: instructorAdiNumber || null,
              firstName: parsed.data.instructorFirstName?.trim() || null,
              lastName: parsed.data.instructorLastName?.trim() || null,
              email: parsed.data.instructorEmail?.trim().toLowerCase() || null,
              mobileNumber: cleanOptionalString(parsed.data.instructorMobileNumber || ""),
              learnerConfirmedPermissionAt: parsed.data.instructorPermission === "on" ? now : null,
              learnerConfirmedAvailabilityCheckAt: parsed.data.instructorAvailabilityCheck === "on" ? now : null,
              inviteSentAt: registeredInstructor?.status === "ACTIVE" ? null : now,
              invites: registeredInstructor?.status === "ACTIVE" ? undefined : {
                create: {
                  instructorAccountId: null,
                  email: parsed.data.instructorEmail?.trim().toLowerCase() || "",
                  adiNumber: instructorAdiNumber || "",
                  status: "PENDING",
                  inviteSentAt: now,
                  inviteError: "Email delivery pending: invite record created for future mailer integration.",
                },
              },
            }
          : {
// Has instructor but doesn't know details yet — placeholder record
              instructorAccountId: null,
              adiNumber: null,
              firstName: null,
              lastName: null,
              email: null,
              mobileNumber: null,
              learnerConfirmedPermissionAt: null,
              learnerConfirmedAvailabilityCheckAt: null,
              inviteSentAt: null,
            },
      };

  const listing = await prisma.listing.create({
    data: {
      accountId: session.accountId,
      currentCentreId: parsed.data.currentCentreId,
      originalCentreId: parsed.data.originalCentreId || null,
      currentDateTime: dateTime(parsed.data.currentDate, parsed.data.currentTime),
      bookingReferenceEncrypted: bookingReference?.encryptedValue ?? null,
      bookingReferenceIv: bookingReference?.iv ?? null,
      bookingReferenceAuthTag: bookingReference?.authTag ?? null,
      testType: parsed.data.testType,
      hasRemainingChange: true,
      desiredDateFrom: new Date(`${parsed.data.desiredDateFrom}T00:00:00.000Z`),
      desiredDateTo: new Date(`${parsed.data.desiredDateTo}T23:59:59.000Z`),
      desiredTimePreference: parsed.data.desiredTimePreference,
      desiredCentreIds: parsed.data.desiredCentreIds,
      desiredDirection: parsed.data.desiredDirection,
      jurisdiction: centre.sourceAgency === "DVA" ? "NI_DVA" : "GB_DVSA",
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      ...(instructorDetailsData ? { instructorDetails: instructorDetailsData } : {}),
    },
  });

  await createPotentialMatchesForListing(listing.id);

  // Push to DTC for cross-platform visibility (fire-and-forget)
  import("./cross-platform-sync").then(({ pushListingToDTC }) => {
    pushListingToDTC({
      mmtListingId: listing.id,
      action: "created",
      currentCentreId: listing.currentCentreId,
      originalCentreId: listing.originalCentreId,
      currentDateTime: listing.currentDateTime.toISOString(),
      testType: listing.testType,
      hasRemainingChange: listing.hasRemainingChange,
      desiredDateFrom: listing.desiredDateFrom.toISOString(),
      desiredDateTo: listing.desiredDateTo.toISOString(),
      desiredTimePreference: listing.desiredTimePreference,
      desiredCentreIds: parsed.data.desiredCentreIds,
      desiredDirection: listing.desiredDirection,
      jurisdiction: listing.jurisdiction,
      status: listing.status,
      expiresAt: listing.expiresAt.toISOString(),
    }).catch((err) => console.error("[MMTCrossSync] Background sync failed:", err));
  });

  revalidatePath(`${TEST_SWAP_BASE_PATH}/dashboard`);
  redirect(`${TEST_SWAP_BASE_PATH}/dashboard/what-to-expect` as never);
}

export async function pauseMoveMyTestListingAction(formData: FormData) {
  const session = await requireMoveMyTestSession();
  const listingId = String(formData.get("listingId") ?? "");
  
  // Prevent pausing DTC shadow listings
  const listing = await prisma.listing.findFirst({
    where: { id: listingId, accountId: session.accountId },
    select: { source: true },
  });
  if (listing?.source === "DTC") {
    throw new Error("Cannot pause DTC Network listings from MoveMyTest.");
  }
  
  await prisma.listing.updateMany({ where: { id: listingId, accountId: session.accountId }, data: { status: "PAUSED" } });
  revalidatePath(`${TEST_SWAP_BASE_PATH}/dashboard`);
}

export async function deleteMoveMyTestListingAction(formData: FormData) {
  const session = await requireMoveMyTestSession();
  const listingId = String(formData.get("listingId") ?? "");
  const now = new Date();

  // Prevent deleting DTC shadow listings
  const listing = await prisma.listing.findFirst({
    where: { id: listingId, accountId: session.accountId },
    select: { source: true },
  });
  if (listing?.source === "DTC") {
    throw new Error("Cannot delete DTC Network listings from MoveMyTest.");
  }

// Soft-delete the listing
  await prisma.listing.updateMany({ where: { id: listingId, accountId: session.accountId }, data: { status: "DELETED" } });

// Also expire any active matches for this listing so they don't show as "open"
  await prisma.match.updateMany({
    where: {
      status: { in: ["PROPOSED", "LEARNER_A_ACCEPTED", "LEARNER_B_ACCEPTED", "BOTH_ACCEPTED", "CALLER_PENDING", "BOOKING_REFERENCE_CONSENT_REQUESTED", "BOOKING_REFERENCE_SHARED"] },
      OR: [{ listingAId: listingId }, { listingBId: listingId }],
    },
    data: { status: "EXPIRED", cancelledAt: now, cancelReason: "Listing was deleted by the learner." },
  });

  revalidatePath(`${TEST_SWAP_BASE_PATH}/dashboard`);
  redirect(`${TEST_SWAP_BASE_PATH}/dashboard?deleted=true`);
}

export async function acceptMoveMyTestMatchAction(formData: FormData) {
  const session = await requireMoveMyTestSession();
  const matchId = String(formData.get("matchId") ?? "");

  // Use transaction to prevent race conditions
  const result = await prisma.$transaction(async (tx) => {
    const match = await tx.match.findFirst({
      where: { id: matchId, OR: [{ listingA: { accountId: session.accountId } }, { listingB: { accountId: session.accountId } }] },
      include: { listingA: true, listingB: true },
    });
    if (!match) return { success: false, matchId: null };

    const isA = match.listingA.accountId === session.accountId;

    // Don't regress already-accepted matches
    if (match.learnerAAcceptedAt && match.learnerBAcceptedAt && match.status === "CALLER_PENDING") {
      return { success: true, alreadyAccepted: true, status: match.status, matchId: match.id };
    }

    const data = isA ? { learnerAAcceptedAt: new Date() } : { learnerBAcceptedAt: new Date() };
    const bothAccepted = (isA ? new Date() : match.learnerAAcceptedAt) && (!isA ? new Date() : match.learnerBAcceptedAt);
    const newStatus = bothAccepted ? "CALLER_PENDING" : isA ? "LEARNER_A_ACCEPTED" : "LEARNER_B_ACCEPTED";

    await tx.match.update({
      where: { id: match.id },
      data: { ...data, status: newStatus, bothAcceptedAt: bothAccepted ? new Date() : null },
    });

    await tx.matchEvent.create({ data: { matchId: match.id, accountId: session.accountId, eventType: "MATCH_ACCEPTED" } });

    return { success: true, alreadyAccepted: false, status: newStatus, matchId: match.id };
  });

  if (!result.success || !result.matchId) return;

  revalidatePath(`${TEST_SWAP_BASE_PATH}/matches/${result.matchId}`);

  // Push acceptance to DTC if the other listing is cross-platform
  import("./cross-platform-sync").then(({ pushAcceptanceToDTC }) => {
    prisma.match.findUnique({
      where: { id: result.matchId! },
      select: { listingAId: true, listingBId: true, dtcMatchId: true },
    }).then((m) => {
      if (!m) return;
      prisma.listing.findMany({
        where: { id: { in: [m.listingAId, m.listingBId] } },
        select: { id: true, source: true, dtcListingId: true },
      }).then((listings) => {
        const otherListing = listings.find((l) => l.source === "DTC" || l.dtcListingId);
        if (otherListing) {
          // Map MMT listing IDs to DTC listing IDs for the acceptance payload
          const listingA = listings.find((l) => l.id === m.listingAId);
          const listingB = listings.find((l) => l.id === m.listingBId);
          const dtcListingAId = listingA?.dtcListingId || (listingA?.source === "DTC" ? listingA.id : null) || m.listingAId;
          const dtcListingBId = listingB?.dtcListingId || (listingB?.source === "DTC" ? listingB.id : null) || m.listingBId;
          pushAcceptanceToDTC({
            matchId: result.matchId!,
            dtcMatchId: m.dtcMatchId,
            acceptedBy: "MMT" as const,
            listingOwnerId: otherListing.dtcListingId || otherListing.id,
            listingAId: dtcListingAId,
            listingBId: dtcListingBId,
          });
        }
      }).catch(() => {});
    }).catch(() => {});
  });
}

export async function revealBookingReferenceAction(_: MoveMyTestActionState, formData: FormData): Promise<MoveMyTestActionState> {
  const session = await requireMoveMyTestSession();
  const matchId = String(formData.get("matchId") ?? "");
  const useSavedBookingReference = String(formData.get("useSavedBookingReference") ?? "") === "on";
  const volunteerDvsaCaller = String(formData.get("volunteerDvsaCaller") ?? "") === "on";
  const instructorConfirmedByLearner = String(formData.get("instructorConfirmedByLearner") ?? "") === "on";
  const parsed = bookingReferenceConsentSchema.safeParse({
    bookingReference: useSavedBookingReference ? "saved-reference" : String(formData.get("bookingReference") ?? ""),
    consentReadyNow: String(formData.get("consentReadyNow") ?? ""),
    consentSecurity: String(formData.get("consentSecurity") ?? ""),
    consentNoSensitiveSharing: String(formData.get("consentNoSensitiveSharing") ?? ""),
    volunteerDvsaCaller: volunteerDvsaCaller ? "on" : (void 0 as unknown as string),
  });
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0]?.message ?? "Please check the consent form." };

  const match = await prisma.match.findFirst({
    where: { id: matchId, status: { in: ["CALLER_PENDING", "BOOKING_REFERENCE_CONSENT_REQUESTED", "BOOKING_REFERENCE_SHARED"] }, OR: [{ listingA: { accountId: session.accountId } }, { listingB: { accountId: session.accountId } }] },
    include: { listingA: true, listingB: true, secrets: true },
  });
  if (!match) return { status: "error", message: "Booking references can only be shared after both learners accept the match." };
  if (hasDvsaCallWindowExpired(match.callWindowExpiresAt, new Date()) && !match.learnerACompletedAt && !match.learnerBCompletedAt) {
    await prisma.match.update({ where: { id: match.id }, data: { status: "EXPIRED", cancelledAt: new Date(), cancelReason: "DVSA call window expired before either learner marked the match complete." } });
    return { status: "error", message: "This match call window has expired. Please look for another match." };
  }

  const isA = match.listingA.accountId === session.accountId;
  const myListing = isA ? match.listingA : match.listingB;
  const hasDvsaCaller = Boolean(match.learnerADvsaCallerAt || match.learnerBDvsaCallerAt);

  if (!hasDvsaCaller && !volunteerDvsaCaller) {
    return { status: "error", message: "One learner must volunteer to make the DVSA call before booking references are stored." };
  }

  const existingSecret = match.secrets.find((secret) => secret.ownerAccountId === session.accountId && !secret.deletedAt);
  if (!existingSecret) {
    const encrypted = useSavedBookingReference && myListing.bookingReferenceEncrypted && myListing.bookingReferenceIv && myListing.bookingReferenceAuthTag
      ? { encryptedValue: myListing.bookingReferenceEncrypted, iv: myListing.bookingReferenceIv, authTag: myListing.bookingReferenceAuthTag }
      : encryptBookingReference(parsed.data.bookingReference.trim());
    await prisma.bookingReferenceSecret.create({
      data: { matchId, ownerAccountId: session.accountId, ...encrypted, revealedAt: new Date(), expiresAt: match.callWindowExpiresAt ?? bookingReferenceExpiresAt(new Date(), BOOKING_REFERENCE_TTL_MINUTES) },
    });
  }

  const otherConfirmed = isA ? match.learnerBBookingReferenceConfirmedAt : match.learnerABookingReferenceConfirmedAt;
  const callWindow = otherConfirmed && !match.callWindowStartedAt ? calculateDvsaCallWindow(new Date()) : null;
  if (callWindow) {
    await prisma.bookingReferenceSecret.updateMany({ where: { matchId, deletedAt: null }, data: { expiresAt: callWindow.expiresAt } });
  }
  const callerUpdate = volunteerDvsaCaller
    ? isA
      ? { learnerADvsaCallerAt: match.learnerADvsaCallerAt ?? new Date() }
      : { learnerBDvsaCallerAt: match.learnerBDvsaCallerAt ?? new Date() }
    : {};

  await prisma.match.update({
    where: { id: matchId },
    data: {
      ...(isA
        ? { learnerABookingReferenceConfirmedAt: new Date(), instructorConfirmedByLearnerAtA: instructorConfirmedByLearner ? new Date() : undefined }
        : { learnerBBookingReferenceConfirmedAt: new Date(), instructorConfirmedByLearnerAtB: instructorConfirmedByLearner ? new Date() : undefined }),
      ...callerUpdate,
      status: otherConfirmed ? "BOOKING_REFERENCE_SHARED" : "BOOKING_REFERENCE_CONSENT_REQUESTED",
      ...(callWindow ? { callWindowStartedAt: callWindow.startedAt, callWindowExpiresAt: callWindow.expiresAt } : {}),
    },
  });

  const shouldSyncCallerVolunteer =
    volunteerDvsaCaller &&
    !match.learnerADvsaCallerAt &&
    !match.learnerBDvsaCallerAt &&
    (match.listingA.source === "DTC" || match.listingB.source === "DTC" || Boolean(match.listingA.dtcListingId || match.listingB.dtcListingId));

  if (shouldSyncCallerVolunteer) {
    const dtcIdForMmtListing = (listing: typeof match.listingA) => {
      if (listing.dtcListingId) return listing.dtcListingId;
      if (listing.source === "DTC") return listing.id;
      return listing.id;
    };

    const { pushCallerVolunteerToDTC } = await import("./cross-platform-sync");
    await pushCallerVolunteerToDTC({
      matchId: match.id,
      dtcMatchId: match.dtcMatchId,
      callerPlatform: "MMT",
      listingAId: dtcIdForMmtListing(match.listingA),
      listingBId: dtcIdForMmtListing(match.listingB),
    });
  }

  if (instructorConfirmedByLearner) {
    await prisma.matchEvent.create({ data: { matchId, accountId: session.accountId, eventType: "INSTRUCTOR_CONFIRMED_BY_LEARNER", detail: { confirmedBy: isA ? "LEARNER_A" : "LEARNER_B" } } });
  }
  await prisma.matchEvent.create({ data: { matchId, accountId: session.accountId, eventType: "BOOKING_REFERENCE_REVEALED", detail: { ttlMinutes: BOOKING_REFERENCE_TTL_MINUTES } } });
  
// Schedule automated email reminders
  await scheduleMatchEmailQueue(matchId);
  
  revalidatePath(`${TEST_SWAP_BASE_PATH}/matches/${matchId}`);
  revalidatePath(`${TEST_SWAP_BASE_PATH}/dashboard`);
  redirect(`${TEST_SWAP_BASE_PATH}/dashboard#call-dvsa` as never);
}

export async function completeMoveMyTestMatchAction(formData: FormData) {
  const session = await requireMoveMyTestSession();
  const matchId = String(formData.get("matchId") ?? "");
  const match = await prisma.match.findFirst({
    where: { id: matchId, status: "BOOKING_REFERENCE_SHARED", OR: [{ listingA: { accountId: session.accountId } }, { listingB: { accountId: session.accountId } }] },
    include: { listingA: true, listingB: true },
  });
  if (!match) return;
  const isA = match.listingA.accountId === session.accountId;
  const completedAt = new Date();
  const data = isA
    ? { learnerACompletedAt: completedAt, learnerBCompletedAt: match.learnerBCompletedAt ?? completedAt }
    : { learnerACompletedAt: match.learnerACompletedAt ?? completedAt, learnerBCompletedAt: completedAt };
  await prisma.match.update({ where: { id: match.id }, data: { ...data, status: "COMPLETED", completedAt } });
  await prisma.listing.updateMany({ where: { id: { in: [match.listingAId, match.listingBId] } }, data: { status: "COMPLETED" } });
  await prisma.matchEvent.create({ data: { matchId: match.id, accountId: session.accountId, eventType: "MATCH_COMPLETION_CONFIRMED" } });
  revalidatePath(`${TEST_SWAP_BASE_PATH}/dashboard`);
  revalidatePath(`${TEST_SWAP_BASE_PATH}/matches/${match.id}`);

// One learner's confirmation after the DVSA call closes the swap, because DVSA has already completed the official change.
  const queuedEmails = await scheduleMatchEmailQueue(match.id);
  if (queuedEmails > 0) {
    await sendQueuedMoveMyTestEmailsAction(match.id);
  }
  redirect(`${TEST_SWAP_BASE_PATH}/support-us?donation=swap-complete` as never);
}

export async function volunteerDvsaCallerAction(formData: FormData) {
  const session = await requireMoveMyTestSession();
  const matchId = String(formData.get("matchId") ?? "");
  const match = await prisma.match.findFirst({
    where: {
      id: matchId,
      status: { in: ["CALLER_PENDING", "BOOKING_REFERENCE_CONSENT_REQUESTED", "BOOKING_REFERENCE_SHARED"] },
      OR: [{ listingA: { accountId: session.accountId } }, { listingB: { accountId: session.accountId } }],
    },
    include: { listingA: true, listingB: true },
  });
  if (!match) return;
  const isA = match.listingA.accountId === session.accountId;
  const ownAlreadyVolunteered = isA ? match.learnerADvsaCallerAt : match.learnerBDvsaCallerAt;
  const callerData = isA ? { learnerADvsaCallerAt: new Date() } : { learnerBDvsaCallerAt: new Date() };
  const otherAlreadyVolunteered = isA ? match.learnerBDvsaCallerAt : match.learnerADvsaCallerAt;

  if (otherAlreadyVolunteered || ownAlreadyVolunteered) {
    revalidatePath(`${TEST_SWAP_BASE_PATH}/matches/${match.id}`);
    revalidatePath(`${TEST_SWAP_BASE_PATH}/dashboard`);
    revalidatePath(`${TEST_SWAP_BASE_PATH}/dashboard/call-dvsa`);
    return;
  }

// Advance to BOOKING_REFERENCE_CONSENT_REQUESTED once at least one person volunteers
  const statusUpdate = match.status === "CALLER_PENDING" ? { status: "BOOKING_REFERENCE_CONSENT_REQUESTED" as const } : {};
  await prisma.match.update({ where: { id: match.id }, data: { ...callerData, ...statusUpdate } });
  await prisma.matchEvent.create({ data: { matchId: match.id, accountId: session.accountId, eventType: "DVSA_CALLER_VOLUNTEERED" } });
  revalidatePath(`${TEST_SWAP_BASE_PATH}/matches/${match.id}`);
  revalidatePath(`${TEST_SWAP_BASE_PATH}/dashboard`);
  revalidatePath(`${TEST_SWAP_BASE_PATH}/dashboard/call-dvsa`);

  import("./cross-platform-sync").then(({ pushCallerVolunteerToDTC }) => {
    prisma.listing.findMany({
      where: { id: { in: [match.listingAId, match.listingBId] } },
      select: { id: true, source: true, dtcListingId: true },
    }).then((listings) => {
      const hasDtcListing = listings.some((listing) => listing.source === "DTC" || listing.dtcListingId);
      if (!hasDtcListing) return;

      const dtcIdForMmtListing = (mmtId: string) => {
        const listing = listings.find((item) => item.id === mmtId);
        if (!listing) return mmtId;
        if (listing.dtcListingId) return listing.dtcListingId;
        if (listing.source === "DTC") return listing.id;
        return mmtId;
      };

      pushCallerVolunteerToDTC({
        matchId: match.id,
        dtcMatchId: match.dtcMatchId,
        callerPlatform: "MMT",
        listingAId: dtcIdForMmtListing(match.listingAId),
        listingBId: dtcIdForMmtListing(match.listingBId),
      });
    }).catch((error) => console.error("[MMTCrossSync] Failed to prepare caller sync:", error));
  }).catch((error) => console.error("[MMTCrossSync] Failed to load caller sync:", error));
}

export async function declineMoveMyTestMatchAction(formData: FormData) {
  const session = await requireMoveMyTestSession();
  const matchId = String(formData.get("matchId") ?? "");
  const match = await prisma.match.findFirst({
    where: {
      id: matchId,
      status: { in: ["PROPOSED", "LEARNER_A_ACCEPTED", "LEARNER_B_ACCEPTED", "BOTH_ACCEPTED", "CALLER_PENDING", "BOOKING_REFERENCE_CONSENT_REQUESTED", "BOOKING_REFERENCE_SHARED"] },
      OR: [{ listingA: { accountId: session.accountId } }, { listingB: { accountId: session.accountId } }],
    },
    include: { listingA: { include: { account: { select: { email: true } } } }, listingB: { include: { account: { select: { email: true } } } } },
  });
  if (!match) return;

  const isA = match.listingA.accountId === session.accountId;
  const now = new Date();

// 1. Decline the match
  await prisma.match.update({
    where: { id: match.id },
    data: { status: "DECLINED", cancelledAt: now, cancelReason: `Learner ${isA ? "A" : "B"} declined the match.` },
  });

// 2. Reactivate both listings so they can be matched again
  await prisma.listing.updateMany({
    where: { id: { in: [match.listingAId, match.listingBId] } },
    data: { status: "ACTIVE" },
  });

// 3. Clear any pending emails for this match so no stale reminders go out
  await (prisma as any).$executeRawUnsafe(
    "UPDATE MoveMyTestEmailQueue SET status = 'SKIPPED', updatedAt = ? WHERE matchId = ? AND status = 'PENDING'",
    now.toISOString(),
    match.id,
  );

// 4. Send immediate email to the OTHER learner
  const otherListing = isA ? match.listingB : match.listingA;
  const otherEmail = otherListing.account?.email ?? null;
  const otherAccountId = otherListing.accountId;
  if (otherEmail) {
    await (prisma as any).$executeRawUnsafe(
      "INSERT INTO MoveMyTestEmailQueue (id, matchId, kind, recipient, recipientRole, scheduledFor, retryCount, maxRetries, status) VALUES (?, ?, ?, ?, ?, ?, 0, 3, 'PENDING')",
      `email_${match.id}_MATCH_DECLINED_${otherEmail}_${Date.now()}`.slice(0, 191),
      match.id,
      "MATCH_DECLINED",
      otherEmail,
      "LEARNER",
      now.toISOString(),
    );
  }

// 5. Log events for both sides
  await prisma.matchEvent.create({ data: { matchId: match.id, accountId: session.accountId, eventType: "MATCH_DECLINED" } });
  if (otherAccountId) {
    await prisma.matchEvent.create({ data: { matchId: match.id, accountId: otherAccountId, eventType: "MATCH_DECLINED_BY_OTHER" } });
  }

  revalidatePath(`${TEST_SWAP_BASE_PATH}/matches/${match.id}`);
  revalidatePath(`${TEST_SWAP_BASE_PATH}/dashboard`);
}

export async function reportMoveMyTestAction(formData: FormData) {
  const session = await requireMoveMyTestSession();
  await prisma.report.create({
    data: {
      reporterAccountId: session.accountId,
      listingId: String(formData.get("listingId") || "") || null,
      matchId: String(formData.get("matchId") || "") || null,
      reason: String(formData.get("reason") || "Suspicious match"),
      detail: String(formData.get("detail") || "") || null,
    },
  });
  revalidatePath(`${TEST_SWAP_BASE_PATH}/dashboard`);
}

export async function updateMoveMyTestLearnerRecordAction(formData: FormData): Promise<void> {
  const session = await requireMoveMyTestSession();
  const listingId = String(formData.get("listingId") ?? "");

  const listing = await prisma.listing.findFirst({
    where: { id: listingId, accountId: session.accountId, status: { not: "DELETED" } },
  });
  if (!listing) redirect("/dashboard/edit?status=invalid" as never);

  // Prevent editing DTC shadow listings in MMT
  if (listing.source === "DTC") {
    redirect("/dashboard/edit?status=dtc-readonly" as never);
  }

  const raw = {
    currentCentreId: String(formData.get("currentCentreId") ?? ""),
    originalCentreId: String(formData.get("originalCentreId") ?? ""),
    currentDate: String(formData.get("currentDate") ?? ""),
    currentTime: String(formData.get("currentTime") ?? ""),
    testType: String(formData.get("testType") ?? ""),
    desiredDateFrom: String(formData.get("desiredDateFrom") ?? ""),
    desiredDateTo: String(formData.get("desiredDateTo") ?? ""),
    desiredTimePreference: String(formData.get("desiredTimePreference") ?? "ANY"),
    desiredCentreIds: formData.getAll("desiredCentreIds").map(String).filter(Boolean),
    desiredDirection: String(formData.get("desiredDirection") ?? "EITHER"),
  };

  const parsed = movemytestListingEditSchema.safeParse(raw);
  if (!parsed.success) redirect("/dashboard/edit?status=invalid" as never);

  const centre = await prisma.testCentre.findUnique({ where: { id: parsed.data.currentCentreId } });
  if (!centre) redirect("/dashboard/edit?status=centre" as never);

  const currentDateTime = new Date(`${parsed.data.currentDate}T${parsed.data.currentTime}:00.000Z`);
  const desiredFrom = new Date(`${parsed.data.desiredDateFrom}T00:00:00.000Z`);
  const desiredTo = new Date(`${parsed.data.desiredDateTo}T23:59:59.000Z`);

  if (Number.isNaN(currentDateTime.getTime()) || Number.isNaN(desiredFrom.getTime()) || Number.isNaN(desiredTo.getTime()) || desiredFrom > desiredTo) {
    redirect("/dashboard/edit?status=invalid" as never);
  }

  await prisma.listing.update({
    where: { id: listing.id },
    data: {
      currentCentreId: parsed.data.currentCentreId,
      originalCentreId: parsed.data.originalCentreId || null,
      currentDateTime,
      testType: parsed.data.testType,
      desiredDateFrom: desiredFrom,
      desiredDateTo: desiredTo,
      desiredTimePreference: parsed.data.desiredTimePreference,
      desiredCentreIds: parsed.data.desiredCentreIds,
      desiredDirection: parsed.data.desiredDirection,
    },
  });

// Re-run matching with updated preferences
  await createPotentialMatchesForListing(listing.id);

  // Push updated listing to DTC for cross-platform visibility (fire-and-forget)
  // Only sync MMT-owned listings, not DTC shadow listings
  if (listing.source !== "DTC") {
    import("./cross-platform-sync").then(({ pushListingToDTC }) => {
      pushListingToDTC({
        mmtListingId: listing.id,
        action: "updated",
        currentCentreId: listing.currentCentreId,
        originalCentreId: listing.originalCentreId,
        currentDateTime: listing.currentDateTime.toISOString(),
        testType: listing.testType,
        hasRemainingChange: listing.hasRemainingChange,
        desiredDateFrom: listing.desiredDateFrom.toISOString(),
        desiredDateTo: listing.desiredDateTo.toISOString(),
        desiredTimePreference: listing.desiredTimePreference,
        desiredCentreIds: parsed.data.desiredCentreIds,
        desiredDirection: listing.desiredDirection,
        jurisdiction: listing.jurisdiction,
        status: listing.status,
        expiresAt: listing.expiresAt.toISOString(),
      }).catch((err) => console.error("[MMTCrossSync] Background update sync failed:", err));
    });
  }

  revalidatePath("/dashboard/edit");
  revalidatePath("/dashboard");
  redirect("/dashboard?updated=true" as never);
}

export async function updateMoveMyTestInstructorAction(_: MoveMyTestActionState, formData: FormData): Promise<MoveMyTestActionState> {
  const session = await requireMoveMyTestSession();
  const raw = {
    listingId: String(formData.get("listingId") ?? ""),
    hasInstructor: String(formData.get("hasInstructor") ?? ""),
    knowsInstructorDetails: String(formData.get("knowsInstructorDetails") ?? ""),
    instructorAdiNumber: String(formData.get("instructorAdiNumber") ?? ""),
    instructorFirstName: String(formData.get("instructorFirstName") ?? ""),
    instructorLastName: String(formData.get("instructorLastName") ?? ""),
    instructorMobileNumber: String(formData.get("instructorMobileNumber") ?? ""),
    instructorEmail: String(formData.get("instructorEmail") ?? ""),
    instructorPermission: String(formData.get("instructorPermission") ?? ""),
    instructorAvailabilityCheck: String(formData.get("instructorAvailabilityCheck") ?? ""),
  };

  const parsed = movemytestInstructorSchema.safeParse(raw);
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0]?.message ?? "Please check the form and try again." };

  const listing = await prisma.listing.findFirst({
    where: { id: parsed.data.listingId, accountId: session.accountId, status: { not: "DELETED" } },
    include: { instructorDetails: true },
  });
  if (!listing) return { status: "error", message: "Listing not found." };

  const hasInstructor = parsed.data.hasInstructor === "yes";
  const knowsInstructorDetails = parsed.data.knowsInstructorDetails === "yes";
  const now = new Date();

// Case 1: No instructor — delete existing instructor details if any
  if (!hasInstructor) {
    if (listing.instructorDetails) {
      await prisma.listingInstructor.delete({ where: { listingId: listing.id } });
    }
    revalidatePath(`${TEST_SWAP_BASE_PATH}/dashboard/instructor`);
    revalidatePath(`${TEST_SWAP_BASE_PATH}/dashboard`);
    return { status: "success", message: "Instructor removed." };
  }

// Case 2: Has instructor but doesn't know details — create/update placeholder
  if (hasInstructor && !knowsInstructorDetails) {
    const data = {
      instructorAccountId: null as string | null,
      adiNumber: null as string | null,
      firstName: null as string | null,
      lastName: null as string | null,
      email: null as string | null,
      mobileNumber: null as string | null,
      learnerConfirmedPermissionAt: null as Date | null,
      learnerConfirmedAvailabilityCheckAt: null as Date | null,
      inviteSentAt: null as Date | null,
    };

    if (listing.instructorDetails) {
      await prisma.listingInstructor.update({ where: { listingId: listing.id }, data });
    } else {
      await prisma.listingInstructor.create({ data: { ...data, listingId: listing.id } });
    }
    revalidatePath(`${TEST_SWAP_BASE_PATH}/dashboard/instructor`);
    revalidatePath(`${TEST_SWAP_BASE_PATH}/dashboard`);
    return { status: "success", message: "Instructor added without details — you can update later." };
  }

// Case 3: Has instructor and knows details — create/update with full details
  const instructorAdiNumber = normalizeAdiNumber(parsed.data.instructorAdiNumber || "");
  const registeredInstructor = instructorAdiNumber
    ? await prisma.instructorAccount.findUnique({ where: { adiNumber: instructorAdiNumber }, select: { id: true, status: true } })
    : null;

  const data = {
    instructorAccountId: registeredInstructor?.status === "ACTIVE" ? registeredInstructor.id : null,
    adiNumber: instructorAdiNumber || null,
    firstName: parsed.data.instructorFirstName?.trim() || null,
    lastName: parsed.data.instructorLastName?.trim() || null,
    email: parsed.data.instructorEmail?.trim().toLowerCase() || null,
    mobileNumber: cleanOptionalString(parsed.data.instructorMobileNumber || ""),
    learnerConfirmedPermissionAt: parsed.data.instructorPermission === "on" ? now : null,
    learnerConfirmedAvailabilityCheckAt: parsed.data.instructorAvailabilityCheck === "on" ? now : null,
    inviteSentAt: registeredInstructor?.status === "ACTIVE" ? null : now,
  };

  if (listing.instructorDetails) {
    await prisma.listingInstructor.update({
      where: { listingId: listing.id },
      data: {
        ...data,
        invites: registeredInstructor?.status === "ACTIVE" ? undefined : {
          create: {
            instructorAccountId: null,
            email: parsed.data.instructorEmail?.trim().toLowerCase() || "",
            adiNumber: instructorAdiNumber || "",
            status: "PENDING" as const,
            inviteSentAt: now,
            inviteError: "Email delivery pending: invite record created for future mailer integration.",
          },
        },
      },
    });
  } else {
    await prisma.listingInstructor.create({
      data: {
        ...data,
        listingId: listing.id,
        invites: registeredInstructor?.status === "ACTIVE" ? undefined : {
          create: {
            instructorAccountId: null,
            email: parsed.data.instructorEmail?.trim().toLowerCase() || "",
            adiNumber: instructorAdiNumber || "",
            status: "PENDING" as const,
            inviteSentAt: now,
            inviteError: "Email delivery pending: invite record created for future mailer integration.",
          },
        },
      },
    });
  }

  revalidatePath(`${TEST_SWAP_BASE_PATH}/dashboard/instructor`);
  revalidatePath(`${TEST_SWAP_BASE_PATH}/dashboard`);
  return { status: "success", message: "Instructor details updated." };
}
