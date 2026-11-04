import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: 'div' | 'article' | 'section';
  children: React.ReactNode;
}

export function Card({
  as: Component = 'div',
  className = '',
  children,
  ...props
}: CardProps) {
  return (
    <Component
      className={`bg-surface-container-lowest border border-outline-variant rounded-md p-4 md:p-6 shadow-none transition-colors ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}

export function CardHeader({
  className = '',
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`flex flex-col gap-1 pb-3 mb-4 border-b border-outline-variant/30 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({
  className = '',
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={`text-h3 text-on-surface font-semibold ${className}`} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({
  className = '',
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={`text-body-sm text-on-surface-variant ${className}`} {...props}>
      {children}
    </p>
  );
}

export function CardContent({
  className = '',
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`flex-1 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({
  className = '',
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`flex items-center justify-between pt-3 mt-4 border-t border-outline-variant/30 ${className}`} {...props}>
      {children}
    </div>
  );
}

export default Card;
