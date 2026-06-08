import { CalendarDays, CheckCircle2, Clock, ShieldCheck, UsersRound } from "lucide-react";
import { prisma } from "@/lib/db/prisma";
import { requireMoveMyTestInstructorSession } from "@/features/movemytest/instructor-session";
import { MoveMyTestInstructorDashboardCalendar } from "@/components/movemytest/movemytest-instructor-dashboard-calendar";
import { LearnerCardsList } from "@/components/movemytest/learner-cards-list";
import { DIRECTION_LABELS, TIME_PREFERENCE_LABELS } from "@/features/movemytest/constants";
import { recordMoveMyTestInstructorAvailabilityAction, updateMoveMyTestInstructorProfileAction } from "@/features/movemytest/instructor-actions";
import type { CalendarEvent } from "@/features/calendar/queries";

function formatDateTime(value: Date | string | null | undefined) {
  if (!value) return "Date not set";
  const d = typeof value === "string" ? new Date(value) : value;
  if (isNaN(d.getTime())) return "Invalid date";
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/London" }).format(d);
}

function formatDate(value: Date | string | null | undefined) {
  if (!value) return "Date not set";
  const d = typeof value === "string" ? new Date(value) : value;
  if (isNaN(d.getTime())) return "Invalid date";
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeZone: "Europe/London" }).format(d);
}

function humanise(value: string) {
  return value.toLowerCase().replaceAll("_", " ");
}

function statusTone(status: string) {
  if (["ACTIVE", "PROPOSED", "LEARNER_A_ACCEPTED", "LEARNER_B_ACCEPTED", "BOTH_ACCEPTED"].includes(status)) return "border-emerald-200 bg-emerald-50 text-emerald-800";
  if (["MATCHED", "BOOKING_REFERENCE_CONSENT_REQUESTED", "BOOKING_REFERENCE_SHARED"].includes(status)) return "border-blue-200 bg-blue-50 text-blue-800";
  if (["PAUSED"].includes(status)) return "border-amber-200 bg-amber-50 text-amber-800";
  if (["COMPLETED"].includes(status)) return "border-slate-200 bg-slate-100 text-slate-800";
  return "border-red-200 bg-red-50 text-red-800";
}

function availabilityTone(status?: string) {
  if (status === "AVAILABLE") return "border-emerald-200 bg-emerald-50 text-emerald-800";
  if (status === "UNAVAILABLE") return "border-red-200 bg-red-50 text-red-800";
  if (status === "NEEDS_DISCUSSION") return "border-amber-200 bg-amber-50 text-amber-800";
  return "border-slate-200 bg-slate-50 text-slate-600";
}

type InstructorLink = Awaited<ReturnType<typeof getInstructorLinks>>[number];
type AvailabilityDecision = InstructorLink["availabilityDecisions"][number];

type FlattenedMatch = {
  id: string;
  status: string;
  score: number;
  otherCentre: string;
  otherDateTime: Date;
  bothAcceptedAt: Date | null;
  callWindowStartedAt: Date | null;
  callWindowExpiresAt: Date | null;
  completedAt: Date | null;
  instructorSelfCertified: boolean;
};

async function getInstructorLinks(instructorId: string, adiNumber: string) {
  return prisma.listingInstructor.findMany({
    where: { OR: [{ instructorAccountId: instructorId }, { adiNumber }] },
    include: {
      listing: {
        include: {
          currentCentre: true,
          originalCentre: true,
          account: { select: { email: true, mobileNumber: true } },
          listingAMatches: {
            where: {
              status: { notIn: ["DECLINED", "EXPIRED", "REPORTED", "COMPLETED"] },
              listingB: { status: { not: "DELETED" } },
            },
            include: {
              listingA: { include: { currentCentre: true, account: { select: { email: true, mobileNumber: true } } } },
              listingB: { include: { currentCentre: true, account: { select: { email: true, mobileNumber: true } } } },
            },
            orderBy: { updatedAt: "desc" },
          },
          listingBMatches: {
            where: {
              status: { notIn: ["DECLINED", "EXPIRED", "REPORTED", "COMPLETED"] },
              listingA: { status: { not: "DELETED" } },
            },
            include: {
              listingA: { include: { currentCentre: true, account: { select: { email: true, mobileNumber: true } } } },
              listingB: { include: { currentCentre: true, account: { select: { email: true, mobileNumber: true } } } },
            },
            orderBy: { updatedAt: "desc" },
          },
        },
      },
      availabilityDecisions: { orderBy: { decidedAt: "desc" }, take: 20 },
    },
    orderBy: { createdAt: "desc" },
  });
}

