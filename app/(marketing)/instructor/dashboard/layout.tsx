import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, LogOut } from "lucide-react";
import { InstructorDashboardSidebarNav } from "@/components/movemytest/instructor-dashboard-sidebar-nav";
import { requireMoveMyTestInstructorSession } from "@/features/movemytest/instructor-session";
import { logoutMoveMyTestInstructorAction } from "@/features/movemytest/instructor-actions";
import { prisma } from "@/lib/db/prisma";
import { MobileInstructorDashboardMenu } from "@/components/movemytest/mobile-instructor-dashboard-menu";

export const metadata: Metadata = {
  title: "MoveMyTest Instructor Dashboard",
  description: "Independent instructor dashboard for managing MoveMyTest learner requests linked to an ADI number.",
  robots: { index: false, follow: false },
};

export default async function MoveMyTestInstructorDashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await requireMoveMyTestInstructorSession();
  const instructor = await prisma.instructorAccount.findUniqueOrThrow({
    where: { id: session.instructorId },
    select: { email: true, adiNumber: true},
  });
  const isDtcInstructor = false; // MoveMyTest is standalone, no CRM instructor link

  return (
    <main className="flex h-dvh min-h-dvh flex-col overflow-hidden bg-white">
      <header className="shrink-0 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <MobileInstructorDashboardMenu />
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brand)]">{isDtcInstructor ? "MoveMyTest instructor" : "Independent instructor"}</p>
              <h1 className="mt-0.5 text-base font-bold tracking-tight text-slate-950 sm:text-lg">{isDtcInstructor ? "MoveMyTest Instructor dashboard" : "Instructor dashboard"}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isDtcInstructor && (
              <Link href="/instructor/dashboard" className="hidden sm:inline-flex items-center rounded-full px-3 py-2 text-xs font-semibold text-slate-600 ring-1 ring-slate-200 transition hover:bg-slate-100 hover:text-slate-900">
                <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> MoveMyTest dashboard
              </Link>
            )}
            <form action={logoutMoveMyTestInstructorAction} className="shrink-0">
              <button className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold text-slate-600 ring-1 ring-slate-200 transition hover:bg-red-50 hover:text-red-700 hover:ring-red-200 sm:text-sm">
                <LogOut className="h-3.5 w-3.5 text-[var(--brand)] sm:h-4 sm:w-4" /> <span className="hidden sm:inline">Log out</span>
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-7xl flex-1 overflow-hidden">
        <aside className="hidden w-[248px] shrink-0 overflow-y-auto border-r border-slate-200 bg-slate-50 p-5 lg:block">
          <InstructorDashboardSidebarNav />
        </aside>
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-4xl px-4 py-5 sm:px-6 sm:py-8">{children}</div>
        </div>
      </div>
    </main>
  );
}
