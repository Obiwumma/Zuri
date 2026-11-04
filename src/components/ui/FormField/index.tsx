import React from 'react';
import { AlertCircle } from 'lucide-react';

export interface FormFieldProps {
  label?: string;
  error?: string;
  helperText?: string;
  id?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function FormField({
  label,
  error,
  helperText,
  id,
  required,
  className = '',
  children,
}: FormFieldProps) {
  return (
    <div className={`flex flex-col w-full mb-4 ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className="text-body-sm font-medium text-on-surface mb-1.5 select-none"
        >
          {label}
          {required && <span className="text-error ml-0.5" aria-hidden="true">*</span>}
        </label>
      )}
      {children}
      {error && (
        <p className="text-caption text-error flex items-center gap-1.5 mt-1.5" role="alert">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </p>
      )}
      {!error && helperText && (
        <p className="text-caption text-on-surface-variant mt-1.5">{helperText}</p>
      )}
    </div>
  );
}

export default FormField;
