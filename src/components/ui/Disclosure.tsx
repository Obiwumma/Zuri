'use client';

/**
 * Progressive disclosure primitives.
 *
 * `useDisclosure` – open/closed state with optional per-browser memory
 * (localStorage, failure-tolerant) so a section someone always keeps open
 * stays open on their next visit.
 *
 * `DisclosurePanel` – animated reveal (CSS grid 0fr → 1fr) that keeps hidden
 * content out of the tab order and away from screen readers while closed.
 */

import React, { useCallback, useEffect, useId, useState } from 'react';

const STORAGE_PREFIX = 'zuri:disclosure:';

export interface UseDisclosureOptions {
  /** Initial state when nothing is remembered. Default: false (closed). */
  defaultOpen?: boolean;
  /** If set, the open/closed state is remembered per browser under this key. */
  persistKey?: string;
}

export interface DisclosureState {
  isOpen: boolean;
  toggle: () => void;
  setOpen: (open: boolean) => void;
  /** Spread onto the trigger <button>. */
  triggerProps: {
    'aria-expanded': boolean;
    'aria-controls': string;
    onClick: () => void;
  };
  /** id to give the panel (DisclosurePanel takes it via `id`). */
  panelId: string;
}

export function useDisclosure({
  defaultOpen = false,
  persistKey,
}: UseDisclosureOptions = {}): DisclosureState {
  const panelId = useId();
  const [isOpen, setIsOpen] = useState(defaultOpen);

  // Restore remembered state after mount (avoids SSR/client mismatch).
  useEffect(() => {
    if (!persistKey) return;
    try {
      const stored = window.localStorage.getItem(STORAGE_PREFIX + persistKey);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time sync from browser storage
      if (stored === '1' || stored === '0') setIsOpen(stored === '1');
    } catch {
      /* storage unavailable: keep default */
    }
  }, [persistKey]);

  const setOpen = useCallback(
    (open: boolean) => {
      setIsOpen(open);
      if (!persistKey) return;
      try {
        window.localStorage.setItem(STORAGE_PREFIX + persistKey, open ? '1' : '0');
      } catch {
        /* storage unavailable: state still works for this visit */
      }
    },
    [persistKey]
  );

  const toggle = useCallback(() => setOpen(!isOpen), [isOpen, setOpen]);

  return {
    isOpen,
    toggle,
    setOpen,
    panelId,
    triggerProps: { 'aria-expanded': isOpen, 'aria-controls': panelId, onClick: toggle },
  };
}

export interface DisclosurePanelProps {
  id: string;
  isOpen: boolean;
  children: React.ReactNode;
  className?: string;
}

export function DisclosurePanel({ id, isOpen, children, className = '' }: DisclosurePanelProps) {
  return (
    <div
      id={id}
      inert={!isOpen}
      aria-hidden={!isOpen}
      className={`grid transition-[grid-template-rows,opacity] duration-200 ease-out motion-reduce:transition-none ${
        isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
      }`}
    >
      <div className="min-h-0 overflow-hidden">
        <div className={className}>{children}</div>
      </div>
    </div>
  );
}
