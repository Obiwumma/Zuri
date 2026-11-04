'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Wordmark } from '@/components/brand/Wordmark';
import {
  TextField,
  PasswordField,
  Checkbox,
  Button,
  Alert,
} from '@/components/ui';
import { SlidersHorizontal } from 'lucide-react';
import { canAccessOps, canAccessInstitution } from '@/lib/auth/roles';

export type HarnessState =
  | 'default'
  | 'submitting'
  | 'loading'
  | 'invalid'
  | 'locked'
  | 'rotation-required'
  | 'reset';

function OpsLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Harness states bar enabled when ?states=1 is in URL
  const showHarness = searchParams.get('states') === '1';

  const [harnessState, setHarnessState] = useState<HarnessState>('default');
  const [email, setEmail] = useState<string>('operator@lexi.internal');
  const [password, setPassword] = useState<string>('');
  const [rememberSession, setRememberSession] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number>(60);

  // Live countdown timer for locked state
  useEffect(() => {
    if (harnessState !== 'locked') return;

    if (countdown <= 0) {
      setHarnessState('default');
      setErrorMessage(null);
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setHarnessState('default');
          setErrorMessage(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [harnessState, countdown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      harnessState === 'locked' ||
      harnessState === 'submitting' ||
      harnessState === 'loading'
    ) {
      return;
    }

    setHarnessState('submitting');
    setErrorMessage(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        if (res.status === 401) {
          setHarnessState('invalid');
          setErrorMessage('Email or password is incorrect. Check both and try again.');
        } else if (res.status === 429) {
          setHarnessState('locked');
          setCountdown(60);
          setErrorMessage(data?.message || 'Too many failed attempts. Try again in 60s.');
        } else if (res.status === 503) {
          setHarnessState('invalid');
          setErrorMessage('Service is temporarily unavailable. Please try again shortly.');
        } else {
          setHarnessState('invalid');
          setErrorMessage('Email or password is incorrect. Check both and try again.');
        }
        return;
      }

      if (data?.mustChangePassword) {
        setHarnessState('rotation-required');
        router.push('/ops/change-password');
        return;
      }

      if (canAccessOps(data?.role)) {
        window.location.href = '/ops/health';
      } else if (canAccessInstitution(data?.role)) {
        window.location.href = '/dashboard';
      } else {
        window.location.href = '/ops/health';
      }
    } catch {
      setHarnessState('invalid');
      setErrorMessage('Unable to connect. Check your connection and try again.');
    }
  };

  const isSubmitting = harnessState === 'submitting' || harnessState === 'loading';
  const isLocked = harnessState === 'locked';
  const isFormDisabled = isSubmitting || isLocked;

  return (
    <div className="min-h-dvh bg-ops-canvas text-ops-text flex flex-col justify-between antialiased selection:bg-ops-accent selection:text-ops-canvas">
      {/* Top Header: Wordmark top-left, nothing right */}
      <header className="px-6 py-5 flex items-center justify-between">
        <Wordmark size="sm" tone="dark" />
      </header>

      {/* Main Content: Centered form column (max 420px) */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 sm:px-6">
        {/* Dev State Simulation Harness Bar (only when ?states=1) */}
        {showHarness && (
          <aside aria-label="Development test harness" className="w-full max-w-[420px] mb-6">
            <div className="bg-ops-panel border border-ops-border rounded-default p-2 flex flex-wrap items-center justify-between gap-2 text-caption">
              <span className="text-ops-text-muted font-medium flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5" aria-hidden="true" />
                States:
              </span>
              <div className="flex items-center gap-1 flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    setHarnessState('default');
                    setErrorMessage(null);
                  }}
                  className={`px-2 py-1 rounded-sm text-caption transition-colors cursor-pointer ${
                    harnessState === 'default'
                      ? 'bg-ops-accent-strong text-ops-canvas font-semibold'
                      : 'text-ops-text-muted hover:text-ops-text hover:bg-ops-panel-raised'
                  }`}
                >
                  Default
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setHarnessState('submitting');
                    setErrorMessage(null);
                  }}
                  className={`px-2 py-1 rounded-sm text-caption transition-colors cursor-pointer ${
                    isSubmitting
                      ? 'bg-ops-accent-strong text-ops-canvas font-semibold'
                      : 'text-ops-text-muted hover:text-ops-text hover:bg-ops-panel-raised'
                  }`}
                >
                  Submitting
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setHarnessState('invalid');
                    setErrorMessage('Email or password is incorrect. Check both and try again.');
                  }}
                  className={`px-2 py-1 rounded-sm text-caption transition-colors cursor-pointer ${
                    harnessState === 'invalid'
                      ? 'bg-ops-accent-strong text-ops-canvas font-semibold'
                      : 'text-ops-text-muted hover:text-ops-text hover:bg-ops-panel-raised'
                  }`}
                >
                  Invalid
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setHarnessState('locked');
                    setCountdown(60);
                  }}
                  className={`px-2 py-1 rounded-sm text-caption transition-colors cursor-pointer ${
                    isLocked
                      ? 'bg-ops-accent-strong text-ops-canvas font-semibold'
                      : 'text-ops-text-muted hover:text-ops-text hover:bg-ops-panel-raised'
                  }`}
                >
                  Locked
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setHarnessState('rotation-required');
                    setErrorMessage(null);
                  }}
                  className={`px-2 py-1 rounded-sm text-caption transition-colors cursor-pointer ${
                    harnessState === 'rotation-required' || harnessState === 'reset'
                      ? 'bg-ops-accent-strong text-ops-canvas font-semibold'
                      : 'text-ops-text-muted hover:text-ops-text hover:bg-ops-panel-raised'
                  }`}
                >
                  Rotation
                </button>
              </div>
            </div>
          </aside>
        )}

        <div className="w-full max-w-[420px] flex flex-col">
          {/* Header titles */}
          <div className="mb-6">
            <h1 className="text-[28px] leading-tight font-semibold text-ops-text font-sans">
              Sign in to the ops console
            </h1>
            <p className="text-body-sm text-ops-text-muted mt-1.5">
              For Zuri team members only.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate={false}>
            <TextField
              label="Work email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              autoComplete="username"
              disabled={isFormDisabled}
              required
            />

            <PasswordField
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••"
              autoComplete="current-password"
              disabled={isFormDisabled}
              required
            />

            <div className="flex items-center justify-between gap-4">
              <Checkbox
                id="keep-signed-in"
                label={
                  <span className="text-caption text-ops-text-muted">
                    Keep me signed in for 12 hours
                  </span>
                }
                checked={rememberSession}
                onChange={(e) => setRememberSession(e.target.checked)}
                disabled={isFormDisabled}
              />
              <Link
                href="/ops/forgot-password"
                className="text-caption text-ops-accent hover:underline shrink-0 outline-none focus-visible:focus-ring rounded-xs"
              >
                Forgot password?
              </Link>
            </div>

            {/* State Banners / Error notifications */}
            {harnessState === 'invalid' && (
              <Alert
                variant="error"
                description={
                  errorMessage || 'Email or password is incorrect. Check both and try again.'
                }
              />
            )}

            {isLocked && (
              <Alert
                variant="error"
                title="Account temporarily locked"
                description={`Too many failed attempts. Try again in ${countdown}s.`}
              />
            )}

            {(harnessState === 'rotation-required' || harnessState === 'reset') && (
              <Alert
                variant="warning"
                title="Password rotation required"
                description={
                  <span>
                    Your password has expired and must be updated.{' '}
                    <Link
                      href="/ops/change-password"
                      className="text-ops-accent font-medium underline hover:text-ops-text"
                    >
                      Change password now
                    </Link>
                  </span>
                }
              />
            )}

            <Button
              type="submit"
              variant="primary"
              className="w-full h-11"
              isLoading={isSubmitting}
              disabled={isFormDisabled}
            >
              Sign in
            </Button>
          </form>
        </div>
      </main>

      {/* Bottom Footer: Quiet single line */}
      <footer className="py-6 text-center text-caption text-ops-text-muted">
        Sign-in activity is logged.
      </footer>
    </div>
  );
}

export default function OpsLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-ops-canvas" />}>
      <OpsLoginForm />
    </Suspense>
  );
}
