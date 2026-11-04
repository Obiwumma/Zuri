import React from 'react';

export type SkeletonVariant = 'text' | 'circular' | 'rectangular' | 'row';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: SkeletonVariant;
}

const variantStyles: Record<SkeletonVariant, string> = {
  text: 'h-4 w-full rounded-sm',
  circular: 'rounded-full',
  rectangular: 'rounded-default',
  row: 'h-12 w-full rounded-none',
};

export function Skeleton({
  variant = 'rectangular',
  className = '',
  style,
  ...props
}: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={`bg-surface-container-high animate-pulse select-none ${variantStyles[variant]} ${className}`}
      style={style}
      {...props}
    />
  );
}

export default Skeleton;
