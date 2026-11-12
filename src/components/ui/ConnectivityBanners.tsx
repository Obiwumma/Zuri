'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useOpsTheme } from '@/lib/opsTheme';
import { Button } from './Button';
import { Alert } from './Alert';

export function ConnectivityBanners() {
  const pathname = usePathname();
  const isOps = pathname.startsWith('/ops');
  const theme = useOpsTheme();
  const [isOffline, setIsOffline] = useState(false);
  const [isServiceBusy, setIsServiceBusy] = useState(false);

  useEffect(() => {
    const updateOfflineState = () => setIsOffline(!navigator.onLine);
    const originalFetch = window.fetch;
    const observedFetch: typeof window.fetch = async (...args) => {
      try {
        const response = await originalFetch.apply(window, args);
        if (response.status === 503) setIsServiceBusy(true);
        return response;
      } catch (error) {
        if (!navigator.onLine) setIsOffline(true);
        throw error;
      }
    };

    updateOfflineState();
    window.addEventListener('offline', updateOfflineState);
    window.addEventListener('online', updateOfflineState);
    window.fetch = observedFetch;

    return () => {
      window.removeEventListener('offline', updateOfflineState);
      window.removeEventListener('online', updateOfflineState);
      if (window.fetch === observedFetch) window.fetch = originalFetch;
    };
  }, []);

  if (!isOffline && !isServiceBusy) return null;

  return (
    <div
      data-theme={isOps ? 'ops' : undefined}
      data-theme-mode={isOps ? theme : undefined}
      className="fixed inset-x-4 top-16 z-50 mx-auto flex max-w-3xl flex-col gap-2"
    >
      {isOffline && (
        <Alert
          variant="warning"
          title="You are offline"
          description="Check your internet connection. This page will reconnect when you are back online."
        />
      )}
      {isServiceBusy && (
        <Alert
          variant="warning"
          title="The service is busy"
          description="The request could not be completed right now. Try again when the service is available."
          action={
            <Button variant="secondary" size="sm" onClick={() => window.location.reload()}>
              Try again
            </Button>
          }
        />
      )}
    </div>
  );
}