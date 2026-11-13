'use client';

/**
 * Demo access panel shown under the real sign-in form.
 *
 * Renders nothing unless the server reports demo mode is enabled
 * (GET /api/auth/demo-login returns 200). The real email/password form
 * above it keeps working against the backend either way.
 */

import React, { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import type { DemoShell } from '@/lib/auth/demoPersonas';

interface PersonaSummary {
  id: string;
  label: string;
  description: string;
  shell: DemoShell;
}

const TONES = {
  institution: {
    panel: 'border-outline-variant bg-surface-container',
    title: 'text-on-surface',
    muted: 'text-on-surface-variant',
    item: 'border-outline-variant bg-surface hover:border-primary hover:bg-surface-container-high',
    error: 'text-error',
  },
  ops: {
    panel: 'border-ops-border bg-ops-panel',
    title: 'text-ops-text',
    muted: 'text-ops-text-muted',
    item: 'border-ops-border bg-ops-panel-raised hover:border-ops-accent',
    error: 'text-ops-crit',
  },
} as const;

export function DemoAccessPanel({ shell }: { shell: DemoShell }) {
  const [personas, setPersonas] = useState<PersonaSummary[] | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const tone = TONES[shell];

  useEffect(() => {
    let cancelled = false;
    fetch('/api/auth/demo-login', { headers: { Accept: 'application/json' } })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data?.enabled) setPersonas(data.personas as PersonaSummary[]);
      })
      .catch(() => {
        /* demo mode unavailable: render nothing */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!personas || personas.length === 0) return null;

  // Show this shell's personas first, then the others.
  const ordered = [
    ...personas.filter((p) => p.shell === shell),
    ...personas.filter((p) => p.shell !== shell),
  ];

  const signIn = async (personaId: string) => {
    setPendingId(personaId);
    setError(null);
    try {
      const res = await fetch('/api/auth/demo-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ personaId }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.redirectTo) throw new Error();
      window.location.assign(data.redirectTo);
    } catch {
      setPendingId(null);
      setError('Demo sign-in failed. Refresh the page and try again.');
    }
  };

  return (
    <section
      aria-labelledby="demo-access-heading"
      className={`mt-8 rounded-default border border-dashed p-4 ${tone.panel}`}
    >
      <div className="flex items-start gap-2">
        <Sparkles className={`mt-0.5 h-4 w-4 shrink-0 ${tone.muted}`} aria-hidden="true" />
        <div>
          <h2 id="demo-access-heading" className={`text-body-sm font-semibold ${tone.title}`}>
            Demo access
          </h2>
          <p className={`text-caption mt-0.5 ${tone.muted}`}>
            Preview the app with sample data. No backend account needed.
          </p>
        </div>
      </div>

      <ul className="mt-3 grid gap-2">
        {ordered.map((p) => (
          <li key={p.id}>
            <button
              type="button"
              onClick={() => signIn(p.id)}
              disabled={pendingId !== null}
              className={`w-full rounded-default border px-3 py-2 text-left transition-colors cursor-pointer disabled:cursor-wait disabled:opacity-60 outline-none focus-visible:focus-ring ${tone.item}`}
            >
              <span className={`block text-body-sm font-medium ${tone.title}`}>
                {pendingId === p.id ? 'Signing in…' : `Continue as ${p.label}`}
              </span>
              <span className={`block text-caption ${tone.muted}`}>{p.description}</span>
            </button>
          </li>
        ))}
      </ul>

      {error && (
        <p role="alert" className={`text-caption mt-2 ${tone.error}`}>
          {error}
        </p>
      )}
    </section>
  );
}