function latestAvailability(link: InstructorLink, slotType: "CURRENT_TEST" | "PROPOSED_SWAP", matchId?: string) {
  return link.availabilityDecisions.find((decision) => decision.slotType === slotType && (slotType === "CURRENT_TEST" ? !decision.matchId : decision.matchId === matchId));
}

function flattenMatches(link: InstructorLink): FlattenedMatch[] {
  const listingId = link.listing.id;
  return [...link.listing.listingAMatches, ...link.listing.listingBMatches].map((match) => {
  const other = match.listingAId === listingId ? match.listingB : match.listingA;
    const isA = match.listingAId === listingId;
    return {
      id: match.id,
      status: match.status,
      score: match.score,
      otherCentre: other.currentCentre?.name,
      otherDateTime: other.currentDateTime,
      bothAcceptedAt: match.bothAcceptedAt,
      callWindowStartedAt: match.callWindowStartedAt,
      callWindowExpiresAt: match.callWindowExpiresAt,
      completedAt: match.completedAt,
      instructorSelfCertified: Boolean(isA ? match.instructorConfirmedByLearnerAtA : match.instructorConfirmedByLearnerAtB),
    };
  });
}

function needsAttention(link: InstructorLink) {
  const matches = flattenMatches(link);
  if (["ACTIVE", "MATCHED"].includes(link.listing.status) && matches.length === 0) return "Confirm you can support this learner if a suitable swap appears.";
  const callWindow = matches.find((match) => match.status === "BOOKING_REFERENCE_SHARED" && !match.completedAt);
  if (callWindow) {
    if (callWindow.instructorSelfCertified) return "Learner has an active DVSA call window. They have confirmed they spoke to you and you agreed to the swap.";
    return "Learner has an active DVSA call window. Check availability for the proposed swapped slot.";
  }
  const accepted = matches.find((match) => ["BOTH_ACCEPTED", "BOOKING_REFERENCE_CONSENT_REQUESTED"].includes(match.status));
  if (accepted) {
    if (accepted.instructorSelfCertified) return "Learner has accepted a match and confirmed they spoke to you. Verify availability before they complete the DVSA call.";
    return "Learner has accepted a match. Confirm you are available before they complete the DVSA call.";
  }
  const proposed = matches.find((match) => ["PROPOSED", "LEARNER_A_ACCEPTED", "LEARNER_B_ACCEPTED"].includes(match.status));
  if (proposed) return "Learner has a proposed match. Review the possible new test slot.";
  if (link.listing.status === "PAUSED") return "Listing is paused. No action unless the learner asks to restart.";
  return null;
}

