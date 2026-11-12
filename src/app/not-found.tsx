import { SystemScreen } from '@/components/ui/SystemScreen';

export default function NotFound() {
  return (
    <SystemScreen
      icon="search"
      title="Page not found"
      description="This page may have moved or the address may be incorrect. Check the address or return to the dashboard."
      actionLabel="Go to dashboard"
      destination="/dashboard"
    />
  );
}