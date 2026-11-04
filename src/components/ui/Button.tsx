import React from 'react';
import { RefreshCw } from 'lucide-react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';
export type ButtonSize = 'default' | 'sm' | 'icon';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-on-primary hover:bg-primary-container active:bg-primary-container disabled:opacity-50',
  secondary:
    'bg-transparent border border-outline text-on-surface hover:bg-surface-container active:bg-surface-container-high disabled:opacity-50',
  ghost:
    'bg-transparent text-on-surface hover:bg-surface-container active:bg-surface-container-high disabled:opacity-50',
  destructive:
    'bg-error text-on-error hover:bg-error-container hover:text-on-error-container active:bg-error-container disabled:opacity-50',
};

const sizeStyles: Record<ButtonSize, string> = {
  default: 'h-11 md:h-10 px-4 md:px-5 text-body-sm font-medium',
  sm: 'h-9 px-3 text-caption font-medium',
  icon: 'w-11 h-11 md:w-10 md:h-10 p-0',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'default',
      isLoading = false,
      disabled = false,
      className = '',
      children,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        className={`relative inline-flex items-center justify-center gap-2 rounded-default select-none transition-colors duration-150 cursor-pointer disabled:cursor-not-allowed outline-none focus-visible:focus-ring ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...props}
      >
        {isLoading && (
          <span className="absolute inset-0 flex items-center justify-center bg-inherit rounded-default">
            <RefreshCw className="w-4 h-4 md:w-4.5 md:h-4.5 animate-spin" aria-hidden="true" />
            <span className="sr-only">Loading</span>
          </span>
        )}
        <span className={`inline-flex items-center justify-center gap-2 ${isLoading ? 'invisible' : ''}`}>
          {children}
        </span>
      </button>
    );
  }
);

Button.displayName = 'Button';
