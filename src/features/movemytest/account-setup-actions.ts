"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { getMoveMyTestSession } from "./session";

export type MoveMyTestAccountSetupState = { status: "idle" | "error"; message?: string };

const setupSchema = z.object({
  mobileNumber: z.string().trim().min(10, "Enter a mobile number we can use for SMS or WhatsApp alerts.").max(30, "Enter a valid mobile number."),
  mobileContactConsent: z.literal("on", { message: "Confirm MoveMyTest can contact you by SMS or WhatsApp about MoveMyTest matches." }),
  from: z.string().optional(),
});

function safeRedirectTarget(value?: string) {
  // Only allow relative paths starting with "/", reject "/account-setup" loop
  if (!value || !value.startsWith("/") || value.startsWith("/account-setup")) return "/start";
  return value;
}

export async function completeMoveMyTestAccountSetupAction(_: MoveMyTestAccountSetupState, formData: FormData): Promise<MoveMyTestAccountSetupState> {
  const session = await getMoveMyTestSession();
  if (!session) redirect(`/register?from=${encodeURIComponent("/account-setup")}`);

  const parsed = setupSchema.safeParse({
    mobileNumber: String(formData.get("mobileNumber") ?? ""),
    mobileContactConsent: formData.get("mobileContactConsent") ? "on" : undefined,
    from: String(formData.get("from") ?? ""),
  });

  if (!parsed.success) return { status: "error", message: parsed.error.issues[0]?.message ?? "Please check the form and try again." };

  const normalisedMobile = parsed.data.mobileNumber.replace(/\s+/g, " ");
  await prisma.learnerAccount.update({
    where: { id: session.accountId },
    data: {
      mobileNumber: normalisedMobile,
      mobileContactConsentAt: new Date(),
      accountSetupCompletedAt: new Date(),
    },
  });

  redirect(safeRedirectTarget(parsed.data.from) as never);
}
