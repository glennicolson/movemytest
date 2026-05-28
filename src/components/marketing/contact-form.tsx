"use client";

import { useState } from "react";
import { trackEnquirySubmitted } from "@/lib/analytics/events";

type FormState = "idle" | "submitting" | "success" | "error";

const titles = ["Mr", "Mrs", "Miss", "Ms"] as const;

const licenceOptions = [
  "Provisional Licence",
  "Full UK Licence",
  "Full EU Licence",
  "None of the above",
] as const;

const theoryOptions = ["YES", "NO", "Booked"] as const;

const practicalOptions = ["YES", "NO", "Extended Test"] as const;

const experienceOptions = [
  "Complete Beginner",
  "Had a few lessons",
  "Nearing test standard",
  "Test standard",
  "Failed test",
  "Passed test (refresher)",
] as const;

const dayOptions = [
  "Monday before 4pm",
  "Tuesday before 4pm",
  "Wednesday before 4pm",
  "Thursday before 4pm",
  "Friday before 4pm",
  "Evening & Weekends",
] as const;

const serviceOptions = [
  "Manual Driving Lessons",
  "Automatic Driving Lessons",
  "Extended Test Training",
  "Refresher Training",
  "Motorway Training",
  "Pass Plus",
] as const;

const hearAboutOptions = [
  "Google",
  "Bing",
  "Yahoo",
  "Facebook",
  "Saw Our Cars",
  "My Friend",
  "Yell.com",
  "The BT Phonebook",
  "Chat GPT",
] as const;

