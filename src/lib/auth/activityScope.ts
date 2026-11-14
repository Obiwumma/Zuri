/**
 * Academic Activity scoping by role (frontend, sample data).
 *
 * - Institution admin: everything, including Governance (full audit trail).
 * - HOD: teaching categories only, limited to their division when known.
 * - Lecturer: teaching categories only, limited to their modules when known.
 *
 * When the backend ships a scoped activity endpoint it must apply the same
 * rules server-side; this file then only shapes the UI.
 */

import { roleTier } from './access';
import type { SessionScope } from './session';

export const TEACHING_CATEGORIES = ['Intervention', 'Knowledge ingest', 'Assessment', 'Supervision'] as const;

export interface ActivityScope {
  isFullAccess: boolean;
  categories: readonly string[] | null; // null = all categories
  modules: string[] | null;
  division: string | null;
  /** Human-readable description of what the user is seeing, or null for full access. */
  label: string | null;
}

export function getActivityScope(role: string | null, scope: SessionScope): ActivityScope {
  const tier = roleTier(role);
  if (tier === 'admin') {
    return { isFullAccess: true, categories: null, modules: null, division: null, label: null };
  }
  if (tier === 'hod') {
    return {
      isFullAccess: false,
      categories: TEACHING_CATEGORIES,
      modules: null,
      division: scope.division,
      label: scope.division ? `Teaching activity in ${scope.division}` : 'Teaching activity in your department',
    };
  }
  // Lecturer (and any other staff role): narrowest view.
  return {
    isFullAccess: false,
    categories: TEACHING_CATEGORIES,
    modules: scope.modules,
    division: null,
    label: scope.modules ? `Teaching activity for your courses: ${scope.modules.join(', ')}` : 'Teaching activity for your courses',
  };
}

export function applyActivityScope<T extends { category: string; moduleCode: string; division: string }>(
  items: T[],
  s: ActivityScope
): T[] {
  return items.filter(
    (i) =>
      (!s.categories || s.categories.includes(i.category)) &&
      (!s.modules || s.modules.includes(i.moduleCode)) &&
      (!s.division || i.division === s.division)
  );
}
