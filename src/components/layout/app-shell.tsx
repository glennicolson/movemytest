"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { NavItem, NavGroup } from "@/types/navigation";
import { BrandMark } from "@/components/branding/brand-mark";
import { SignOutForm } from "@/components/forms/sign-out-form";
import { Badge } from "@/components/ui/badge";
import { signOutAction } from "../../app/(auth)/actions";
import { appConfig } from "@/lib/config/app";
import type { AppRole } from "@/lib/auth/roles";
import { CrmBreadcrumbs } from "@/components/crm-breadcrumbs";
import { PanelLeftOpen, PanelLeftClose, Plus } from "lucide-react";
import { QuickMenuFAB } from "@/components/layout/quick-menu-fab";
import type { QuickAction } from "@/components/layout/quick-menu-fab";
import { MobileInstructorMenu } from "@/components/instructor/mobile-instructor-menu";

const SIDEBAR_COLLAPSED_KEY = "crm-sidebar-collapsed";

export function AppShell({
  title,
  subtitle,
  roleLabel,
  nav,
  navGroups,
  children,
  userName,
  userRole,
  sidebarFooter,
  showQuickMenu = false,
  quickMenuActions,
}: {
  title: string;
  subtitle: string;
  roleLabel: string;
  nav: NavItem[];
  /** Optional grouped navigation (renders with section headers) */
  navGroups?: NavGroup[];
  children: React.ReactNode;
  userName?: string;
  userRole?: AppRole;
  sidebarFooter?: React.ReactNode;
  /** Enable the Quick Menu floating action button */
  showQuickMenu?: boolean;
  /** Quick Menu action items */
  quickMenuActions?: QuickAction[];
}) {
  const [collapsed, setCollapsed] = useState(true);// Default to collapsed
  const [hovered, setHovered] = useState(false);
  const [mounted, setMounted] = useState(false);

  const visibleNav = nav.filter((item) => !item.roles || (userRole && item.roles.includes(userRole)));

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
    if (saved !== null) {
      setCollapsed(saved === "true");
    }
  }, []);

  const toggleCollapse = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(next));
  };

  const isExpanded = !collapsed || hovered;

