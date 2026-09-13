import React from 'react';
import { Badge } from '@/components/ui/badge';
import { StatusIndicator } from '@/components/ui/status-indicator';
import { Shield, Clock, MapPin } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  subtitle: string;
  scenarioName: string;
  regionLocation: string;
  operationStatus: string;
  lastUpdated: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  scenarioName,
  regionLocation,
  operationStatus,
  lastUpdated,
}) => {
  // Sanitize operation status to avoid repeating tagline
  const cleanStatus = operationStatus.includes('→') ? 'RESPONSE ACTIVE' : operationStatus;

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-2 text-xs font-sans">
          <Badge variant="outline" className="bg-white border-slate-300 text-slate-800 font-semibold px-2 py-0.5">
            <Shield className="w-3 h-3 mr-1 text-slate-700 inline" />
            {scenarioName}
          </Badge>
          <span className="text-slate-300">•</span>
          <span className="text-slate-600 font-medium flex items-center gap-1">
            <MapPin size={12} className="text-slate-400" />
            {regionLocation}
          </span>
        </div>
        <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
          {title}
        </h1>
        <p className="text-xs text-slate-600 font-sans max-w-3xl leading-relaxed">
          {subtitle}
        </p>
      </div>

      <div className="flex items-center gap-3 self-start md:self-auto shrink-0">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-white shadow-2xs text-xs">
          <StatusIndicator status="active" label={cleanStatus} />
          <span className="text-slate-300">|</span>
          <div className="flex items-center gap-1 text-[11px] text-slate-500 font-mono">
            <Clock size={12} />
            <span>{lastUpdated}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
