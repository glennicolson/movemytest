"use client";

import { Search } from "lucide-react";
import { useMemo, useState, useRef, useEffect } from "react";

export type CentreSearchItem = {
  id: string;
  slug: string;
  displayName: string;
  // The MMT TestCentre schema has region as nullable; the search UI
  // tolerates null by using an empty string in the rendered output.
  region: string | null;
  postcode: string | null;
};

type Props = {
  centres: CentreSearchItem[];
  searchPlaceholder?: string;
};

export function CentreSearchAutocomplete({ centres, searchPlaceholder = "Search by centre name, town or postcode…" }: Props) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const filtered = useMemo(() => {
    if (!query.trim()) return [];
    const term = query.toLowerCase().trim();
    return centres
      .filter((centre) => {
        const searchTarget = `${centre.displayName} ${centre.postcode ?? ""} ${centre.region}`.toLowerCase();
        return searchTarget.includes(term);
      })
      .slice(0, 8);
  }, [query, centres]);

  useEffect(() => {
    setSelectedIndex(-1);
  }, [query]);

  useEffect(() => {
    if (selectedIndex >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll("li");
      if (items[selectedIndex]) {
        items[selectedIndex].scrollIntoView({ block: "nearest" });
      }
    }
  }, [selectedIndex]);

  function onKeyDown(e: React.KeyboardEvent) {
    if (!filtered.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filtered.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % filtered.length);
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault();
      const hit = filtered[selectedIndex];
      if (hit) {
        window.location.href = `/test-centres/${hit.slug}`;
      }
    } else if (e.key === "Escape") {
      setShowDropdown(false);
      inputRef.current?.blur();
    }
  }

  function onSelect(slug: string) {
    window.location.href = `/test-centres/${slug}`;
  }

  return (
    <div className="relative">
      <div className="flex items-center gap-3 rounded-2xl border border-slate-300 bg-white px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-[var(--brand)]/30">
        <Search className="h-5 w-5 text-slate-400" />
        <input
          ref={inputRef}
          className="w-full border-0 text-sm outline-none"
          placeholder={searchPlaceholder}
          value={query}
          onChange={(e) => { setQuery(e.target.value); setShowDropdown(true); }}
          onFocus={() => setShowDropdown(true)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
          onKeyDown={onKeyDown}
          role="combobox"
          aria-expanded={showDropdown}
          aria-controls="centre-search-results"
          autoComplete="off"
        />
      </div>
      {showDropdown && filtered.length > 0 ? (
        <ul id="centre-search-results" ref={listRef} role="listbox" className="absolute z-50 mt-1 w-full rounded-2xl border border-slate-200 bg-white shadow-lg">
          {filtered.map((centre, idx) => (
            <li
              key={centre.id}
              role="option"
              aria-selected={idx === selectedIndex}
              onMouseDown={() => onSelect(centre.slug)}
              className={`cursor-pointer px-4 py-2.5 text-sm ${idx === selectedIndex ? "bg-slate-100" : "hover:bg-slate-50"} ${idx === 0 ? "rounded-t-2xl" : ""} ${idx === filtered.length - 1 ? "rounded-b-2xl" : ""}`}
            >
              <span className="font-semibold text-slate-950">{centre.displayName}</span>
              <span className="ml-2 text-xs text-slate-500">{centre.postcode ?? ""} · {centre.region}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
