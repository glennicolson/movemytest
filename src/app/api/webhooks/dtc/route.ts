import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature, isWebhookTimestampValid } from "@/lib/webhook";
import { validateApiKey } from "@/lib/api-key";
import { prisma } from "@/lib/db/prisma";

const DTC_WEBHOOK_SECRET = process.env.DTC_WEBHOOK_SECRET;

/**
 * POST /api/webhooks/dtc
 * 
 * Receives webhooks from DTC when cross-platform matches occur.
 * Updates MMT match records when DTC users take action.
 */
export async function POST(request: NextRequest) {
  try {
    // Parse payload first (needed for both auth methods)
    const payload = await request.json();
    const event = request.headers.get("x-webhook-event") || payload.event;

    // Check for internal API key auth (used for listing sync from DTC)
    const apiKey = request.headers.get("X-API-Key");
    if (apiKey && validateApiKey(request)) {
      console.log(`[Webhook] Internal API key auth for ${event}`);
      // Process based on event type
      return handleWebhookEvent(event, payload.data || payload);
    }

    // Verify secret is configured
    if (!DTC_WEBHOOK_SECRET) {
      console.error("[Webhook] DTC_WEBHOOK_SECRET not configured");
      return NextResponse.json(
        { error: "Webhook not configured" },
        { status: 500 }
      );
    }

    // Get signature from header
    const signature = request.headers.get("x-webhook-signature")?.replace("sha256=", "");
    const webhookId = request.headers.get("x-webhook-id");
    const timestamp = request.headers.get("x-webhook-timestamp");

    if (!signature || !webhookId || !event || !timestamp) {
      return NextResponse.json(
        { error: "Missing webhook headers" },
        { status: 400 }
      );
    }

    // Verify timestamp (prevent replay attacks)
    if (!isWebhookTimestampValid(timestamp)) {
      return NextResponse.json(
        { error: "Webhook timestamp expired" },
        { status: 400 }
      );
    }

    // Verify signature
    const isValid = verifyWebhookSignature(DTC_WEBHOOK_SECRET, signature, {
      event,
      timestamp,
      webhookId,
      data: payload.data || payload,
    });

    if (!isValid) {
      console.error(`[Webhook] Invalid signature for ${webhookId}`);
      return NextResponse.json(
        { error: "Invalid webhook signature" },
        { status: 401 }
      );
    }

    // Log webhook receipt
    console.log(`[Webhook] Received ${event} from DTC (ID: ${webhookId})`);

    // Process based on event type
    switch (event) {
      case "listing.synced":
        return handleListingSynced(payload.data);
      case "match.proposed":
        return handleMatchProposed(payload.data);
      case "match.accepted":
        return handleMatchAccepted(payload.data);
      case "match.booking_reference_shared":
        return handleBookingReferenceShared(payload.data);
      case "match.cancelled":
        return handleMatchCancelled(payload.data);
      case "match.completed":
        return handleMatchCompleted(payload.data);
      default:
        console.warn(`[Webhook] Unknown event type: ${event}`);
        return NextResponse.json(
          { received: true, warning: "Unknown event type" },
          { status: 202 }
        );
    }
  } catch (error) {
    const err = error instanceof Error ? error.message : String(error);
    console.error("[Webhook] Error processing webhook:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Route webhook events to appropriate handlers
 */
async function handleWebhookEvent(event: string, data: any) {
  switch (event) {
    case "listing.synced":
      return handleListingSynced(data);
    case "match.proposed":
      return handleMatchProposed(data);
    case "match.accepted":
      return handleMatchAccepted(data);
    case "match.booking_reference_shared":
      return handleBookingReferenceShared(data);
    case "match.cancelled":
      return handleMatchCancelled(data);
    case "match.completed":
      return handleMatchCompleted(data);
    default:
      console.warn(`[Webhook] Unknown event type: ${event}`);
      return NextResponse.json(
        { received: true, warning: "Unknown event type" },
        { status: 202 }
      );
  }
}

/**
 * Handle listing.synced — DTC is syncing a listing to MMT as a shadow record
 */
async function handleListingSynced(data: any) {
  const { dtcListingId, action } = data;
  console.log(`[Webhook] Processing listing.synced: dtcListingId=${dtcListingId}, action=${action}`);

  try {
    if (action === "deleted") {
      // Mark DTC shadow listing as withdrawn in MMT
      const result = await prisma.listing.updateMany({
        where: { dtcListingId, source: "DTC" },
        data: { status: "EXPIRED" },
      });
      console.log(`[Webhook] Withdrew DTC shadow listing ${dtcListingId}, matched ${result.count} records`);
      return NextResponse.json({ received: true, status: "withdrawn", count: result.count });
    }

    // Create or update shadow listing from DTC data
    const {
      currentCentreId, originalCentreId, currentDateTime, testType,
      hasRemainingChange, desiredDateFrom, desiredDateTo, desiredTimePreference,
      desiredCentreIds, desiredDirection, jurisdiction, status: listingStatus, expiresAt
    } = data;

    // Validate required fields
    if (!currentCentreId || !currentDateTime || !testType) {
      return NextResponse.json({ error: "Missing required listing fields" }, { status: 400 });
    }

    const existing = await prisma.listing.findFirst({
      where: { dtcListingId, source: "DTC" },
    });

    if (existing) {
      // Update existing shadow
      await prisma.listing.update({
        where: { id: existing.id },
        data: {
          currentCentreId,
          originalCentreId: originalCentreId || null,
          currentDateTime: new Date(currentDateTime),
          testType,
          hasRemainingChange: hasRemainingChange ?? true,
          desiredDateFrom: new Date(desiredDateFrom),
          desiredDateTo: new Date(desiredDateTo),
          desiredTimePreference: desiredTimePreference || "ANY",
          desiredCentreIds: desiredCentreIds || [],
          desiredDirection: desiredDirection || "EITHER",
          jurisdiction: jurisdiction || "GB_DVSA",
          status: listingStatus || "ACTIVE",
          expiresAt: expiresAt ? new Date(expiresAt) : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        },
      });
      console.log(`[Webhook] Updated DTC shadow listing ${dtcListingId} → MMT ${existing.id}`);
    } else {
      // Create new shadow
      const created = await prisma.listing.create({
        data: {
          source: "DTC",
          dtcListingId,
          accountId: null,
          currentCentreId,
          originalCentreId: originalCentreId || null,
          currentDateTime: new Date(currentDateTime),
          testType,
          hasRemainingChange: hasRemainingChange ?? true,
          desiredDateFrom: new Date(desiredDateFrom),
          desiredDateTo: new Date(desiredDateTo),
          desiredTimePreference: desiredTimePreference || "ANY",
          desiredCentreIds: desiredCentreIds || [],
          desiredDirection: desiredDirection || "EITHER",
          jurisdiction: jurisdiction || "GB_DVSA",
          status: listingStatus || "ACTIVE",
          expiresAt: expiresAt ? new Date(expiresAt) : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        },
      });
      console.log(`[Webhook] Created DTC shadow listing ${dtcListingId} → MMT ${created.id}`);

      // Run matching for the new shadow listing to find MMT matches
      try {
        const { createPotentialMatchesForListing } = await import("@/features/movemytest/actions");
        await createPotentialMatchesForListing(created.id);
      } catch (matchErr) {
        console.error(`[Webhook] Matching skipped for shadow listing ${created.id}:`, matchErr);
      }
    }

    return NextResponse.json({ received: true, status: "synced" });
  } catch (error) {
    const err = error instanceof Error ? error.message : String(error);
    console.error("[Webhook] Error syncing listing:", err);
    return NextResponse.json({ error: "Failed to sync listing" }, { status: 500 });
  }
}

/**
 * Handle match.proposed from DTC
 * DTC is notifying MMT that a DTC user wants to match with an MMT listing
 */
async function handleMatchProposed(data: any) {
  const {
    matchId: dtcMatchId,
    sourceListingId, // DTC listing
    targetListingId, // MMT listing
    score,
    proposedAt,
    expiresAt,
  } = data;

  try {
    // Check if MMT listing exists
    const mmtListing = await prisma.listing.findUnique({
      where: { id: targetListingId },
      include: {
        account: { select: { email: true } },
      },
    });

    if (!mmtListing) {
      console.warn(`[Webhook] MMT listing ${targetListingId} not found`);
      return NextResponse.json(
        { error: "Target listing not found" },
        { status: 404 }
      );
    }

    // Check if match already exists
    const existing = await prisma.match.findFirst({
      where: {
        OR: [
          { dtcMatchId },
          {
            AND: [
              { listingAId: targetListingId },
              { listingBId: sourceListingId },
            ],
          },
        ],
      },
    });

    if (existing) {
      console.log(`[Webhook] Match already exists: ${existing.id}`);
      return NextResponse.json(
        { received: true, matchId: existing.id, status: "already_exists" },
        { status: 200 }
      );
    }

    // Create match in MMT database
    // Note: We use the DTC listing ID directly since it's synced to MMT
    const match = await prisma.match.create({
      data: {
        listingAId: targetListingId, // MMT listing
        listingBId: sourceListingId, // DTC listing (shadow in MMT)
        score,
        status: "PROPOSED",
        qualitySummary: `Match score ${score}/100 (from DTC)`,
        expiresAt: new Date(expiresAt),
        dtcMatchId, // Store DTC match ID for cross-reference
      },
    });

    console.log(`[Webhook] Created match ${match.id} for MMT listing ${targetListingId}`);

    // TODO: Send notification email to MMT user
    // await sendMatchProposedEmail(mmtListing.account.email, match);

    return NextResponse.json(
      {
        received: true,
        matchId: match.id,
        status: "created",
        message: "Match created in MMT",
      },
      { status: 201 }
    );
  } catch (error) {
    const err = error instanceof Error ? error.message : String(error);
    console.error("[Webhook] Error creating match:", err);
    return NextResponse.json(
      { error: "Failed to create match" },
      { status: 500 }
    );
  }
}

/**
 * Handle match.accepted from DTC
 */
async function handleMatchAccepted(data: any) {
  const { matchId: dtcMatchId, acceptedBy, listingAId, listingBId } = data;
  console.log(`[Webhook] Processing match.accepted from DTC: dtcMatchId=${dtcMatchId}, acceptedBy=${acceptedBy}, listingAId=${listingAId}, listingBId=${listingBId}`);

  try {
    // Try finding by dtcMatchId first, then fall back to listing ID pair
    let match = await prisma.match.findFirst({
      where: { dtcMatchId },
    });

    if (!match && listingAId && listingBId) {
      // Try to find the MMT-side match by listing IDs. DTC sends its own listing
      // IDs, which may differ from MMT's. Look up MMT listings by dtcListingId
      // to find the actual MMT listing IDs, then match by those.
      const mappedListings = await prisma.listing.findMany({
        where: {
          OR: [
            { dtcListingId: listingAId },
            { dtcListingId: listingBId },
            { id: listingAId },
            { id: listingBId },
          ],
        },
        select: { id: true },
      });
      if (mappedListings.length >= 2) {
        const ids = mappedListings.map((l) => l.id);
        match = await prisma.match.findFirst({
          where: {
            archivedAt: null,
            OR: [
              { listingAId: ids[0], listingBId: ids[1] },
              { listingAId: ids[1], listingBId: ids[0] },
            ],
          },
        });
      }
      if (match) {
        // Store dtcMatchId for future reference
        await prisma.match.update({
          where: { id: match.id },
          data: { dtcMatchId },
        });
      }
    }

    if (!match) {
      return NextResponse.json(
        { error: "Match not found" },
        { status: 404 }
      );
    }

    const matchWithListings = await prisma.match.findUnique({
      where: { id: match.id },
      include: {
        listingA: { select: { id: true, source: true, dtcListingId: true } },
        listingB: { select: { id: true, source: true, dtcListingId: true } },
      },
    });

    if (!matchWithListings) {
      return NextResponse.json(
        { error: "Match not found" },
        { status: 404 }
      );
    }

    const isDtcListing = (listing: { source: string; dtcListingId: string | null }) =>
      listing.source === "DTC" || Boolean(listing.dtcListingId);
    const acceptedSide =
      acceptedBy === "DTC"
        ? isDtcListing(matchWithListings.listingA)
          ? "A"
          : "B"
        : isDtcListing(matchWithListings.listingA)
          ? "B"
          : "A";

    const updateData: any = {};
    if (acceptedSide === "A") {
      updateData.learnerAAcceptedAt = new Date();
      if (matchWithListings.learnerBAcceptedAt) {
        updateData.bothAcceptedAt = new Date();
        updateData.status = "CALLER_PENDING";
      } else {
        updateData.status = "LEARNER_A_ACCEPTED";
      }
    } else {
      updateData.learnerBAcceptedAt = new Date();
      if (matchWithListings.learnerAAcceptedAt) {
        updateData.bothAcceptedAt = new Date();
        updateData.status = "CALLER_PENDING";
      } else {
        updateData.status = "LEARNER_B_ACCEPTED";
      }
    }

    await prisma.match.update({
      where: { id: match.id },
      data: updateData,
    });

    console.log(`[Webhook] Updated match ${match.id} status to ${updateData.status || "ACCEPTED"} (accepted side ${acceptedSide})`);

    return NextResponse.json({ received: true, status: "updated" });
  } catch (error) {
    console.error("[Webhook] Error updating match:", error);
    return NextResponse.json(
      { error: "Failed to update match" },
      { status: 500 }
    );
  }
}

/**
 * Handle match.booking_reference_shared from DTC
 */
async function handleBookingReferenceShared(data: any) {
  const { matchId: dtcMatchId, sharedBy } = data;

  try {
    const match = await prisma.match.findFirst({
      where: { dtcMatchId },
    });

    if (!match) {
      return NextResponse.json(
        { error: "Match not found" },
        { status: 404 }
      );
    }

    const updateData: any = {};
    if (sharedBy === "DTC") {
      updateData.learnerBBookingReferenceConfirmedAt = new Date();
    } else {
      updateData.learnerABookingReferenceConfirmedAt = new Date();
    }

    // If both shared, mark ready for DVSA call
    if (
      (sharedBy === "DTC" && match.learnerABookingReferenceConfirmedAt) ||
      (sharedBy === "MMT" && match.learnerBBookingReferenceConfirmedAt)
    ) {
      updateData.status = "BOOKING_REFERENCE_SHARED";
    }

    await prisma.match.update({
      where: { id: match.id },
      data: updateData,
    });

    return NextResponse.json({ received: true, status: "updated" });
  } catch (error) {
    console.error("[Webhook] Error updating booking ref:", error);
    return NextResponse.json(
      { error: "Failed to update booking ref" },
      { status: 500 }
    );
  }
}

/**
 * Handle match.cancelled from DTC
 */
async function handleMatchCancelled(data: any) {
  const { matchId: dtcMatchId, reason } = data;

  try {
    const match = await prisma.match.findFirst({
      where: { dtcMatchId },
    });

    if (!match) {
      return NextResponse.json(
        { error: "Match not found" },
        { status: 404 }
      );
    }

    await prisma.match.update({
      where: { id: match.id },
      data: {
        status: "EXPIRED",
        cancelledAt: new Date(),
        cancelReason: reason,
      },
    });

    return NextResponse.json({ received: true, status: "cancelled" });
  } catch (error) {
    console.error("[Webhook] Error cancelling match:", error);
    return NextResponse.json(
      { error: "Failed to cancel match" },
      { status: 500 }
    );
  }
}

/**
 * Handle match.completed from DTC
 */
async function handleMatchCompleted(data: any) {
  const { matchId: dtcMatchId } = data;

  try {
    const match = await prisma.match.findFirst({
      where: { dtcMatchId },
    });

    if (!match) {
      return NextResponse.json(
        { error: "Match not found" },
        { status: 404 }
      );
    }

    await prisma.match.update({
      where: { id: match.id },
      data: {
        status: "COMPLETED",
        learnerACompletedAt: new Date(),
        learnerBCompletedAt: new Date(),
      },
    });

    return NextResponse.json({ received: true, status: "completed" });
  } catch (error) {
    console.error("[Webhook] Error completing match:", error);
    return NextResponse.json(
      { error: "Failed to complete match" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/webhooks/dtc
 * Health check endpoint for webhook status
 */
export async function GET() {
  return NextResponse.json({
    status: "ok",
    webhookEndpoint: "dtc",
    configured: Boolean(DTC_WEBHOOK_SECRET),
    timestamp: new Date().toISOString(),
  });
}
