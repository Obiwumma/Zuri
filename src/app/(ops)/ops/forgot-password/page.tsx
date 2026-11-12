'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Wordmark } from '@/components/brand/Wordmark';
import { TextField, Button, Alert } from '@/components/ui';
import { SlidersHorizontal, ArrowLeft, CheckCircle2 } from 'lucide-react';

export type OpsForgotPasswordState = 'default' | 'submitting' | 'error' | 'sent';

function OpsForgotPasswordContent() {
  const searchParams = useSearchParams();
  const showHarness = process.env.NODE_ENV !== 'production' && searchParams.get('states') === '1';

  const [harnessState, setHarnessState] = useState<OpsForgotPasswordState>('default');
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
            data?.message || 'Rate limit threshold exceeded. Please wait before retrying.'
          );
        } else if (res.status === 503) {
          setErrorMessage('Operations gateway is temporarily unavailable. Please retry shortly.');
        } else {
          setErrorMessage(data?.message || 'Unable to process recovery request.');
        }
        return;
      }

      setSuccessMessage(
        data?.message ||
          'If identity is registered in the directory, recovery instructions have been dispatched.'
      );
    } catch {
      setErrorMessage('Network communication error with operations gateway.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormDisabled = isSubmitting || harnessState === 'submitting';
  const isSent = Boolean(successMessage) || harnessState === 'sent';
  const effectiveError =
    harnessState === 'error'
      ? errorMessage || 'Work email not found in operator directory. Check spelling and retry.'
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
                  setHarnessState('sent');
                  setErrorMessage(null);
                }}
                className={`px-2 py-0.5 rounded-xs text-caption transition-colors cursor-pointer ${
                  harnessState === 'sent'
                    ? 'bg-ops-accent-strong text-ops-canvas font-semibold'
                    : 'text-ops-text-muted hover:text-ops-text hover:bg-ops-panel-raised'
                }`}
              >
                Sent
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
              Reset ops password
            </h1>
            <p className="text-body-sm text-ops-text-muted mt-1.5">
              Enter your authorized work email to receive a recovery token.
            </p>
          </div>

          {/* Form or Sent Banner */}
          {isSent ? (
            <div className="flex flex-col gap-5">
              <div className="p-4 rounded-sm bg-ops-panel border border-ops-border flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-ops-accent shrink-0 mt-0.5" aria-hidden="true" />
                <div className="flex flex-col gap-1 text-body-sm text-ops-text">
                  <span className="font-medium">Recovery dispatch sent</span>
                  <p className="text-caption text-ops-text-muted leading-relaxed">
                    {successMessage ||
                      'If identity is registered in the directory, recovery instructions have been dispatched to your email address.'}
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/ops/login"
                  className="inline-flex items-center justify-center w-full h-10 px-4 rounded-sm border border-ops-border bg-ops-panel text-ops-text text-body-sm font-medium hover:bg-ops-panel-raised transition-colors"
                >
                  Return to sign in
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <TextField
                label="Work email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
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
                Send recovery token
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

export default function OpsForgotPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-ops-canvas" />}>
      <OpsForgotPasswordContent />
    </Suspense>
  );
}
