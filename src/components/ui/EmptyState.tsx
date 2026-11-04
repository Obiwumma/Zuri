import React from 'react';
import type { LucideIcon } from 'lucide-react';

export interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: IconComponent,
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 md:p-12 max-w-md mx-auto ${className}`}
    >
      <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant mb-4 shrink-0">
        <IconComponent className="w-6 h-6 stroke-[1.75]" aria-hidden="true" />
      </div>
      <h3 className="text-h3 text-on-surface font-semibold mb-1.5 leading-snug">
        {title}
      </h3>
      <p className="text-body-sm text-on-surface-variant mb-6 leading-relaxed">
        {description}
      </p>
      {action && <div className="flex items-center justify-center">{action}</div>}
    </div>
  );
}

export default EmptyState;
