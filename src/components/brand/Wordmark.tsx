'use client';

import React from 'react';
import { BRAND_NAME } from '@/lib/brand';

export interface WordmarkProps extends React.SVGProps<SVGSVGElement> {
  size?: 'sm' | 'md' | 'lg' | number;
  tone?: 'dark' | 'light' | 'primary-fixed';
  className?: string;
}

export function Wordmark({
  size = 'md',
  tone = 'dark',
  className = '',
  ...props
}: WordmarkProps) {
  const height =
    typeof size === 'number'
      ? size
      : size === 'sm'
      ? 20
      : size === 'lg'
      ? 32
      : 24;

  // Aspect ratio for "Zuri" in serif ~ 4.2:1 (width 100, height 24)
  const width = Math.round(height * 4.16);
  const fillColor =
    tone === 'primary-fixed'
      ? 'var(--primary-fixed, #dfe8a9)'
      : tone === 'light'
      ? 'var(--primary, #272e0a)'
      : 'var(--ops-text, #eceef1)';

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 100 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={BRAND_NAME}
      className={`shrink-0 select-none ${className}`}
      {...props}
    >
      <text
        x="0"
        y="19"
        fill={fillColor}
        fontFamily="var(--font-serif), 'Newsreader', Georgia, serif"
        fontSize="24"
        fontWeight="600"
        letterSpacing="-0.02em"
      >
        {BRAND_NAME}
      </text>
    </svg>
  );
}

export default Wordmark;
