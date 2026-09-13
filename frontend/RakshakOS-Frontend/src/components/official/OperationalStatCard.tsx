import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { OperationalStat } from '@/lib/types/official';
import { ArrowUpRight } from 'lucide-react';

interface OperationalStatCardProps {
  stat: OperationalStat;
  onClick: (statKey: OperationalStat['key']) => void;
}

export const OperationalStatCard: React.FC<OperationalStatCardProps> = ({ stat, onClick }) => {
  const badgeVariants = {
    normal: 'default',
    active: 'success',
    warning: 'warning',
    critical: 'critical',
  } as const;

  return (
    <Card
      onClick={() => onClick(stat.key)}
      className="border-slate-200 bg-white hover:border-slate-400 hover:shadow-md transition-all cursor-pointer group"
    >
      <CardContent className="p-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider font-sans">
            {stat.label}
          </span>
          <div className="flex items-center gap-1">
            <Badge variant={badgeVariants[stat.statusVariant]} className="font-sans text-[10px]">
              {stat.statusVariant.toUpperCase()}
            </Badge>
            <ArrowUpRight size={14} className="text-slate-400 group-hover:text-slate-900 transition-colors" />
          </div>
        </div>

        <div className="flex items-baseline justify-between">
          <span className="text-2xl md:text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
            {stat.value}
          </span>
        </div>

        <div className="space-y-0.5 pt-1 border-t border-slate-100 font-sans text-xs">
          <span className="font-semibold text-slate-900 block">
            {stat.statusText}
          </span>
          {stat.supportingDetail && (
            <span className="text-[11px] text-slate-500 block truncate group-hover:text-slate-700">
              {stat.supportingDetail}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