// Don't render collapsed state until mounted to avoid hydration mismatch
  const showExpanded = mounted ? isExpanded : true;

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-50 text-slate-900 crm-shell">
      <div
        className={`grid min-h-screen min-w-0 transition-all duration-300 ease-in-out ${
          showExpanded ? "lg:grid-cols-[280px_minmax(0,1fr)]" : "lg:grid-cols-[64px_minmax(0,1fr)]"
        }`}
      >
        <aside
          className="relative border-b border-white/10 bg-[linear-gradient(180deg,var(--crm-sidebar-from),var(--crm-sidebar-to))] text-white transition-all duration-300 ease-in-out lg:border-b-0 lg:border-r"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          {/* Mobile hamburger menu */}
          <div className="lg:hidden">
            <MobileInstructorMenu />
          </div>

          {/* Collapse toggle button */}
          <button
            onClick={toggleCollapse}
            className="absolute -right-3 top-4 z-50 hidden h-6 w-6 items-center justify-center rounded-full bg-white text-slate-700 shadow-md hover:bg-slate-100 lg:flex"
            title={showExpanded ? "Collapse sidebar" : "Expand sidebar"}
          >
            {showExpanded ? <PanelLeftClose size={14} /> : <PanelLeftOpen size={14} />}
          </button>

          <div className={`px-4 py-4 transition-all duration-300 ${showExpanded ? "lg:px-6 lg:py-8" : "lg:px-2 lg:py-4"}`}>
            {/* Header: show full when expanded, minimal when collapsed */}
            <div className={`${showExpanded ? "" : "lg:hidden"}`}>
              <div className="flex items-start justify-between gap-4 lg:block">
                <div className="min-w-0">
                  <BrandMark inverted />
                  <p className="mt-4 hidden text-xs font-medium uppercase tracking-[0.24em] text-slate-400 sm:block lg:mt-5">
                    {appConfig.companyTagline}
                  </p>
                  <h1 className="mt-3 text-xl font-semibold lg:text-2xl">{title}</h1>
                  <p className="mt-2 max-h-10 overflow-hidden text-sm text-slate-200 lg:mt-3 lg:max-h-none lg:overflow-visible">
                    {subtitle}
                  </p>
                </div>
                <div className="shrink-0 lg:mt-4">
                  <SignOutForm action={signOutAction} />
                </div>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-2 lg:gap-3">
                <Badge>{roleLabel}</Badge>
                {userName ? <span className="text-xs text-white/80">{userName}</span> : null}
                <a
                  href={appConfig.companyWebsite}
                  target="_blank"
                  rel="noreferrer"
                  className="hidden text-xs text-white/70 transition hover:text-white sm:inline"
                >
                  {appConfig.companyWebsite.replace("https://", "")}
                </a>
              </div>
            </div>

            {/* Collapsed header: just logo */}
            <div className={`hidden ${showExpanded ? "lg:hidden" : "lg:block"}`}>
              <div className="flex justify-center">
                <div className="h-8 w-8 rounded bg-white/15 flex items-center justify-center text-xs font-bold text-white">
                  MMT
                </div>
              </div>
            </div>

            {/* Navigation - hidden on mobile (use hamburger menu instead) */}
            {navGroups && navGroups.length > 0 ? (
              <nav className={`-mx-1 mt-4 hidden lg:mx-0 lg:block lg:mt-8 lg:space-y-6 lg:overflow-visible ${showExpanded ? "" : "lg:mt-6"}`}>
                {navGroups.map((group) => {
                  const visibleItems = group.items.filter(
                    (item) => !item.roles || (userRole && item.roles.includes(userRole))
                  );
                  if (visibleItems.length === 0) return null;
                  return (
                    <div key={group.label}>
                      {showExpanded && (
                        <p className="mb-1 px-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                          {group.label}
                        </p>
                      )}
                      <div className="space-y-1">
                        {visibleItems.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            className={`block rounded-lg px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10 hover:text-white ${
                              showExpanded ? "" : "lg:flex lg:justify-center lg:px-2"
                            }`}
                            title={!showExpanded ? item.title : undefined}
                          >
                            <span className={`font-medium ${showExpanded ? "" : "lg:hidden"}`}>{item.title}</span>
                            {!showExpanded && (
                              <span className="hidden text-xs font-medium lg:block">{item.title.charAt(0)}</span>
                            )}
                          </Link>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </nav>
            ) : (
              <nav className={`-mx-1 mt-4 hidden lg:mx-0 lg:block lg:space-y-2 lg:overflow-visible lg:pb-0 ${showExpanded ? "lg:mt-8" : "lg:mt-6"}`}>
                {visibleNav.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`block rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 transition hover:border-white/10 hover:bg-white/10 hover:text-white lg:border-transparent lg:bg-transparent ${
                      showExpanded ? "lg:min-w-0" : "lg:flex lg:justify-center lg:px-2"
                    }`}
                    title={!showExpanded ? item.title : undefined}
                  >
                    <span className={`font-medium ${showExpanded ? "" : "lg:hidden"}`}>{item.title}</span>
                    {!showExpanded && (
                      <span className="hidden text-xs font-medium lg:block">{item.title.charAt(0)}</span>
                    )}
                    {item.description && showExpanded ? (
                      <span className="mt-1 hidden text-xs text-slate-400 lg:block">{item.description}</span>
                    ) : null}
                  </Link>
                ))}
              </nav>
            )}

            {sidebarFooter && showExpanded ? (
              <div className="mt-4">
                {sidebarFooter}
              </div>
            ) : null}
          </div>
        </aside>
        <main className="min-w-0 overflow-x-hidden px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
          <CrmBreadcrumbs />
          {children}
        </main>
      </div>
      {showQuickMenu && quickMenuActions ? (
        <QuickMenuFAB actions={quickMenuActions} />
      ) : null}
    </div>
  );
}
