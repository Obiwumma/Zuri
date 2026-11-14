'use client';

/**
 * Exposes the signed-in user's role and responsibility scope to client pages
 * (set by the shell layout from the server session). Display/scoping only:
 * page access itself is enforced in the middleware.
 */

import React, { createContext, useContext } from 'react';
import type { SessionScope } from '@/lib/auth/session';

export interface ClientSession {
  role: string | null;
  isDemo: boolean;
  scope: SessionScope;
}

const SessionContext = createContext<ClientSession>({
  role: null,
  isDemo: false,
  scope: { modules: null, division: null },
});

export function SessionProvider({ value, children }: { value: ClientSession; children: React.ReactNode }) {
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useClientSession(): ClientSession {
  return useContext(SessionContext);
}
