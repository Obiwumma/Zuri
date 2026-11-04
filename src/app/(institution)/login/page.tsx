'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthLayout } from '@/components/auth/AuthLayout';
import {
  TextField,
  PasswordField,
  Checkbox,
  Button,
  Alert,
} from '@/components/ui';
import { SlidersHorizontal } from 'lucide-react';
import { canAccessInstitution, canAccessOps } from '@/lib/auth/roles';

export type HarnessState =
  | 'default'
  | 'submitting'
  | 'loading'
  | 'invalid'
  | 'locked'
  | 'reset';

function InstitutionLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Harness states bar enabled when ?states=1 is in URL
  const showHarness = searchParams.get('states') === '1';

  const [harnessState, setHarnessState] = useState<HarnessState>('default');
  const [email, setEmail] = useState<string>('admin@oxford.ac.uk');
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
          setErrorMessage(data?.message || 'Too many sign-in attempts. Try again in 60s.');
        } else if (res.status === 503) {
          setHarnessState('invalid');
          setErrorMessage('Service is temporarily unavailable. Please try again shortly.');
        } else {
          setHarnessState('invalid');
          setErrorMessage('Email or password is incorrect. Check both and try again.');
        }
        return;
      }

      // Route by forced password flag or user role
      if (data?.mustChangePassword) {
        setHarnessState('reset');
        router.push('/change-password');
        return;
      }

      if (canAccessInstitution(data?.role)) {
        window.location.href = '/dashboard';
      } else if (canAccessOps(data?.role)) {
        window.location.href = '/ops/health';
      } else {
        window.location.href = '/dashboard';
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
    <AuthLayout editorialStatement="See what is happening across your academic year.">
      {/* Dev State Simulation Harness Bar (only when ?states=1) */}
      {showHarness && (
        <aside aria-label="Development test harness" className="w-full mb-6">
          <div className="bg-surface-container-high border border-outline-variant rounded-default p-2 flex flex-wrap items-center justify-between gap-2 text-caption">
            <span className="text-on-surface-variant font-medium flex items-center gap-1.5">
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
                    ? 'bg-primary text-on-primary font-semibold'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
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
                    ? 'bg-primary text-on-primary font-semibold'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
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
                    ? 'bg-primary text-on-primary font-semibold'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
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
                    ? 'bg-primary text-on-primary font-semibold'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                }`}
              >
                Locked
              </button>
              <button
                type="button"
                onClick={() => {
                  setHarnessState('reset');
                  setErrorMessage(null);
                }}
                className={`px-2 py-1 rounded-sm text-caption transition-colors cursor-pointer ${
                  harnessState === 'reset'
                    ? 'bg-primary text-on-primary font-semibold'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                }`}
              >
                Password change
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* Heading */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-serif font-semibold text-on-surface tracking-tight">
          Sign in to your account
        </h1>
        <p className="text-body-sm text-on-surface-variant mt-1.5">
          Enter your institutional credentials to continue.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <TextField
          label="Work email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@university.edu"
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
            id="remember-session"
            label={
              <span className="text-caption text-on-surface-variant">
                Keep me signed in for 12 hours
              </span>
            }
            checked={rememberSession}
            onChange={(e) => setRememberSession(e.target.checked)}
            disabled={isFormDisabled}
          />
          <Link
            href="/forgot-password"
            className="text-caption font-medium text-primary hover:underline shrink-0 outline-none focus-visible:focus-ring rounded-xs"
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
            description={`Too many sign-in attempts. Try again in ${countdown}s.`}
          />
        )}

        {harnessState === 'reset' && (
          <Alert
            variant="info"
            title="First-time sign-in or password reset required"
            description={
              <span>
                You must change your password before continuing.{' '}
                <Link
                  href="/change-password"
                  className="text-primary font-medium underline hover:text-primary-container"
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
    </AuthLayout>
  );
}

export default function InstitutionLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-surface" />}>
      <InstitutionLoginForm />
    </Suspense>
  );
}
