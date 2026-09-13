import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ResponseOperationItem, SeverityLevel } from '@/lib/types/official';
import { ShieldAlert, ChevronRight, Filter, Users, Route } from 'lucide-react';

interface IncidentListPanelProps {
  operations: ResponseOperationItem[];
  selectedOperationId: string;
  onSelectOperation: (op: ResponseOperationItem) => void;
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

export const IncidentListPanel: React.FC<IncidentListPanelProps> = ({
  operations,
  selectedOperationId,
  onSelectOperation,
  activeFilter,
  onFilterChange,
}) => {
  const getBadgeVariant = (severity: SeverityLevel) => {
    switch (severity) {
      case 'CRITICAL':
        return 'critical';
      case 'WARNING':
        return 'warning';
      case 'ACTIVE':
        return 'success';
      case 'NORMAL':
        return 'default';
    }
  };

  return (
    <Card className="border-slate-200 bg-white flex flex-col h-full shadow-2xs font-sans">
      <CardHeader className="bg-slate-50/50 p-4 border-b border-slate-100 space-y-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <ShieldAlert size={16} className="text-slate-800" />
            Active Operations Queue ({operations.length})
          </CardTitle>
          <Badge variant="outline" className="font-mono text-[10px] text-slate-700 bg-white">
            Live Stream
          </Badge>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs">
          {(['ALL', 'CRITICAL', 'WARNING', 'ACTIVE', 'MONITORING'] as const).map((filterKey) => {
            const isSelected = activeFilter === filterKey;
            return (
              <button
                key={filterKey}
                onClick={() => onFilterChange(filterKey)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-sans font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {filterKey === 'ALL'
                  ? 'All'
                  : filterKey === 'CRITICAL'
                  ? 'Critical'
                  : filterKey === 'WARNING'
                  ? 'Warning'
                  : filterKey === 'ACTIVE'
                  ? 'Active'
                  : 'Monitoring'}
              </button>
            );
          })}
        </div>
      </CardHeader>

      <CardContent className="p-3 space-y-2 flex-1 overflow-y-auto max-h-[620px]">
        {operations.length === 0 ? (
          <div className="p-6 text-center border border-dashed border-slate-200 rounded-md bg-slate-50 text-slate-500 text-xs">
            No active operations match the selected filter.
          </div>
        ) : (
          operations.map((op) => {
            const isSelected = op.id === selectedOperationId;
            return (
              <div
                key={op.id}
                onClick={() => onSelectOperation(op)}
                className={`p-3.5 rounded-lg border text-xs transition-all cursor-pointer space-y-2 group ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm ring-1 ring-slate-900'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-mono text-[11px] font-bold px-1.5 py-0.5 rounded ${
                        isSelected ? 'bg-slate-800 text-amber-400 border border-slate-700' : 'bg-slate-100 text-slate-900 border border-slate-200'
                      }`}
                    >
                      {op.code}
                    </span>
                    <Badge variant={getBadgeVariant(op.severity)} className="text-[10px] font-sans">
                      {op.severity}
                    </Badge>
                  </div>
                  <ChevronRight
                    size={16}
                    className={isSelected ? 'text-white' : 'text-slate-400 group-hover:text-slate-800'}
                  />
                </div>

                <div>
                  <h4 className={`font-bold text-xs leading-snug ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                    {op.title}
                  </h4>
                  <span className={`text-[11px] font-sans block mt-0.5 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                    {op.location}
                  </span>
                </div>

                <div
                  className={`pt-2 flex items-center justify-between text-[11px] font-sans border-t ${
                    isSelected ? 'border-slate-800 text-slate-300' : 'border-slate-100 text-slate-600'
                  }`}
                >
                  <span className="flex items-center gap-1 font-medium">
                    <Users size={12} className={isSelected ? 'text-sky-300' : 'text-slate-500'} />
                    {op.assignedTeamDetail.teamName}
                  </span>
                  <span className="font-mono font-bold text-[10px] uppercase px-1.5 py-0.5 rounded bg-slate-100/20">
                    Plan {op.currentPlanVersion}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
};
