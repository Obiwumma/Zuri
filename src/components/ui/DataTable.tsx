import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { ChevronRight, Database } from 'lucide-react';
import { Skeleton } from './Skeleton';
import { EmptyState } from './EmptyState';

export interface Column<T> {
  header: string;
  accessor: (row: T, index: number) => React.ReactNode;
  className?: string;
  numeric?: boolean;
  isTitle?: boolean;
  isKeyField?: boolean;
}

export interface DataTableProps<T> {
  title?: string;
  subtitle?: string;
  categoryLabel?: string;
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T, index: number) => string;
  isLoading?: boolean;
  skeletonRowCount?: number;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
  emptyIcon?: LucideIcon;
  emptyState?: React.ReactNode;
  onRowClick?: (row: T) => void;
  actions?: React.ReactNode;
  disableStacked?: boolean;
  className?: string;
}

export function DataTable<T>({
  title,
  subtitle,
  categoryLabel,
  columns,
  data,
  keyExtractor,
  isLoading = false,
  skeletonRowCount = 5,
  emptyTitle = 'No entries found',
  emptyDescription = 'There are no items to display right now.',
  emptyAction,
  emptyIcon = Database,
  emptyState,
  onRowClick,
  actions,
  disableStacked = false,
  className = '',
}: DataTableProps<T>) {
  const isOverThreeColumns = columns.length > 3 && !disableStacked;

  // Determine title and key field columns for mobile stacked row view
  const titleColumn = columns.find((c) => c.isTitle) || columns[0];
  const keyColumns = columns.filter((c) => c !== titleColumn && (c.isKeyField || true)).slice(0, 2);

  return (
    <section
      className={`bg-surface-container-lowest rounded-md border border-outline-variant p-4 md:p-5 flex flex-col gap-4 shadow-none transition-colors ${className}`}
    >
      {/* Header strip if title or actions provided */}
      {(title || subtitle || categoryLabel || actions) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-outline-variant/30">
          <div>
            {categoryLabel && (
              <span className="text-caption text-secondary font-medium tracking-wide block mb-0.5">
                {categoryLabel}
              </span>
            )}
            {title && (
              <h2 className="text-h3 font-serif [data-theme='ops']_&:font-sans text-on-surface font-semibold">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-body-sm text-on-surface-variant mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
          {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
        </div>
      )}

      {/* MOBILE STACKED VIEW (when > 3 columns and screen < md) */}
      {isOverThreeColumns && !isLoading && data.length > 0 && (
        <div className="md:hidden flex flex-col divide-y divide-outline-variant/30">
          {data.map((row, rowIdx) => (
            <div
              key={keyExtractor(row, rowIdx)}
              onClick={() => onRowClick?.(row)}
              className={`py-3 px-1 flex items-center justify-between gap-3 ${
                onRowClick ? 'cursor-pointer hover:bg-surface-container -mx-2 px-3 rounded' : ''
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="text-body-sm font-medium text-on-surface truncate">
                  {titleColumn.accessor(row, rowIdx)}
                </div>
                <div className="flex items-center gap-3 mt-1 text-caption text-on-surface-variant">
                  {keyColumns.map((col, cIdx) => (
                    <span key={cIdx} className="truncate">
                      <span className="text-on-surface-variant/70 mr-1">{col.header}:</span>
                      <span className={col.numeric ? 'tabular-nums font-mono' : ''}>
                        {col.accessor(row, rowIdx)}
                      </span>
                    </span>
                  ))}
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-outline shrink-0" aria-hidden="true" />
            </div>
          ))}
        </div>
      )}

      {/* DESKTOP TABLE VIEW (or all views if <= 3 columns) */}
      <div className={`overflow-x-auto ${isOverThreeColumns ? 'hidden md:block' : 'block'}`}>
        <table className="w-full text-left text-body-sm">
          <thead>
            <tr className="sticky top-0 bg-surface-container-low/95 backdrop-blur-sm z-10 border-b border-outline-variant text-caption font-medium text-on-surface-variant h-11">
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  scope="col"
                  className={`px-4 py-2.5 font-medium select-none ${
                    col.numeric ? 'text-right' : 'text-left'
                  } ${col.className || ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/20">
            {isLoading ? (
              // Loading state: Skeleton rows
              Array.from({ length: skeletonRowCount }).map((_, rIdx) => (
                <tr key={rIdx} className="h-12">
                  {columns.map((col, cIdx) => (
                    <td key={cIdx} className="px-4 py-3">
                      <Skeleton variant="text" className={col.numeric ? 'ml-auto w-16' : 'w-28'} />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              // Empty state inside table
              <tr>
                <td colSpan={columns.length} className="py-12 px-4">
                  {emptyState || (
                    <EmptyState
                      icon={emptyIcon}
                      title={emptyTitle}
                      description={emptyDescription}
                      action={emptyAction}
                    />
                  )}
                </td>
              </tr>
            ) : (
              // Data rows (48px height, tabular numbers on numeric, hover highlight)
              data.map((row, rowIdx) => (
                <tr
                  key={keyExtractor(row, rowIdx)}
                  onClick={() => onRowClick?.(row)}
                  className={`h-12 hover:bg-surface-container transition-colors ${
                    onRowClick ? 'cursor-pointer' : ''
                  }`}
                >
                  {columns.map((col, colIdx) => (
                    <td
                      key={colIdx}
                      className={`px-4 py-3 text-on-surface ${
                        col.numeric ? 'text-right tabular-nums' : ''
                      } ${col.className || ''}`}
                    >
                      {col.accessor(row, rowIdx)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Loading state for mobile stacked view */}
      {isOverThreeColumns && isLoading && (
        <div className="md:hidden flex flex-col gap-3 py-2">
          {Array.from({ length: skeletonRowCount }).map((_, idx) => (
            <div key={idx} className="p-3 bg-surface-container-low rounded flex flex-col gap-2">
              <Skeleton variant="text" className="w-2/3 h-4" />
              <div className="flex gap-4">
                <Skeleton variant="text" className="w-1/3 h-3" />
                <Skeleton variant="text" className="w-1/4 h-3" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state for mobile stacked view */}
      {isOverThreeColumns && !isLoading && data.length === 0 && (
        <div className="md:hidden py-8">
          {emptyState || (
            <EmptyState
              icon={emptyIcon}
              title={emptyTitle}
              description={emptyDescription}
              action={emptyAction}
            />
          )}
        </div>
      )}
    </section>
  );
}

export default DataTable;
