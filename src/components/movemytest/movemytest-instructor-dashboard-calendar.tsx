"use client";

import { LessonCalendar } from "@/features/calendar/calendar-component";
import type { CalendarEvent } from "@/features/calendar/queries";

function parseDates(events: CalendarEvent[]): CalendarEvent[] {
  return events.map((event) => {
    const parsed = {
      ...event,
      start: new Date(event.start),
    } as CalendarEvent;
    if ("end" in event) {
      (parsed as any).end = event.end ? new Date(event.end as any) : null;
    }
    return parsed;
  });
}

export function MoveMyTestInstructorDashboardCalendar({ events }: { events: CalendarEvent[] }) {
  return <LessonCalendar events={parseDates(events)} showFilters slotMinTime="07:00:00" slotMaxTime="20:00:00" scrollTime="07:00:00" />;
}
