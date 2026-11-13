/**
 * GET /api/auth/status
 *
 * Go-live check: reports whether the backend gateway is configured and
 * reachable (by fetching its JWT public key), and whether demo mode is on.
 * Never returns secrets or the backend URL itself.
 */

import { NextResponse } from 'next/server';
import { isDemoModeEnabled } from '@/lib/auth/demo';
import { getApiBaseUrl } from '@/lib/api/config';
import { ENDPOINTS } from '@/lib/api/endpoints';

export const dynamic = 'force-dynamic';

export async function GET() {
  const backendConfigured = Boolean(process.env.ZURI_API_BASE_URL?.trim());
  let backendReachable = false;
  let backendError: string | null = null;

  if (backendConfigured) {
    try {
      // Direct fetch (no cache fallback) so this reflects the backend right now.
      const res = await fetch(`${getApiBaseUrl()}${ENDPOINTS.auth.publicKey}`, {
        headers: { Accept: 'application/json' },
        cache: 'no-store',
        signal: AbortSignal.timeout(10_000),
      });
      const body = res.ok ? await res.text() : '';
      backendReachable = res.ok && body.includes('BEGIN PUBLIC KEY');
      if (!backendReachable) {
        backendError = res.ok
          ? 'Public key endpoint responded but returned no PEM key'
          : `Public key endpoint returned HTTP ${res.status}`;
      }
    } catch (err) {
      backendError = err instanceof Error ? err.message : 'Unknown error';
    }
  }

  return NextResponse.json(
    {
      backend: {
        configured: backendConfigured,
        reachable: backendReachable,
        error: backendConfigured ? backendError : 'ZURI_API_BASE_URL is not set',
      },
      realLogin: backendReachable ? 'available' : 'unavailable',
      demoMode: isDemoModeEnabled() ? 'on' : 'off',
    },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}
