import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { MoveMyTestInstructorRegisterForm } from "@/components/movemytest/movemytest-instructor-register-form";

export const metadata: Metadata = {
  title: "Register as a MoveMyTest Instructor",
  description: "Create an instructor account to manage MoveMyTest requests linked to your ADI number.",
  robots: { index: false, follow: false },
  openGraph: {
    title: "Register as a MoveMyTest Instructor",
    description: "Create an instructor account to manage MoveMyTest requests linked to your ADI number.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Register as a MoveMyTest Instructor",
    description: "Create an instructor account to manage MoveMyTest requests linked to your ADI number.",
  },
};

export default function MoveMyTestInstructorRegisterPage() {
  return (
    <main className="grid min-h-screen lg:grid-cols-[1fr_1fr]">
      <section className="flex items-center px-6 py-12 lg:px-12">
        <div className="mx-auto w-full max-w-xl">
          <Card className="border-slate-200/80 shadow-lg shadow-slate-200/60">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">MoveMyTest Instructor</p>
            <CardTitle>Instructor Registration</CardTitle>
            <CardDescription>
              Create a MoveMyTest instructor account. You will need to verify your email before your account is active.
            </CardDescription>
            <div className="mt-6"><MoveMyTestInstructorRegisterForm /></div>
          </Card>
          <div className="mt-4 text-center">
            <Link href="/instructor/login" className="text-sm font-medium text-slate-500 transition hover:text-zinc-700">Already have an account? Instructor sign in</Link>
          </div>
        </div>
      </section>
      <section className="flex items-center bg-gradient-to-br from-slate-100 to-slate-200 px-6 py-12 text-slate-900 lg:px-12">
        <div className="mx-auto max-w-lg">
          <p className="mt-4 text-lg font-semibold text-slate-700">Move your driving test without giving away control.</p>
          <p className="mt-8 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Instructor Registration</p>
          <h1 className="mt-3 text-4xl font-semibold leading-tight">Help your learners find test swaps.</h1>
          <p className="mt-4 text-base text-slate-600">
            Create an instructor account to view learner swap requests linked to your ADI number and help your pupils move their tests safely.
          </p>
          <div className="mt-8 rounded-2xl bg-white p-4 text-sm font-semibold leading-6 text-slate-800 shadow-sm">
            Create your instructor account to view learner swap requests linked to your ADI number and help your pupils move their tests.for your pupils.
          </div>
          <p className="mt-8 text-sm text-slate-400">movemytest.co.uk</p>
        </div>
      </section>
    </main>
  );
}