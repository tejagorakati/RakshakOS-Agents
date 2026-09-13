import React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { ArrowUpRight } from 'lucide-react';

export interface MetricBlockProps {
  label: string;
  value: string | number;
  subtext?: string;
  badgeText?: string;
  badgeVariant?: 'default' | 'outline' | 'success' | 'warning' | 'critical' | 'info';
  icon?: React.ElementType;
  onClick?: () => void;
  className?: string;
}

export const MetricBlock: React.FC<MetricBlockProps> = ({
  label,
  value,
  subtext,
  badgeText,
  badgeVariant = 'default',
  icon: Icon,
  onClick,
  className,
}) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        'p-4 rounded-xl border border-slate-200 bg-white shadow-2xs transition-all',
        onClick && 'cursor-pointer hover:border-slate-300 hover:shadow-xs group',
        className
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-sans">
          {label}
        </span>
        <div className="flex items-center gap-1.5">
          {badgeText && (
            <Badge variant={badgeVariant} className="text-[10px] uppercase font-mono px-1.5 py-0.5">
              {badgeText}
            </Badge>
          )}
          {Icon && <Icon className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-colors" />}
          {onClick && !Icon && (
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-900 transition-colors" />
          )}
        </div>
      </div>

      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-2xl md:text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
          {value}
        </span>
      </div>

      {subtext && (
        <p className="mt-1.5 text-xs text-slate-600 font-sans leading-tight border-t border-slate-100 pt-1.5">
          {subtext}
        </p>
      )}
    </div>
  );
};
