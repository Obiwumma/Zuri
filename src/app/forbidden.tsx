import { SystemScreen } from '@/components/ui/SystemScreen';

export default function Forbidden() {
  return (
    <SystemScreen
      icon="shield"
      title="You do not have permission"
      description="Your account cannot access this page. Contact your administrator to request access."
      actionLabel="Return to sign in"
      destination="/login"
    />
  );
}