/**
 * Demo Login (backend-free access for previews)
 *
 * Enabled only when BOTH are set on the server:
 *   ZURI_DEMO_MODE=true
 *   ZURI_DEMO_SECRET=<random string, at least 32 characters>
 *
 * Demo tokens are HS256 JWTs signed with ZURI_DEMO_SECRET and carry
 * `iss: "zuri-demo"`. Real backend tokens are RS256 and are verified against the
 * gateway public key as before, so both logins can run side by side.
 *
 * Turning demo mode off (removing ZURI_DEMO_MODE) immediately invalidates every
 * outstanding demo session: the middleware rejects the token and clears cookies.
 *
 * Edge-runtime safe (used from middleware).
 */

import { SignJWT, jwtVerify, decodeProtectedHeader } from 'jose';
import type { DemoPersona } from './demoPersonas';
import type { VerifiedTokenPayload } from './verify';

export const DEMO_ISSUER = 'zuri-demo';
export const DEMO_INSTITUTION_ID = 'demo-institution';
/** Demo sessions last 8 hours; there is no refresh token. */
export const DEMO_SESSION_SECONDS = 8 * 60 * 60;

const MIN_SECRET_LENGTH = 32;

function getDemoSecret(): Uint8Array | null {
  const secret = process.env.ZURI_DEMO_SECRET;
  if (!secret || secret.length < MIN_SECRET_LENGTH) return null;
  return new TextEncoder().encode(secret);
}

/** True only when demo mode is switched on AND a strong secret is configured. */
export function isDemoModeEnabled(): boolean {
  return process.env.ZURI_DEMO_MODE === 'true' && getDemoSecret() !== null;
}

/**
 * Cheap structural check (no signature verification): is this token shaped
 * like a demo token? Used to route verification and to skip backend calls.
 */
export function isDemoToken(token: string | undefined | null): boolean {
  if (!token) return false;
  try {
    return decodeProtectedHeader(token).alg === 'HS256';
  } catch {
    return false;
  }
}

export async function signDemoToken(persona: DemoPersona): Promise<string> {
  const secret = getDemoSecret();
  if (!secret || !isDemoModeEnabled()) {
    throw new Error('Demo mode is not enabled');
  }
  const now = Math.floor(Date.now() / 1000);
  return new SignJWT({
    user_id: `demo-${persona.id}`,
    email: persona.email,
    role: persona.role,
    institution_id: persona.shell === 'institution' ? DEMO_INSTITUTION_ID : null,
    token_type: 'access',
    demo: true,
    ...(persona.scope?.modules ? { scope_modules: persona.scope.modules } : {}),
    ...(persona.scope?.division ? { scope_division: persona.scope.division } : {}),
  })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setIssuer(DEMO_ISSUER)
    .setSubject(`demo-${persona.id}`)
    .setIssuedAt(now)
    .setExpirationTime(now + DEMO_SESSION_SECONDS)
    .setJti(crypto.randomUUID())
    .sign(secret);
}

/** Verifies a demo token. Returns null when demo mode is off or the token is invalid. */
export async function verifyDemoToken(token: string): Promise<VerifiedTokenPayload | null> {
  const secret = getDemoSecret();
  if (!secret || !isDemoModeEnabled()) return null;
  try {
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ['HS256'],
      issuer: DEMO_ISSUER,
    });
    if (payload.token_type !== 'access' || typeof payload.exp !== 'number') return null;
    const userId = (payload.user_id || payload.sub) as string | undefined;
    if (!userId) return null;
    return {
      userId,
      email: (payload.email as string) || '',
      role: (payload.role as string) || '',
      institutionId: (payload.institution_id as string) || null,
      tokenType: 'access',
      exp: payload.exp,
      iat: payload.iat ?? Math.floor(Date.now() / 1000),
      jti: payload.jti,
      rawPayload: payload as Record<string, unknown>,
    };
  } catch {
    return null;
  }
}
