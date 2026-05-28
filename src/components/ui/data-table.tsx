import Link from "next/link";
import type { Route } from "next";

export type DataTableColumn<T> = {
  key: keyof T | string;
  header: string;
  render: (row: T) => React.ReactNode;
};

export function DataTable<T extends { id: string }>({
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
  if (rows.length === 0) {
    return <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-sm text-slate-500">{emptyMessage}</div>;
  }

  const renderMobileCard = (row: T) => {
    const href = getRowHref?.(row);
    const cardContent = (
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300 hover:shadow-md">
        <dl className="space-y-3 text-sm">
          {columns.map((column, index) => (
            <div key={String(column.key)} className={index === 0 ? "border-b border-slate-100 pb-3" : undefined}>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">{column.header}</dt>
              <dd className={index === 0 ? "mt-1 font-semibold text-slate-950" : "mt-1 break-words text-slate-700"}>{column.render(row)}</dd>
            </div>
          ))}
        </dl>
      </div>
    );

    return href ? <Link key={row.id} href={href} className="block">{cardContent}</Link> : <div key={row.id}>{cardContent}</div>;
  };

  return (
    <>
      <div className="space-y-3 md:hidden">
        {rows.map(renderMobileCard)}
      </div>
      <div className="hidden overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm md:block">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              {columns.map((column) => (
                <th key={String(column.key)} className="px-4 py-3 text-left font-semibold text-slate-600">
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => {
              const href = getRowHref?.(row);

              return (
                <tr key={row.id} className={href ? "transition hover:bg-slate-50" : undefined}>
                  {columns.map((column, index) => {
                    const content = column.render(row);

                    return (
                      <td key={String(column.key)} className="px-4 py-3 align-top text-slate-700">
                        {href && index === 0 ? (
                          <Link href={href} className="block font-medium text-slate-900 hover:text-blue-700">
                            {content}
                          </Link>
                        ) : (
                          content
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
