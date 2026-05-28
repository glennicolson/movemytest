import type { Metadata } from "next";
import { LogOut } from "lucide-react";
import { MoveMyTestAccountNav } from "@/components/movemytest/movemytest-account-nav";
import { DashboardSidebarNav } from "@/components/movemytest/dashboard-sidebar-nav";
import { MobileLearnerDashboardMenu } from "@/components/movemytest/mobile-learner-dashboard-menu";
import { requireMoveMyTestSession } from "@/features/movemytest/session";
import { logoutMoveMyTestLearnerAction } from "@/features/movemytest/auth-actions";

export const metadata: Metadata = {
  title: "MoveMyTest — Account Overview",
  robots: { index: false, follow: false },
};

export default async function MoveMyTestDashboardLayout({ children }: { children: React.ReactNode }) {
  await requireMoveMyTestSession("/dashboard");

  return (
    <main className="flex h-dvh min-h-dvh flex-col overflow-hidden bg-white">
      {/* Fixed header bar — mobile optimised */}
      <header className="shrink-0 border-b border-slate-200 bg-white">
        {/* Top row */}
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <MobileLearnerDashboardMenu />
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brand)]">Private dashboard</p>
              <h1 className="mt-0.5 text-base font-bold tracking-tight text-slate-950 sm:text-lg">Test swap overview</h1>
            </div>
          </div>
          <form action={logoutMoveMyTestLearnerAction} className="shrink-0">
            <button className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold text-slate-600 ring-1 ring-slate-200 transition hover:bg-red-50 hover:text-red-700 hover:ring-red-200 sm:text-sm">
              <LogOut className="h-3.5 w-3.5 text-[var(--brand)] sm:h-4 sm:w-4" /> <span className="hidden sm:inline">Log out</span>
            </button>
          </form>
        </div>
        {/* Pill nav row — desktop only */}
        <div className="hidden border-t border-slate-100 bg-slate-50/50 px-4 py-2 sm:px-6 md:block">
          <MoveMyTestAccountNav />
        </div>
      </header>

      {/* Body */}
      <div className="mx-auto flex w-full max-w-7xl flex-1 overflow-hidden">
        <aside className="hidden w-[248px] shrink-0 overflow-y-auto border-r border-slate-200 bg-slate-50 p-5 lg:block">
          <DashboardSidebarNav />
        </aside>
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-4xl px-4 py-5 sm:px-6 sm:py-8">{children}</div>
        </div>
      </div>
    </main>
  );
}
