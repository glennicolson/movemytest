"use client";

import { useVirtualizer } from "@tanstack/react-virtual";
import { useRef } from "react";
import Link from "next/link";
import type { Route } from "next";

export type DataTableColumn<T> = {
  key: keyof T | string;
  header: string;
  render: (row: T) => React.ReactNode;
};

const ESTIMATED_ROW_HEIGHT = 72;// px — approximate height of a table row with padding

export function VirtualDataTable<T extends { id: string }>({
  columns,
  rows,
  emptyMessage,
  getRowHref,
}: {
  columns: DataTableColumn<T>[];
  rows: T[];
  emptyMessage: string;
  getRowHref?: (row: T) => Route;
}) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ESTIMATED_ROW_HEIGHT,
    overscan: 10,
  });

  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-sm text-slate-500">
        {emptyMessage}
      </div>
    );
  }

  const virtualRows = virtualizer.getVirtualItems();

  return (
    <>
      {/* Mobile cards */}
      <div className="space-y-3 md:hidden">
        {rows.map((row) => {
          const href = getRowHref?.(row);
          const cardContent = (
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300 hover:shadow-md">
              <dl className="space-y-3 text-sm">
                {columns.map((column, index) => (
                  <div
                    key={String(column.key)}
                    className={index === 0 ? "border-b border-slate-100 pb-3" : undefined}
                  >
                    <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">{column.header}</dt>
                    <dd className={index === 0 ? "mt-1 font-semibold text-slate-950" : "mt-1 break-words text-slate-700"}>
                      {column.render(row)}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          );
          return href ? (
            <Link key={row.id} href={href} className="block">{cardContent}</Link>
          ) : (
            <div key={row.id}>{cardContent}</div>
          );
        })}
      </div>

      {/* Desktop virtualized grid table */}
      <div
        ref={parentRef}
        className="hidden overflow-auto rounded-2xl border border-slate-200 bg-white shadow-sm md:block"
        style={{ maxHeight: "70vh" }}
      >
        {/* Header row */}
        <div className="sticky top-0 z-10 grid bg-slate-50 border-b border-slate-200"
          style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}
        >
          {columns.map((column) => (
            <div
              key={String(column.key)}
              className="px-4 py-3 text-left text-sm font-semibold text-slate-600"
            >
              {column.header}
            </div>
          ))}
        </div>

        {/* Virtualized rows container */}
        <div style={{ height: `${virtualizer.getTotalSize()}px`, position: "relative" }}>
          {virtualRows.map((virtualRow) => {
            const row = rows[virtualRow.index];
            const href = getRowHref?.(row);

            return (
              <div
                key={row.id}
                className={`grid absolute w-full border-b border-slate-100 ${href ? 'hover:bg-slate-50 cursor-pointer' : ''}`}
                style={{
                  top: 0,
                  transform: `translateY(${virtualRow.start}px)`,
                  height: `${virtualRow.size}px`,
                  gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))`,
                }}
                onClick={href ? () => window.location.href = href as string : undefined}
              >
                {columns.map((column, index) => {
                  const content = column.render(row);
                  return (
                    <div
                      key={String(column.key)}
                      className="px-4 py-3 text-sm text-slate-700 flex items-start"
                    >
                      {href && index === 0 ? (
                        <Link href={href} className="block font-medium text-slate-900 hover:text-blue-700 w-full">
                          {content}
                        </Link>
                      ) : (
                        <span className="w-full">{content}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
