"use client";

import { useActionState, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { initialMoveMyTestActionState } from "@/features/movemytest/action-state";
import { createMoveMyTestListingAction } from "@/features/movemytest/actions";
import { DIRECTION_LABELS, TEST_TYPE_LABELS, TIME_PREFERENCE_LABELS } from "@/features/movemytest/constants";
import { lookupMoveMyTestInstructorByAdiAction } from "@/features/movemytest/instructor-actions";

function haversineDistanceMiles(lat1: number, lon1: number, lat2: number, lon2: number) {
  const earthRadiusMiles = 3959;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusMiles * c;
}

function getNearestCentres(currentCentre: CentreOption, allCentres: CentreOption[], count = 3): NearbyCentreOption[] {
  if (!currentCentre.latitude || !currentCentre.longitude) return [];

  return allCentres
    .filter((c) => c.id !== currentCentre.id && c.latitude != null && c.longitude != null)
    .map((c) => ({
      id: c.id,
      name: c.displayName,
      region: c.region ?? "",
      postcode: c.postcode,
      distanceMiles: haversineDistanceMiles(
        Number(currentCentre.latitude),
        Number(currentCentre.longitude),
        Number(c.latitude),
        Number(c.longitude)
      ),
      rank: 0, // Will be set after sorting
    }))
    .sort((a, b) => (a.distanceMiles ?? Infinity) - (b.distanceMiles ?? Infinity))
    .slice(0, count)
    .map((c, index) => ({ ...c, rank: index + 1 }));
}

type NearbyCentreOption = { id: string; name: string; region: string; postcode: string | null; distanceMiles: number | null; rank: number };
type CentreOption = {
  id: string;
  displayName: string;
  region: string | null;
  country: string | null;
  postcode: string | null;
  latitude: number | null;
  longitude: number | null;
  nearestCentres: NearbyCentreOption[];
};

function centreLabel(centre: Pick<CentreOption, "displayName" | "region">) {
  return `${centre.displayName} · ${centre.region ?? "Unknown Region"}`;
}

function SearchableCentreField({ centres, name, label, hint, required = false, onSelected, defaultValue }: { centres: CentreOption[]; name: string; label: string; hint?: string; required?: boolean; onSelected?: (centre: CentreOption | null) => void; defaultValue?: string }) {
  const [query, setQuery] = useState(defaultValue ?? "");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedCentre = useMemo(() => centres.find((centre) => centreLabel(centre) === query) ?? null, [centres, query]);

  const filtered = useMemo(() => {
    if (!query.trim() || query.trim().length < 2) return [];
    const q = query.toLowerCase();
    return centres
      .filter((c) =>
        c.displayName?.toLowerCase().includes(q) ||
        (c.region ?? "").toLowerCase().includes(q) ||
        (c.postcode ?? "").toLowerCase().includes(q)
      )
      .slice(0, 15);
  }, [query, centres]);

// Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleChange(value: string) {
    setQuery(value);
    if (value.length >= 2) setIsOpen(true);
    else setIsOpen(false);
    onSelected?.(centres.find((centre) => centreLabel(centre) === value) ?? null);
  }

  function selectCentre(centre: CentreOption) {
    const label = centreLabel(centre);
    setQuery(label);
    setIsOpen(false);
    onSelected?.(centre);
  }

  return (
    <div ref={containerRef} className="relative">
      <label className="space-y-2 text-sm font-medium text-slate-800">
        {label}
        <input
          ref={inputRef}
          value={query}
          onChange={(event) => handleChange(event.target.value)}
          required={required}
          autoComplete="off"
          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm"
          placeholder="Start typing a test centre name"
        />
      </label>
      <input type="hidden" name={name} value={selectedCentre?.id ?? ""} />
      {isOpen && filtered.length > 0 && (
        <div className="absolute z-50 mt-1 max-h-64 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg">
          {filtered.map((centre) => (
            <button
              key={centre.id}
              type="button"
              className="w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-[var(--brand)]/10 hover:text-[var(--brand-strong)]"
              onMouseDown={(e) => { e.preventDefault(); selectCentre(centre); }}
            >
              {centreLabel(centre)}
              {centre.postcode ? <span className="text-xs text-slate-400 ml-1">· {centre.postcode}</span> : null}
            </button>
          ))}
        </div>
      )}
      {isOpen && query.trim().length >= 2 && filtered.length === 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-400 shadow-lg">
          No centres found
        </div>
      )}
      {hint ? <span className="block text-xs font-normal text-slate-500">{hint}</span> : null}
      {query && !selectedCentre ? <span className="block text-xs font-normal text-amber-700">Choose one of the matching test centres from the list.</span> : null}
    </div>
  );
}

