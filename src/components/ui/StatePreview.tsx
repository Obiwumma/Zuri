'use client';

import React, { useState, useSyncExternalStore } from 'react';
import { Database } from 'lucide-react';
import { Alert } from './Alert';
import { Button } from './Button';
import { EmptyState } from './EmptyState';
import { Skeleton } from './Skeleton';

export type PreviewState = 'default' | 'loading' | 'empty' | 'error';

function subscribeToLocation(callback: () => void) {
  window.addEventListener('popstate', callback);
  return () => window.removeEventListener('popstate', callback);
}

function getStatePreviewSnapshot() {
  return process.env.NODE_ENV !== 'production' &&
    new URLSearchParams(window.location.search).get('states') === '1';
}

function getServerStatePreviewSnapshot() {
  return false;
}

export function StatePreview({
  children,
  loadingLabel,
  emptyTitle,
  emptyDescription,
  errorDescription,
}: {
  children: React.ReactNode;
  loadingLabel: string;
  emptyTitle: string;
  emptyDescription: string;
  errorDescription: string;
}) {
  const [state, setState] = useState<PreviewState>('default');
  const enabled = useSyncExternalStore(
    subscribeToLocation,
    getStatePreviewSnapshot,
    getServerStatePreviewSnapshot
  );

  if (!enabled) return children;

  return (
    <div className="space-y-4">
      <nav aria-label="Page state preview" className="flex flex-wrap gap-2 border-b border-outline-variant pb-3">
        {(['default', 'loading', 'empty', 'error'] as const).map((pageState) => (
          <Button
            key={pageState}
            variant={state === pageState ? 'secondary' : 'ghost'}
            size="sm"
            aria-pressed={state === pageState}
            onClick={() => setState(pageState)}
          >
            {pageState[0].toUpperCase() + pageState.slice(1)}
          </Button>
        ))}
      </nav>

      {state === 'default' && children}
      {state === 'loading' && (
        <section aria-label={loadingLabel} aria-busy="true" className="space-y-4 py-4">
          <p className="text-body-sm text-on-surface-variant">{loadingLabel}</p>
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-40 w-full" />
        </section>
      )}
      {state === 'empty' && (
        <EmptyState
          icon={Database}
          title={emptyTitle}
          description={emptyDescription}
          action={<Button onClick={() => setState('default')}>View all records</Button>}
        />
      )}
      {state === 'error' && (
        <Alert
          variant="error"
          title="This page could not load"
          description={errorDescription}
          action={<Button variant="secondary" onClick={() => setState('default')}>Try again</Button>}
        />
      )}
    </div>
  );
}
