'use client';

import React from 'react';
import { AlertTriangle, KeyRound, Search, Settings, ShieldX } from 'lucide-react';
import { Button } from './Button';
import { EmptyState } from './EmptyState';

const systemIcons = {
  alert: AlertTriangle,
  key: KeyRound,
  search: Search,
  settings: Settings,
  shield: ShieldX,
} as const;

export function SystemScreen({
  icon,
  title,
  description,
  actionLabel,
  destination,
  action = 'navigate',
  onRetry,
}: {
  icon: keyof typeof systemIcons;
  title: string;
  description: string;
  actionLabel: string;
  destination?: string;
  action?: 'navigate' | 'reload';
  onRetry?: () => void;
}) {
  const Icon = systemIcons[icon];

  return (
    <main className="min-h-dvh bg-surface px-4 py-12 text-on-surface flex items-center justify-center">
      <EmptyState
        icon={Icon}
        title={title}
        description={description}
        action={
          <Button
            onClick={() => {
              if (onRetry) onRetry();
              else if (action === 'reload') window.location.reload();
              else if (destination) window.location.assign(destination);
            }}
          >
            {actionLabel}
          </Button>
        }
      />
    </main>
  );
}