function NearbySwapCentresCard({ currentCentre, allCentres }: { currentCentre: CentreOption | null; allCentres: CentreOption[] }) {
  if (!currentCentre) {
    return (
      <div className="rounded-2xl border border-slate-300 bg-slate-50 p-5 text-sm leading-6 text-slate-600">
        Choose your current test centre above and we'll show the three closest centres that may count under the DVSA location rule from 9 June 2026.
      </div>
    );
  }

  // Compute 3 nearest centres on the fly
  const nearestCentres = getNearestCentres(currentCentre, allCentres, 3);

  return (
    <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-emerald-950">Nearby swap centres under DVSA rules</h3>
          <p className="mt-1 text-sm leading-6 text-emerald-900">From 9 June 2026, GOV.UK says swaps can only be with the same test centre, one of your three nearest test centres, or the centre you first booked at. A swap can only go ahead if the rule is met for both learners.</p>
        </div>
        <a href="https://www.gov.uk/guidance/swapping-your-driving-test-with-another-learner-driver#where-your-tests-are-booked" target="_blank" rel="noreferrer" className="shrink-0 rounded-full bg-white px-4 py-2 text-xs font-semibold text-[var(--brand-strong)] shadow-sm hover:bg-[var(--brand)] hover:!text-white">DVSA rule</a>
      </div>
      <div className="mt-5 rounded-2xl border border-emerald-300 bg-white p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Current test centre location</p>
        <p className="mt-2 font-semibold text-slate-950">{currentCentre.displayName}</p>
        <p className="text-sm text-slate-600">{currentCentre.postcode ?? "Postcode unavailable"} · {currentCentre.region}</p>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {/* Current centre itself - DVSA rule allows swaps with the same test centre */}
        <label className="block rounded-2xl border border-emerald-300 bg-white p-4 text-sm shadow-sm transition hover:border-[var(--brand)]">
          <div className="flex items-start gap-3">
            <input name="desiredCentreIds" type="checkbox" value={currentCentre.id} className="mt-1 h-4 w-4 accent-[var(--brand)]" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">Same centre</p>
              <p className="mt-1 font-semibold text-slate-950">{currentCentre.displayName}</p>
              <p className="mt-1 text-slate-600">{currentCentre.postcode ?? "Postcode unavailable"}</p>
              <p className="mt-2 text-xs font-semibold text-[var(--brand-strong)]">Same-centre swap allowed under DVSA rules</p>
            </div>
          </div>
        </label>
        {nearestCentres.length > 0 ? (
          nearestCentres.map((centre) => (
          <label key={centre.id} className="block rounded-2xl border border-emerald-300 bg-white p-4 text-sm shadow-sm transition hover:border-[var(--brand)]">
            <div className="flex items-start gap-3">
              <input name="desiredCentreIds" type="checkbox" value={centre.id} className="mt-1 h-4 w-4 accent-[var(--brand)]" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">Nearest #{centre.rank}</p>
                <p className="mt-1 font-semibold text-slate-950">{centre.name}</p>
                <p className="mt-1 text-slate-600">{centre.postcode ?? "Postcode unavailable"}</p>
                <p className="mt-2 text-xs font-semibold text-[var(--brand-strong)]">{centre.distanceMiles ? `About ${centre.distanceMiles.toFixed(1)} miles away` : "Nearest-centre match"}</p>
              </div>
            </div>
          </label>
        ))) : null}
      </div>
      <p className="mt-4 text-xs leading-5 text-emerald-900">Tick any nearby centres you would consider, or choose other acceptable centres from the full list below. Always check the final swap still meets the DVSA rule for both learners.</p>
    </section>
  );
}

function InstructorDetailsBox({ prefillAdiNumber }: { prefillAdiNumber?: string }) {
  const [hasInstructor, setHasInstructor] = useState<string | null>(prefillAdiNumber ? "yes" : null);
  const [knowsDetails, setKnowsDetails] = useState<string | null>(prefillAdiNumber ? "yes" : null);
  const [lookupState, lookupAction, lookupPending] = useActionState(lookupMoveMyTestInstructorByAdiAction, { status: "idle" } as const);
  const [lookupTransitionPending, startLookupTransition] = useTransition();
  const adiInputRef = useRef<HTMLInputElement>(null);
  const lookupIsPending = lookupPending || lookupTransitionPending;
  const [adiNumber, setAdiNumber] = useState(prefillAdiNumber ?? "");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (lookupState.status !== "found") return;
    setFirstName(lookupState.assignedInstructor.firstName);
    setLastName(lookupState.assignedInstructor.lastName);
    setMobileNumber(lookupState.assignedInstructor.mobileNumber ?? "");
    setEmail(lookupState.assignedInstructor.email);
  }, [lookupState]);