function desiredCentreIds(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

export async function getInstructorDashboardData() {
  const session = await requireMoveMyTestInstructorSession();
  const instructor = await prisma.instructorAccount.findUniqueOrThrow({ where: { id: session.instructorId } });
  const links = await getInstructorLinks(instructor.id, instructor.adiNumber);
  links.sort((a, b) => a.listing.currentDateTime.getTime() - b.listing.currentDateTime.getTime());

  const desiredIds = Array.from(new Set(links.flatMap((link) => desiredCentreIds(link.listing.desiredCentreIds))));
  const desiredCentres = desiredIds.length
    ? await prisma.testCentre.findMany({ where: { id: { in: desiredIds } }, select: { id: true, name: true, postcode: true } })
    : [];
  const desiredCentreMap = new Map(desiredCentres.map((centre) => [centre.id, centre]));

  const activeLinks = links.filter((link) => ["ACTIVE", "MATCHED", "PAUSED"].includes(link.listing.status));
  const allMatches = links.flatMap(flattenMatches);
  const attentionItems = links.map((link) => ({ link, reason: needsAttention(link), matches: flattenMatches(link) })).filter((item): item is { link: InstructorLink; reason: string; matches: FlattenedMatch[] } => Boolean(item.reason));
  const activeCallWindows = allMatches.filter((match) => match.status === "BOOKING_REFERENCE_SHARED" && !match.completedAt).length;
  const acceptedMatches = allMatches.filter((match) => ["BOTH_ACCEPTED", "BOOKING_REFERENCE_CONSENT_REQUESTED", "BOOKING_REFERENCE_SHARED"].includes(match.status)).length;

  const learnerCards = buildLearnerCards(links);
  const actionCards = learnerCards.filter(c => c.priority <= 3);

  const currentTestEvents: CalendarEvent[] = activeLinks.map((link) => ({
    id: `movemytest-current-${link.listing.id}`,
    title: `Current test: ${link.listing.currentCentre.name}`,
    start: link.listing.currentDateTime,
    end: new Date(link.listing.currentDateTime.getTime() + 2 * 60 * 60 * 1000),
    status: link.listing.status,
    pupilName: link.listing.account?.email ?? "MoveMyTest learner",
    learnerId: link.listing.accountId ?? link.listing.id,
    instructorName: `${instructor.firstName} ${instructor.lastName}`,
    instructorId: instructor.id,
    testCentre: link.listing.currentCentre.name,
    testKind: "practical",
    type: "test",
    instructorTakingToTest: true,
  }));

  const proposedSwapEvents: CalendarEvent[] = links.flatMap((link) => flattenMatches(link).slice(0, 3).map((match) => ({
    id: `movemytest-proposed-${match.id}-${link.listing.id}`,
    title: `Possible swap: ${match.otherCentre}`,
    start: match.otherDateTime,
    end: new Date(match.otherDateTime.getTime() + 2 * 60 * 60 * 1000),
    status: `PROPOSED_${match.status}`,
    pupilName: link.listing.account?.email ?? "MoveMyTest learner",
    learnerId: link.listing.accountId ?? link.listing.id,
    instructorName: `${instructor.firstName} ${instructor.lastName}`,
    instructorId: instructor.id,
    testCentre: match.otherCentre,
    testKind: "practical" as const,
    type: "test" as const,
    instructorTakingToTest: true,
  })));

  const tsEvents: CalendarEvent[] = [...currentTestEvents, ...proposedSwapEvents];

// MoveMyTest instructor calendar view (standalone — no DTC integration)
  let dtcCalendarEvents: CalendarEvent[] = [];

// Support ticket summary
  const supportTickets = await prisma.report.findMany({
    where: { mobileNumber: instructor.email, reason: { startsWith: "INSTRUCTOR_" } },
    select: { status: true },
  });
  const openTickets = supportTickets.filter(t => t.status === "OPEN" || t.status === "IN_PROGRESS").length;
  const awaitingResponse = supportTickets.filter(t => t.status === "OPEN").length;

  return JSON.parse(JSON.stringify({
    instructor,
    links,
    learnerCards,
    actionCards,
    desiredCentreMap,
    activeLinks,
    allMatches,
    attentionItems,
    activeCallWindows,
    acceptedMatches,
    supportSummary: {
      total: supportTickets.length,
      open: openTickets,
      awaitingResponse,
      inProgress: supportTickets.filter(t => t.status === "IN_PROGRESS").length,
      resolved: supportTickets.filter(t => t.status === "RESOLVED").length,
    },
    calendarEvents: [...tsEvents, ...dtcCalendarEvents],
  }));
}

type LearnerCard = {
  learnerId: string;
  email: string;
  activeLink: InstructorLink | null;
  historyLinks: InstructorLink[];
  activeMatches: FlattenedMatch[];
  priority: number;
};

function buildLearnerCards(links: InstructorLink[]) {
  const groups = new Map<string, { active: InstructorLink | null; history: InstructorLink[]; email: string }>();

  for (const link of links) {
    const learnerId = link.listing.accountId ?? link.listing.id;
    const email = link.listing.account?.email ?? "Unknown learner";
    if (!groups.has(learnerId)) {
      groups.set(learnerId, { active: null, history: [], email });
    }
    const group = groups.get(learnerId)!;
// Update email if we have a better one
    if (email !== "Unknown learner") group.email = email;

    if (["ACTIVE", "MATCHED", "PAUSED"].includes(link.listing.status)) {
// Keep the most recently updated active listing
      if (!group.active || new Date(link.updatedAt) > new Date(group.active.updatedAt)) {
        if (group.active) group.history.push(group.active);
        group.active = link;
      } else {
        group.history.push(link);
      }
    } else {
      group.history.push(link);
    }
  }

// Sort history newest first
  for (const group of groups.values()) {
    group.history.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

// Build cards with priority
  const cards: LearnerCard[] = [];
  for (const [learnerId, group] of groups) {
    const activeMatches = group.active ? flattenMatches(group.active) : [];
    const hasCallWindow = activeMatches.some(m => m.status === "BOOKING_REFERENCE_SHARED" && !m.completedAt);
    const hasSelfCertified = activeMatches.some(m => m.instructorSelfCertified);
    const hasAccepted = activeMatches.some(m => ["BOTH_ACCEPTED", "BOOKING_REFERENCE_CONSENT_REQUESTED"].includes(m.status));
    const hasProposed = activeMatches.some(m => ["PROPOSED", "LEARNER_A_ACCEPTED", "LEARNER_B_ACCEPTED"].includes(m.status));

    let priority: number;
    if (hasCallWindow && !hasSelfCertified) priority = 0;// urgent - confirm now
    else if (hasCallWindow && hasSelfCertified) priority = 1;// call window but learner says spoke
    else if (hasAccepted) priority = 2;// accepted match pending check
    else if (hasProposed) priority = 3;// proposed match to review
    else if (group.active?.listing.status === "PAUSED") priority = 5;// paused
    else if (group.active) priority = 4;// active, no matches
    else priority = 6;// no active listing (history only)

    cards.push({
      learnerId,
      email: group.email,
      activeLink: group.active,
      historyLinks: group.history,
      activeMatches,
      priority,
    });
  }

// Sort by priority then by email
  cards.sort((a, b) => a.priority - b.priority || a.email.localeCompare(b.email));
  return cards;
}

type InstructorDashboardData = Awaited<ReturnType<typeof getInstructorDashboardData>>;

export function InstructorOverviewSection({ data }: { data: InstructorDashboardData }) {
  const isDtc = Boolean(data.instructor.crmInstructorProfileId);

  const uniqueLearners = data.learnerCards.length;
  const activeLearners = data.learnerCards.filter((c: {priority: number}) => c.priority <= 4).length;
  const pausedLearners = data.learnerCards.filter((c: {priority: number}) => c.priority === 5).length;
  const urgentCount = data.learnerCards.filter((c: {priority: number}) => c.priority <= 2).length;

  return (
    <>
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[var(--brand)]">{isDtc ? "MoveMyTest instructor workspace" : "Independent instructor workspace"}</p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">Your MoveMyTest dashboard</h2>
        <p className="mt-3 max-w-3xl text-base leading-7 text-slate-700">
          {isDtc
            ? "MoveMyTest shows learners who have named your ADI number alongside your DTC calendar. Keep an eye on matches needing your availability — everything else is history."
            : "MoveMyTest shows learners who have named your ADI number. Review matches needing your availability — everything else is history."}
        </p>
      </div>

      {/* Alert banner */}
      <div className={`mt-8 rounded-3xl border p-5 text-sm leading-6 ${urgentCount > 0 ? "border-red-200 bg-red-50 text-red-950" : "border-emerald-200 bg-emerald-50 text-emerald-950"}`}>
        <div className="flex gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            {urgentCount > 0 ? (
              <p><strong>{urgentCount} learner{urgentCount !== 1 ? 's' : ''} need{urgentCount === 1 ? 's' : ''} your attention</strong> — check the Linked Learners page to confirm your availability for accepted matches or active DVSA call windows.</p>
            ) : (
              <p><strong>All clear.</strong> No urgent actions right now. When a learner accepts a match or enters a DVSA call window, you&apos;ll see it here.</p>
            )}
          </div>
        </div>
      </div>

      {/* Metrics row */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Learners linked" value={uniqueLearners} subtitle={`${activeLearners} active · ${pausedLearners} paused`} icon={<UsersRound className="h-5 w-5" />} />
        <MetricCard label="Needs attention" value={urgentCount} subtitle={urgentCount > 0 ? `${data.activeCallWindows} in DVSA call window` : "No action needed"} icon={<CheckCircle2 className="h-5 w-5" />} tone={urgentCount > 0 ? "red" : undefined} />
        <MetricCard label="Open matches" value={data.acceptedMatches} subtitle="Accepted or call-stage" icon={<CalendarDays className="h-5 w-5" />} />
        <MetricCard label="Support tickets" value={data.supportSummary.total} subtitle={data.supportSummary.total > 0 ? `${data.supportSummary.open} open · ${data.supportSummary.resolved} resolved` : "No tickets"} icon={<Clock className="h-5 w-5" />} />
      </div>
    </>
  );
}

export function InstructorProfileSection({ data, profileStatus }: { data: InstructorDashboardData; profileStatus?: string }) {
  const { instructor } = data;
  return (
    <section className="rounded-3xl border border-slate-300 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-950">Instructor profile and ADI management</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">Keep your MoveMyTest-only instructor profile current. ADI changes are locked once learners are linked, so learner visibility cannot be accidentally moved.</p>
        </div>
        <ProfileMessage status={profileStatus} />
      </div>
      <form action={updateMoveMyTestInstructorProfileAction} className="mt-5 grid gap-3 sm:gap-4 lg:grid-cols-5">
        <label className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">ADI number<input name="adiNumber" defaultValue={instructor.adiNumber} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium normal-case tracking-normal text-slate-900" /></label>
        <label className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">First name<input name="firstName" defaultValue={instructor.firstName} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium normal-case tracking-normal text-slate-900" /></label>
        <label className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Last name<input name="lastName" defaultValue={instructor.lastName} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium normal-case tracking-normal text-slate-900" /></label>
        <label className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Email<input type="email" name="email" defaultValue={instructor.email} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium normal-case tracking-normal text-slate-900" /></label>
        <label className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Mobile<input name="mobileNumber" defaultValue={instructor.mobileNumber ?? ""} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium normal-case tracking-normal text-slate-900" /></label>
        <div className="lg:col-span-5"><button className="w-full rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 sm:w-auto">Save profile</button></div>
      </form>
    </section>
  );
}

export function InstructorActionCentreSection({ data }: { data: InstructorDashboardData }) {
  const urgentCards = data.actionCards.filter((c: {priority: number}) => c.priority <= 2);
  const reviewCards = data.actionCards.filter((c: {priority: number}) => c.priority === 3);

  const priorityConfig: Record<number, { label: string; color: string; bg: string }> = {
    0: { label: "Action needed", color: "text-red-800", bg: "bg-red-50 border-red-200" },
    1: { label: "Call window", color: "text-amber-800", bg: "bg-amber-50 border-amber-200" },
    2: { label: "Match accepted", color: "text-orange-800", bg: "bg-orange-50 border-orange-200" },
    3: { label: "Match proposed", color: "text-blue-800", bg: "bg-blue-50 border-blue-200" },
  };

  if (!data.actionCards.length) {
    return (
      <section className="rounded-3xl border border-slate-300 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-2xl font-semibold text-slate-950">Action Centre</h2>
        <p className="mt-2 rounded-2xl bg-slate-50 p-5 text-sm text-slate-600">
          Nothing needs your attention right now. When a learner accepts a match or a DVSA call window opens, action items will appear here.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-slate-300 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-950">Action Centre</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {urgentCards.length} urgent · {reviewCards.length} to review — sorted by what needs your availability input first
          </p>
        </div>
        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
          {data.actionCards.length} need{data.actionCards.length === 1 ? 's' : ''} attention
        </span>
      </div>

      <div className="mt-5 space-y-3">
        {data.actionCards.map((card: any) => {
          const config = priorityConfig[card.priority] ?? priorityConfig[3];
          const link = card.activeLink!;
          const match = card.activeMatches[0];
          const hasSelfCertified = card.activeMatches.some((m: any) => m.instructorSelfCertified);

          return (
            <article key={card.learnerId} className={`rounded-2xl border ${config.bg} p-4`}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${config.color} bg-white/80 ring-1 ring-slate-200`}>
                      {config.label}
                    </span>
                    {hasSelfCertified && (
                      <span className="text-xs text-emerald-700">✓ Spoke to instructor</span>
                    )}
                  </div>
                  <p className="mt-1.5 font-semibold text-slate-950">{card.email}</p>
                  <p className="mt-1 text-xs text-slate-600">
                    Test: {link.listing.currentCentre.name} · {formatDateTime(link.listing.currentDateTime)}
                  </p>
                </div>
                <StatusPill status={link.listing.status} />
              </div>

              {/* Action prompt */}
              {card.priority <= 1 ? (
                <p className="mt-3 rounded-xl bg-white p-3 text-sm leading-6 text-slate-700">
                  {card.priority === 0
                    ? "DVSA call window is open — confirm you are available for the swap before the learner completes the call."
                    : "DVSA call window open. Learner says they have spoken to you. Verify when you can."}
                </p>
              ) : card.priority === 2 ? (
                <p className="mt-3 rounded-xl bg-white p-3 text-sm leading-6 text-slate-700">
                  Match accepted by both learners — confirm your availability for the new test slot.
                </p>
              ) : (
                <p className="mt-3 rounded-xl bg-white p-3 text-sm leading-6 text-slate-700">
                  New match proposed — review whether the swap slot works for your diary.
                </p>
              )}

              {/* Top match detail */}
              {match && (
                <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3 text-sm">
                  <p className="font-semibold text-slate-950">
                    {card.priority <= 2 ? "Swap to confirm: " : "Proposed swap: "}
                    {match.otherCentre}
                  </p>
                  <p className="mt-1 text-xs text-slate-600">
                    {formatDateTime(match.otherDateTime)} · Score {match.score}/100 · {humanise(match.status)}
                  </p>
                  <AvailabilityForm
                    listingInstructorId={link.id}
                    matchId={match.id}
                    slotType="PROPOSED_SWAP"
                    compact
                  />
                </div>
              )}

              {/* Current test availability */}
              <div className="mt-2">
                <AvailabilityBadge
                  label="Current test availability"
                  decision={latestAvailability(link, "CURRENT_TEST")}
                />
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export function InstructorCalendarSection({ data }: { data: InstructorDashboardData }) {
  const isDtc = Boolean(data.instructor.crmInstructorProfileId);

  return (
    <section className="rounded-3xl border border-slate-300 bg-white p-5 shadow-sm sm:p-6">
      <h2 className="text-2xl font-semibold text-slate-950">Calendar</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        {isDtc
          ? "Your unified calendar shows DTC lessons, tests, and unavailability alongside MoveMyTest current booked tests and possible swapped test slots. Visible hours are 07:00 to 20:00."
          : "Your MoveMyTest calendar shows current booked tests and possible swapped test slots linked to your ADI number. Visible hours are 07:00 to 20:00 so you can manage realistic instructor availability and spot diary clashes early."}
      </p>
      <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-slate-700">
        {isDtc && <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">DTC lessons</span>}
        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">Current booked tests</span>
        <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-blue-800">Possible swapped slots</span>
        {isDtc && <span className="rounded-full border border-slate-300/80 bg-slate-300/80 px-3 py-1 text-slate-700">Time off</span>}
        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-800">Accepted// call stage</span>
        <span className="rounded-full border border-slate-200 bg-white px-3 py-1">07:00-20:00</span>
      </div>
      <div className="mt-5"><MoveMyTestInstructorDashboardCalendar events={data.calendarEvents} /></div>
    </section>
  );
}

export function InstructorLinkedLearnersSection({ data }: { data: InstructorDashboardData }) {
  if (!data.learnerCards.length) {
    return (
      <section className="rounded-3xl border border-slate-300 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-2xl font-semibold text-slate-950">Linked Learners</h2>
        <p className="mt-2 rounded-2xl bg-slate-50 p-5 text-sm text-slate-600">
          No MoveMyTest learners are linked to your ADI number yet. Share your ADI number with your learners and ask them to enter it when creating or editing their MoveMyTest listing.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-slate-300 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-950">Linked Learners</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {data.learnerCards.length} learner{data.learnerCards.length !== 1 ? "s" : ""} linked · sorted by what needs your attention
          </p>
        </div>
      </div>

      <div className="mt-5">
        <LearnerCardsList data={data} />
      </div>
    </section>
  );
}

function MetricCard({ label, value, subtitle, icon, tone }: { label: string; value: number; subtitle?: string; icon: React.ReactNode; tone?: "red" | "amber" | "emerald" }) {
  const toneClasses = tone === "red" ? "border-red-200 bg-red-50" : tone === "amber" ? "border-amber-200 bg-amber-50" : "border-slate-200 bg-slate-50";
  return (
    <div className={`rounded-2xl border ${toneClasses} p-5`}>
      <div className="flex items-center justify-between gap-3 text-slate-600"><p className="text-sm font-medium">{label}</p>{icon}</div>
      <p className="mt-2 text-3xl font-bold text-slate-950">{value}</p>
      {subtitle ? <p className="mt-1 text-xs text-slate-500">{subtitle}</p> : null}
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  return <span className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize ${statusTone(status)}`}>{humanise(status)}</span>;
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-4"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</p><p className="mt-2 text-sm font-semibold leading-6 text-slate-950">{value}</p></div>;
}

function ProfileMessage({ status }: { status?: string }) {
  if (!status) return null;
  const messages: Record<string, { text: string; tone: string }> = {
    updated: { text: "Profile updated.", tone: "border-emerald-200 bg-emerald-50 text-emerald-800" },
    invalid: { text: "Check the profile fields and try again.", tone: "border-red-200 bg-red-50 text-red-800" },
    duplicate: { text: "That ADI number or email is already used by another instructor account.", tone: "border-red-200 bg-red-50 text-red-800" },
    "adi-locked": { text: "ADI changes are locked once learners are linked. Contact MoveMyTest support if this ADI number is wrong.", tone: "border-amber-200 bg-amber-50 text-amber-800" },
  };
  const message = messages[status];
  if (!message) return null;
  return <p className={`rounded-full border px-3 py-1 text-xs font-semibold ${message.tone}`}>{message.text}</p>;
}

function AvailabilityBadge({ label, decision }: { label: string; decision?: AvailabilityDecision }) {
  return (
    <div className={`rounded-xl border px-3 py-2 text-xs font-semibold ${availabilityTone(decision?.status)}`}>
      <p className="uppercase tracking-[0.14em] opacity-80">{label}</p>
      <p className="mt-1 capitalize">{decision ? humanise(decision.status) : "No decision recorded"}</p>
      {decision?.decidedAt ? <p className="mt-1 font-normal opacity-80">Recorded {formatDateTime(decision.decidedAt)}</p> : null}
      {decision?.note ? <p className="mt-1 font-normal opacity-90">"{decision.note}"</p> : null}
    </div>
  );
}

function AvailabilityForm({ listingInstructorId, matchId, slotType, compact = false }: { listingInstructorId: string; matchId?: string; slotType: "CURRENT_TEST" | "PROPOSED_SWAP"; compact?: boolean }) {
  return (
    <form action={recordMoveMyTestInstructorAvailabilityAction} className={`mt-3 grid gap-3 ${compact ? "" : "lg:grid-cols-[1fr_auto] lg:items-end"}`}>
      <input type="hidden" name="listingInstructorId" value={listingInstructorId} />
      <input type="hidden" name="slotType" value={slotType} />
      {matchId ? <input type="hidden" name="matchId" value={matchId} /> : null}
      <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <label className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
          Decision
          <select name="status" defaultValue="AVAILABLE" className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium normal-case tracking-normal text-slate-900">
            <option value="AVAILABLE">Available</option>
            <option value="UNAVAILABLE">Unavailable</option>
            <option value="NEEDS_DISCUSSION">Needs discussion</option>
          </select>
        </label>
        <label className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
          Optional note
          <input name="note" maxLength={1000} placeholder="e.g. Can do this slot" className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium normal-case tracking-normal text-slate-900" />
        </label>
      </div>
      <button className="w-full rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 sm:w-auto">Save availability</button>
    </form>
  );
}
