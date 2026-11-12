'use client';

import './globals.css';
import { SystemScreen } from '@/components/ui/SystemScreen';

export default function GlobalError({
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <SystemScreen
          icon="alert"
          title="Zuri could not start"
          description="A temporary problem stopped the app from opening. Try again, and contact support if it continues."
          actionLabel="Try again"
          onRetry={retry}
        />
      </body>
    </html>
  );
}