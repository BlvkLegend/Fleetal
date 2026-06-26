import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Spinner } from './primitives';

export function Table({ columns, data, onSort, sortField, sortDir, onRowClick, loading }) {
  return (
    <div className="overflow-x-auto w-full">
      <table className="w-full min-w-[640px]">
        <thead>
          <tr className="border-b border-warm-200 dark:border-warm-700 bg-warm-50/80 dark:bg-warm-800/40">
            {columns.map(col => (
              <th key={col.key} className="th" style={col.width ? { width: col.width } : {}}>
                {col.sortable && onSort ? (
                  <button
                    className="flex items-center gap-1.5 hover:text-warm-800 dark:hover:text-warm-200 transition-colors"
                    onClick={() => onSort(col.key)}
                  >
                    {col.label}
                    {sortField === col.key
                      ? sortDir === 'asc'
                        ? <ChevronUp size={12} className="text-teal-500" />
                        : <ChevronDown size={12} className="text-teal-500" />
                      : <ChevronsUpDown size={12} className="text-warm-400" />
                    }
                  </button>
                ) : col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-warm-100 dark:divide-warm-800">
          {loading ? (
            <tr><td colSpan={columns.length} className="py-16 text-center"><Spinner size={24} className="mx-auto" /></td></tr>
          ) : data.length === 0 ? (
            <tr><td colSpan={columns.length} className="py-12 text-center text-sm text-warm-400">No results found</td></tr>
          ) : data.map((row, i) => (
            <tr
              key={row.id || i}
              className={cn(
                'transition-colors duration-100',
                onRowClick
                  ? 'cursor-pointer hover:bg-teal-50/60 dark:hover:bg-teal-950/20'
                  : 'hover:bg-warm-50 dark:hover:bg-warm-800/30'
              )}
              onClick={() => onRowClick?.(row)}
            >
              {columns.map(col => (
                <td key={col.key} className="td" style={col.width ? { width: col.width } : {}}>
                  {col.render ? col.render(row[col.key], row) : (row[col.key] ?? '—')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Pagination({ page, pages, total, perPage, onChange }) {
  const from = total === 0 ? 0 : (page - 1) * perPage + 1;
  const to   = Math.min(page * perPage, total);

  // Build page numbers with ellipsis
  function getPages() {
    if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1);
    if (page <= 4)  return [1,2,3,4,5,'…',pages];
    if (page >= pages - 3) return [1,'…',pages-4,pages-3,pages-2,pages-1,pages];
    return [1,'…',page-1,page,page+1,'…',pages];
  }

  return (
    <div className="flex flex-col xs:flex-row items-center justify-between px-4 py-3 border-t border-warm-200 dark:border-warm-700 gap-3 text-sm">
      <span className="text-warm-500 dark:text-warm-400 text-xs">
        {total === 0 ? 'No results' : `${from}–${to} of ${total}`}
      </span>
      <div className="flex items-center gap-1">
        <button
          className="btn-ghost py-1 px-2.5 text-xs disabled:opacity-30 disabled:cursor-not-allowed"
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
        >
          Prev
        </button>
        {getPages().map((p, i) =>
          p === '…' ? (
            <span key={`e${i}`} className="w-8 text-center text-warm-400">…</span>
          ) : (
            <button
              key={p}
              className={cn(
                'w-8 h-8 rounded-lg text-xs font-medium transition-colors',
                p === page
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'hover:bg-warm-100 dark:hover:bg-warm-700 text-warm-600 dark:text-warm-400'
              )}
              onClick={() => onChange(p)}
            >
              {p}
            </button>
          )
        )}
        <button
          className="btn-ghost py-1 px-2.5 text-xs disabled:opacity-30 disabled:cursor-not-allowed"
          disabled={page >= pages}
          onClick={() => onChange(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
