"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import enGbLocale from "@fullcalendar/core/locales/en-gb";
import type { EventDropArg } from "@fullcalendar/core";
import type { EventResizeDoneArg } from "@fullcalendar/interaction";

// Dynamic import of FullCalendar to reduce initial bundle
const FullCalendar = dynamic(() => import("@fullcalendar/react"), {
  loading: () => <div className="flex items-center justify-center h-[600px]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--brand)]"></div></div>,
  ssr: false,
});
import type { CalendarEvent, CalendarLessonEvent, CalendarTestEvent, CalendarUnavailabilityEvent } from "@/features/calendar/queries";

type EventFilter = "all" | "lessons" | "tests" | "unavailability" | "practical-with-instructor";

const STATUS_COLOURS: Record<string, string> = {
  DRAFT: "bg-slate-200 text-slate-800 border-slate-300",
  SCHEDULED: "bg-blue-100 text-blue-800 border-blue-300",
  CONFIRMED: "bg-green-100 text-green-800 border-green-300",
  COMPLETED: "bg-emerald-100 text-emerald-800 border-emerald-300",
  CANCELLED: "bg-red-100 text-red-800 border-red-300",
  NO_SHOW: "bg-amber-100 text-amber-800 border-amber-300",
  BOOKED: "bg-purple-100 text-purple-800 border-purple-300",
  NOT_BOOKED: "bg-slate-100 text-slate-600 border-slate-200",
  PASSED: "bg-green-200 text-green-900 border-green-400",
  FAILED: "bg-red-200 text-red-900 border-red-400",
};

/** Striped background class for unavailability blocks */
const UNAVAILABILITY_CLASS =
  "bg-slate-300/80 text-slate-700 border-slate-400 !bg-[repeating-linear-gradient(135deg,transparent,transparent_4px,#cbd5e1_4px,#cbd5e1_8px)]";

function eventColour(event: CalendarEvent) {
  if (event.type === "unavailability") {
    return UNAVAILABILITY_CLASS;
  }
  if (event.type === "test") {
    return event.testKind === "theory"
      ? "bg-purple-100 text-purple-800 border-purple-300"
      : "bg-amber-100 text-amber-800 border-amber-300";
  }
  return STATUS_COLOURS[event.status] ?? "bg-slate-100 text-slate-700 border-slate-200";
}

function eventEnd(event: CalendarEvent): Date | undefined {
  if (event.type === "unavailability" || event.type === "lesson") {
    return event.end ?? undefined;
  }
  if (event.type === "test") {
// Theory tests are all-day markers
    if (event.testKind === "theory") return undefined;
// Practical tests always span 2 hours (travel, waiting, test, return)
// regardless of instructorTakingToTest flag — a booked practical test
// always blocks the instructor's calendar for 2 hours
    return new Date(new Date(event.start).getTime() + 2 * 60 * 60 * 1000);
  }
  return undefined;
}

type CalendarProps = {
  events: CalendarEvent[];
  showFilters?: boolean;
  editable?: boolean;
  onEventDrop?: (info: EventDropArg) => void;
  onEventResize?: (info: EventResizeDoneArg) => void;
  onDateClick?: (date: Date) => void;
  onEventClick?: (event: CalendarEvent) => void;
  onSelectSlot?: (start: Date, end: Date) => void;
  slotMinTime?: string;
  slotMaxTime?: string;
  scrollTime?: string;
};

export function LessonCalendar({
  events,
  showFilters = false,
  editable = false,
  onEventDrop,
  onEventResize,
  onDateClick,
  onEventClick,
  onSelectSlot,
  slotMinTime = "06:00:00",
  slotMaxTime = "22:00:00",
  scrollTime = "08:00:00",
}: CalendarProps) {
  const [filter, setFilter] = useState<EventFilter>("all");
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [clickedDate, setClickedDate] = useState<Date | null>(null);
  const [isCompact, setIsCompact] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const updateViewport = () => setIsCompact(window.innerWidth < 640);
    updateViewport();
    window.addEventListener("resize", updateViewport);
    return () => window.removeEventListener("resize", updateViewport);
  }, []);

