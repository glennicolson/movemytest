"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Menu, X, Activity, BellRing, CheckCircle2, Clock, FileText, Heart, MapPin, Phone, Shield } from "lucide-react";

const swapMenu = [
  { href: "/dashboard", label: "Overview", icon: Activity, exact: true },
  { href: "/dashboard/what-to-expect", label: "What to Expect", icon: CheckCircle2 },
  { href: "/dashboard/instructor", label: "Instructor", icon: MapPin },
  { href: "/dashboard/queue", label: "Queue Status", icon: Clock },
  { href: "/dashboard/matches", label: "My Match", icon: BellRing },
  { href: "/dashboard/call-dvsa", label: "Call DVSA", icon: Phone },
];

const accountMenu = [
  { href: "/dashboard/history", label: "Swap History", icon: FileText },
  { href: "/dashboard/account", label: "Account", icon: Shield },
  { href: "/dashboard/support", label: "Support", icon: Activity },
  { href: "/dashboard/support-us", label: "Support Us", icon: Heart },
  { href: "/dashboard/security", label: "Security", icon: Shield },
];

export function MobileLearnerDashboardMenu() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Drawer backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer panel */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-[280px] bg-white shadow-2xl transition-transform duration-300 ease-out lg:hidden",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Drawer header */}
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <span className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--brand)]">MoveMyTest</span>
            <button
              onClick={() => setOpen(false)}
              className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Scrollable nav */}
          <div className="flex-1 overflow-y-auto px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Menu</p>
            <div className="mt-3 space-y-1">
              {swapMenu.map((item) => (
                <Link
                  key={item.href}
                  href={item.href as `/${string}`}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition",
                    isActive(item.href, item.exact)
                      ? "bg-blue-50 text-[var(--brand-strong)] ring-1 ring-[var(--brand)]/20"
                      : "text-slate-700 hover:bg-slate-50 hover:text-[var(--brand-strong)]"
                  )}
                >
                  <item.icon className="h-4 w-4 text-[var(--brand)]" />
                  {item.label}
                </Link>
              ))}
            </div>

            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Account</p>
            <div className="mt-3 space-y-1">
              {accountMenu.map((item) => (
                <Link
                  key={item.href}
                  href={item.href as `/${string}`}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition",
                    isActive(item.href)
                      ? "bg-blue-50 text-[var(--brand-strong)] ring-1 ring-[var(--brand)]/20"
                      : "text-slate-700 hover:bg-slate-50 hover:text-[var(--brand-strong)]"
                  )}
                >
                  <item.icon className="h-4 w-4 text-[var(--brand)]" />
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* Hamburger trigger — shown in header via layout, this component exports the button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-xl bg-[var(--brand)] px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-[var(--brand)]/30 transition hover:bg-[var(--brand-strong)] active:scale-95 lg:hidden"
        aria-label="Open navigation menu"
      >
        <Menu className="h-5 w-5" />
        <span className="hidden sm:inline">Menu</span>
      </button>
    </>
  );
}
