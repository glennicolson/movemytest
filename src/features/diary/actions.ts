"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { requirePermission } from "@/lib/auth/guards";
import { formatDateKey } from "@/lib/formatters/date";
import { sendDiaryTaskInvite } from "@/lib/email/diary-task-email";
import { DiaryPriority, DiaryStatus, Prisma } from "@prisma/client";

const MAX_RECURRING_OCCURRENCES = 366;

/**
 * Parse a form date/time string as Europe/London time and return a UTC Date.
 * This ensures consistent DB storage regardless of the server's timezone.
 *
 * Input: "2026-05-22T17:00:00" or "2026-05-22"
 * Output: Date representing that London time as UTC
 */
function parseLondonDate(dueDateStr: string): Date {
// Parse the form value — if no time part, default to midnight
  const hasTime = dueDateStr.includes("T");
  const fullStr = hasTime ? dueDateStr : `${dueDateStr}T00:00:00`;

// Use Temporal-like approach: create a Date that represents exactly
// the London wall-clock time, then get its UTC equivalent
// We do this by creating a local Date on a known-London server,
// but since we can't guarantee the server is in London,
// we use Intl to extract London's offset
  const [, year, month, day, hour, minute] =
    fullStr.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/) ?? [];

  if (!year) return new Date(NaN);

// Build an ISO-8601 string without timezone, then get London's UTC offset
  const isoStr = `${year}-${month}-${day}T${hour}:${minute}:00`;

// Parse as UTC, then adjust based on London's actual offset at this moment
  const utcBase = new Date(`${isoStr}Z`);
  if (Number.isNaN(utcBase.getTime())) return utcBase;
  
// Get London's offset from UTC at this moment
// Format a known UTC timestamp in London to figure out the offset
  const londonParts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    hour: "numeric",
    minute: "numeric",
    timeZoneName: "shortOffset",
    hour12: false,
  }).formatToParts(utcBase);
  
  const offsetStr = londonParts.find((p) => p.type === "timeZoneName")?.value ?? "UTC";
// "GMT+1" means London is 1 hour AHEAD of UTC
  const offsetMatch = offsetStr.match(/GMT([+-]\d+)/);
  const offsetHours = offsetMatch ? Number.parseInt(offsetMatch[1], 10) : 0;
  
// If London is GMT+1, UTC = London - 1
// So to convert London wall-clock to UTC: subtract offset
  const utcMs = utcBase.getTime() - offsetHours * 60 * 60 * 1000;
  
  return new Date(utcMs);
}

function getDefaultRecurrenceUntil(startDate: Date, recurrence: string) {
  const endDate = new Date(startDate);

  if (recurrence === "DAILY") {
    endDate.setDate(endDate.getDate() + (MAX_RECURRING_OCCURRENCES - 1));
    return formatDateKey(endDate);
  }

  endDate.setFullYear(endDate.getFullYear() + 1);
  return formatDateKey(endDate);
}

function buildRecurringDueDates(startDate: Date, recurrence: string, recurrenceUntil: string | null) {
  const dueDates = [new Date(startDate)];

  if (!recurrence || recurrence === "NONE") {
    return dueDates;
  }

// If no end date specified, default to 1 year from start for safety
  const effectiveUntil = recurrenceUntil || getDefaultRecurrenceUntil(startDate, recurrence);

  const untilDate = parseLondonDate(`${effectiveUntil}T23:59:59`);
  if (formatDateKey(untilDate) < formatDateKey(startDate)) {
    throw new Error("Repeat until date cannot be before the first date.");
  }

  const nextDate = new Date(startDate);
  while (true) {
    if (recurrence === "DAILY") nextDate.setDate(nextDate.getDate() + 1);
    else if (recurrence === "WEEKLY") nextDate.setDate(nextDate.getDate() + 7);
    else if (recurrence === "MONTHLY") nextDate.setMonth(nextDate.getMonth() + 1);
    else if (recurrence === "ANNUAL") nextDate.setFullYear(nextDate.getFullYear() + 1);
    else break;

    if (formatDateKey(nextDate) > effectiveUntil) {
      break;
    }

    dueDates.push(new Date(nextDate));
    if (dueDates.length > MAX_RECURRING_OCCURRENCES) {
      throw new Error(`Repeat series is too large. Limit it to ${MAX_RECURRING_OCCURRENCES} entries or fewer.`);
    }
  }

  return dueDates;
}