// Unavailability blocks are always shown unless the user explicitly filters to only unavailability
  const unavailabilityEvents = events.filter((e) => e.type === "unavailability");
  const filtered = filter === "all"
    ? events
    : filter === "lessons"
      ? events.filter((e) => e.type === "lesson")
      : filter === "tests"
        ? events.filter((e) => e.type === "test")
        : filter === "practical-with-instructor"
          ? events.filter((e) => e.type === "test" && (e as CalendarTestEvent).testKind === "practical")
          : events.filter((e) => e.type === "unavailability");

// Merge unavailability back in when lessons/tests are filtered so blocks remain visible
  const displayEvents = filter === "all" || filter === "unavailability"
    ? filtered
    : [...filtered, ...unavailabilityEvents];

  const calendarEvents = displayEvents.map((event) => {
    const colour = eventColour(event);
    const timeStr = event.start.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
    const isUnavailability = event.type === "unavailability";
    return {
      id: event.id,
      title: isUnavailability
        ? `🚫 ${(event as CalendarUnavailabilityEvent).instructorName}${(event as CalendarUnavailabilityEvent).reason ? ` — ${(event as CalendarUnavailabilityEvent).reason}` : ""}`
        : event.type === "lesson"
          ? `${timeStr} ${event.pupilName}`
          : event.title,
      start: event.start,
      end: eventEnd(event),
      allDay: event.type === "test" && event.testKind === "theory",
// Render unavailability as background events so they visually block out the slot
      display: isUnavailability ? ("background" as const) : ("auto" as const),
      backgroundColor: isUnavailability ? "transparent" : "transparent",
      borderColor: "transparent",
      extendedProps: { ...event, colour },
// Only allow dragging/resizing lesson events (not tests or unavailability)
      editable: editable && event.type === "lesson" && ["DRAFT", "SCHEDULED", "CONFIRMED"].includes(event.status),
    };
  });

  const handleEventDrop = useCallback((arg: EventDropArg) => {
    const ext = arg.event.extendedProps as CalendarEvent & { colour: string };
    if (ext.type === "test" || ext.type === "unavailability") {
      arg.revert();
      return;
    }
    if (!["DRAFT", "SCHEDULED", "CONFIRMED"].includes(ext.status)) {
      arg.revert();
      return;
    }
    onEventDrop?.(arg);
  }, [onEventDrop]);

  const handleEventResize = useCallback((arg: EventResizeDoneArg) => {
    const ext = arg.event.extendedProps as CalendarEvent & { colour: string };
    if (ext.type === "test" || ext.type === "unavailability") {
      arg.revert();
      return;
    }
    if (!["DRAFT", "SCHEDULED", "CONFIRMED"].includes(ext.status)) {
      arg.revert();
      return;
    }
    onEventResize?.(arg);
  }, [onEventResize]);

  return (
    <div className="space-y-4">
      {showFilters && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-slate-700">Show:</span>
          {(["all", "lessons", "tests", "practical-with-instructor", "unavailability"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                filter === f
                  ? "bg-[var(--brand)] text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {f === "all" ? "All" : f === "lessons" ? "Lessons" : f === "tests" ? "Tests" : f === "practical-with-instructor" ? "Practical w// instructor" : "Unavailability"}
            </button>
          ))}
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white p-2 sm:p-4">
        <div className={isCompact ? "min-w-0" : "min-w-[720px] md:min-w-0"}>
          <FullCalendar
            key={isCompact ? "compact" : "full"}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView={isCompact ? "timeGridDay" : "timeGridWeek"}
            headerToolbar={isCompact
              ? {
                  left: "prev,next",
                  center: "title",
                  right: "timeGridDay,timeGridWeek",
                }
              : {
                  left: "prev,next today",
                  center: "title",
                  right: "dayGridMonth,timeGridWeek,timeGridDay",
                }}
            events={calendarEvents}
            eventContent={(arg) => {
              const e = arg.event.extendedProps as CalendarEvent & { colour: string };
              if (e.type === "unavailability") {
                const unavail = e as CalendarUnavailabilityEvent;
                return (
                  <div
                    className="w-full h-full rounded border overflow-hidden bg-[repeating-linear-gradient(135deg,transparent,transparent_4px,#cbd5e1_4px,#cbd5e1_8px)] bg-slate-300/70 border-slate-400"
                    title={`${unavail.instructorName} unavailable${unavail.reason ? `: ${unavail.reason}` : ""}`}
                  >
                    <span className="block px-1.5 py-0.5 text-xs font-medium text-slate-700 truncate">🚫 {unavail.instructorName}{unavail.reason ? ` — ${unavail.reason}` : ""}</span>
                  </div>
                );
              }
              const colour = e.colour;
              return (
                <div
                  className={`w-full h-full rounded px-1.5 py-0.5 text-xs font-medium leading-tight border ${colour} overflow-hidden`}
                  title={`${e.pupilName}${e.type === "lesson" ? ` · ${e.status.replaceAll("_", " ")}${(e as CalendarLessonEvent).pickupLocation ? ` · ${(e as CalendarLessonEvent).pickupLocation}` : ""}` : ` · ${e.testKind} test${(e as CalendarTestEvent).testCentre ? ` · ${(e as CalendarTestEvent).testCentre}` : ""}`}` }
                >
                  <span className="truncate">{arg.event.title}</span>
                </div>
              );
            }}
            locale={enGbLocale}
            slotMinTime={slotMinTime}
            slotMaxTime={slotMaxTime}
            scrollTime={scrollTime}
            slotDuration="00:15:00"
            snapDuration="00:15:00"
            nowIndicator
            editable={editable}
            eventDrop={handleEventDrop}
            eventResize={handleEventResize}
            eventClick={(info) => {
              const ext = info.event.extendedProps as CalendarEvent & { colour: string };
              if (onEventClick) {
                onEventClick(ext);
              } else {
                setSelectedEvent(ext);
              }
            }}
            dateClick={(info) => {
              if (onDateClick) {
                onDateClick(info.date);
              } else {
                setClickedDate(info.date);
              }
            }}
            select={(info) => {
              if (onSelectSlot) {
                onSelectSlot(info.start, info.end);
              }
            }}
            selectable={!!onSelectSlot}
            height="auto"
            aspectRatio={isCompact ? 0.85 : 1.4}
            dayMaxEvents={4}
            eventMaxStack={3}
          />
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
        <span className="font-medium">Legend:</span>
        {[
          { label: "Scheduled", cls: STATUS_COLOURS.SCHEDULED },
          { label: "Confirmed", cls: STATUS_COLOURS.CONFIRMED },
          { label: "Completed", cls: STATUS_COLOURS.COMPLETED },
          { label: "Cancelled", cls: STATUS_COLOURS.CANCELLED },
          { label: "No Show", cls: STATUS_COLOURS.NO_SHOW },
          { label: "Theory Test", cls: "bg-purple-100 text-purple-800 border-purple-300" },
          { label: "Practical Test", cls: "bg-amber-100 text-amber-800 border-amber-300" },
          { label: "Unavailable", cls: "bg-slate-300/70 text-slate-700 border-slate-400" },
        ].map((item) => (
          <span key={item.label} className={`inline-flex items-center gap-1.5 rounded border px-2 py-0.5 ${item.cls}`}>
            <span className="h-2 w-2 rounded-full current-bg" />
            {item.label}
          </span>
        ))}
      </div>

      {/* Event Detail Panel */}
      {selectedEvent && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-800">
              {selectedEvent.type === "lesson" ? "Lesson" : selectedEvent.type === "test" ? "Test" : "Unavailability"} Details
            </h3>
            <button
              onClick={() => setSelectedEvent(null)}
              className="text-xs text-slate-500 hover:text-slate-700"
            >
              Close
            </button>
          </div>

          <div className="space-y-2 text-sm">
            {(selectedEvent.type === "lesson" || selectedEvent.type === "test") && (
              <div>
                <span className="font-medium text-slate-700">Pupil: </span>
                <span className="text-slate-900">{(selectedEvent as CalendarLessonEvent | CalendarTestEvent).pupilName}</span>
              </div>
            )}
            {selectedEvent.type === "unavailability" && (
              <div>
                <span className="font-medium text-slate-700">Instructor: </span>
                <span className="text-slate-900">{(selectedEvent as CalendarUnavailabilityEvent).instructorName}</span>
                {(selectedEvent as CalendarUnavailabilityEvent).reason && (
                  <span className="text-slate-600"> — {(selectedEvent as CalendarUnavailabilityEvent).reason}</span>
                )}
              </div>
            )}
            {selectedEvent.type === "lesson" && (
              <>
                <div>
                  <span className="font-medium text-slate-700">Status: </span>
                  <span className="text-slate-900">{(selectedEvent as CalendarLessonEvent).status}</span>
                </div>
                {(selectedEvent as CalendarLessonEvent).pickupLocation && (
                  <div>
                    <span className="font-medium text-slate-700">Pick-up: </span>
                    <span className="text-slate-900">{(selectedEvent as CalendarLessonEvent).pickupLocation}</span>
                  </div>
                )}
              </>
            )}
            {selectedEvent.type === "test" && (
              <>
                <div>
                  <span className="font-medium text-slate-700">Test type: </span>
                  <span className="text-slate-900 capitalize">{(selectedEvent as CalendarTestEvent).testKind}</span>
                </div>
                {(selectedEvent as CalendarTestEvent).testCentre && (
                  <div>
                    <span className="font-medium text-slate-700">Test centre: </span>
                    <span className="text-slate-900">{(selectedEvent as CalendarTestEvent).testCentre}</span>
                  </div>
                )}
                {(selectedEvent as CalendarTestEvent).testKind === "practical" && (
                  <div>
                    <span className="font-medium text-slate-700">Instructor taking: </span>
                    <span className="text-slate-900">{(selectedEvent as CalendarTestEvent).instructorTakingToTest ? "Yes" : "No"}</span>
                  </div>
                )}
              </>
            )}
            <div>
              <span className="font-medium text-slate-700">Time: </span>
              <span className="text-slate-900">
                {selectedEvent.start.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                {selectedEvent.end ? ` - ${selectedEvent.end.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}` : ""}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {(selectedEvent.type === "lesson" || selectedEvent.type === "test") && (
              <button
                onClick={() => {
                  const learnerId = selectedEvent.learnerId;
                  if (learnerId) router.push(`/learners/${learnerId}`);
                }}
                className="rounded-md bg-[var(--brand)] px-3 py-1.5 text-xs font-medium text-white hover:opacity-90"
              >
                View pupil record
              </button>
            )}
            {selectedEvent.type === "lesson" && ["DRAFT", "SCHEDULED", "CONFIRMED"].includes((selectedEvent as CalendarLessonEvent).status) && (
              <button
                onClick={() => {
                  const lessonId = selectedEvent.id;
// Navigate to lesson edit page or trigger edit action
                  router.push(`/learners?lesson=${lessonId}`);
                }}
                className="rounded-md bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200"
              >
                Edit lesson
              </button>
            )}
          </div>
        </div>
      )}

      {/* Clicked Date// Empty Slot Panel */}
      {clickedDate && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-800">
              {clickedDate.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })}
            </h3>
            <button
              onClick={() => setClickedDate(null)}
              className="text-xs text-slate-500 hover:text-slate-700"
            >
              Close
            </button>
          </div>

          <p className="text-sm text-slate-600">What would you like to do at this time?</p>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                onDateClick?.(clickedDate);
                setClickedDate(null);
              }}
              className="rounded-md bg-[var(--brand)] px-3 py-1.5 text-xs font-medium text-white hover:opacity-90"
            >
              Book lesson
            </button>
            <button
              onClick={() => {
                onDateClick?.(clickedDate);
                setClickedDate(null);
              }}
              className="rounded-md bg-purple-100 px-3 py-1.5 text-xs font-medium text-purple-700 hover:bg-purple-200"
            >
              Book test
            </button>
            <button
              onClick={() => {
                onDateClick?.(clickedDate);
                setClickedDate(null);
              }}
              className="rounded-md bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200"
            >
              Block out time
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
