import { SystemScreen } from '@/components/ui/SystemScreen';
import { getSession } from '@/lib/auth/session';
import { canAccessInstitution, canAccessOps } from '@/lib/auth/roles';

export default async function AccessDeniedPage() {
  // Signed-in staff who opened a page their role can't use go back to their
  // own home; everyone else (e.g. students, signed-out) goes to sign in.
  const session = await getSession();
  const role = session?.role;
  const home = canAccessInstitution(role) ? '/dashboard' : canAccessOps(role) ? '/ops/health' : null;

  return (
    <SystemScreen
      icon="shield"
      title="You do not have permission"
      description={
        home
          ? 'Your role does not include access to this page. Contact your administrator if you need it.'
          : 'Your account cannot access this page. Contact your administrator to request access.'
      }
      actionLabel={home ? 'Back to dashboard' : 'Return to sign in'}
      destination={home ?? '/login'}
    />
  );
}
