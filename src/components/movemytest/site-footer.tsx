"use client";

import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-800">MoveMyTest</span>
            <span className="text-xs text-slate-400">© {new Date().getFullYear()}</span>
          </div>
          <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
            <Link href="/privacy-policy" className="text-slate-500 transition hover:text-slate-800">
              Privacy Policy
            </Link>
            <Link href="/terms-of-service" className="text-slate-500 transition hover:text-slate-800">
              Terms of Service
            </Link>
            <Link href="/cookies-policy" className="text-slate-500 transition hover:text-slate-800">
              Cookies Policy
            </Link>
          </nav>
        </div>
        <p className="mt-6 text-center text-xs text-slate-500 sm:text-left">
          MoveMyTest is built by the same team as DTC Test Swap, our brother service, and supported by DTC. We do not share your personal data between the two services.
        </p>
      </div>
    </footer>
  );
}
