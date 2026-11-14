/**
 * User Session Verification Module
 *
 * Reads and verifies the current session access token from the server-side httpOnly cookie.
 */

import { cookies } from 'next/headers';
import { decodeJwtPayload } from './refresh';

export interface SessionUser {
  userId: string;
  email: string;
  role: string;
  institutionId: string | null;
  /** True for backend-free demo sessions (see lib/auth/demo.ts). */
  isDemo: boolean;
  /**
   * What this user is responsible for, when the token says so:
   * lecturers -> their module codes, HODs -> their division/department.
   * Absent until the backend adds these claims (demo tokens include them).
   */
  scope: SessionScope;
}

export interface SessionScope {
  modules: string[] | null;
  division: string | null;
}

function readScope(payload: Record<string, unknown>): SessionScope {
  const rawModules = payload.scope_modules ?? payload.modules;
  const modules = Array.isArray(rawModules)
    ? rawModules.filter((m): m is string => typeof m === 'string')
    : null;
  const rawDivision = payload.scope_division ?? payload.division ?? payload.department;
  return {
    modules: modules && modules.length > 0 ? modules : null,
    division: typeof rawDivision === 'string' && rawDivision ? rawDivision : null,
  };
}

/**
 * Reads the access token from the server httpOnly cookie, verifies its structure
 * and expiration, and extracts the authenticated identity claims.
 *
 * Returns null if the cookie is missing, invalid, or expired.
 */
export async function getSession(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const token =
      cookieStore.get('access_token')?.value ||
      cookieStore.get('zuri_access_token')?.value;

    if (!token || !token.trim()) {
      return null;
    }

    const payload = decodeJwtPayload(token);
    if (!payload) {
      return null;
    }

    // Verify token expiration
    const exp = typeof payload.exp === 'number' ? payload.exp : null;
    if (exp) {
      const now = Math.floor(Date.now() / 1000);
      if (exp <= now) {
        return null;
      }
    }

    const userId = (payload.user_id || payload.sub) as string;
    if (!userId) {
      return null;
    }

    const email = (payload.email as string) || '';
    const role = (payload.role as string) || '';
    const institutionId = (payload.institution_id as string) || null;

    return {
      userId,
      email,
      role,
      institutionId,
      isDemo: payload.iss === 'zuri-demo',
      scope: readScope(payload),
    };
  } catch {
    return null;
  }
}