export function ContactForm() {
  const [state, setState] = useState<FormState>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [practicalBooked, setPracticalBooked] = useState<string>("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("submitting");

    const form = e.currentTarget;
    const data = new FormData(form);

    if (data.get("honeypot")) {
      setState("idle");
      return;
    }

// Collect checked days
    const days = dayOptions.filter((day) => data.get(`day_${day}`) === "on");

    try {
      const res = await fetch("/api/enquiry", {
        method: "POST",
        body: JSON.stringify({
          title: data.get("title"),
          firstName: data.get("firstName"),
          lastName: data.get("lastName"),
          dateOfBirth: data.get("dateOfBirth"),
          phone: data.get("phone"),
          homePhone: data.get("homePhone"),
          addressStreet: data.get("addressStreet"),
          addressCity: data.get("addressCity"),
          postcode: data.get("postcode"),
          email: data.get("email"),
          licenceHeld: data.get("licenceHeld"),
          theoryTestPassed: data.get("theoryTestPassed"),
          practicalTestBooked: data.get("practicalTestBooked"),
          practicalTestDetail: data.get("practicalTestDetail"),
          previousExperience: data.get("previousExperience"),
          daysAvailable: days.join(", "),
          specialRequirements: data.get("specialRequirements"),
          serviceRequired: data.get("serviceRequired"),
          hearAboutUs: data.get("hearAboutUs"),
          notes: data.get("notes"),
        }),
        headers: { "Content-Type": "application/json" },
      });

      const result = await res.json();

      if (res.ok && result.success) {
        setState("success");
        form.reset();
        setPracticalBooked("");
        trackEnquirySubmitted();
      } else {
        setState("error");
        setErrorMessage(result.message || "Something went wrong. Please try again or call us on 0800 011 2122.");
      }
    } catch {
      setState("error");
      setErrorMessage("Something went wrong. Please try again or call us on 0800 011 2122.");
    }
  }

  if (state === "success") {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
        <p className="text-lg font-semibold text-emerald-800">Thank you!</p>
        <p className="mt-2 text-sm text-emerald-700">
          Your enquiry has been received. We&apos;ll be in touch with you shortly.
        </p>
        <button
          type="button"
          onClick={() => setState("idle")}
          className="mt-4 rounded-lg border border-emerald-300 px-4 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-100"
        >
          Send another enquiry
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title + Name */}
      <div className="grid gap-6 sm:grid-cols-3">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-slate-700">Title</label>
          <select
            id="title"
            name="title"
            required
            className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 shadow-sm transition focus:border-[var(--brand)] focus:outline-none focus:ring-1 focus:ring-[var(--brand)]"
          >
            <option value="">Please select</option>
            {titles.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-slate-700">First Name</label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            required
            className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 shadow-sm transition focus:border-[var(--brand)] focus:outline-none focus:ring-1 focus:ring-[var(--brand)]"
            placeholder="Your first name"
          />
        </div>
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-slate-700">Last Name</label>
          <input
            id="lastName"
            name="lastName"
            type="text"
            required
            className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 shadow-sm transition focus:border-[var(--brand)] focus:outline-none focus:ring-1 focus:ring-[var(--brand)]"
            placeholder="Your last name"
          />
        </div>
      </div>

      {/* Date of Birth + Phones */}
      <div className="grid gap-6 sm:grid-cols-3">
        <div>
          <label htmlFor="dateOfBirth" className="block text-sm font-medium text-slate-700">Date Of Birth</label>
          <input
            id="dateOfBirth"
            name="dateOfBirth"
            type="text"
            required
            placeholder="DD/MM/YYYY"
            className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 shadow-sm transition focus:border-[var(--brand)] focus:outline-none focus:ring-1 focus:ring-[var(--brand)]"
          />
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-slate-700">Mobile Telephone Number</label>
          <input
            id="phone"
            name="phone"
            type="tel"
            required
            className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 shadow-sm transition focus:border-[var(--brand)] focus:outline-none focus:ring-1 focus:ring-[var(--brand)]"
            placeholder="07700 900000"
          />
        </div>
        <div>
          <label htmlFor="homePhone" className="block text-sm font-medium text-slate-700">Home Telephone Number <span className="text-slate-400">(optional)</span></label>
          <input
            id="homePhone"
            name="homePhone"
            type="tel"
            className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 shadow-sm transition focus:border-[var(--brand)] focus:outline-none focus:ring-1 focus:ring-[var(--brand)]"
            placeholder="01xxx xxxxxx"
          />
        </div>
      </div>

      {/* Address */}
      <div className="grid gap-6 sm:grid-cols-3">
        <div>
          <label htmlFor="addressStreet" className="block text-sm font-medium text-slate-700">House Name/Number &amp; Street</label>
          <input
            id="addressStreet"
            name="addressStreet"
            type="text"
            required
            className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 shadow-sm transition focus:border-[var(--brand)] focus:outline-none focus:ring-1 focus:ring-[var(--brand)]"
            placeholder="1 High Street"
          />
        </div>
        <div>
          <label htmlFor="addressCity" className="block text-sm font-medium text-slate-700">City <span className="text-slate-400">(optional)</span></label>
          <input
            id="addressCity"
            name="addressCity"
            type="text"
            className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 shadow-sm transition focus:border-[var(--brand)] focus:outline-none focus:ring-1 focus:ring-[var(--brand)]"
            placeholder="Edinburgh"
          />
        </div>
        <div>
          <label htmlFor="postcode" className="block text-sm font-medium text-slate-700">Postcode</label>
          <input
            id="postcode"
            name="postcode"
            type="text"
            required
            className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 shadow-sm transition focus:border-[var(--brand)] focus:outline-none focus:ring-1 focus:ring-[var(--brand)]"
            placeholder="EH1 1AA"
          />
        </div>
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-slate-700">E-mail</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 shadow-sm transition focus:border-[var(--brand)] focus:outline-none focus:ring-1 focus:ring-[var(--brand)]"
          placeholder="you@example.com"
        />
      </div>

      {/* Licence + Theory + Practical */}
      <div className="grid gap-6 sm:grid-cols-3">
        <fieldset>
          <legend className="block text-sm font-medium text-slate-700">Licence Held?</legend>
          <div className="mt-2 space-y-2">
            {licenceOptions.map((opt) => (
              <label key={opt} className="flex items-center gap-2">
                <input type="radio" name="licenceHeld" value={opt} required className="accent-[var(--brand)]" />
                <span className="text-sm text-slate-700">{opt}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend className="block text-sm font-medium text-slate-700">Passed Theory Test?</legend>
          <div className="mt-2 space-y-2">
            {theoryOptions.map((opt) => (
              <label key={opt} className="flex items-center gap-2">
                <input type="radio" name="theoryTestPassed" value={opt} required className="accent-[var(--brand)]" />
                <span className="text-sm text-slate-700">{opt === "YES" ? "Yes" : opt === "NO" ? "No" : opt}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend className="block text-sm font-medium text-slate-700">Practical Test Booked?</legend>
          <div className="mt-2 space-y-2">
            {practicalOptions.map((opt) => (
              <label key={opt} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="practicalTestBooked"
                  value={opt}
                  required
                  className="accent-[var(--brand)]"
                  onChange={(e) => setPracticalBooked(e.target.value)}
                />
                <span className="text-sm text-slate-700">
                  {opt === "YES" ? "Yes" : opt === "NO" ? "No" : opt}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      {/* Practical test detail (conditional) */}
      {practicalBooked === "YES" || practicalBooked === "Extended Test" ? (
        <div>
          <label htmlFor="practicalTestDetail" className="block text-sm font-medium text-slate-700">
            Practical test date, time and location
          </label>
          <input
            id="practicalTestDetail"
            name="practicalTestDetail"
            type="text"
            required
            className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 shadow-sm transition focus:border-[var(--brand)] focus:outline-none focus:ring-1 focus:ring-[var(--brand)]"
            placeholder="e.g. 15th June 2026, 9:30am, Edinburgh Musselburgh Test Centre"
          />
        </div>
      ) : null}

      {/* Previous Experience */}
      <div>
        <label htmlFor="previousExperience" className="block text-sm font-medium text-slate-700">Previous experience</label>
        <select
          id="previousExperience"
          name="previousExperience"
          required
          className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 shadow-sm transition focus:border-[var(--brand)] focus:outline-none focus:ring-1 focus:ring-[var(--brand)]"
        >
          <option value="">Please select</option>
          {experienceOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      </div>

      {/* Days Available */}
      <fieldset>
        <legend className="block text-sm font-medium text-slate-700">Days Available</legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {dayOptions.map((day) => (
            <label key={day} className="flex items-center gap-2">
              <input type="checkbox" name={`day_${day}`} className="accent-[var(--brand)]" />
              <span className="text-sm text-slate-700">{day}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* Special Requirements */}
      <div>
        <label htmlFor="specialRequirements" className="block text-sm font-medium text-slate-700">
          Special requirements <span className="text-slate-400">(e.g. shift worker)</span>
        </label>
        <input
          id="specialRequirements"
          name="specialRequirements"
          type="text"
          className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 shadow-sm transition focus:border-[var(--brand)] focus:outline-none focus:ring-1 focus:ring-[var(--brand)]"
          placeholder="Any special requirements..."
        />
      </div>

      {/* Service + Hear About Us */}
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="serviceRequired" className="block text-sm font-medium text-slate-700">Which service do you need?</label>
          <select
            id="serviceRequired"
            name="serviceRequired"
            required
            className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 shadow-sm transition focus:border-[var(--brand)] focus:outline-none focus:ring-1 focus:ring-[var(--brand)]"
          >
            <option value="">Please select</option>
            {serviceOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="hearAboutUs" className="block text-sm font-medium text-slate-700">Where did you hear about us?</label>
          <select
            id="hearAboutUs"
            name="hearAboutUs"
            required
            className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 shadow-sm transition focus:border-[var(--brand)] focus:outline-none focus:ring-1 focus:ring-[var(--brand)]"
          >
            <option value="">Please select</option>
            {hearAboutOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>
      </div>

      {/* Additional Information */}
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-slate-700">
          Any additional information <span className="text-slate-400">(optional)</span>
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={4}
          className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 shadow-sm transition focus:border-[var(--brand)] focus:outline-none focus:ring-1 focus:ring-[var(--brand)]"
          placeholder="Anything else you'd like to tell us..."
        />
      </div>

      {/* Honeypot */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="honeypot">Do not fill this out</label>
        <input id="honeypot" name="honeypot" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <button
        type="submit"
        disabled={state === "submitting"}
        className="rounded-lg bg-[var(--brand)] px-6 py-3 text-base font-semibold !text-white shadow-sm transition hover:bg-[var(--brand-strong)] hover:!text-white visited:!text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {state === "submitting" ? "Sending..." : "Submit Enquiry"}
      </button>

      {state === "error" ? (
        <p className="text-sm font-medium text-rose-700">{errorMessage}</p>
      ) : null}
    </form>
  );
}