// Auto-lookup if ADI was pre-filled (invited learner)
  useEffect(() => {
    if (!prefillAdiNumber) return;
    const fd = new FormData();
    fd.set("instructorAdiNumber", prefillAdiNumber);
    startLookupTransition(() => lookupAction(fd));
// eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleLookupClick() {
    const formData = new FormData();
    formData.set("instructorAdiNumber", adiInputRef.current?.value ?? adiNumber);
    startLookupTransition(() => lookupAction(formData));
  }

  if (hasInstructor === null) {
    return (
      <section className="space-y-4 rounded-2xl border border-slate-300 bg-white p-5">
        <h2 className="text-xl font-semibold text-slate-950">Instructor</h2>
        <p className="text-sm leading-6 text-slate-600">
          Linking your instructor lets them see your test swap request and respond. You can still create a listing without one and add an instructor later.
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setHasInstructor("yes")}
            className="rounded-full border border-[var(--brand)] bg-white px-5 py-3 text-sm font-semibold text-[var(--brand-strong)] transition hover:bg-[var(--brand)] hover:text-white"
          >
            Yes, I have an instructor
          </button>
          <button
            type="button"
            onClick={() => setHasInstructor("no")}
            className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            No, I don't have one
          </button>
        </div>
      </section>
    );
  }

  if (hasInstructor === "no") {
    return (
      <section className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <h2 className="text-xl font-semibold text-slate-950">Instructor</h2>
        <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
          <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-600">✓</span>
          <p>You don't have an instructor listed. You can still create your listing and add one later from your dashboard if you get one.</p>
        </div>
        <button
          type="button"
          onClick={() => { setHasInstructor(null); setKnowsDetails(null); }}
          className="text-sm font-semibold text-[var(--brand)] underline"
        >
          Change my answer
        </button>
      </section>
    );
  }

// hasInstructor === "yes"
  if (knowsDetails === null) {
    return (
      <section className="space-y-4 rounded-2xl border border-slate-300 bg-white p-5">
        <h2 className="text-xl font-semibold text-slate-950">Instructor</h2>
        <p className="text-sm leading-6 text-slate-600">
          Do you know your instructor's email address or ADI number?
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setKnowsDetails("yes")}
            className="rounded-full border border-[var(--brand)] bg-white px-5 py-3 text-sm font-semibold text-[var(--brand-strong)] transition hover:bg-[var(--brand)] hover:text-white"
          >
            Yes, I know their details
          </button>
          <button
            type="button"
            onClick={() => setKnowsDetails("no")}
            className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            No, I don't know them yet
          </button>
        </div>
        <button
          type="button"
          onClick={() => { setHasInstructor(null); setKnowsDetails(null); }}
          className="text-sm font-semibold text-slate-500 underline"
        >
          Go back
        </button>
      </section>
    );
  }

  if (knowsDetails === "no") {
    return (
      <section className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <h2 className="text-xl font-semibold text-slate-950">Instructor</h2>
        <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
          <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-700">!</span>
          <p>You have an instructor but don't have their details yet. You can still create your listing and add their details later from your dashboard.</p>
        </div>
        {/* Hidden field so server knows there's an instructor but no details */}
        <input type="hidden" name="hasInstructor" value="yes" />
        <input type="hidden" name="knowsInstructorDetails" value="no" />
        <button
          type="button"
          onClick={() => { setHasInstructor("yes"); setKnowsDetails(null); }}
          className="text-sm font-semibold text-[var(--brand)] underline"
        >
          I found their details
        </button>
      </section>
    );
  }

