import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth/guards";
import { ensuremovemytestAccountForCrmUser } from "@/features/movemytest/crm-bridge";
import { createMoveMyTestSession } from "@/features/movemytest/session";

export async function POST() {
  const session = await requirePermission("learnerPortal");
  const account = await ensuremovemytestAccountForCrmUser(session.userId);
  await createMoveMyTestSession(account);

  return NextResponse.json({ redirectUrl: "/dashboard" });
}
