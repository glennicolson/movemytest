"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";
import type { PortalAcknowledgeState } from "@/lib/portal/action-state";

export async function acknowledgePortalItemAction(
  _prevState: PortalAcknowledgeState,
  formData: FormData,
): Promise<PortalAcknowledgeState> {
  const session = await requirePermission("learnerPortal");
  const learner = await prisma.learnerProfile.findFirst({
    where: { user: { email: session.email } },
    select: { id: true },
  });

  if (!learner) {
    return { status: "error", message: "Learner profile not found." };
  }

  const itemType = String(formData.get("itemType") ?? "").trim();
  const itemId = String(formData.get("itemId") ?? "").trim();
  const label = String(formData.get("label") ?? "").trim();

  if (!itemType || !itemId || !label) {
    return { status: "error", message: "Missing acknowledgement details." };
  }

  const allowed = new Set(["Document", "LessonNote"]);
  if (!allowed.has(itemType)) {
    return { status: "error", message: "That portal item cannot be acknowledged." };
  }

  await prisma.auditLog.create({
    data: {
      action: "VIEWED",
      entityType: itemType,
      entityId: itemId,
      userId: session.userId,
      detail: `Learner acknowledged ${itemType === "Document" ? "document" : "lesson note"}: ${label}`,
    },
  });

  await prisma.auditLog.create({
    data: {
      action: "UPDATED",
      entityType: "LearnerProfile",
      entityId: learner.id,
      userId: session.userId,
      detail: `Portal acknowledgement recorded for ${itemType === "Document" ? "document" : "lesson note"}: ${label}`,
    },
  });

  revalidatePath("/portal/documents");
  revalidatePath("/portal/lessons");
  revalidatePath("/portal/progress");
  revalidatePath(`/learners/${learner.id}`);

  return {
    status: "success",
    message: `${itemType === "Document" ? "Document" : "Lesson note"} acknowledgement recorded. If anything is unclear, please contact support@movemytest.co.uk.`,
  };
}
