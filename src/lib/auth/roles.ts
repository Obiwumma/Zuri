// NOTE: This role and shell mapping is pending confirmation with the backend owner.

import type { NavGroup, NavItem } from '@/components/ui/NavShell';
import { canAccessPath, roleTier } from './access';

/**
 * Verified backend roles recognized across Zuri microservices:
 * - student
 * - lecturer
 * - instructor
 * - department_admin
 * - faculty_admin
 * - institution_admin
 * - super_admin
 */
export const BACKEND_ROLES = {
  STUDENT: 'student',
  LECTURER: 'lecturer',
  INSTRUCTOR: 'instructor',
  DEPARTMENT_ADMIN: 'department_admin',
  FACULTY_ADMIN: 'faculty_admin',
  INSTITUTION_ADMIN: 'institution_admin',
  SUPER_ADMIN: 'super_admin',
} as const;

export type BackendRole = (typeof BACKEND_ROLES)[keyof typeof BACKEND_ROLES] | string;

/**
 * Mapping from backend canonical roles to frontend display labels.
 */
export const FRONTEND_ROLE_LABELS: Record<string, string> = {
  [BACKEND_ROLES.INSTITUTION_ADMIN]: 'Institution Admin',
  [BACKEND_ROLES.DEPARTMENT_ADMIN]: 'HOD',
  [BACKEND_ROLES.FACULTY_ADMIN]: 'Faculty Admin',
  [BACKEND_ROLES.LECTURER]: 'Lecturer/Staff',
  [BACKEND_ROLES.INSTRUCTOR]: 'Lecturer/Staff',
  [BACKEND_ROLES.SUPER_ADMIN]: 'Ops',
  [BACKEND_ROLES.STUDENT]: 'Student',
};

/**
 * Canonicalizes a backend role string: lowercase, trimmed, spaces/hyphens -> "_".
 * e.g. "Super Admin", "super-admin", "SUPER_ADMIN" -> "super_admin".
 */
export function normalizeRole(role: string | null | undefined): string {
  return (role ?? '').toLowerCase().trim().replace(/[\s-]+/g, '_');
}

/** True for student accounts, which may not enter either admin shell. */
export function isStudentRole(role: string | null | undefined): boolean {
  return normalizeRole(role) === BACKEND_ROLES.STUDENT;
}

/** True if the role may enter at least one shell (institution or ops). */
export function canAccessAnyShell(role: string | null | undefined): boolean {
  return canAccessInstitution(role) || canAccessOps(role);
}

/**
 * Normalizes and formats a backend role for UI presentation.
 */
export function getFrontendRoleLabel(role: string | null | undefined): string {
  if (!role) return 'Guest';
  const normalized = normalizeRole(role);
  return FRONTEND_ROLE_LABELS[normalized] || role;
}

/**
 * Determines whether a user role is permitted to enter the (institution) shell.
 * Permitted: institution_admin, department_admin, faculty_admin, lecturer, instructor.
 * Students and unauthenticated guests are strictly rejected.
 */
export function canAccessInstitution(role: string | null | undefined): boolean {
  if (!role) return false;
  const normalized = normalizeRole(role);
  if (normalized === BACKEND_ROLES.STUDENT) return false;
  return (
    normalized === BACKEND_ROLES.INSTITUTION_ADMIN ||
    normalized === BACKEND_ROLES.DEPARTMENT_ADMIN ||
    normalized === BACKEND_ROLES.FACULTY_ADMIN ||
    normalized === BACKEND_ROLES.LECTURER ||
    normalized === BACKEND_ROLES.INSTRUCTOR ||
    normalized === 'admin' ||
    normalized === 'hod'
  );
}

/**
 * Determines whether a user role is permitted to enter the (ops) shell.
 * Permitted: super_admin (and ops_admin if defined).
 * All standard institution staff, students, and guests are strictly rejected.
 */
export function canAccessOps(role: string | null | undefined): boolean {
  if (!role) return false;
  const normalized = normalizeRole(role);
  if (normalized === BACKEND_ROLES.STUDENT) return false;
  return normalized === BACKEND_ROLES.SUPER_ADMIN || normalized === 'ops' || normalized === 'ops_admin';
}

/**
 * Filters the institutional navigation tree using the shared route-access
 * table (lib/auth/access.ts), so menu links always match what the middleware
 * allows. Groups left with no links are dropped.
 */
export function filterNavGroupsByRole(
  navGroups: NavGroup[],
  role: string | null | undefined
): NavGroup[] {
  if (!role) return [];
  // Non-admins only get their personal settings, so the link is just "Settings".
  const isAdmin = roleTier(role) === 'admin';
  const relabel = (item: NavItem): NavItem =>
    !isAdmin && item.href === '/settings' ? { ...item, label: 'Settings' } : item;
  const filterItems = (items: NavItem[]): NavItem[] =>
    items
      .filter((item) => canAccessPath(role, item.href))
      .map(relabel)
      .map((item) => (item.subItems ? { ...item, subItems: filterItems(item.subItems) } : item));

  return navGroups
    .map((group) => ({ ...group, items: filterItems(group.items) }))
    .filter((group) => group.items.length > 0);
}
