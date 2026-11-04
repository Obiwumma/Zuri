import React, { useId } from 'react';
import { Check } from 'lucide-react';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode;
  description?: string;
  error?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      id: customId,
      label,
      description,
      error,
      checked,
      disabled,
      className = '',
      onChange,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const id = customId || generatedId;
    const errorId = `${id}-error`;
    const descId = `${id}-desc`;

    return (
      <div className={`flex flex-col ${className}`}>
        <label
          htmlFor={id}
          className={`group flex items-start gap-2.5 select-none ${
            disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
          }`}
        >
          <div className="relative flex items-center justify-center pt-0.5">
            <input
              ref={ref}
              id={id}
              type="checkbox"
              checked={checked}
              disabled={disabled}
              onChange={onChange}
              aria-invalid={!!error}
              aria-describedby={error ? errorId : description ? descId : undefined}
              className="peer sr-only"
              {...props}
            />
            <div
              className={`w-4.5 h-4.5 rounded-sm border transition-colors flex items-center justify-center peer-focus-visible:focus-ring peer-disabled:cursor-not-allowed ${
                checked
                  ? 'bg-primary border-primary text-on-primary'
                  : error
                  ? 'bg-surface-container-lowest border-error'
                  : 'bg-surface-container-lowest border-outline group-hover:border-on-surface-variant'
              }`}
            >
              {checked && <Check className="w-3.5 h-3.5 stroke-[2.5]" aria-hidden="true" />}
            </div>
          </div>
          {(label || description) && (
            <div className="flex flex-col">
              {label && (
                <span className="text-body-sm font-normal text-on-surface leading-tight">
                  {label}
                </span>
              )}
              {description && (
                <span id={descId} className="text-caption text-on-surface-variant mt-0.5">
                  {description}
                </span>
              )}
            </div>
          )}
        </label>
        {error && (
          <p id={errorId} role="alert" className="text-caption text-error mt-1 ml-7">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
