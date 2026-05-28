import type { Metadata } from "next";
import Image from "next/image";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { StaffLoginForm } from "@/components/admin/staff-login-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin Login - MoveMyTest",
  description: "Staff login for MoveMyTest admin portal.",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  return (
    <main className="grid min-h-screen lg:grid-cols-[1fr_1fr]">
      <section className="flex items-center px-6 py-12 lg:px-12">
        <div className="mx-auto w-full max-w-xl">
          <Card className="border-slate-200/80 shadow-lg shadow-slate-200/60">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">MoveMyTest Staff</p>
            <CardTitle>Admin Sign In</CardTitle>
            <CardDescription>
              Staff-only access to the MoveMyTest admin portal. Learners and instructors should use the main login page.
            </CardDescription>
            <StaffLoginForm />
          </Card>
          <div className="mt-4 text-center">
            <a href="/login" className="text-sm font-medium text-slate-500 transition hover:text-zinc-700">
              Learner/Instructor Login →
            </a>
          </div>
        </div>
      </section>
      <section className="flex items-center bg-gradient-to-br from-slate-100 to-slate-200 px-6 py-12 text-slate-900 lg:px-12">
        <div className="mx-auto max-w-lg">
          <div className="mb-6">
            <Image
              src="/movemytest-logo.png"
              alt="MoveMyTest"
              width={240}
              height={70}
              priority
              className="h-auto w-[220px]"
            />
          </div>
          <p className="mt-4 text-lg font-semibold text-slate-700">Admin Portal</p>
          <p className="mt-8 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Staff Access Only</p>
          <h1 className="mt-3 text-4xl font-semibold leading-tight">Manage test swaps.</h1>
          <p className="mt-4 text-base text-slate-600">
            Monitor learner listings, track matches, manage support tickets, and oversee instructor activity.
          </p>
          <div className="mt-8 rounded-2xl bg-white p-4 text-sm font-semibold leading-6 text-slate-800 shadow-sm">
            Authorised staff members only. All admin actions are logged for security.
          </div>
          <p className="mt-8 text-sm text-slate-400">movemytest.co.uk</p>
        </div>
      </section>
    </main>
  );
}
