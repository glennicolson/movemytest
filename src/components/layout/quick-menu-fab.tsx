"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Plus, X } from "lucide-react";

// Import popup components
import { DiaryEntryPopup } from "@/components/diary/diary-entry-popup";
import { BookLessonPopup } from "@/components/diary/book-lesson-popup";
import { RecordPaymentPopup } from "@/components/diary/record-payment-popup";
import { ScheduleLessonPopup } from "@/components/instructor/schedule-lesson-popup";

export type QuickAction = {
  label: string;
  href?: Route<string>;
  /** Type discriminator for popup rendering */
  popupType?: "diary" | "book-lesson" | "record-payment" | "schedule-lesson";
  /** Optional data payload for the popup */
  popupData?: Record<string, unknown>;
};

export function QuickMenuFAB({ actions }: { actions: QuickAction[] }) {
  const [open, setOpen] = useState(false);
  const [activePopup, setActivePopup] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
        setActivePopup(null);
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
        if (activePopup) setActivePopup(null);
        else setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [open, activePopup]);

  const activeAction = activePopup ? actions.find((a) => a.label === activePopup) : null;

  function renderPopup() {
    if (!activeAction?.popupType) return null;
    switch (activeAction.popupType) {
      case "diary":
        return <DiaryEntryPopup />;
      case "book-lesson": {
        const learners = (activeAction.popupData?.learners as Array<{ id: string; name: string; email: string; instructorId: string | null }>) ?? [];
        const instructors = (activeAction.popupData?.instructors as Array<{ id: string; name: string }>) ?? [];
        return <BookLessonPopup learners={learners} instructors={instructors} />;
      }
      case "record-payment": {
        const learners = (activeAction.popupData?.learners as Array<{ id: string; name: string; email: string }>) ?? [];
        return <RecordPaymentPopup learners={learners} />;
      }
      case "schedule-lesson":
        return <ScheduleLessonPopup />;
      default:
        return null;
    }
  }

  return (
    <div ref={menuRef} className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      {/* Popup modal */}
      {activePopup && activeAction?.popupType && (
        <div className="rounded-xl border border-slate-200 bg-white shadow-xl p-5 w-[420px] max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-slate-900">{activePopup}</h2>
            <button
              onClick={() => setActivePopup(null)}
              className="rounded p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X size={18} />
            </button>
          </div>
          {renderPopup()}
        </div>
      )}

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
                onClick={() => { setOpen(false); setActivePopup(action.label); }}
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
        onClick={() => { setOpen(!open); setActivePopup(null); }}
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
