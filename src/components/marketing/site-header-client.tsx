"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { BrandMark } from "@/components/branding/brand-mark";
import { getNavIcon, NavIcon } from "./nav-icons";
import { Breadcrumbs } from "./breadcrumbs";

export type NavItem = {
  title: string;
  href: string;
  openInNewTab?: boolean;
  description?: string;
  icon?: string;
  children?: NavItem[];
};

/* ─── Helpers ─── */
function useScrollDirection() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return scrolled;
}

function useLockBodyScroll(lock: boolean) {
  useEffect(() => {
    if (!lock) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [lock]);
}

/* ─── Desktop Nav Link with Animated Underline ─── */
function DesktopNavLink({ item, isActive }: { item: NavItem; isActive: boolean }) {
  const [hovered, setHovered] = useState(false);
  const hasChildren = (item.children?.length ?? 0) > 0;

  return (
    <div
      className="relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Link
        href={item.href as "/"}
        target={item.openInNewTab ? "_blank" : undefined}
        rel={item.openInNewTab ? "noopener noreferrer" : undefined}
        className={`group relative inline-flex items-center gap-1 px-3 py-2 text-sm font-medium transition-colors ${
          isActive
            ? "text-[var(--brand-accent)]"
            : "text-zinc-300 hover:text-white"
        }`}
      >
        <span>{item.title}</span>
        {hasChildren && (
          <svg
            className="h-3.5 w-3.5 transition-transform duration-200"
            style={{ transform: hovered ? "rotate(180deg)" : "rotate(0deg)" }}
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        )}
        {/* Animated underline */}
        <span
          className="absolute bottom-0 left-3 right-3 h-[2px] origin-left bg-[var(--brand-accent)] transition-transform duration-300 ease-out"
          style={{
            transform: isActive || hovered ? "scaleX(1)" : "scaleX(0)",
          }}
        />
      </Link>

      {/* Dropdown panel */}
      <AnimatePresence>
        {hasChildren && hovered && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            className="absolute left-0 top-full z-50 min-w-[280px] pt-2"
          >
            <div className="overflow-hidden rounded-xl border border-white/10 bg-zinc-900/95 p-2 shadow-2xl backdrop-blur-xl">
              {item.children!.map((child) => (
                <Link
                  key={child.href}
                  href={child.href as "/"}
                  target={child.openInNewTab ? "_blank" : undefined}
                  rel={child.openInNewTab ? "noopener noreferrer" : undefined}
                  className="group flex items-start gap-3 rounded-lg px-4 py-3 transition-colors hover:bg-white/[0.06]"
                >
                  {(() => {
                    const ChildIcon = getNavIcon(child.href, child.title);
                    return ChildIcon ? <NavIcon icon={ChildIcon} /> : null;
                  })()}
                  <div className="flex-1">
                    <span className="block text-sm font-medium text-zinc-200 transition-colors group-hover:text-white">
                      {child.title}
                    </span>
                    {child.description && (
                      <span className="mt-0.5 block text-xs text-zinc-500 transition-colors group-hover:text-zinc-400">
                        {child.description}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Mobile Full-Screen Menu (Pichincha-style) ─── */
function MobileMenu({
  items,
  onClose,
}: {
  items: NavItem[];
  onClose: () => void;
}) {
// Derive sections directly from the parent items and their children
  const sections: { title: string; items: NavItem[] }[] = items
    .filter((item) => (item.children?.length ?? 0) > 0)
    .map((item) => ({
      title: item.title,
      items: item.children!,
    }));

// Any top-level items that have no children become their own single-item section
  const parentHrefs = new Set(sections.flatMap((s) => s.items.map((i) => i.href)));
  const standalone = items.filter(
    (i) => !parentHrefs.has(i.href) && i.href !== "/contact" && i.href !== "#"
  );
  if (standalone.length > 0) {
    sections.push({ title: "More", items: standalone });
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 bg-zinc-950 md:hidden"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
        className="flex h-full flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <Link href="/" onClick={onClose}>
            <div className="drop-shadow-[0_0_14px_rgba(255,255,255,0.18)]">
              <BrandMark compact inverted />
            </div>
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-white/[0.07] hover:text-white"
            aria-label="Close menu"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 py-5">
          <div className="mb-6 grid grid-cols-2 gap-2">
            {[
              { title: "Book", href: "/contact", className: "bg-[var(--brand-accent)] text-white hover:bg-red-700" },
              { title: "WhatsApp", href: "https://wa.me/447850907770", openInNewTab: true, className: "bg-[#25D366] text-white hover:bg-[#1fba57]" },
              { title: "Prices", href: "/prices", className: "bg-amber-500 text-black hover:bg-amber-400" },
              { title: "Reviews", href: "/reviews", className: "bg-[#25D366] text-white hover:bg-[#1fba57]" },
            ].map((shortcut) => (
              <Link
                key={shortcut.href}
                href={shortcut.href as "/"}
                onClick={onClose}
                target={shortcut.openInNewTab ? "_blank" : undefined}
                rel={shortcut.openInNewTab ? "noopener noreferrer" : undefined}
                className={`inline-flex min-h-12 items-center justify-center rounded-xl px-3 py-2 text-sm font-bold shadow-sm transition ${shortcut.className}`}
              >
                {shortcut.title}
              </Link>
            ))}
          </div>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
            {sections.map((section, sectionIndex) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.1 + sectionIndex * 0.08,
                  duration: 0.4,
                  ease: [0.23, 1, 0.32, 1],
                }}
              >
                <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-zinc-500">
                  {section.title}
                </h3>
                <div className="space-y-1">
                  {section.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href as "/"}
                      onClick={onClose}
                      target={item.openInNewTab ? "_blank" : undefined}
                      rel={item.openInNewTab ? "noopener noreferrer" : undefined}
                      className="group flex items-start gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-white/[0.05]"
                    >
                      {(() => {
                        const ItemIcon = getNavIcon(item.href, item.title);
                        return ItemIcon ? <NavIcon icon={ItemIcon} size={18} /> : null;
                      })()}
                      <div className="flex-1">
                        <span className="block text-base font-semibold text-zinc-200 transition-colors group-hover:text-white">
                          {item.title}
                        </span>
                        {item.description && (
                          <span className="mt-0.5 block text-sm text-zinc-500 transition-colors group-hover:text-zinc-400">
                            {item.description}
                          </span>
                        )}
                      </div>
                      <svg
                        className="mt-1 h-4 w-4 shrink-0 text-zinc-600 transition-colors group-hover:text-zinc-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                      </svg>
                    </Link>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom utility bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="border-t border-white/10 bg-zinc-950/95 px-6 py-5"
        >
          <div className="flex items-center justify-between gap-4">
            <Link
              href="/contact"
              onClick={onClose}
              className="rounded-lg bg-[var(--brand-accent)] px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-110"
            >
              Book lesson
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Main Component ─── */
export function SiteHeaderClient({ items }: { items: NavItem[] }) {
  const [menuOpen, setMenuOpen] = useState(false);
  useScrollDirection();
  const pathname = usePathname();

  const closeMobile = useCallback(() => setMenuOpen(false), []);
  useLockBodyScroll(menuOpen);

  return (
    <>
      <header
        className="sticky top-0 z-40 border-b border-white/10 bg-black text-white backdrop-blur-md transition-all duration-300 shadow-lg shadow-black/20"
      >
        <div className="relative mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
          {/* Logo */}
          <Link
            href="/"
            className="absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0 inline-flex items-center gap-3 rounded-lg px-1 py-1 transition hover:bg-white/[0.07]"
          >
            <div className="drop-shadow-[0_0_14px_rgba(255,255,255,0.18)]">
              <BrandMark compact inverted />
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center md:flex">
            {items.map((item) => (
              <DesktopNavLink
                key={item.title + item.href}
                item={item}
                isActive={pathname === item.href || pathname.startsWith(item.href + "/")}
              />
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden items-center gap-3 md:flex">
            <Link
              href="/contact"
              className="rounded-lg bg-[var(--brand-accent)] px-4 py-2.5 text-sm font-semibold text-black transition hover:brightness-110"
            >
              Get in Touch
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            className="ml-auto inline-flex h-10 w-10 items-center justify-center rounded-lg text-zinc-300 transition hover:bg-white/[0.07] md:hidden"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              )}
            </svg>
          </button>
        </div>

        <Breadcrumbs />
      </header>

      {/* Mobile overlay */}
      <AnimatePresence>
        {menuOpen && (
          <MobileMenu items={items} onClose={closeMobile} />
        )}
      </AnimatePresence>
    </>
  );
}
