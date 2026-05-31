import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const payload = await request.json();
  
  return NextResponse.json({
    received: true,
    targetListingId: payload.data?.targetListingId,
    sourceListingId: payload.data?.sourceListingId,
    event: payload.event,
  });
}
