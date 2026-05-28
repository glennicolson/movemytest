"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Activity, BellRing, CheckCircle2, Clock, ExternalLink, FileText, Heart, MapPin, Phone, Shield } from "lucide-react";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
  external?: boolean;
};

const swapMenu: NavItem[] = [
  { href: "/dashboard", label: "Overview", icon: Activity, exact: true },
  { href: "/dashboard/what-to-expect", label: "What to Expect", icon: CheckCircle2 },
  { href: "/dashboard/instructor", label: "Instructor", icon: MapPin },
  { href: "/dashboard/queue", label: "Queue Status", icon: Clock },
  { href: "/dashboard/matches", label: "My Match", icon: BellRing },
  { href: "/dashboard/call-dvsa", label: "Call DVSA", icon: Phone },
];

const accountMenu: NavItem[] = [
  { href: "/dashboard/history", label: "Swap History", icon: FileText },
  { href: "/dashboard/account", label: "Account", icon: Shield },
  { href: "/dashboard/support", label: "Support", icon: Activity },
  { href: "/ready_to_pass", label: "Ready to Pass", icon: ExternalLink, external: true },
  { href: "/dashboard/support-us", label: "Support Us", icon: Heart },
  { href: "/dashboard/security", label: "Security", icon: Shield },
];

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  const className = cn(
    "flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-semibold transition",
    active
      ? "bg-blue-50 text-[var(--brand-strong)] ring-1 ring-[var(--brand)]/20"
      : "text-slate-700 hover:bg-white hover:text-[var(--brand-strong)]",
  );

  if (item.external) {
    return (
      <a href={item.href} className={className} target="_blank" rel="noopener noreferrer">
        {item.icon ? <item.icon className="h-4 w-4 text-[var(--brand)]" /> : null}
        {item.label}
      </a>
    );
  }

  return (
    <Link
      href={item.href as `/${string}`}
      className={className}
    >
      {item.icon ? <item.icon className="h-4 w-4 text-[var(--brand)]" /> : null}
      {item.label}
    </Link>
  );
}

export function DashboardSidebarNav() {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <nav aria-label="MoveMyTest dashboard">
      <p className="px-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">MoveMyTest</p>
      <div className="mt-3 space-y-1">
        {swapMenu.map((item) => (
          <NavLink key={item.href} item={item} active={isActive(item.href, item.exact)} />
        ))}
      </div>
      <p className="mt-6 px-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Account</p>
      <div className="mt-3 space-y-1">
        {accountMenu.map((item) => (
          <NavLink key={item.href} item={item} active={isActive(item.href, item.exact)} />
        ))}
      </div>
    </nav>
  );
}
