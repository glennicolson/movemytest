import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature, isWebhookTimestampValid } from "@/lib/webhook";
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
    const event = request.headers.get("x-webhook-event");
    const timestamp = request.headers.get("x-webhook-timestamp");

    if (!signature || !webhookId || !event || !timestamp) {
      return NextResponse.json(
        { error: "Missing webhook headers" },
        { status: 400 }
      );
    }

    // Parse payload
    const payload = await request.json();

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
  const { matchId: dtcMatchId, acceptedBy } = data;

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
    if (acceptedBy === "DTC") {
      // DTC user accepted, update MMT side
      updateData.learnerBAcceptedAt = new Date();
      // If MMT already accepted, mark both accepted
      if (match.learnerAAcceptedAt) {
        updateData.bothAcceptedAt = new Date();
        updateData.status = "BOTH_ACCEPTED";
      } else {
        updateData.status = "ACCEPTED";
      }
    } else {
      // MMT user accepted (echo back from DTC)
      updateData.learnerAAcceptedAt = new Date();
      if (match.learnerBAcceptedAt) {
        updateData.bothAcceptedAt = new Date();
        updateData.status = "BOTH_ACCEPTED";
      }
    }

    await prisma.match.update({
      where: { id: match.id },
      data: updateData,
    });

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
