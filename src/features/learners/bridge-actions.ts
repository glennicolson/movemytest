"use server";

import { prisma } from "@/lib/db/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// ─── Learner Goals ───

const createGoalSchema = z.object({
  learnerId: z.string(),
  instructorId: z.string(),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  targetSkill: z.string().optional(),
  targetLevel: z.string().optional(),
  dueDate: z.string().datetime().optional(),
});

export async function createGoal(formData: FormData) {
  const data = createGoalSchema.parse({
    learnerId: formData.get("learnerId"),
    instructorId: formData.get("instructorId"),
    title: formData.get("title"),
    description: formData.get("description"),
    targetSkill: formData.get("targetSkill") || undefined,
    targetLevel: formData.get("targetLevel") || undefined,
    dueDate: formData.get("dueDate") || undefined,
  });

  await prisma.learnerGoal.create({
    data: {
      learnerId: data.learnerId,
      instructorId: data.instructorId,
      title: data.title,
      description: data.description,
      targetSkill: data.targetSkill,
      targetLevel: data.targetLevel,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
    },
  });

  revalidatePath("/portal/dashboard");
  revalidatePath("/portal/progress");
  revalidatePath("/instructor/pupils/[learnerId]");
}

const updateGoalStatusSchema = z.object({
  goalId: z.string(),
  status: z.enum(["ACTIVE", "COMPLETED", "ARCHIVED"]),
});

export async function updateGoalStatus(formData: FormData) {
  const data = updateGoalStatusSchema.parse({
    goalId: formData.get("goalId"),
    status: formData.get("status"),
  });

  await prisma.learnerGoal.update({
    where: { id: data.goalId },
    data: {
      status: data.status,
      completedAt: data.status === "COMPLETED" ? new Date() : null,
    },
  });

  revalidatePath("/portal/dashboard");
  revalidatePath("/portal/progress");
  revalidatePath("/instructor/pupils/[learnerId]");
}

// ─── Self Assessments ───

const addSelfAssessmentSchema = z.object({
  learnerId: z.string(),
  skillLabel: z.string(),
  confidence: z.enum([
    "NOT_CONFIDENT",
    "SLIGHTLY_CONFIDENT",
    "MODERATELY_CONFIDENT",
    "VERY_CONFIDENT",
    "FULLY_CONFIDENT",
  ]),
  notes: z.string().optional(),
  lessonId: z.string().optional(),
});

export async function addSelfAssessment(formData: FormData) {
  const data = addSelfAssessmentSchema.parse({
    learnerId: formData.get("learnerId"),
    skillLabel: formData.get("skillLabel"),
    confidence: formData.get("confidence"),
    notes: formData.get("notes") || undefined,
    lessonId: formData.get("lessonId") || undefined,
  });

  await prisma.learnerSelfAssessment.create({
    data: {
      learnerId: data.learnerId,
      skillLabel: data.skillLabel,
      confidence: data.confidence,
      notes: data.notes,
      lessonId: data.lessonId,
    },
  });

  revalidatePath("/portal/dashboard");
  revalidatePath("/portal/progress");
  revalidatePath("/instructor/pupils/[learnerId]");
}

// ─── Lesson Prep ───

const setLessonPrepSchema = z.object({
  learnerId: z.string(),
  instructorId: z.string(),
  lessonId: z.string().optional(),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  resourceLink: z.string().optional(),
  dueBefore: z.string().datetime().optional(),
});

export async function setLessonPrep(formData: FormData) {
  const data = setLessonPrepSchema.parse({
    learnerId: formData.get("learnerId"),
    instructorId: formData.get("instructorId"),
    lessonId: formData.get("lessonId") || undefined,
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    resourceLink: formData.get("resourceLink") || undefined,
    dueBefore: formData.get("dueBefore") || undefined,
  });

  await prisma.lessonPrep.create({
    data: {
      learnerId: data.learnerId,
      instructorId: data.instructorId,
      lessonId: data.lessonId,
      title: data.title,
      description: data.description,
      resourceLink: data.resourceLink,
      dueBefore: data.dueBefore ? new Date(data.dueBefore) : null,
    },
  });

  revalidatePath("/portal/dashboard");
  revalidatePath("/portal/progress");
  revalidatePath("/instructor/pupils/[learnerId]");
}

const updateLessonPrepStatusSchema = z.object({
  prepId: z.string(),
  status: z.enum(["ASSIGNED", "IN_PROGRESS", "COMPLETED", "SKIPPED"]),
});

export async function updateLessonPrepStatus(formData: FormData) {
  const data = updateLessonPrepStatusSchema.parse({
    prepId: formData.get("prepId"),
    status: formData.get("status"),
  });

  await prisma.lessonPrep.update({
    where: { id: data.prepId },
    data: {
      status: data.status,
      completedAt: data.status === "COMPLETED" ? new Date() : null,
    },
  });

  revalidatePath("/portal/dashboard");
  revalidatePath("/portal/progress");
}

// ─── Queries for Bridge Data ───

export async function getLearnerGoals(learnerId: string) {
  return prisma.learnerGoal.findMany({
    where: { learnerId, status: { in: ["ACTIVE", "COMPLETED"] } },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    include: { instructor: { include: { user: true } } },
  });
}

export async function getLearnerSelfAssessments(learnerId: string) {
  return prisma.learnerSelfAssessment.findMany({
    where: { learnerId },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
}

export async function getLearnerLessonPrep(learnerId: string) {
  return prisma.lessonPrep.findMany({
    where: { learnerId, status: { in: ["ASSIGNED", "IN_PROGRESS"] } },
    orderBy: { createdAt: "desc" },
    include: { instructor: { include: { user: true } } },
  });
}

export async function getInstructorGoalsForLearner(instructorId: string, learnerId: string) {
  return prisma.learnerGoal.findMany({
    where: { instructorId, learnerId },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });
}

export async function getInstructorSelfAssessmentsForLearner(learnerId: string) {
  return prisma.learnerSelfAssessment.findMany({
    where: { learnerId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}
