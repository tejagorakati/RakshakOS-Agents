'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ResponseZone, SeverityLevel, ResponseOperationItem } from '@/lib/types/official';
import { MapPin, AlertTriangle, Users, Droplets, Navigation, CheckCircle2 } from 'lucide-react';

interface OperationsMapVisualizationProps {
  zones: ResponseZone[];
  selectedZoneId: string;
  onSelectZone: (zoneId: string) => void;
  selectedOperation: ResponseOperationItem;
}

export const OperationsMapVisualization: React.FC<OperationsMapVisualizationProps> = ({
  zones,
  selectedZoneId,
  onSelectZone,
  selectedOperation,
}) => {
  const getSeverityBadgeVariant = (severity: SeverityLevel) => {
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

  const getSeverityBoxStyle = (severity: SeverityLevel, isSelected: boolean, isIncidentZone: boolean) => {
    const base = 'p-3.5 rounded-lg border transition-all cursor-pointer text-left space-y-1.5 font-sans ';
    
    if (isIncidentZone) {
      return base + 'bg-slate-900 text-white border-slate-900 ring-2 ring-slate-900 shadow-md';
    }

    switch (severity) {
      case 'CRITICAL':
        return (
          base +
          (isSelected
            ? 'bg-rose-50 border-rose-500 ring-2 ring-rose-500/30 shadow-xs'
            : 'bg-rose-50/50 border-rose-200 hover:border-rose-300')
        );
      case 'WARNING':
        return (
          base +
          (isSelected
            ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-500/30 shadow-xs'
            : 'bg-amber-50/50 border-amber-200 hover:border-amber-300')
        );
      case 'ACTIVE':
        return (
          base +
          (isSelected
            ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/30 shadow-xs'
            : 'bg-white border-slate-200 hover:border-slate-300')
        );
      case 'NORMAL':
        return (
          base +
          (isSelected
            ? 'bg-slate-100 border-slate-500 ring-2 ring-slate-500/30 shadow-xs'
            : 'bg-white border-slate-200 hover:border-slate-300')
        );
    }
  };

  return (
    <Card className="border-slate-200 bg-white shadow-2xs font-sans">
      <CardHeader className="bg-slate-50/50 p-4 border-b border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <CardTitle className="flex items-center gap-2 text-slate-900 text-sm font-bold">
              <MapPin className="w-4 h-4 text-slate-800" />
              Operations Situation Map & Flood Sensitivity Grid
            </CardTitle>
            <CardDescription className="text-xs">
              Geographic zone severity & active response vector map.
            </CardDescription>
          </div>

          {/* Semantic Legend */}
          <div className="flex items-center gap-1.5 flex-wrap text-[11px] font-sans">
            <span className="text-slate-500 font-semibold uppercase text-[10px]">Severity:</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-50 border border-rose-200 text-rose-800 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-600" /> Critical
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-800 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Warning
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Active
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        {/* Interactive Zone Grid Visualizer */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {zones.map((zone) => {
            const isSelected = zone.id === selectedZoneId;
            const isIncidentZone = zone.id === selectedOperation.zoneId;

            return (
              <button
                key={zone.id}
                type="button"
                onClick={() => onSelectZone(zone.id)}
                className={getSeverityBoxStyle(zone.severity, isSelected, isIncidentZone)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        isIncidentZone
                          ? 'bg-slate-800 text-amber-400 border border-slate-700'
                          : 'bg-white text-slate-900 border border-slate-200'
                      }`}
                    >
                      {zone.sectorCode}
                    </span>
                    {isIncidentZone && (
                      <span className="px-1.5 py-0.5 rounded bg-amber-400/20 border border-amber-400/40 text-amber-300 text-[9px] font-bold uppercase">
                        Target Zone
                      </span>
                    )}
                  </div>
                  <Badge variant={getSeverityBadgeVariant(zone.severity)} className="text-[10px] font-sans">
                    {zone.severity}
                  </Badge>
                </div>

                <div>
                  <h4 className={`font-bold text-xs truncate ${isIncidentZone ? 'text-white' : 'text-slate-900'}`}>
                    {zone.name}
                  </h4>
                  <span className={`text-[11px] block truncate ${isIncidentZone ? 'text-slate-300' : 'text-slate-500'}`}>
                    {zone.primaryRisk}
                  </span>
                </div>

                <div
                  className={`flex items-center justify-between text-[11px] pt-2 border-t ${
                    isIncidentZone ? 'border-slate-800 text-slate-300' : 'border-slate-200/60 text-slate-600'
                  }`}
                >
                  <span className="font-semibold">{zone.incidentCount} Incidents</span>
                  <span className="font-mono">{zone.waterLevelDepth}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Zone Overview Bar */}
        <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-sans">
          <div className="flex items-center gap-2">
            <MapPin size={15} className="text-slate-700 shrink-0" />
            <span className="text-slate-700">
              Active Focus Sector: <strong className="text-slate-900">{zones.find((z) => z.id === selectedZoneId)?.name || 'North Canal'}</strong>
            </span>
          </div>
          <span className="text-[11px] text-slate-500 italic">
            Click any sector zone above to highlight its incidents & operational status.
          </span>
        </div>
      </CardContent>
    </Card>
  );
};
