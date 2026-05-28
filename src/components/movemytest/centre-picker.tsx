"use client";

import { useState, useRef, useEffect, useMemo } from "react";

type Centre = { id: string; name: string; region: string | null; postcode: string | null };

export function CentrePicker({
  name,
  centres,
  defaultValue,
  required = false,
  placeholder = "Start typing a test centre name…",
  includeEmptyOption = false,
  emptyLabel = "Not supplied// same as current",
  onSelected,
}: {
  name: string;
  centres: Centre[];
  defaultValue?: string;
  required?: boolean;
  placeholder?: string;
  includeEmptyOption?: boolean;
  emptyLabel?: string;
  onSelected?: (centre: Centre | null) => void;
}) {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(defaultValue ?? "");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

// Resolve the selected centre's display label for the input
  const selectedLabel = useMemo(() => {
    if (!selectedId) return "";
    if (includeEmptyOption && selectedId === "") return emptyLabel;
    const centre = centres.find((c) => c.id === selectedId);
    return centre ? `${centre.name} · ${centre.region ?? ""}${centre.postcode ? ` · ${centre.postcode}` : ""}` : "";
  }, [selectedId, centres, includeEmptyOption, emptyLabel]);

  const hasMinQuery = query.trim().length >= 2;

  const filtered = useMemo(() => {
    if (!hasMinQuery) return [];
    const q = query.toLowerCase();
    return centres
      .filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          (c.region?.toLowerCase() ?? "").includes(q) ||
          (c.postcode?.toLowerCase() ?? "").includes(q),
      )
      .slice(0, 15);
  }, [query, centres, hasMinQuery]);

// Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

// Auto-select if the user types an exact match (and hasn't already selected it)
  const exactMatch = useMemo(() => {
    if (!query.trim() || query.trim().length < 2) return null;
    return centres.find((c) =>
      c.name.toLowerCase() === query.trim().toLowerCase() ||
      `${c.name} · ${c.region}`.toLowerCase() === query.trim().toLowerCase()
    ) ?? null;
  }, [query, centres]);

  useEffect(() => {
    if (exactMatch && exactMatch.id !== selectedId) {
      setSelectedId(exactMatch.id);
      onSelected?.(exactMatch);
    }
  }, [exactMatch, selectedId, onSelected]);

  return (
    <div ref={containerRef} className="relative">
      <input type="hidden" name={name} value={selectedId} />
      <input
        type="text"
        value={query}
        onChange={(e) => {
          const v = e.target.value;
          setQuery(v);
          if (v.length >= 2) {
            setIsOpen(true);
          } else {
            setIsOpen(false);
          }
        }}
        placeholder={selectedLabel || placeholder}
        required={required}
        autoComplete="off"
        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm"
      />
      {isOpen && (
        <div className="absolute z-50 mt-1 max-h-64 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg">
          {includeEmptyOption && (
            <button
              type="button"
              className="w-full px-3 py-2 text-left text-sm text-slate-500 hover:bg-slate-50"
              onClick={() => {
                setSelectedId("");
                setQuery("");
                setIsOpen(false);
              }}
            >
              {emptyLabel}
            </button>
          )}
          {filtered.length === 0 && !hasMinQuery ? (
            <div className="px-3 py-2 text-sm text-slate-400">Type at least 2 characters to search…</div>
          ) : filtered.length === 0 && hasMinQuery ? (
            <div className="px-3 py-2 text-sm text-slate-400">No centres found</div>
          ) : (
            filtered.map((centre) => (
              <button
                key={centre.id}
                type="button"
                className="w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-[var(--brand)]/10 hover:text-[var(--brand-strong)]"
                onClick={() => {
                  setSelectedId(centre.id);
                  setQuery("");
                  setIsOpen(false);
                  onSelected?.(centre);
                }}
              >
                {centre.name}
                <span className="text-xs text-slate-400 ml-1.5">
                  · {centre.region ?? ""}{centre.postcode ? ` · ${centre.postcode}` : ""}
                </span>
              </button>
            ))
          )}
        </div>
      )}
      {selectedId && (
        <p className="mt-1 text-xs text-emerald-600 font-medium">
          ✓ Selected: {selectedLabel}
        </p>
      )}
    </div>
  );
}
