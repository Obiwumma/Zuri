'use client';

import React from 'react';
import Link from 'next/link';
import { Wordmark } from '@/components/brand/Wordmark';
import { ArrowLeft } from 'lucide-react';

export interface AuthLayoutProps {
  children: React.ReactNode;
  editorialStatement?: string;
  backLink?: {
    href: string;
    label: string;
  };
  className?: string;
}

export function AuthLayout({
  children,
  editorialStatement = 'See what is happening across your academic year.',
  backLink,
  className = '',
}: AuthLayoutProps) {
  return (
    <div className="min-h-dvh flex flex-col lg:flex-row bg-surface text-on-surface antialiased selection:bg-primary-container selection:text-on-primary-container">
      {/* Left editorial panel: visible only on lg+ (DESIGN.md section 13) */}
      <aside
        aria-label="Editorial overview"
        className="hidden lg:flex lg:w-5/12 bg-primary p-10 xl:p-16 flex-col justify-between text-primary-fixed select-none relative overflow-hidden"
      >
        <div className="relative z-10">
          <Wordmark size="md" tone="primary-fixed" />
        </div>

        <div className="relative z-10 max-w-md my-auto py-12">
          <p className="font-serif font-normal text-3xl xl:text-4xl leading-tight text-primary-fixed tracking-tight">
            {editorialStatement}
          </p>
        </div>

        <div className="relative z-10">
          <span className="text-caption text-primary-fixed/80">
            Academic Intelligence
          </span>
        </div>
      </aside>

      {/* Right form column: full-width on mobile/tablet, 7/12 on lg+ */}
      <main className="flex-1 lg:w-7/12 flex flex-col justify-between px-4 py-8 sm:px-6 sm:py-12 lg:px-12 xl:px-16 min-h-dvh">
        {/* Mobile/Tablet top wordmark header (below lg) */}
        <header className="lg:hidden flex items-center justify-between pb-6">
          <Wordmark size="sm" tone="light" />
        </header>

        {/* Centered form column */}
        <div className="flex-1 flex flex-col items-center justify-center w-full">
          <div className={`w-full max-w-[420px] flex flex-col ${className}`}>
            {backLink && (
              <div className="mb-4">
                <Link
                  href={backLink.href}
                  className="inline-flex items-center gap-1.5 text-caption font-medium text-on-surface-variant hover:text-on-surface transition-colors outline-none focus-visible:focus-ring rounded-xs"
                >
                  <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{backLink.label}</span>
                </Link>
              </div>
            )}
            {children}
          </div>
        </div>

        {/* Quiet footer area */}
        <footer className="pt-6 text-center text-caption text-on-surface-variant/70">
          Academic activity intelligence &bull; Veritas
        </footer>
      </main>
    </div>
  );
}

export default AuthLayout;
