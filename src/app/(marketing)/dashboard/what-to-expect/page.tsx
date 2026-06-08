import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { requireMoveMyTestSession } from "@/features/movemytest/session";
import { getLearnerMoveMyTestDashboard } from "@/features/movemytest/queries";
import { ArrowRight, BellRing, Clock, FileText, Heart, MapPin, Phone, Shield, Activity, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "What to Expect — MoveMyTest",
  robots: { index: false, follow: false },
};

export default async function WhatToExpectPage() {
  const session = await requireMoveMyTestSession("/dashboard");
  const { listing } = await getLearnerMoveMyTestDashboard(session.accountId);

  const menuItems = [
    {
      icon: Activity,
      label: "Overview",
      href: "/dashboard",
      description: "Your main dashboard. See your listing status, current test details, desired swap dates and any active matches.",
    },
    {
      icon: MapPin,
      label: "Instructor",
      href: "/dashboard/instructor",
      description: "Link or update your driving instructor. Your instructor can see your listing and help manage swap decisions.",
    },
    {
      icon: Clock,
      label: "Queue Status",
      href: "/dashboard/queue",
      description: "See where your listing sits in the matching queue and how many other learners are looking for similar slots.",
    },
    {
      icon: BellRing,
      label: "My Match",
      href: "/dashboard/matches",
      description: "When MoveMyTest finds a compatible learner, your match appears here. Review the details and choose to accept or decline.",
    },
    {
      icon: Phone,
      label: "Call DVSA",
      href: "/dashboard/call-dvsa",
      description: "Step-by-step guide for the official DVSA phone swap. Only appears when both learners have agreed to a match.",
    },
    {
      icon: FileText,
      label: "Swap History",
      href: "/dashboard/history",
      description: "A record of all your past listings and matches, including completed and cancelled swaps.",
    },
    {
      icon: Shield,
      label: "Account",
      href: "/dashboard/account",
      description: "Update your email, mobile number and notification preferences.",
    },
    {
      icon: Activity,
      label: "Support",
      href: "/dashboard/support",
      description: "Send a message to MoveMyTest if something looks wrong, you need help with a match, or you cannot complete the DVSA call.",
    },
    {
      icon: Heart,
      label: "Support Us",
      href: "/dashboard/support-us",
      description: "MoveMyTest is free. Learn how you can support the service and help other learners.",
    },
    {
      icon: Shield,
      label: "Security",
      href: "/dashboard/security",
      description: "Manage multi-factor authentication, backup codes and security settings for your account.",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Status banner — copy and color depend on the listing's current state.
          Previously this was hardcoded to "Your listing is live" for any
          non-null listing, which produced a confusing mismatch with the
          /dashboard overview showing the same listing as COMPLETED. */}
      {(() => {
        if (!listing) return null;
        const status = listing.status;
        const centre = listing.currentCentre?.name;
        const dateStr = listing.currentDateTime?.toLocaleDateString("en-GB", {
          dateStyle: "medium",
          timeZone: "UTC",
        });

        if (status === "ACTIVE") {
          return (
            <section className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 shadow-sm">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-emerald-600" />
                <div>
                  <h2 className="text-xl font-semibold text-emerald-950">Your listing is live</h2>
                  <p className="mt-1 text-sm leading-6 text-emerald-900">
                    Your test swap listing for <strong>{centre}</strong> on <strong>{dateStr}</strong> has been created successfully.
                  </p>
                  <p className="mt-3 text-sm leading-6 text-emerald-900">
                    You can edit your listing at any time from the Overview page. MoveMyTest will email you when a compatible match is found.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <Link href="/dashboard" className="dashboard-button inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold shadow-sm transition">
                      Go to Overview <ArrowRight className="h-4 w-4" />
                    </Link>
                    <Link href="/dashboard/edit" className="edit-listing-button inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:border-[var(--brand)]">
                      Edit my listing
                    </Link>
                  </div>
                </div>
              </div>
            </section>
          );
        }

        if (status === "PAUSED") {
          return (
            <section className="rounded-3xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-amber-600" />
                <div>
                  <h2 className="text-xl font-semibold text-amber-950">Your listing is paused</h2>
                  <p className="mt-1 text-sm leading-6 text-amber-900">
                    Your test swap listing for <strong>{centre}</strong> on <strong>{dateStr}</strong> is currently paused and not being matched.
                  </p>
                  <p className="mt-3 text-sm leading-6 text-amber-900">
                    Reactivate it from the Overview page when you're ready to look for matches again.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <Link href="/dashboard" className="dashboard-button inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold shadow-sm transition">
                      Go to Overview <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </section>
          );
        }

        if (status === "MATCHED") {
          return (
            <section className="rounded-3xl border border-blue-200 bg-blue-50 p-6 shadow-sm">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-blue-600" />
                <div>
                  <h2 className="text-xl font-semibold text-blue-950">You have an active match</h2>
                  <p className="mt-1 text-sm leading-6 text-blue-900">
                    Your listing for <strong>{centre}</strong> on <strong>{dateStr}</strong> has been matched with another learner.
                  </p>
                  <p className="mt-3 text-sm leading-6 text-blue-900">
                    Review the match details on the My Match page and follow the steps to complete your swap with DVSA.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <Link href="/dashboard/matches" className="dashboard-button inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold shadow-sm transition">
                      Open My Match <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </section>
          );
        }

        if (status === "COMPLETED") {
          return (
            <section className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-slate-500" />
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">Your last swap is complete</h2>
                  <p className="mt-1 text-sm leading-6 text-slate-700">
                    Your test swap listing for <strong>{centre}</strong> on <strong>{dateStr}</strong> has been completed.
                  </p>
                  <p className="mt-3 text-sm leading-6 text-slate-700">
                    If you have a new DVSA test booking, you can add a new listing. Your completed listing stays in your swap history.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <Link href="/dashboard" className="dashboard-button inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold shadow-sm transition">
                      Go to Overview <ArrowRight className="h-4 w-4" />
                    </Link>
                    <Link href="/dashboard/edit" className="edit-listing-button inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:border-[var(--brand)]">
                      Add a new listing
                    </Link>
                  </div>
                </div>
              </div>
            </section>
          );
        }

        if (status === "EXPIRED") {
          return (
            <section className="rounded-3xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-amber-600" />
                <div>
                  <h2 className="text-xl font-semibold text-amber-950">Your listing has expired</h2>
                  <p className="mt-1 text-sm leading-6 text-amber-900">
                    Your test date has passed. Your listing for <strong>{centre}</strong> on <strong>{dateStr}</strong> is no longer being matched.
                  </p>
                  <p className="mt-3 text-sm leading-6 text-amber-900">
                    If you have a new DVSA test booking, you can add a new listing.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <Link href="/dashboard/edit" className="dashboard-button inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold shadow-sm transition">
                      Add a new listing <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </section>
          );
        }

        return null; // DELETED or unknown — no banner
      })()}

      {/* Process Overview */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-semibold text-slate-950">What happens next</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Here is the full process from listing creation to completing your swap with DVSA.
        </p>

        <ol className="mt-6 space-y-4">
          {[
            {
              title: "We watch for matches",
              body: "MoveMyTest checks your listing against all other active listings. When a compatible learner is found, we email you immediately.",
            },
            {
              title: "You review the match",
              body: "Visit My Match to see the other learner's current test details and proposed swap. You have a limited time to accept or decline.",
            },
            {
              title: "Check instructor availability",
              body: "Before accepting any match, confirm your instructor is available for the new date, time and test centre.",
            },
            {
              title: "Both learners accept",
              body: "The swap only proceeds when both learners have clicked Accept. Until then, either side can decline with no penalty.",
            },
            {
              title: "One learner volunteers to call DVSA",
              body: "After both learners accept, one person must volunteer to make the DVSA call. The other learner will be notified to be ready to answer their phone at the same time. The person who initiates the swap is designated as the caller. The other person is informed that they will be receiving a call from the DVSA.",
            },
            {
              title: "Call DVSA together",
              body: "Follow the step-by-step guide on the Call DVSA page. Both learners must be on the phone with DVSA at the same time. One of you will have agreed to make the call — the other should be available to answer the phone at the same time.",
            },
            {
              title: "DVSA confirms the swap",
              body: "DVSA performs security checks, verifies both booking references and updates both records. You receive confirmation from DVSA directly.",
            },
            {
              title: "Complete the swap in your dashboard",
              body: "After DVSA confirms the swap, return to your MoveMyTest dashboard and mark the match as complete. This closes the match for both learners.",
            },
          ].map((step, index) => (
            <li key={step.title} className="flex gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--brand)] text-sm font-bold text-white">
                {index + 1}
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">{step.title}</h3>
                <p className="mt-1 text-sm leading-6 text-slate-600">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Menu Guide */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-semibold text-slate-950">Your dashboard menu</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Each menu option explained. Use the left sidebar to navigate between pages.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {menuItems.map((item) => (
            <Link
              key={item.label}
              href={item.href as `/${string}`}
              className="group flex gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 transition hover:border-[var(--brand)] hover:bg-white hover:shadow-sm"
            >
              <item.icon className="mt-0.5 h-5 w-5 shrink-0 text-[var(--brand)]" />
              <div>
                <h3 className="text-sm font-semibold text-slate-900 group-hover:text-[var(--brand-strong)]">
                  {item.label}
                </h3>
                <p className="mt-1 text-xs leading-5 text-slate-500">{item.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <div className="flex justify-end">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 rounded-full bg-[var(--brand)] px-6 py-3 text-sm font-semibold !text-white shadow-sm transition hover:bg-[var(--brand-strong)] hover:!text-white"
        >
          Go to my dashboard
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
