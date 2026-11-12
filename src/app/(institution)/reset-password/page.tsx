'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { TextField, PasswordField, Button, Alert } from '@/components/ui';
import { SlidersHorizontal, CheckCircle2 } from 'lucide-react';

export type ResetPasswordState = 'default' | 'submitting' | 'error' | 'success';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const showHarness = process.env.NODE_ENV !== 'production' && searchParams.get('states') === '1';

  const [harnessState, setHarnessState] = useState<ResetPasswordState>('default');
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
            data?.message || 'Too many reset attempts. Please wait before trying again.'
          );
        } else if (res.status === 503) {
          setErrorMessage('Reset service is temporarily unavailable. Please retry shortly.');
        } else {
          setErrorMessage(data?.message || 'Invalid or expired password reset token.');
        }
        return;
      }

      setSuccessMessage('Password reset successfully. Redirecting to sign in...');
      setTimeout(() => {
        router.push('/login');
      }, 1500);
    } catch {
      setErrorMessage('Network connection error. Please check your connection and retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormDisabled = isSubmitting || harnessState === 'submitting';
  const isSuccess = Boolean(successMessage) || harnessState === 'success';
  const effectiveError =
    harnessState === 'error'
      ? errorMessage || 'Invalid or expired recovery token. Request a new password reset.'
      : errorMessage;

  return (
    <AuthLayout
      editorialStatement="Choose a new password for your account."
      backLink={{ href: '/login', label: 'Back to sign in' }}
    >
      {/* Test states harness */}
      {showHarness && (
        <aside
          aria-label="Testing states harness"
          className="mb-6 p-2.5 rounded-md bg-surface-container-high border border-outline-variant/50 text-caption flex flex-wrap items-center justify-between gap-2"
        >
          <div className="flex items-center gap-1.5 font-medium text-on-surface">
            <SlidersHorizontal className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
            <span>Auth states</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => {
                setHarnessState('default');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`px-2 py-0.5 rounded text-caption transition-colors ${
                harnessState === 'default'
                  ? 'bg-primary text-on-primary font-semibold'
                  : 'text-on-surface-variant hover:bg-surface-container-highest'
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
              className={`px-2 py-0.5 rounded text-caption transition-colors ${
                harnessState === 'submitting'
                  ? 'bg-primary text-on-primary font-semibold'
                  : 'text-on-surface-variant hover:bg-surface-container-highest'
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
              className={`px-2 py-0.5 rounded text-caption transition-colors ${
                harnessState === 'error'
                  ? 'bg-primary text-on-primary font-semibold'
                  : 'text-on-surface-variant hover:bg-surface-container-highest'
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
              className={`px-2 py-0.5 rounded text-caption transition-colors ${
                harnessState === 'success'
                  ? 'bg-primary text-on-primary font-semibold'
                  : 'text-on-surface-variant hover:bg-surface-container-highest'
              }`}
            >
              Success
            </button>
          </div>
        </aside>
      )}

      {/* Header title */}
      <div className="mb-6">
        <h1 className="text-display-sm font-editorial italic text-text-primary">
          Set new password
        </h1>
        <p className="text-body-sm text-text-muted mt-1.5">
          Enter your recovery token and choose a new secure password.
        </p>
      </div>

      {/* Form or success state */}
      {isSuccess ? (
        <div className="flex flex-col gap-5">
          <div className="p-4 rounded-md bg-primary-fixed/30 border border-primary/20 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" aria-hidden="true" />
            <div className="flex flex-col gap-1 text-body-sm text-text-primary">
              <span className="font-medium">Password updated successfully</span>
              <p className="text-body-xs text-text-muted leading-relaxed">
                {successMessage ||
                  'Your password has been changed. You can now use your new credentials to sign in.'}
              </p>
            </div>
          </div>

          <div className="pt-2">
            <Link
              href="/login"
              className="inline-flex items-center justify-center w-full h-10 px-4 rounded-md bg-primary text-on-primary text-body-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Sign in now
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <TextField
            id="reset-token"
            label="Recovery token"
            type="text"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Paste token from email"
            disabled={isFormDisabled}
            required
          />

          <PasswordField
            id="new-password"
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
            id="confirm-password"
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
              href="/login"
              className="text-caption text-text-muted hover:text-text-primary transition-colors hover:underline"
            >
              Return to sign in
            </Link>
          </div>
        </form>
      )}
    </AuthLayout>
  );
}

export default function InstitutionResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-surface" />}>
      <ResetPasswordContent />
    </Suspense>
  );
}
