import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function Card({ title, children, className }: CardProps) {
  return (
    <div
      className={cn(
        'glass-panel rounded-2xl p-4 shadow-sm transition-colors hover:shadow-md',
        className
      )}
    >
      {title && (
        <h2 className="text-sm font-semibold text-primary mb-2">{title}</h2>
      )}
      {children}
    </div>
  );
}
