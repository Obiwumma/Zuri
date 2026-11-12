'use client';

import React from 'react';
import { useOpsTheme } from '@/lib/opsTheme';

export function OpsThemeRoot({ children }: { children: React.ReactNode }) {
  const theme = useOpsTheme();

  return (
    <div data-theme="ops" data-theme-mode={theme} className={`${theme} min-h-dvh bg-ops-canvas text-ops-text`}>
      {children}
    </div>
  );
}
