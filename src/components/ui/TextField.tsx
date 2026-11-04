import React, { useId } from 'react';
import { AlertCircle } from 'lucide-react';

export interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerClassName?: string;
}

export const TextField = React.forwardRef<HTMLInputElement, TextFieldProps>(
  (
    {
      id: customId,
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      className = '',
      containerClassName = '',
      disabled,
      required,
      type = 'text',
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const id = customId || generatedId;
    const errorId = `${id}-error`;
    const helperId = `${id}-helper`;

    const describedBy = [
      error ? errorId : null,
      helperText ? helperId : null,
    ]
      .filter(Boolean)
      .join(' ') || undefined;

    return (
      <div className={`flex flex-col w-full ${containerClassName}`}>
        {label && (
          <label
            htmlFor={id}
            className="text-body-sm font-medium text-on-surface mb-1.5 select-none"
          >
            {label}
            {required && <span className="text-error ml-0.5" aria-hidden="true">*</span>}
          </label>
        )}
        <div className="relative flex items-center w-full">
          {leftIcon && (
            <div className="absolute left-3.5 flex items-center pointer-events-none text-on-surface-variant">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={id}
            type={type}
            disabled={disabled}
            required={required}
            aria-invalid={!!error}
            aria-describedby={describedBy}
            className={`w-full h-11 md:h-10 px-3.5 bg-surface-container-lowest text-on-surface text-base md:text-body-sm rounded-default border transition-colors outline-none placeholder:text-text-placeholder disabled:opacity-50 disabled:cursor-not-allowed focus-visible:focus-ring ${
              leftIcon ? 'pl-10' : ''
            } ${rightIcon ? 'pr-11' : ''} ${
              error
                ? 'border-error focus-visible:ring-error'
                : 'border-outline hover:border-on-surface-variant'
            } ${className}`}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-1.5 flex items-center">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p
            id={errorId}
            role="alert"
            className="text-caption text-error flex items-center gap-1.5 mt-1.5"
          >
            <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </p>
        )}
        {!error && helperText && (
          <p id={helperId} className="text-caption text-on-surface-variant mt-1.5">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

TextField.displayName = 'TextField';
