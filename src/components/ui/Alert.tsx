import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, HelpCircle } from 'lucide-react';

export type AlertVariant = 'error' | 'warning' | 'success' | 'info';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant;
  title?: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
}

const variantConfig: Record<
  AlertVariant,
  { container: string; iconClass: string; Icon: typeof AlertCircle }
> = {
  error: {
    container: 'bg-error-container/20 border-error text-on-surface',
    iconClass: 'text-error',
    Icon: AlertCircle,
  },
  warning: {
    container: 'bg-warning-container/20 border-warning text-on-surface',
    iconClass: 'text-warning',
    Icon: AlertTriangle,
  },
  success: {
    container: 'bg-success-container/20 border-success text-on-surface',
    iconClass: 'text-success',
    Icon: CheckCircle2,
  },
  info: {
    container: 'bg-info-container/20 border-info text-on-surface',
    iconClass: 'text-info',
    Icon: HelpCircle,
  },
};

export function Alert({
  variant = 'error',
  title,
  description,
  action,
  className = '',
  children,
  ...props
}: AlertProps) {
  const { container, iconClass, Icon } = variantConfig[variant] || variantConfig.error;

  return (
    <div
      role="alert"
      className={`flex items-start gap-3 p-3.5 md:p-4 rounded-default border text-body-sm transition-colors ${container} ${className}`}
      {...props}
    >
      <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${iconClass}`} aria-hidden="true" />
      <div className="flex-1 min-w-0">
        {title && <h4 className="font-semibold text-on-surface leading-tight mb-0.5">{title}</h4>}
        <div className="text-caption text-on-surface-variant leading-normal">
          {description || children}
        </div>
      </div>
      {action && <div className="shrink-0 ml-2">{action}</div>}
    </div>
  );
}

export default Alert;
