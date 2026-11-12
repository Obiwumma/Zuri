'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { TextField, Button, Alert } from '@/components/ui';
import { SlidersHorizontal, CheckCircle2 } from 'lucide-react';

export type ForgotPasswordState = 'default' | 'submitting' | 'error' | 'sent';

function ForgotPasswordContent() {
  const searchParams = useSearchParams();
  const showHarness = process.env.NODE_ENV !== 'production' && searchParams.get('states') === '1';

  const [harnessState, setHarnessState] = useState<ForgotPasswordState>('default');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || harnessState === 'submitting') return;

    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        if (res.status === 429) {
          setErrorMessage(
            data?.message || 'Too many recovery requests. Please wait before trying again.'
          );
        } else if (res.status === 503) {
          setErrorMessage('Recovery service is temporarily unavailable. Please retry shortly.');
        } else {
          setErrorMessage(data?.message || 'Unable to process recovery request.');
        }
        return;
      }

      setSuccessMessage(
        data?.message ||
          'If an account matches that email address, password reset instructions have been sent.'
      );
    } catch {
      setErrorMessage('Network connection failure. Please check your connection and retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormDisabled = isSubmitting || harnessState === 'submitting';
  const isSent = Boolean(successMessage) || harnessState === 'sent';
  const effectiveError =
    harnessState === 'error'
      ? errorMessage || 'Unable to find an account with that email address. Check the spelling and try again.'
      : errorMessage;

  return (
    <AuthLayout
      editorialStatement="Reset your academic credentials."
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
                setHarnessState('sent');
                setErrorMessage(null);
              }}
              className={`px-2 py-0.5 rounded text-caption transition-colors ${
                harnessState === 'sent'
                  ? 'bg-primary text-on-primary font-semibold'
                  : 'text-on-surface-variant hover:bg-surface-container-highest'
              }`}
            >
              Sent
            </button>
          </div>
        </aside>
      )}

      {/* Header title */}
      <div className="mb-6">
        <h1 className="text-display-sm font-editorial italic text-text-primary">
          Reset your password
        </h1>
        <p className="text-body-sm text-text-muted mt-1.5">
          Enter your institutional email address to receive recovery instructions.
        </p>
      </div>

      {/* Main content */}
      {isSent ? (
        <div className="flex flex-col gap-5">
          <div className="p-4 rounded-md bg-primary-fixed/30 border border-primary/20 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" aria-hidden="true" />
            <div className="flex flex-col gap-1 text-body-sm text-text-primary">
              <span className="font-medium">Check your inbox</span>
              <p className="text-body-xs text-text-muted leading-relaxed">
                {successMessage ||
                  'If an account matches that email address, password reset instructions have been sent. Please follow the link in the message to choose a new password.'}
              </p>
            </div>
          </div>

          <p className="text-body-xs text-text-muted">
            Did not receive an email? Check your spam folder or verify with your administrator.
          </p>

          <div className="pt-2">
            <Link
              href="/login"
              className="inline-flex items-center justify-center w-full h-10 px-4 rounded-md border border-outline-variant bg-surface-container-lowest text-on-surface text-body-sm font-medium hover:bg-surface-container-low transition-colors"
            >
              Return to sign in
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <TextField
            id="reset-email"
            label="Work email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@oxford.ac.uk"
            autoComplete="email"
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
            Send recovery instructions
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

export default function InstitutionForgotPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-surface" />}>
      <ForgotPasswordContent />
    </Suspense>
  );
}
