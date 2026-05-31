import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature, isWebhookTimestampValid } from "@/lib/webhook";
import { prisma } from "@/lib/db/prisma";

const MMT_WEBHOOK_SECRET = process.env.MMT_WEBHOOK_SECRET;

/**
 * POST /api/webhooks/mmt
 * 
 * Receives webhooks from MoveMyTest when cross-platform matches occur.
 * Creates shadow match records in DTC database so DTC users can see
 * matches proposed by MMT users.
 */
export async function POST(request: NextRequest) {
  try {
    // Verify secret is configured
    if (!MMT_WEBHOOK_SECRET) {
      console.error("[Webhook] MMT_WEBHOOK_SECRET not configured");
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
    const isValid = verifyWebhookSignature(MMT_WEBHOOK_SECRET, signature, {
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
    console.log(`[Webhook] Received ${event} from MMT (ID: ${webhookId})`);

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
 * Handle match.proposed — create shadow match in DTC
 */
async function handleMatchProposed(data: any) {
  const {
    matchId: mmtMatchId,
    sourceListingId,
    targetListingId, // This is the DTC listing ID
    score,
    proposedAt,
    expiresAt,
    sourceUser,
    targetUser,
  } = data;

  try {
    // Check if DTC listing exists
    const dtcListing = await prisma.testSwapListing.findUnique({
      where: { id: targetListingId },
      include: {
        account: { include: { user: { select: { email: true, firstName: true, lastName: true } } } },
      },
    });

    if (!dtcListing) {
      console.warn(`[Webhook] DTC listing ${targetListingId} not found`);
      return NextResponse.json(
        { error: "Target listing not found" },
        { status: 404 }
      );
    }

    // Check if shadow match already exists
    const existing = await prisma.testSwapMatch.findFirst({
      where: {
        OR: [
          { mmtMatchId },
          {
            AND: [
              { myListingId: targetListingId },
              { theirListingId: sourceListingId },
            ],
          },
        ],
      },
    });

    if (existing) {
      console.log(`[Webhook] Shadow match already exists: ${existing.id}`);
      return NextResponse.json(
        { received: true, matchId: existing.id, status: "already_exists" },
        { status: 200 }
      );
    }

    // Create shadow match in DTC
    // Note: We store the MMT listing info as JSON since it's not in DTC database
    const shadowMatch = await prisma.testSwapMatch.create({
      data: {
        myListingId: targetListingId,
        theirListingId: sourceListingId, // MMT listing ID (external)
        status: "PROPOSED",
        score,
        proposedAt: new Date(proposedAt),
        expiresAt: new Date(expiresAt),
        mmtMatchId, // Store MMT match ID for cross-reference
        crossPlatform: true,
        crossPlatformSource: "MMT",
        // Store MMT user details as metadata
        theirTestCentre: sourceUser.testCentre,
        theirTestDate: new Date(sourceUser.testDate),
        theirTestType: sourceUser.testType,
        theirDesiredDateFrom: new Date(sourceUser.desiredDateFrom),
        theirDesiredDateTo: new Date(sourceUser.desiredDateTo),
        theirDesiredDirection: sourceUser.desiredDirection,
      },
    });

    console.log(`[Webhook] Created shadow match ${shadowMatch.id} for DTC listing ${targetListingId}`);

    // TODO: Send notification email to DTC user
    // await sendMatchProposedEmail(dtcListing.account.user.email, shadowMatch);

    return NextResponse.json(
      {
        received: true,
        matchId: shadowMatch.id,
        status: "created",
        message: "Shadow match created in DTC",
      },
      { status: 201 }
    );
  } catch (error) {
    const err = error instanceof Error ? error.message : String(error);
    console.error("[Webhook] Error creating shadow match:", err);
    return NextResponse.json(
      { error: "Failed to create shadow match" },
      { status: 500 }
    );
  }
}

/**
 * Handle match.accepted
 */
async function handleMatchAccepted(data: any) {
  const { matchId: mmtMatchId, acceptedBy, targetListingId } = data;

  try {
    const match = await prisma.testSwapMatch.findFirst({
      where: { mmtMatchId },
    });

    if (!match) {
      return NextResponse.json(
        { error: "Match not found" },
        { status: 404 }
      );
    }

    // Update based on who accepted
    if (acceptedBy === "MMT") {
      // MMT user accepted, update DTC side
      await prisma.testSwapMatch.update({
        where: { id: match.id },
        data: {
          status: match.status === "ACCEPTED_BY_MMT" ? "BOTH_ACCEPTED" : "ACCEPTED_BY_MMT",
          theirAcceptedAt: new Date(),
        },
      });
    } else {
      // DTC user accepted
      await prisma.testSwapMatch.update({
        where: { id: match.id },
        data: {
          status: match.status === "ACCEPTED_BY_MMT" ? "BOTH_ACCEPTED" : "ACCEPTED_BY_DTC",
          myAcceptedAt: new Date(),
        },
      });
    }

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
 * Handle match.booking_reference_shared
 */
async function handleBookingReferenceShared(data: any) {
  const { matchId: mmtMatchId, sharedBy } = data;

  try {
    const match = await prisma.testSwapMatch.findFirst({
      where: { mmtMatchId },
    });

    if (!match) {
      return NextResponse.json(
        { error: "Match not found" },
        { status: 404 }
      );
    }

    const updateData: any = {};
    if (sharedBy === "MMT") {
      updateData.theirBookingRefSharedAt = new Date();
    } else {
      updateData.myBookingRefSharedAt = new Date();
    }

    // If both shared, mark as ready for DVSA call
    if (match.myBookingRefSharedAt && sharedBy === "MMT") {
      updateData.status = "BOOKING_REFS_SHARED";
    } else if (match.theirBookingRefSharedAt && sharedBy === "DTC") {
      updateData.status = "BOOKING_REFS_SHARED";
    }

    await prisma.testSwapMatch.update({
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
 * Handle match.cancelled
 */
async function handleMatchCancelled(data: any) {
  const { matchId: mmtMatchId, reason } = data;

  try {
    const match = await prisma.testSwapMatch.findFirst({
      where: { mmtMatchId },
    });

    if (!match) {
      return NextResponse.json(
        { error: "Match not found" },
        { status: 404 }
      );
    }

    await prisma.testSwapMatch.update({
      where: { id: match.id },
      data: {
        status: "CANCELLED",
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
 * Handle match.completed
 */
async function handleMatchCompleted(data: any) {
  const { matchId: mmtMatchId } = data;

  try {
    const match = await prisma.testSwapMatch.findFirst({
      where: { mmtMatchId },
    });

    if (!match) {
      return NextResponse.json(
        { error: "Match not found" },
        { status: 404 }
      );
    }

    await prisma.testSwapMatch.update({
      where: { id: match.id },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
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
 * GET /api/webhooks/mmt
 * Health check endpoint for webhook status
 */
export async function GET() {
  return NextResponse.json({
    status: "ok",
    webhookEndpoint: "mmt",
    configured: Boolean(MMT_WEBHOOK_SECRET),
    timestamp: new Date().toISOString(),
  });
}
