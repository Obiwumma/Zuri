import { SystemScreen } from '@/components/ui/SystemScreen';

export default function SessionExpiredPage() {
  return (
    <SystemScreen
      icon="key"
      title="Your session has expired"
      description="Sign in again to continue. Any changes you have not saved may be lost."
      actionLabel="Sign in"
      destination="/login"
    />
  );
}