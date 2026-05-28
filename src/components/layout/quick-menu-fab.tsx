"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Plus, X } from "lucide-react";

export type QuickAction = {
  label: string;
  href?: Route<string>;
};

export function QuickMenuFAB({ actions }: { actions: QuickAction[] }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [open]);

  return (
    <div ref={menuRef} className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      {/* Menu items */}
      {open && (
        <div className="flex flex-col gap-1.5 rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
          {actions.map((action, index) => {
            const itemKey = `${action.label}-${index}`;
            if (action.href) {
              return (
                <Link
                  key={itemKey}
                  href={action.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                >
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-600">+</span>
                  {action.label}
                </Link>
              );
            }
            return (
              <button
                key={itemKey}
                onClick={() => { setOpen(false); }}
                className="flex items-center gap-3 whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-600">+</span>
                {action.label}
              </button>
            );
          })}
        </div>
      )}

      {/* FAB button */}
      <button
        onClick={() => { setOpen(!open); }}
        className={`flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all duration-200 ${
          open
            ? "rotate-45 bg-slate-700 text-white hover:bg-slate-800"
            : "bg-slate-800 text-white hover:bg-slate-900 hover:shadow-xl"
        }`}
        aria-label={open ? "Close quick menu" : "Open quick menu"}
      >
        {open ? <X size={22} /> : <Plus size={24} />}
      </button>
    </div>
  );
}
