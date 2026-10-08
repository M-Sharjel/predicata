import { useMemo, useState, type ReactNode } from 'react';
import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react';
import { usePagination } from '../hooks/useMedia';
import { EmptyState } from './States';
import { Pagination } from './Inputs';

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  /** Return a sortable value to enable sorting on this column. */
  sort?: (row: T) => string | number;
  /** Hide the label on mobile cards (e.g. for action columns). */
  noLabel?: boolean;
}

/**
 * Responsive table: a normal table on tablet/desktop, stacked cards on phones
 * (the `.rtable` CSS uses each cell's data-label).
 */
export function DataTable<T>({ columns, rows, rowKey, onRowClick, pageSize = 8, empty, ariaLabel }: {
  columns: Column<T>[]; rows: T[]; rowKey: (r: T) => string; onRowClick?: (r: T) => void; pageSize?: number; empty?: ReactNode; ariaLabel: string;
}) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [dir, setDir] = useState<1 | -1>(1);
  const sorted = useMemo(() => {
    const col = columns.find((c) => c.key === sortKey);
    if (!col?.sort) return rows;
    const s = col.sort;
    return [...rows].sort((a, b) => (s(a) > s(b) ? 1 : s(a) < s(b) ? -1 : 0) * dir);
  }, [rows, sortKey, dir, columns]);
  const pg = usePagination(sorted, pageSize);

  if (rows.length === 0) return <>{empty ?? <EmptyState title="No results" message="Try adjusting your filters." />}</>;

  return (
    <>
      <div className="table-wrap">
        <table className="t rtable" aria-label={ariaLabel}>
          <thead>
            <tr>
              {columns.map((c) => (
                <th key={c.key} scope="col" aria-sort={sortKey === c.key ? (dir === 1 ? 'ascending' : 'descending') : undefined} className={c.sort ? 'sortable' : ''}>
                  {c.sort ? (
                    <button onClick={() => { if (sortKey === c.key) setDir((d) => (d === 1 ? -1 : 1)); else { setSortKey(c.key); setDir(1); } }}>
                      {c.header}
                      {sortKey === c.key ? (dir === 1 ? <ArrowUp size={13} /> : <ArrowDown size={13} />) : <ChevronsUpDown size={13} />}
                    </button>
                  ) : c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pg.slice.map((r) => (
              <tr
                key={rowKey(r)}
                className={onRowClick ? 'clickable' : ''}
                tabIndex={onRowClick ? 0 : undefined}
                onClick={() => onRowClick?.(r)}
                onKeyDown={(e) => { if (onRowClick && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); onRowClick(r); } }}
              >
                {columns.map((c) => (
                  <td key={c.key} data-label={c.noLabel ? undefined : c.header}>{c.render(r)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination page={pg.page} pages={pg.pages} total={pg.total} pageSize={pageSize} onPage={pg.setPage} />
    </>
  );
}
