import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { OperationalAlert } from '@/lib/types/official';
import { AlertCircle, AlertTriangle, Info, MapPin, ChevronRight } from 'lucide-react';

interface CriticalAlertsListProps {
  alerts: OperationalAlert[];
  onSelectAlert: (alert: OperationalAlert) => void;
}

export const CriticalAlertsList: React.FC<CriticalAlertsListProps> = ({ alerts, onSelectAlert }) => {
  const getAlertIcon = (severity: 'CRITICAL' | 'WARNING' | 'INFO') => {
    switch (severity) {
      case 'CRITICAL':
        return <AlertCircle size={16} className="text-rose-600 shrink-0" />;
      case 'WARNING':
        return <AlertTriangle size={16} className="text-amber-600 shrink-0" />;
      case 'INFO':
        return <Info size={16} className="text-slate-600 shrink-0" />;
    }
  };

  const getAlertStyle = (severity: 'CRITICAL' | 'WARNING' | 'INFO') => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-rose-50/60 border-rose-200 hover:border-rose-400 hover:bg-rose-50 text-rose-950';
      case 'WARNING':
        return 'bg-amber-50/60 border-amber-200 hover:border-amber-400 hover:bg-amber-50 text-amber-950';
      case 'INFO':
        return 'bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-white text-slate-900';
    }
  };

  const getBadgeVariant = (severity: 'CRITICAL' | 'WARNING' | 'INFO') => {
    switch (severity) {
      case 'CRITICAL':
        return 'critical';
      case 'WARNING':
        return 'warning';
      case 'INFO':
        return 'default';
    }
  };

  return (
    <Card className="border-slate-200 bg-white">
      <CardHeader className="bg-slate-50/50 p-4 border-b border-slate-100 flex flex-row items-center justify-between">
        <div className="space-y-0.5">
          <CardTitle className="flex items-center gap-2 text-slate-900 text-sm font-bold">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            Critical Operational Alerts ({alerts.length})
          </CardTitle>
          <CardDescription className="text-xs">
            Priority alerts from field reports and agent observation loop.
          </CardDescription>
        </div>
        <Badge variant="critical" className="font-sans text-[10px]">Priority Feed</Badge>
      </CardHeader>

      <CardContent className="p-4 space-y-2.5">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            onClick={() => onSelectAlert(alert)}
            className={`p-3 rounded-lg border text-xs font-sans space-y-1.5 transition-all cursor-pointer group ${getAlertStyle(
              alert.severity
            )}`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
                {getAlertIcon(alert.severity)}
                <span className="group-hover:underline">{alert.title}</span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <Badge variant={getBadgeVariant(alert.severity)} className="text-[10px] font-sans">
                  {alert.severity}
                </Badge>
                <ChevronRight size={14} className="text-slate-400 group-hover:text-slate-800 transition-colors" />
              </div>
            </div>

            <p className="text-slate-700 leading-relaxed text-xs pl-6">
              {alert.message}
            </p>

            <div className="flex items-center justify-between text-[11px] text-slate-500 font-sans pl-6 pt-1 border-t border-slate-200/40">
              <span className="flex items-center gap-1">
                <MapPin size={11} className="text-slate-500" />
                {alert.location}
              </span>
              <span className="font-mono text-[10px] text-slate-500">{alert.timestamp}</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
