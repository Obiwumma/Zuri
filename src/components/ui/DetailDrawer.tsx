'use client';

/**
 * Right-hand detail drawer for progressive disclosure on directory pages:
 * tables show only the columns needed to find a record; everything else
 * lives here, one click away.
 *
 * - Closes on Escape, backdrop click, or the close button.
 * - Moves focus into the drawer on open and restores it on close.
 * - Locks page scroll while open.
 */

import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export interface DetailField {
  label: string;
  value: React.ReactNode;
  /** Span both columns of the field grid. */
  wide?: boolean;
}

export interface DetailDrawerProps {
  open: boolean;
  onClose: () => void;
  /** Small label above the title, e.g. "Staff member". */
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  /** Label/value pairs rendered in a two-column grid. */
  fields?: DetailField[];
  /** Any extra content under the fields. */
  children?: React.ReactNode;
  /** Footer actions (buttons). */
  footer?: React.ReactNode;
  /** Accessible name for the dialog. */
  ariaLabel: string;
}

export function DetailDrawer({
  open,
  onClose,
  eyebrow,
  title,
  subtitle,
  fields,
  children,
  footer,
  ariaLabel,
}: DetailDrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    panelRef.current?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseRef.current();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      previouslyFocused?.focus?.();
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
      className="fixed inset-0 z-50 bg-on-surface/40 backdrop-blur-xs flex justify-end"
      onClick={onClose}
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        className="w-full max-w-lg h-full bg-surface-container-lowest text-on-surface flex flex-col border-l border-outline-variant shadow-lg outline-none animate-[drawer-in_200ms_ease-out] motion-reduce:animate-none"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          <div className="flex items-start justify-between gap-4 pb-4 border-b border-outline-variant/40">
            <div className="min-w-0">
              {eyebrow && (
                <span className="text-caption text-on-surface-variant font-medium">{eyebrow}</span>
              )}
              <h2 className="text-2xl font-serif font-semibold text-on-surface mt-1 break-words">
                {title}
              </h2>
              {subtitle && (
                <div className="text-body-sm text-on-surface-variant mt-0.5">{subtitle}</div>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-default text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer outline-none focus-visible:focus-ring shrink-0"
              aria-label="Close details"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>

          {fields && fields.length > 0 && (
            <dl className="grid grid-cols-2 gap-x-4 gap-y-4 bg-surface-container-low p-4 rounded-default border border-outline-variant/30 text-body-sm">
              {fields.map((f) => (
                <div key={f.label} className={f.wide ? 'col-span-2' : ''}>
                  <dt className="text-caption text-on-surface-variant">{f.label}</dt>
                  <dd className="font-medium text-on-surface mt-0.5">{f.value}</dd>
                </div>
              ))}
            </dl>
          )}

          {children}
        </div>

        {footer && (
          <div className="px-6 sm:px-8 py-4 border-t border-outline-variant/40 flex items-center justify-end gap-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Splits table columns into those shown in the table and those moved into the
 * drawer, so every hidden column stays one click away with its own formatting.
 */
export function splitColumns<C extends { header: string }>(
  columns: C[],
  visibleHeaders: string[]
): { visible: C[]; hidden: C[] } {
  const keep = new Set(visibleHeaders);
  return {
    visible: columns.filter((c) => keep.has(c.header)),
    hidden: columns.filter((c) => !keep.has(c.header)),
  };
}

/** Turns hidden columns into drawer fields for one row. */
export function columnsToFields<T>(
  columns: { header: string; accessor: (row: T, index: number) => React.ReactNode }[],
  row: T,
  index = 0
): DetailField[] {
  return columns.map((c) => ({ label: c.header, value: c.accessor(row, index) }));
}
