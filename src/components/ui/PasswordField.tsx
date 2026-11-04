import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { TextField, type TextFieldProps } from './TextField';

export interface PasswordFieldProps extends Omit<TextFieldProps, 'type' | 'rightIcon'> {
  showToggle?: boolean;
}

export const PasswordField = React.forwardRef<HTMLInputElement, PasswordFieldProps>(
  ({ showToggle = true, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    const toggleButton = showToggle ? (
      <button
        type="button"
        onClick={() => setShowPassword((prev) => !prev)}
        className="p-2 md:p-1.5 rounded-default text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer outline-none focus-visible:focus-ring"
        aria-label={showPassword ? 'Hide password' : 'Show password'}
        tabIndex={0}
      >
        {showPassword ? (
          <EyeOff className="w-5 h-5 md:w-4.5 md:h-4.5" aria-hidden="true" />
        ) : (
          <Eye className="w-5 h-5 md:w-4.5 md:h-4.5" aria-hidden="true" />
        )}
      </button>
    ) : undefined;

    return (
      <TextField
        ref={ref}
        type={showPassword ? 'text' : 'password'}
        rightIcon={toggleButton}
        {...props}
      />
    );
  }
);

PasswordField.displayName = 'PasswordField';
