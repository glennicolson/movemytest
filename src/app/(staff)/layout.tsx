import { requireStaffSession } from "@/features/admin/auth";
import type { ReactNode } from "react";

export const dynamic = "force-dynamic";

export default async function StaffLayout({ children }: { children: ReactNode }) {
  const staff = await requireStaffSession();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Admin header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold text-slate-900">MoveMyTest Admin</h1>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
              {staff.role}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600">{staff.name}</span>
            <span className="text-sm text-slate-400">{staff.email}</span>
            <form action="/admin/logout" method="POST">
              <button
                type="submit"
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
