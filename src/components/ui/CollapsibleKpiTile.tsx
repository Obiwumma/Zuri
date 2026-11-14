'use client';

/**
 * KPI tile with progressive disclosure.
 *
 * Closed (layer 1 – glance): label + headline value.
 * Open   (layer 2/3):        trend badge, explanation, optional details, link.
 *
 * `alert` is the one thing allowed to show while closed: use it only when a
 * metric needs attention, so silence means "all fine".
 */

import React from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronDown, AlertTriangle } from 'lucide-react';
import { KpiDeltaBadge, type KpiDirection } from './KpiDeltaBadge';
import { DisclosurePanel, useDisclosure } from './Disclosure';

export interface CollapsibleKpiTileProps {
  label: string;
  value: string | number;
  delta?: { value: string; direction?: KpiDirection };
  /** One-line explanation of the number (shown when open). */
  subtext?: React.ReactNode;
  /** Deeper detail (shown when open). */
  details?: React.ReactNode;
  /** Link to the page with the full picture (shown when open). */
  link?: { href: string; label: string };
  /** Attention line shown even while closed. Leave unset when all is fine. */
  alert?: string;
  defaultOpen?: boolean;
  /** Remember open/closed per browser under this key. */
  persistKey?: string;
  className?: string;
}

export function CollapsibleKpiTile({
  label,
  value,
  delta,
  subtext,
  details,
  link,
  alert,
  defaultOpen = false,
  persistKey,
  className = '',
}: CollapsibleKpiTileProps) {
  const { isOpen, triggerProps, panelId } = useDisclosure({ defaultOpen, persistKey });

  return (
    <article
      className={`bg-surface-container-lowest rounded-md border transition-colors ${
        isOpen ? 'border-outline' : 'border-outline-variant hover:border-outline'
      } ${className}`}
    >
      <button
        type="button"
        {...triggerProps}
        aria-label={`${label}: ${value}. ${isOpen ? 'Hide' : 'Show'} details`}
        className="w-full text-left p-4 md:p-5 cursor-pointer rounded-md outline-none focus-visible:focus-ring"
      >
        <span className="flex items-start justify-between gap-2">
          <span className="text-caption text-on-surface-variant font-medium leading-snug">{label}</span>
          <ChevronDown
            className={`w-4 h-4 mt-px shrink-0 text-on-surface-variant transition-transform duration-200 motion-reduce:transition-none ${
              isOpen ? 'rotate-180' : ''
            }`}
            aria-hidden="true"
          />
        </span>
        <span className="block mt-1.5 text-h1 font-serif [data-theme='ops']_&:font-sans [data-theme='ops']_&:font-semibold font-medium text-on-surface tracking-tight tabular-nums truncate">
          {value}
        </span>
        {alert && (
          <span className="mt-2 flex items-center gap-1.5 text-caption font-medium text-error">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span className="truncate">{alert}</span>
          </span>
        )}
      </button>

      <DisclosurePanel id={panelId} isOpen={isOpen} className="px-4 md:px-5 pb-4 md:pb-5">
        <div className="pt-3 border-t border-outline-variant/40 flex flex-col gap-2.5">
          {(delta || subtext) && (
            <div className="flex flex-col items-start gap-1.5">
              {delta && <KpiDeltaBadge value={delta.value} direction={delta.direction} />}
              {subtext && (
                <p className="text-caption text-on-surface-variant leading-normal">{subtext}</p>
              )}
            </div>
          )}
          {details && <div className="text-caption text-on-surface leading-normal">{details}</div>}
          {link && (
            <Link
              href={link.href}
              className="inline-flex items-center gap-1 text-caption font-medium text-primary hover:underline outline-none focus-visible:focus-ring rounded-xs self-start"
            >
              <span>{link.label}</span>
              <ArrowRight className="w-3 h-3" aria-hidden="true" />
            </Link>
          )}
        </div>
      </DisclosurePanel>
    </article>
  );
}

export default CollapsibleKpiTile;
