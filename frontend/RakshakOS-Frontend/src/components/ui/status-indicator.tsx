import React from 'react';
import { cn } from '@/lib/utils';

export type StatusState = 'active' | 'warning' | 'critical' | 'inactive';

interface StatusIndicatorProps {
  status: StatusState;
  label?: string;
  className?: string;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  label,
  className,
}) => {
  const dotColors: Record<StatusState, string> = {
    active: 'bg-emerald-500',
    warning: 'bg-amber-500',
    critical: 'bg-rose-500',
    inactive: 'bg-slate-400',
  };

  const textColors: Record<StatusState, string> = {
    active: 'text-emerald-700 font-medium',
    warning: 'text-amber-700 font-medium',
    critical: 'text-rose-700 font-semibold',
    inactive: 'text-slate-500',
  };

  return (
    <div className={cn('inline-flex items-center gap-1.5 text-xs', className)}>
      <span className={cn('w-2 h-2 rounded-full shrink-0', dotColors[status])} />
      {label && <span className={textColors[status]}>{label}</span>}
    </div>
  );
};