// knowsDetails === "yes" — show the full detail entry form
  const isPreFilled = Boolean(prefillAdiNumber);
  return (
    <section className="space-y-4 rounded-2xl border border-slate-300 bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-950">Instructor details</h2>
          {isPreFilled ? (
            <p className="mt-2 text-sm leading-6 text-slate-600">Your instructor is linked from a previous listing or invite. To remove this instructor, use the Instructor page in your dashboard.</p>
          ) : (
            <p className="mt-2 text-sm leading-6 text-slate-600">Enter what you know. If they are registered with MoveMyTest, we&apos;ll fill details automatically when you check their ADI number.</p>
          )}
        </div>
        {!isPreFilled && (
          <button
            type="button"
            onClick={() => { setHasInstructor("yes"); setKnowsDetails(null); }}
            className="shrink-0 text-xs font-semibold text-slate-500 underline"
          >
            Change
          </button>
        )}
      </div>

      <input type="hidden" name="hasInstructor" value="yes" />
      <input type="hidden" name="knowsInstructorDetails" value="yes" />

      <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
        <label className="space-y-2 text-sm font-medium text-slate-800">
          ADI number (if you know it)
          <input ref={adiInputRef} name="instructorAdiNumber" type="text" value={adiNumber} onChange={(event) => setAdiNumber(event.target.value.toUpperCase())} className="w-full rounded-xl border border-slate-300 px-3 py-3 text-sm uppercase" placeholder="e.g. ADI123456" />
        </label>
        <button type="button" onClick={handleLookupClick} disabled={lookupIsPending} className="rounded-full border border-[var(--brand)] bg-white px-5 py-3 text-sm font-semibold text-[var(--brand-strong)] transition hover:bg-[var(--brand)] hover:text-white disabled:opacity-60">
          {lookupIsPending ? "Checking..." : "Check ADI"}
        </button>
      </div>
      {lookupState.status === "found" ? <p className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-950">Registered instructor found. Details have been filled from MoveMyTest instructor record.</p> : null}
      {lookupState.status === "not_found" || lookupState.status === "error" ? <p className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-900">{lookupState.message}</p> : null}

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm font-medium text-slate-800">
          Instructor first name
          <input name="instructorFirstName" type="text" value={firstName} onChange={(event) => setFirstName(event.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-3 text-sm" />
        </label>
        <label className="space-y-2 text-sm font-medium text-slate-800">
          Instructor last name
          <input name="instructorLastName" type="text" value={lastName} onChange={(event) => setLastName(event.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-3 text-sm" />
        </label>
        <label className="space-y-2 text-sm font-medium text-slate-800">
          Instructor mobile number
          <input name="instructorMobileNumber" type="tel" value={mobileNumber} onChange={(event) => setMobileNumber(event.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-3 text-sm" />
        </label>
        <label className="space-y-2 text-sm font-medium text-slate-800">
          Instructor email address
          <input name="instructorEmail" type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-3 text-sm" />
        </label>
      </div>

      <div className="space-y-3 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
        <label className="flex gap-3"><input name="instructorPermission" type="checkbox" /> <span>I confirm I have permission from my instructor to use these details for this MoveMyTest listing.</span></label>
        <label className="flex gap-3"><input name="instructorAvailabilityCheck" type="checkbox" /> <span>I confirm I have checked, or will check before accepting a swap, that my instructor is available for the test date, time, and centre.</span></label>
      </div>
    </section>
  );
}

export function MoveMyTestListingForm({ centres, prefillCentre, prefillAdiNumber }: { centres: CentreOption[]; prefillCentre?: string; prefillAdiNumber?: string }) {
  const prefilledCentre = prefillCentre ? centres.find((c) => c.displayName === prefillCentre) ?? null : null;
  const [state, action, pending] = useActionState(createMoveMyTestListingAction, initialMoveMyTestActionState);
  const [currentCentre, setCurrentCentre] = useState<CentreOption | null>(prefilledCentre);
  const [currentDate, setCurrentDate] = useState("");
  const [currentTime, setCurrentTime] = useState("");
  const [desiredFrom, setDesiredFrom] = useState("");
  const [desiredTo, setDesiredTo] = useState("");
  const [autoDirection, setAutoDirection] = useState<string>("EITHER");

  useEffect(() => {
    if (!currentDate || !desiredFrom || !desiredTo) return;
    const current = new Date(`${currentDate}T${currentTime || "00:00"}`).getTime();
    const from = new Date(`${desiredFrom}T00:00`).getTime();
    const to = new Date(`${desiredTo}T23:59`).getTime();
    if (to < current) {
      setAutoDirection("EARLIER");
    } else if (from > current) {
      setAutoDirection("LATER");
    } else {
      setAutoDirection("EITHER");
    }
  }, [currentDate, currentTime, desiredFrom, desiredTo]);

  return (
    <form action={action} className="space-y-8 rounded-3xl border border-slate-300 bg-white p-5 shadow-sm sm:p-8">
      {state.status === "error" ? <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{state.message}</div> : null}

      <section className="space-y-4 rounded-2xl border border-slate-300 bg-slate-50 p-5">
        <h2 className="text-xl font-semibold text-slate-950">Where is your test?</h2>
        <SearchableCentreField centres={centres} name="currentCentreId" label="Current test centre" required hint="Choose the test centre shown on your DVSA booking confirmation." onSelected={setCurrentCentre} />
        <SearchableCentreField centres={centres} name="originalCentreId" label="First-booked/original centre, if known" hint="Leave blank if you are not sure or it is the same as your current centre." />
      </section>

      <section className="space-y-4 rounded-2xl border border-slate-300 bg-white p-5">
        <h2 className="text-xl font-semibold text-slate-950">When is your test?</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm font-medium text-slate-800">
            Current test date
            <input name="currentDate" type="date" required value={currentDate} onChange={(event) => setCurrentDate(event.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-3 text-sm" />
          </label>
          <label className="space-y-2 text-sm font-medium text-slate-800">
            Current test time
            <input name="currentTime" type="time" required value={currentTime} onChange={(event) => setCurrentTime(event.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-3 text-sm" />
          </label>
        </div>
        <label className="space-y-2 text-sm font-medium text-slate-800">
          Test type/category
          <select name="testType" required className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm">
            {Object.entries(TEST_TYPE_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
      </section>

      <section className="space-y-4 rounded-2xl border border-slate-300 bg-slate-50 p-5">
        <h2 className="text-xl font-semibold text-slate-950">DVSA booking reference</h2>
        <label className="space-y-2 text-sm font-medium text-slate-800">
          Booking reference - optional but recommended
          <input name="bookingReference" type="text" inputMode="text" maxLength={40} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm" placeholder="Found in your DVSA booking confirmation email" />
        </label>
        <p className="text-sm leading-6 text-slate-600">Found in your DVSA booking confirmation email. Needed to complete the DVSA swap call - you can add it now or later.</p>
        <p className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold leading-6 text-emerald-950">Encrypted and only shared when both parties confirm a swap.</p>
      </section>

      <InstructorDetailsBox prefillAdiNumber={prefillAdiNumber} />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-950">What you would consider</h2>
        <NearbySwapCentresCard currentCentre={currentCentre} allCentres={centres} />
        <div className="grid gap-4 md:grid-cols-3">
          <label className="space-y-2 text-sm font-medium text-slate-800">
            From date
            <input name="desiredDateFrom" type="date" required value={desiredFrom} onChange={(event) => setDesiredFrom(event.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-3 text-sm" />
          </label>
          <label className="space-y-2 text-sm font-medium text-slate-800">
            To date
            <input name="desiredDateTo" type="date" required value={desiredTo} onChange={(event) => setDesiredTo(event.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-3 text-sm" />
          </label>
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-800">Direction</p>
            <input type="hidden" name="desiredDirection" value={autoDirection} />
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm">
              <span className="font-semibold text-[var(--brand)]">{DIRECTION_LABELS[autoDirection as keyof typeof DIRECTION_LABELS]}</span>
              <span className="text-xs text-slate-500">(auto)</span>
            </div>
          </div>
        </div>
        <label className="space-y-2 text-sm font-medium text-slate-800">
          Time preference
          <select name="desiredTimePreference" className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm">
            {Object.entries(TIME_PREFERENCE_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
        <label className="space-y-2 text-sm font-medium text-slate-800">
          Other centres you would consider
          <select name="desiredCentreIds" multiple size={8} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm">
            {centres.map((centre) => <option key={centre.id} value={centre.id}>{centreLabel(centre)}</option>)}
          </select>
          <span className="block text-xs font-normal text-slate-500">Hold Command/Ctrl to choose more than one centre. You can also tick nearby centres above.</span>
        </label>
      </section>

      <section className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm font-semibold leading-6 text-red-900">
        <h2 className="text-base font-bold">Double-check everything.</h2>
        <p className="mt-2">Your test centre, date, and time must match your DVSA booking exactly. Mismatches will cause your swap to fail.</p>
      </section>

      <section className="space-y-3 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
        <label className="flex gap-3"><input name="hasRemainingChange" type="checkbox" required /> <span>I have at least 1 of my 2 allowed changes remaining.</span></label>
        <label className="flex gap-3"><input name="complianceOwnTest" type="checkbox" required /> <span>This is my own car driving test booking.</span></label>
        <label className="flex gap-3"><input name="complianceDvsaPhone" type="checkbox" required /> <span>I understand MoveMyTest only helps find a potential match; the official swap must be completed by phone with DVSA.</span></label>
        <label className="flex gap-3"><input name="complianceNoSensitiveSharing" type="checkbox" required /> <span>I will not share driving licence numbers, card details, home address, theory certificate details or GOV.UK login details with another learner.</span></label>
      </section>

      <button disabled={pending} className="rounded-full bg-[var(--brand)] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--brand-strong)] disabled:opacity-60">
        {pending ? "Creating listing..." : "Create free test swap listing"}
      </button>
    </form>
  );
}
