"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requirePermission } from "@/lib/auth/guards";
import type { FormActionState } from "@/features/crm/form-action-state";

const reviewSchema = z.object({
  authorName: z.string().trim().min(2, "Reviewer name is required"),
  rating: z.coerce.number().int().min(1).max(5),
  text: z.string().trim().min(10, "Review text is too short").max(4000, "Review text is too long (max 4,000 characters)"),
  reviewedAt: z.string().min(1, "Review date is required"),
  sortOrder: z.coerce.number().int().min(0).default(0),
  visible: z.coerce.boolean().default(true),
});

function refreshReviewSurfaces() {
  revalidatePath("/");
  revalidatePath("/reviews");
}

export async function getVisibleReviews() {
  return prisma.googleReview.findMany({
    where: { visible: true },
    orderBy: [{ sortOrder: "asc" }, { reviewedAt: "desc" }],
  });
}

export async function getAllReviews() {
  await requirePermission("manageContent");

  return prisma.googleReview.findMany({
    orderBy: [{ sortOrder: "asc" }, { reviewedAt: "desc" }],
  });
}

export async function createReviewAction(
  _state: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  await requirePermission("manageContent");

  const parsed = reviewSchema.safeParse({
    authorName: formData.get("authorName"),
    rating: formData.get("rating"),
    text: formData.get("text"),
    reviewedAt: formData.get("reviewedAt"),
    sortOrder: formData.get("sortOrder") || 0,
    visible: formData.get("visible") === "on",
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Unable to save review.",
    };
  }

  try {
    await prisma.googleReview.create({
      data: {
        ...parsed.data,
        reviewedAt: new Date(parsed.data.reviewedAt),
      },
    });
  } catch (err) {
    return {
      status: "error",
      message: err instanceof Error ? err.message : "Unable to save review.",
    };
  }

  refreshReviewSurfaces();
  return { status: "success", message: "Review added." };
}

export async function updateReviewAction(
  _state: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  await requirePermission("manageContent");

  const id = z.string().min(1).safeParse(formData.get("id"));
  if (!id.success) return { status: "error", message: "Missing review id." };

  const parsed = reviewSchema.safeParse({
    authorName: formData.get("authorName"),
    rating: formData.get("rating"),
    text: formData.get("text"),
    reviewedAt: formData.get("reviewedAt"),
    sortOrder: formData.get("sortOrder") || 0,
    visible: formData.get("visible") === "on",
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Unable to update review.",
    };
  }

  try {
    await prisma.googleReview.update({
      where: { id: id.data },
      data: {
        ...parsed.data,
        reviewedAt: new Date(parsed.data.reviewedAt),
      },
    });
  } catch (err) {
    return {
      status: "error",
      message: err instanceof Error ? err.message : "Unable to update review.",
    };
  }

  refreshReviewSurfaces();
  return { status: "success", message: "Review updated." };
}

export async function deleteReviewAction(formData: FormData) {
  await requirePermission("manageContent");

  const id = z.string().min(1).parse(formData.get("id"));
  await prisma.googleReview.delete({ where: { id } });
  refreshReviewSurfaces();
}

export async function seedReviewsIfEmpty() {
  await requirePermission("manageContent");

  const count = await prisma.googleReview.count();
  if (count > 0) return false;

  await prisma.googleReview.createMany({
    data: [
      {
        authorName: "Sam Freeman",
        rating: 5,
        text: "Can’t fault Douggie and EDS. Professional, experienced and got me to passing standard in the short time window I had. Douggie is a joy to drive with, calm and full of expert tips.",
        reviewedAt: new Date("2021-11-09T10:55:06.260Z"),
        visible: true,
        sortOrder: 0,
      },
      {
        authorName: "Christine Clancy",
        rating: 5,
        text: "Dougie was a great instructor who built my confidence and knowledge progressively and thoroughly. He was incredibly patient and explained things brilliantly.",
        reviewedAt: new Date("2021-11-29T11:49:14.810Z"),
        visible: true,
        sortOrder: 1,
      },
      {
        authorName: "J Mitchell",
        rating: 5,
        text: "I had a really positive experience learning to drive. My instructor got me up to test standard very quickly and I passed first time. A great experience and very good value.",
        reviewedAt: new Date("2021-10-19T08:57:50.000Z"),
        visible: true,
        sortOrder: 2,
      },
    ],
  });

  refreshReviewSurfaces();
  return true;
}
