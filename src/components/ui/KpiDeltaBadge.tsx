import React from 'react';
import { TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';

export type KpiDirection = 'up' | 'down' | 'neutral';

/** Coloured trend pill used by KpiTile and CollapsibleKpiTile. */
export function KpiDeltaBadge({ value, direction = 'up' }: { value?: string; direction?: KpiDirection }) {
  if (!value) return null;

  let badgeClass = 'bg-success-container text-success';
  let DeltaIcon = TrendingUp;
  if (direction === 'down') {
    badgeClass = 'bg-error-container text-error';
    DeltaIcon = TrendingDown;
  } else if (direction === 'neutral') {
    badgeClass = 'bg-surface-container-high text-on-surface-variant';
    DeltaIcon = ArrowRight;
  }

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-caption font-medium shrink-0 select-none ${badgeClass}`}
    >
      <DeltaIcon className="w-3 h-3 stroke-[2]" aria-hidden="true" />
      <span>{value}</span>
    </span>
  );
}
