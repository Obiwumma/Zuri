import { SystemScreen } from '@/components/ui/SystemScreen';

export default function MaintenancePage() {
  return (
    <SystemScreen
      icon="settings"
      title="Zuri is temporarily unavailable"
      description="Maintenance is in progress. Try again later to return to your work."
      actionLabel="Try again"
      action="reload"
    />
  );
}