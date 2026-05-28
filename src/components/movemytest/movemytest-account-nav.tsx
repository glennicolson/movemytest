"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type MoveMyTestAccountNavProps = {
  active?: "dashboard" | "start" | "security" | "support" | "match";
  className?: string;
};

const navItems = [
  { key: "dashboard", label: "Dashboard", href: "/dashboard" },
  { key: "start", label: "Create listing", href: "/start" },
  { key: "security", label: "Security", href: "/dashboard/security" },
  { key: "support", label: "Support us", href: "/dashboard/support-us" },
] as const;

export function MoveMyTestAccountNav({ active, className }: MoveMyTestAccountNavProps) {
  const pathname = usePathname();

  return (
    <nav
      className={cn("overflow-x-auto", className)}
      aria-label="MoveMyTest account navigation"
    >
      <div className="flex justify-center gap-1.5 whitespace-nowrap pb-1">
        {navItems.map((item) => {
          const isActive = active
            ? active === item.key
            : item.key === "dashboard"
              ? pathname === item.href
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.key}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-semibold transition",
                isActive
                  ? "bg-[var(--brand)] !text-white shadow-sm"
                  : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-[var(--brand)] hover:!text-white hover:ring-[var(--brand)]",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
