/**
 * Route-level access control for the institution shell.
 *
 * ONE table decides which roles may open which page. It is used by:
 *   - the middleware (blocks direct URL access with 403 /access-denied)
 *   - the navigation filter (hides links the role cannot open)
 * so the menu and the guard can never disagree.
 *
 * Unknown institution routes default to admin-only (fail closed).
 *
 * NOTE: this controls which PAGES a role can open. Which RECORDS a role may
 * see (e.g. only their own courses) must also be enforced by the backend API.
 */

import { normalizeRole, BACKEND_ROLES } from './roles';

export type AccessTier = 'admin' | 'hod' | 'lecturer';

const ALL: AccessTier[] = ['admin', 'hod', 'lecturer'];
const ADMIN_HOD: AccessTier[] = ['admin', 'hod'];
const ADMIN: AccessTier[] = ['admin'];

/** Maps a backend role to its access tier (null = no institution access). */
export function roleTier(role: string | null | undefined): AccessTier | null {
  const r = normalizeRole(role);
  if (r === BACKEND_ROLES.INSTITUTION_ADMIN || r === 'admin') return 'admin';
  if (r === BACKEND_ROLES.DEPARTMENT_ADMIN || r === BACKEND_ROLES.FACULTY_ADMIN || r === 'hod') return 'hod';
  if (r === BACKEND_ROLES.LECTURER || r === BACKEND_ROLES.INSTRUCTOR) return 'lecturer';
  return null;
}

/**
 * Page → roles allowed. Keys are paths; a key with a #hash refines access to
 * a section link (used by the menu, e.g. Settings → Data & Privacy).
 */
export const ROUTE_ACCESS: Record<string, AccessTier[]> = {
  // Overview
  '/dashboard': ALL,
  '/activity': ALL, // content is scoped per role (see activityScope.ts)

  // Academic structure
  '/departments': ADMIN_HOD,
  '/enrollment': ADMIN_HOD,
  '/courses': ALL,
  '/timetable': ALL,
  '/calendar': ADMIN_HOD,

  // People & access
  '/students': ALL,
  '/lecturers': ADMIN_HOD,
  '/staff': ADMIN_HOD,
  '/roles': ADMIN,
  '/roles#audit-logs': ADMIN,

  // Content & knowledge
  '/library': ALL,
  '/materials': ALL,
  '/extraction': ALL,

  // Intelligence & analytics
  '/analytics': ALL,
  '/analytics/interventions': ALL,
  '/analytics/quiz-performance': ALL,
  '/analytics/ai-usage': ADMIN_HOD,

  // System & governance (personal settings + notifications for everyone)
  '/notifications': ALL,
  '/settings': ALL,
  '/settings#privacy': ADMIN,
};

/**
 * Can this role open this path or menu href?
 * Resolution: exact href (incl. #hash) → path without hash → longest parent
 * path (so /courses/123 follows /courses) → otherwise admin only.
 */
export function canAccessPath(role: string | null | undefined, hrefOrPath: string): boolean {
  const tier = roleTier(role);
  if (!tier) return false;

  if (ROUTE_ACCESS[hrefOrPath]) return ROUTE_ACCESS[hrefOrPath].includes(tier);

  const path = (hrefOrPath.split('#')[0].split('?')[0] || '/').replace(/\/+$/, '') || '/';
  if (ROUTE_ACCESS[path]) return ROUTE_ACCESS[path].includes(tier);

  const parent = Object.keys(ROUTE_ACCESS)
    .filter((k) => !k.includes('#') && path.startsWith(`${k}/`))
    .sort((a, b) => b.length - a.length)[0];
  if (parent) return ROUTE_ACCESS[parent].includes(tier);

  return tier === 'admin';
}
