import React from 'react';
import type { LucideIcon } from 'lucide-react';

export type BadgeVariant = 'success' | 'warning' | 'info' | 'error' | 'neutral';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  icon?: LucideIcon;
  dot?: boolean;
  children: React.ReactNode;
}

const variantStyles: Record<BadgeVariant, { container: string; dot: string }> = {
  success: {
    container: 'bg-success-container text-success',
    dot: 'bg-success',
  },
  warning: {
    container: 'bg-warning-container text-warning',
    dot: 'bg-warning',
  },
  info: {
    container: 'bg-info-container text-info',
    dot: 'bg-info',
  },
  error: {
    container: 'bg-error-container text-error',
    dot: 'bg-error',
  },
  neutral: {
    container: 'bg-surface-container-high text-on-surface-variant',
    dot: 'bg-outline',
  },
};

export function Badge({
  variant = 'neutral',
  icon: IconComponent,
  dot = true,
  className = '',
  children,
  ...props
}: BadgeProps) {
  const currentVariant = variantStyles[variant] || variantStyles.neutral;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-caption font-medium select-none ${currentVariant.container} ${className}`}
      {...props}
    >
      {IconComponent ? (
        <IconComponent className="w-3 h-3 shrink-0" aria-hidden="true" />
      ) : dot ? (
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${currentVariant.dot}`} aria-hidden="true" />
      ) : null}
      <span>{children}</span>
    </span>
  );
}

export default Badge;
