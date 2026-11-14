import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { Icon } from '@/components/ui/Icon';
import { KpiDeltaBadge } from './KpiDeltaBadge';

export interface KpiTileProps {
  label: string;
  value: string | number;
  delta?: {
    value: string;
    direction?: 'up' | 'down' | 'neutral';
  };
  trend?: string;
  trendDirection?: 'up' | 'down' | 'neutral';
  icon?: string | LucideIcon;
  subtext?: React.ReactNode;
  progressWidth?: string;
  className?: string;
}

export function KpiTile({
  label,
  value,
  delta,
  trend,
  trendDirection = 'up',
  icon,
  subtext,
  progressWidth,
  className = '',
}: KpiTileProps) {
  // Support both new `delta` object and backward-compatible `trend`/`trendDirection`
  const deltaValue = delta?.value || trend;
  const direction = delta?.direction || trendDirection;

  return (
    <article
      className={`bg-surface-container-lowest p-4 md:p-5 rounded-md border border-outline-variant flex flex-col justify-between shadow-none transition-colors ${className}`}
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-caption text-on-surface-variant font-medium truncate">
            {label}
          </span>
          {icon && (
            <div className="text-on-surface-variant shrink-0">
              {typeof icon === 'string' ? (
                <Icon name={icon} size={18} aria-hidden="true" />
              ) : (
                React.createElement(icon, { className: 'w-4.5 h-4.5', 'aria-hidden': 'true' })
              )}
            </div>
          )}
        </div>
        <div className="flex items-baseline justify-between gap-3 my-1">
          <span className="text-h1 font-serif [data-theme='ops']_&:font-sans [data-theme='ops']_&:font-semibold text-on-surface font-medium tracking-tight truncate tabular-nums">
            {value}
          </span>
          <KpiDeltaBadge value={deltaValue} direction={direction} />
        </div>
      </div>
      {subtext && (
        <div className="mt-3 pt-2.5 border-t border-outline-variant/30">
          <div className="text-caption text-on-surface-variant leading-normal">
            {subtext}
          </div>
          {progressWidth && (
            <div className="mt-2 w-full bg-surface-container rounded-full h-1 overflow-hidden">
              <div
                className="bg-primary h-1 rounded-full transition-all"
                style={{ width: progressWidth }}
              />
            </div>
          )}
        </div>
      )}
    </article>
  );
}

export default KpiTile;
