/**
 * /api/auth/demo-login
 *
 * GET  -> { enabled, personas } so login pages know whether to show demo access.
 * POST -> { personaId } signs a demo session cookie for that persona.
 *
 * Returns 404 for both methods unless ZURI_DEMO_MODE=true and ZURI_DEMO_SECRET
 * are configured on the server. See docs/demo-mode.md.
 */

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { AUTH_COOKIE_OPTIONS } from '@/lib/auth/refresh';
import { DEMO_SESSION_SECONDS, isDemoModeEnabled, signDemoToken } from '@/lib/auth/demo';
import { DEMO_PERSONAS, findDemoPersona } from '@/lib/auth/demoPersonas';

export const dynamic = 'force-dynamic';

const notFound = () =>
  NextResponse.json({ enabled: false, error: 'Not Found' }, { status: 404 });

export async function GET() {
  if (!isDemoModeEnabled()) return notFound();
  return NextResponse.json({
    enabled: true,
    personas: DEMO_PERSONAS.map(({ id, label, description, role, shell }) => ({
      id,
      label,
      description,
      role,
      shell,
    })),
  });
}

export async function POST(request: Request) {
  if (!isDemoModeEnabled()) return notFound();

  let personaId: unknown;
  try {
    personaId = ((await request.json()) as { personaId?: unknown })?.personaId;
  } catch {
    // fall through to validation
  }

  const persona = findDemoPersona(personaId);
  if (!persona) {
    return NextResponse.json(
      { error: 'Bad Request', message: 'Unknown demo persona' },
      { status: 400 }
    );
  }

  const token = await signDemoToken(persona);
  const cookieStore = await cookies();
  cookieStore.set('access_token', token, { ...AUTH_COOKIE_OPTIONS, maxAge: DEMO_SESSION_SECONDS });
  // Demo sessions have no refresh token; clear any stale real one so the
  // middleware never tries to rotate it against the backend.
  cookieStore.set('refresh_token', '', { ...AUTH_COOKIE_OPTIONS, maxAge: 0 });

  return NextResponse.json({
    role: persona.role,
    displayName: persona.label,
    email: persona.email,
    shell: persona.shell,
    redirectTo: persona.shell === 'ops' ? '/ops/health' : '/dashboard',
  });
}
