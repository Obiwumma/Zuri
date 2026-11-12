'use client';

import { SystemScreen } from '@/components/ui/SystemScreen';

export default function ErrorPage({
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <SystemScreen
      icon="alert"
      title="This page could not load"
      description="A temporary problem stopped this page from loading. Try again, and contact support if it continues."
      actionLabel="Try again"
      onRetry={retry}
    />
  );
}