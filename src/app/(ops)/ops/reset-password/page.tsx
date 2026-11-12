'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Wordmark } from '@/components/brand/Wordmark';
import { TextField, PasswordField, Button, Alert } from '@/components/ui';
import { SlidersHorizontal, ArrowLeft, CheckCircle2 } from 'lucide-react';

export type OpsResetPasswordState = 'default' | 'submitting' | 'error' | 'success';

function OpsResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const showHarness = process.env.NODE_ENV !== 'production' && searchParams.get('states') === '1';

  const [harnessState, setHarnessState] = useState<OpsResetPasswordState>('default');
  const [token, setToken] = useState(() => searchParams.get('token') || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || harnessState === 'submitting') return;

    if (!token.trim()) {
      setErrorMessage('Recovery token is required.');
      return;
    }

    if (newPassword.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match. Check both and try again.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          token: token.trim(),
          new_password: newPassword,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        if (res.status === 429) {
          setErrorMessage(
            data?.message || 'Rate limit threshold exceeded. Please retry later.'
          );
        } else if (res.status === 503) {
          setErrorMessage('Operations gateway is temporarily unavailable.');
        } else {
          setErrorMessage(data?.message || 'Invalid or expired recovery dispatch token.');
        }
        return;
      }

      setSuccessMessage('Password reset successfully. Redirecting to operations console...');
      setTimeout(() => {
        router.push('/ops/login');
      }, 1500);
    } catch {
      setErrorMessage('Network communication error with operations gateway.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormDisabled = isSubmitting || harnessState === 'submitting';
  const isSuccess = Boolean(successMessage) || harnessState === 'success';
  const effectiveError =
    harnessState === 'error'
      ? errorMessage || 'Invalid or expired recovery token. Request a new token to continue.'
      : errorMessage;

  return (
    <div className="min-h-dvh bg-ops-canvas text-ops-text flex flex-col justify-between p-6 sm:p-10">
      {/* Top Header */}
      <header className="flex items-center justify-between">
        <Wordmark tone="dark" />
        <span className="text-caption text-ops-text-muted font-mono">
          INTERNAL CONSOLE
        </span>
      </header>

      {/* Main Content Area */}
      <main className="w-full flex-1 flex flex-col items-center justify-center py-8">
        {/* Test harness */}
        {showHarness && (
          <aside
            aria-label="Testing states harness"
            className="w-full max-w-[420px] mb-6 p-2.5 rounded-sm bg-ops-panel border border-ops-border text-caption flex flex-wrap items-center justify-between gap-2"
          >
            <div className="flex items-center gap-1.5 font-medium text-ops-text">
              <SlidersHorizontal className="w-3.5 h-3.5 text-ops-accent" aria-hidden="true" />
              <span>Ops states</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  setHarnessState('default');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className={`px-2 py-0.5 rounded-xs text-caption transition-colors cursor-pointer ${
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
                className={`px-2 py-0.5 rounded-xs text-caption transition-colors cursor-pointer ${
                  harnessState === 'submitting'
                    ? 'bg-ops-accent-strong text-ops-canvas font-semibold'
                    : 'text-ops-text-muted hover:text-ops-text hover:bg-ops-panel-raised'
                }`}
              >
                Loading
              </button>
              <button
                type="button"
                onClick={() => {
                  setHarnessState('error');
                  setSuccessMessage(null);
                }}
                className={`px-2 py-0.5 rounded-xs text-caption transition-colors cursor-pointer ${
                  harnessState === 'error'
                    ? 'bg-ops-accent-strong text-ops-canvas font-semibold'
                    : 'text-ops-text-muted hover:text-ops-text hover:bg-ops-panel-raised'
                }`}
              >
                Error
              </button>
              <button
                type="button"
                onClick={() => {
                  setHarnessState('success');
                  setErrorMessage(null);
                }}
                className={`px-2 py-0.5 rounded-xs text-caption transition-colors cursor-pointer ${
                  harnessState === 'success'
                    ? 'bg-ops-accent-strong text-ops-canvas font-semibold'
                    : 'text-ops-text-muted hover:text-ops-text hover:bg-ops-panel-raised'
                }`}
              >
                Success
              </button>
            </div>
          </aside>
        )}

        <div className="w-full max-w-[420px] flex flex-col">
          {/* Back link */}
          <div className="mb-4">
            <Link
              href="/ops/login"
              className="inline-flex items-center gap-1.5 text-caption font-medium text-ops-text-muted hover:text-ops-text transition-colors outline-none focus-visible:focus-ring rounded-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Back to sign in</span>
            </Link>
          </div>

          {/* Header titles */}
          <div className="mb-6">
            <h1 className="text-[28px] leading-tight font-semibold text-ops-text font-sans">
              Set new ops password
            </h1>
            <p className="text-body-sm text-ops-text-muted mt-1.5">
              Enter your recovery token to establish a new password.
            </p>
          </div>

          {/* Form or Success Banner */}
          {isSuccess ? (
            <div className="flex flex-col gap-5">
              <div className="p-4 rounded-sm bg-ops-panel border border-ops-border flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-ops-accent shrink-0 mt-0.5" aria-hidden="true" />
                <div className="flex flex-col gap-1 text-body-sm text-ops-text">
                  <span className="font-medium">Password reset successfully</span>
                  <p className="text-caption text-ops-text-muted leading-relaxed">
                    {successMessage ||
                      'Your password has been changed. You may now sign in with your new credentials.'}
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/ops/login"
                  className="inline-flex items-center justify-center w-full h-10 px-4 rounded-sm bg-ops-accent-strong text-ops-canvas text-body-sm font-semibold hover:opacity-90 transition-opacity"
                >
                  Sign in to ops console
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <TextField
                label="Recovery token"
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Paste token received in dispatch"
                disabled={isFormDisabled}
                required
              />

              <PasswordField
                label="New password"
                helperText="Minimum 8 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••••••"
                autoComplete="new-password"
                disabled={isFormDisabled}
                required
              />

              <PasswordField
                label="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••••••"
                autoComplete="new-password"
                disabled={isFormDisabled}
                required
              />

              {effectiveError && (
                <Alert
                  variant="error"
                  description={effectiveError}
                />
              )}

              <Button
                type="submit"
                variant="primary"
                className="w-full h-11"
                isLoading={isFormDisabled}
                disabled={isFormDisabled}
              >
                Reset password
              </Button>

              <div className="text-center pt-2">
                <Link
                  href="/ops/login"
                  className="text-caption text-ops-text-muted hover:text-ops-text transition-colors hover:underline"
                >
                  Return to sign in
                </Link>
              </div>
            </form>
          )}
        </div>
      </main>

      {/* Bottom Footer */}
      <footer className="py-6 text-center text-caption text-ops-text-muted">
        Sign-in activity is logged.
      </footer>
    </div>
  );
}

export default function OpsResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-ops-canvas" />}>
      <OpsResetPasswordContent />
    </Suspense>
  );
}
