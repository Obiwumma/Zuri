'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Wordmark } from '@/components/brand/Wordmark';
import { PasswordField, Button, Alert } from '@/components/ui';
import { SlidersHorizontal, ArrowLeft, CheckCircle2 } from 'lucide-react';

export type OpsChangePasswordState = 'default' | 'submitting' | 'error' | 'success';

function OpsChangePasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const showHarness = process.env.NODE_ENV !== 'production' && searchParams.get('states') === '1';

  const [harnessState, setHarnessState] = useState<OpsChangePasswordState>('default');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || harnessState === 'submitting') return;

    if (newPassword.length < 8) {
      setErrorMessage('New password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('New passwords do not match. Check both and try again.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        if (res.status === 401) {
          setErrorMessage('Current password is incorrect or session token has expired.');
        } else if (res.status === 429) {
          setErrorMessage(
            data?.message || 'Rate limit threshold exceeded. Please retry later.'
          );
        } else if (res.status === 503) {
          setErrorMessage('Operations gateway is temporarily unavailable.');
        } else {
          setErrorMessage(data?.message || 'Failed to update credentials. Please verify requirements.');
        }
        return;
      }

      setSuccessMessage('Credentials rotated successfully. Redirecting to system health...');
      setTimeout(() => {
        router.push('/ops/health');
      }, 1200);
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
      ? errorMessage || 'Current password is incorrect. Check your details and try again.'
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
              Password rotation required
            </h1>
            <p className="text-body-sm text-ops-text-muted mt-1.5">
              Your password has expired or rotation has been requested. Update it to continue.
            </p>
          </div>

          {/* Form or Success Banner */}
          {isSuccess ? (
            <div className="flex flex-col gap-5">
              <div className="p-4 rounded-sm bg-ops-panel border border-ops-border flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-ops-accent shrink-0 mt-0.5" aria-hidden="true" />
                <div className="flex flex-col gap-1 text-body-sm text-ops-text">
                  <span className="font-medium">Credentials rotated</span>
                  <p className="text-caption text-ops-text-muted leading-relaxed">
                    {successMessage ||
                      'Your password has been updated successfully. Initializing system console...'}
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/ops/health"
                  className="inline-flex items-center justify-center w-full h-10 px-4 rounded-sm bg-ops-accent-strong text-ops-canvas text-body-sm font-semibold hover:opacity-90 transition-opacity"
                >
                  Continue to console
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <PasswordField
                label="Current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••••••"
                autoComplete="current-password"
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
                Rotate password
              </Button>

              <div className="text-center pt-2">
                <Link
                  href="/ops/login"
                  className="text-caption text-ops-text-muted hover:text-ops-text transition-colors hover:underline"
                >
                  Cancel and sign out
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

export default function OpsChangePasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-ops-canvas" />}>
      <OpsChangePasswordContent />
    </Suspense>
  );
}
