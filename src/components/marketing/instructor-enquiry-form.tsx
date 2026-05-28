"use client";

import { useState } from "react";
import { trackInstructorApply } from "@/lib/analytics/events";

const instructorStatuses = [
  { value: "qualified_adi", label: "I am a qualified ADI (green badge holder)" },
  { value: "trainee", label: "I am a trainee instructor (working towards my ADI qualification)" },
  { value: "exploring", label: "I am exploring becoming a driving instructor and want to learn more" },
];

const lessonTypes = [
  { value: "manual", label: "Manual" },
  { value: "automatic", label: "Automatic" },
  { value: "both", label: "Both manual and automatic" },
];

const areas = [
  "Edinburgh",
  "Musselburgh",
  "Dalkeith",
  "Currie",
  "Dunfermline",
  "Dumfries",
  "Dunbar",
  "Lockerbie",
  "Penicuik",
  "Other",
];

type FormState = "idle" | "submitting" | "success" | "error";

export function InstructorEnquiryForm() {
  const [state, setState] = useState<FormState>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("submitting");

    const form = e.currentTarget;
    const data = new FormData(form);

    if (data.get("honeypot")) {
      setState("idle");
      return;
    }

    try {
      const res = await fetch("/api/instructor-enquiry", {
        method: "POST",
        body: JSON.stringify({
          firstName: data.get("firstName"),
          lastName: data.get("lastName"),
          email: data.get("email"),
          phone: data.get("phone"),
          instructorStatus: data.get("instructorStatus"),
          area: data.get("area"),
          lessonType: data.get("lessonType"),
          adiNumber: data.get("adiNumber"),
          hasCar: data.get("hasCar"),
          message: data.get("message"),
        }),
        headers: { "Content-Type": "application/json" },
      });

      const result = await res.json();

      if (res.ok && result.success) {
        setState("success");
        form.reset();
        trackInstructorApply();
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
        <p className="mt-2 text-sm text-emerald-700">Your instructor enquiry has been received. We&apos;ll be in touch shortly to discuss next steps.</p>
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
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-slate-700">
            First name
          </label>
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
          <label htmlFor="lastName" className="block text-sm font-medium text-slate-700">
            Last name
          </label>
          <input
            id="lastName"
            name="lastName"
            type="text"
            required
            className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 shadow-sm transition focus:border-[var(--brand)] focus:outline-none focus:ring-1 focus:ring-[var(--brand)]"
            placeholder="Your last name"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-700">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 shadow-sm transition focus:border-[var(--brand)] focus:outline-none focus:ring-1 focus:ring-[var(--brand)]"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-slate-700">
            Phone number
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            required
            className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 shadow-sm transition focus:border-[var(--brand)] focus:outline-none focus:ring-1 focus:ring-[var(--brand)]"
            placeholder="07700 900000"
          />
        </div>
      </div>

      <fieldset>
        <legend className="block text-sm font-medium text-slate-700">Which best describes you?</legend>
        <div className="mt-3 space-y-3">
          {instructorStatuses.map((status) => (
            <label key={status.value} className="flex items-start gap-3">
              <input
                type="radio"
                name="instructorStatus"
                value={status.value}
                required
                className="mt-0.5 accent-[var(--brand)]"
              />
              <span className="text-sm text-slate-700">{status.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor="area" className="block text-sm font-medium text-slate-700">
          Where would you like to work?
        </label>
        <select
          id="area"
          name="area"
          required
          className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 shadow-sm transition focus:border-[var(--brand)] focus:outline-none focus:ring-1 focus:ring-[var(--brand)]"
        >
          <option value="">Select your preferred area</option>
          {areas.map((area) => (
            <option key={area} value={area}>{area}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="lessonType" className="block text-sm font-medium text-slate-700">
          What type of lessons can you offer?
        </label>
        <div className="mt-2 flex flex-wrap gap-4">
          {lessonTypes.map((type) => (
            <label key={type.value} className="flex items-center gap-2">
              <input
                type="radio"
                name="lessonType"
                value={type.value}
                defaultChecked={type.value === "both"}
                className="accent-[var(--brand)]"
              />
              <span className="text-sm text-slate-700">{type.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="adiNumber" className="block text-sm font-medium text-slate-700">
          ADI or trainee licence number <span className="text-slate-400">(if you have one)</span>
        </label>
        <input
          id="adiNumber"
          name="adiNumber"
          type="text"
          className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 shadow-sm transition focus:border-[var(--brand)] focus:outline-none focus:ring-1 focus:ring-[var(--brand)]"
          placeholder="e.g. ADI 123456"
        />
      </div>

      <div>
        <label htmlFor="hasCar" className="block text-sm font-medium text-slate-700">
          Do you have your own car for instruction?
        </label>
        <div className="mt-2 flex flex-wrap gap-4">
          <label className="flex items-center gap-2">
            <input type="radio" name="hasCar" value="yes" defaultChecked className="accent-[var(--brand)]" />
            <span className="text-sm text-slate-700">Yes, I have my own car</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" name="hasCar" value="no" className="accent-[var(--brand)]" />
            <span className="text-sm text-slate-700">No, I do not</span>
          </label>
        </div>
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium text-slate-700">
          Tell us a bit about yourself <span className="text-slate-400">(optional)</span>
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 shadow-sm transition focus:border-[var(--brand)] focus:outline-none focus:ring-1 focus:ring-[var(--brand)]"
          placeholder="Any details about your experience, availability, or what you are looking for..."
        />
      </div>

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