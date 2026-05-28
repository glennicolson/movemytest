"use client";

import { useState, useRef, useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type FabAction = {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  tone?: "brand" | "danger" | "neutral";
};

type QuickFabProps = {
  icon: React.ReactNode;
  label: string;
  actions: FabAction[];
};

export function QuickFab({ icon, label, actions }: QuickFabProps) {
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
      {/* Action buttons */}
      {open && (
        <div className="flex flex-col-reverse gap-2">
          {actions.map((action) => (
            <button
              key={action.id}
              onClick={() => {
                action.onClick();
                setOpen(false);
              }}
              className={cn(
                "flex items-center gap-3 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-medium shadow-lg transition-all duration-150",
                "animate-in slide-in-from-bottom-2 fade-in",
                action.tone === "danger"
                  ? "bg-rose-600 text-white hover:bg-rose-700"
                  : action.tone === "brand"
                    ? "bg-slate-800 text-white hover:bg-slate-900"
                    : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
              )}
            >
              {action.icon}
              {action.label}
            </button>
          ))}
        </div>
      )}

      {/* Main FAB */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close quick actions" : label}
        className={cn(
          "flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all duration-200",
          open
            ? "rotate-45 bg-slate-700 text-white hover:bg-slate-800"
            : "bg-slate-800 text-white hover:bg-slate-900 hover:shadow-xl"
        )}
      >
        {open ? <X size={22} /> : icon}
      </button>
    </div>
  );
}