export async function createDiaryEntryAction(formData: FormData) {
  const session = await requirePermission("adminWorkspace");

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const dueDateStr = formData.get("dueDate") as string;
  const priority = (formData.get("priority") as string) || "MEDIUM";
  const durationMinutesRaw = formData.get("durationMinutes") as string | null;
  const recurrence = (formData.get("recurrence") as string) || "NONE";
  const recurrenceUntil = (formData.get("recurrenceUntil") as string) || null;
  const entityType = formData.get("entityType") as string;
  const entityId = formData.get("entityId") as string;

  const normalizedPriority: DiaryPriority =
    priority === "LOW" || priority === "MEDIUM" || priority === "HIGH" || priority === "URGENT"
      ? priority
      : "MEDIUM";

  if (!title?.trim() || !dueDateStr) {
    return { status: "error", message: "Title and due date are required." } as const;
  }

// Parse the form's local time string as Europe/London time,
// then convert to UTC for consistent DB storage across all server timezones
  const dueDate = parseLondonDate(dueDateStr);
  if (Number.isNaN(dueDate.getTime())) {
    return { status: "error", message: "Invalid due date." } as const;
  }

  const durationMinutes =
    durationMinutesRaw && durationMinutesRaw.trim()
      ? Number.parseInt(durationMinutesRaw, 10)
      : null;

  if (durationMinutes !== null && (!Number.isFinite(durationMinutes) || durationMinutes < 15 || durationMinutes > 1440)) {
    return { status: "error", message: "Duration must be between 15 minutes and 24 hours." } as const;
  }

  const sendInvite = formData.get("sendInvite") === "true";
  const seriesId = recurrence !== "NONE" ? crypto.randomUUID() : null;

// Build recurring dates first to get effective end date
  let dueDates: Date[];
  try {
    dueDates = buildRecurringDueDates(dueDate, recurrence, recurrenceUntil);
  } catch (error) {
    return { status: "error", message: error instanceof Error ? error.message : "Invalid repeat settings." } as const;
  }

// Use effective end date for storage (the last date in the series, or null if no recurrence)
  const effectiveRecurrenceUntil = recurrence !== "NONE" && dueDates.length > 0
    ? parseLondonDate(`${formatDateKey(dueDates[dueDates.length - 1])}T23:59:59`)
    : null;

  await prisma.diaryEntry.createMany({
    data: dueDates.map((entryDate) => ({
      title: title.trim(),
      description: description?.trim() || null,
      dueDate: entryDate,
      durationMinutes,
      priority: normalizedPriority,
      recurrence,
      recurrenceUntil: effectiveRecurrenceUntil,
      seriesId,
      entityType: entityType || null,
      entityId: entityId || null,
      createdByUserId: session.userId,
      assignedUserId: session.userId,
    })),
  });

// Fetch the created entries with relations for email
  if (sendInvite) {
    const createdEntries = await prisma.diaryEntry.findMany({
      where: {
        title: title.trim(),
        dueDate: { gte: dueDate },
        createdByUserId: session.userId,
      },
      orderBy: { dueDate: "asc" },
      take: dueDates.length,
      include: {
        assignedTo: { select: { firstName: true, lastName: true, email: true } },
        createdBy: { select: { firstName: true, lastName: true } },
      },
    });

    for (const raw of createdEntries) {
      const entry = { ...raw, assignedTo: raw.assignedTo, createdBy: raw.createdBy };
      if (entry.assignedTo?.email) {
        await sendDiaryTaskInvite({
          entry: {
            id: entry.id,
            title: entry.title,
            description: entry.description,
            dueDate: entry.dueDate,
            durationMinutes: entry.durationMinutes,
            priority: entry.priority,
            status: entry.status,
            recurrence: entry.recurrence,
            recurrenceUntil: entry.recurrenceUntil,
            assignedTo: entry.assignedTo,
            createdBy: entry.createdBy,
          },
          to: entry.assignedTo.email,
        });
      }
    }
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/diary");
  if (entityType && entityId) {
    revalidatePath(`/${entityType.toLowerCase()}s/${entityId}`);
  }

  return {
    status: "success",
    message: dueDates.length > 1 ? `${dueDates.length} diary entries created.` : "Diary entry created.",
  } as const;
}

export async function updateDiaryEntryAction(formData: FormData) {
  await requirePermission("adminWorkspace");

  const entryId = formData.get("entryId") as string;
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const dueDateStr = formData.get("dueDate") as string;
  const priority = (formData.get("priority") as string) || "MEDIUM";
  const durationMinutesRaw = formData.get("durationMinutes") as string | null;

  const normalizedPriority: DiaryPriority =
    priority === "LOW" || priority === "MEDIUM" || priority === "HIGH" || priority === "URGENT"
      ? priority
      : "MEDIUM";

  if (!entryId || !title?.trim() || !dueDateStr) {
    return { status: "error", message: "Title, due date, and entry ID are required." } as const;
  }

  const dueDate = parseLondonDate(dueDateStr);
  if (Number.isNaN(dueDate.getTime())) {
    return { status: "error", message: "Invalid due date." } as const;
  }

  const durationMinutes =
    durationMinutesRaw && durationMinutesRaw.trim()
      ? Number.parseInt(durationMinutesRaw, 10)
      : null;

  if (durationMinutes !== null && (!Number.isFinite(durationMinutes) || durationMinutes < 15 || durationMinutes > 1440)) {
    return { status: "error", message: "Duration must be between 15 minutes and 24 hours." } as const;
  }

  const sendInvite = formData.get("sendInvite") === "true";
  const updateSeries = formData.get("updateSeries") === "true";

// Get the entry first to check if it's part of a series
  const existingEntry = await prisma.diaryEntry.findUnique({
    where: { id: entryId },
    select: { seriesId: true, dueDate: true, recurrenceUntil: true },
  });

  if (updateSeries && existingEntry?.seriesId) {
    const seriesEntries = await prisma.diaryEntry.findMany({
      where: { seriesId: existingEntry.seriesId },
      select: { id: true, dueDate: true, recurrenceUntil: true },
      orderBy: { dueDate: "asc" },
    });

    const dueDateOffsetMs = dueDate.getTime() - existingEntry.dueDate.getTime();

    await prisma.$transaction(
      seriesEntries.map((seriesEntry) => {
        const nextDueDate = new Date(seriesEntry.dueDate.getTime() + dueDateOffsetMs);
        const nextRecurrenceUntil = seriesEntry.recurrenceUntil
          ? new Date(seriesEntry.recurrenceUntil.getTime() + dueDateOffsetMs)
          : existingEntry.recurrenceUntil
            ? new Date(existingEntry.recurrenceUntil.getTime() + dueDateOffsetMs)
            : null;

        return prisma.diaryEntry.update({
          where: { id: seriesEntry.id },
          data: {
            title: title.trim(),
            description: description?.trim() || null,
            dueDate: nextDueDate,
            durationMinutes,
            priority: normalizedPriority,
            recurrenceUntil: nextRecurrenceUntil,
          },
        });
      }),
    );
  } else {
// Update single entry
    await prisma.diaryEntry.update({
      where: { id: entryId },
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        dueDate,
        durationMinutes,
        priority: normalizedPriority,
      },
    });
  }

// Send email invite if requested
  if (sendInvite) {
    const targetEntry = updateSeries && existingEntry?.seriesId
      ? await prisma.diaryEntry.findFirst({
          where: { seriesId: existingEntry.seriesId },
          orderBy: { dueDate: "asc" },
          include: {
            assignedTo: { select: { firstName: true, lastName: true, email: true } },
            createdBy: { select: { firstName: true, lastName: true } },
          },
        })
      : await prisma.diaryEntry.findUnique({
          where: { id: entryId },
          include: {
            assignedTo: { select: { firstName: true, lastName: true, email: true } },
            createdBy: { select: { firstName: true, lastName: true } },
          },
        });

    if (targetEntry) {
      const entry = { ...targetEntry, assignedTo: targetEntry.assignedTo, createdBy: targetEntry.createdBy };
      if (entry.assignedTo?.email) {
        await sendDiaryTaskInvite({
          entry: {
            id: targetEntry.id,
            title: targetEntry.title,
            description: targetEntry.description,
            dueDate: targetEntry.dueDate,
            durationMinutes: targetEntry.durationMinutes,
            priority: targetEntry.priority,
            status: targetEntry.status,
            recurrence: targetEntry.recurrence,
            recurrenceUntil: targetEntry.recurrenceUntil,
            assignedTo: entry.assignedTo,
            createdBy: entry.createdBy,
          },
          to: entry.assignedTo.email,
        });
      }
    }
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/diary");
  return { status: "success", message: updateSeries ? "Series updated." : "Entry updated." } as const;
}

export async function deleteDiaryEntryAction(formData: FormData) {
  await requirePermission("adminWorkspace");

  const entryId = formData.get("entryId") as string;
  if (!entryId) return { status: "error", message: "Invalid entry." } as const;

// Check if this is part of a series
  const existingEntry = await prisma.diaryEntry.findUnique({
    where: { id: entryId },
    select: { seriesId: true },
  });

  const deleteSeries = formData.get("deleteSeries") === "true";

  if (deleteSeries && existingEntry?.seriesId) {
    await prisma.diaryEntry.deleteMany({
      where: { seriesId: existingEntry.seriesId },
    });
  } else {
    await prisma.diaryEntry.delete({
      where: { id: entryId },
    });
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/diary");
  return { status: "success", message: deleteSeries ? "Series deleted." : "Entry deleted." } as const;
}

export async function completeDiaryEntryAction(formData: FormData) {
  await requirePermission("adminWorkspace");

  const entryId = formData.get("entryId") as string;
  if (!entryId) return { status: "error", message: "Invalid entry." } as const;

  await prisma.diaryEntry.update({
    where: { id: entryId },
    data: { status: "COMPLETED", completedAt: new Date() },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/diary");
  return { status: "success", message: "Entry completed." } as const;
}

export async function cancelDiaryEntryAction(formData: FormData) {
  await requirePermission("adminWorkspace");

  const entryId = formData.get("entryId") as string;
  if (!entryId) return { status: "error", message: "Invalid entry." } as const;

  await prisma.diaryEntry.update({
    where: { id: entryId },
    data: { status: "CANCELLED" },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/diary");
  return { status: "success", message: "Entry cancelled." } as const;
}

export async function rescheduleDiaryEntryAction(formData: FormData) {
  await requirePermission("adminWorkspace");

  const entryId = formData.get("entryId") as string;
  const newDueDateStr = formData.get("dueDate") as string;

  if (!entryId || !newDueDateStr) {
    return { status: "error", message: "Entry ID and new due date are required." } as const;
  }

  const newDueDate = parseLondonDate(newDueDateStr);
  if (Number.isNaN(newDueDate.getTime())) {
    return { status: "error", message: "Invalid date." } as const;
  }

  await prisma.diaryEntry.update({
    where: { id: entryId },
    data: { dueDate: newDueDate },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/diary");
  return { status: "success", message: "Entry rescheduled." } as const;
}

export async function getDiaryEntries({
  status,
  dueDate,
  entityType,
  entityId,
}: {
  status?: DiaryStatus;
  dueDate?: Date;
  entityType?: string;
  entityId?: string;
} = {}) {
  await requirePermission("adminWorkspace");

  const where: Prisma.DiaryEntryWhereInput = {};
  if (status) where.status = status;
  if (dueDate) where.dueDate = { lte: dueDate };
  if (entityType) where.entityType = entityType;
  if (entityId) where.entityId = entityId;

  const entries = await prisma.diaryEntry.findMany({
    where,
    orderBy: [{ priority: "asc" }, { dueDate: "asc" }],
    include: {
      createdBy: { select: { firstName: true, lastName: true } },
      assignedTo: { select: { firstName: true, lastName: true } },
    },
  });

// Map disambiguated Prisma names back to the shorthand used by consumers
  return entries.map((e: any) => ({
    ...e,
    createdBy: e.createdBy,
    assignedTo: e.assignedTo,
  }));
}
