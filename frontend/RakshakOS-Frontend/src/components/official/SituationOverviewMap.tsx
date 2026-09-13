'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ResponseZone, SeverityLevel } from '@/lib/types/official';
import { MapPin, AlertTriangle, Users, Droplets, Navigation, CheckCircle2 } from 'lucide-react';

interface SituationOverviewMapProps {
  zones: ResponseZone[];
}

export const SituationOverviewMap: React.FC<SituationOverviewMapProps> = ({ zones }) => {
  const [selectedZoneId, setSelectedZoneId] = useState<string>(zones[0]?.id || '');

  const selectedZone = zones.find((z) => z.id === selectedZoneId) || zones[0];

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

  const getSeverityBoxStyle = (severity: SeverityLevel, isSelected: boolean) => {
    const base = 'p-4 rounded-lg border transition-all cursor-pointer text-left space-y-2 ';
    switch (severity) {
      case 'CRITICAL':
        return (
          base +
          (isSelected
            ? 'bg-rose-50 border-rose-500 ring-2 ring-rose-500/20 shadow-xs'
            : 'bg-rose-50/40 border-rose-200 hover:border-rose-300')
        );
      case 'WARNING':
        return (
          base +
          (isSelected
            ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-500/20 shadow-xs'
            : 'bg-amber-50/40 border-amber-200 hover:border-amber-300')
        );
      case 'ACTIVE':
        return (
          base +
          (isSelected
            ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
            : 'bg-white border-slate-200 hover:border-slate-300')
        );
      case 'NORMAL':
        return (
          base +
          (isSelected
            ? 'bg-slate-100 border-slate-500 ring-2 ring-slate-500/20 shadow-xs'
            : 'bg-white border-slate-200 hover:border-slate-300')
        );
    }
  };

  return (
    <Card className="border-slate-200 bg-white">
      <CardHeader className="bg-slate-50/50 p-5 border-b border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-slate-900">
              <MapPin className="w-4 h-4 text-slate-700" />
              Disaster Sensitivity & Situation Overview
            </CardTitle>
            <CardDescription>
              Operational incident concentration across Metro City North Sector flood zones.
            </CardDescription>
          </div>

          {/* Map Visual Legend */}
          <div className="flex items-center gap-2 flex-wrap text-xs font-sans">
            <span className="text-slate-500 text-[11px] font-semibold uppercase">Legend:</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-50 border border-rose-200 text-rose-700 text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-600" /> Critical (1.0m+)
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-800 text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Warning (0.5m+)
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Active (0.3m)
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" /> Normal
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-5 space-y-6">
        {/* Interactive Zone Grid Visualizer */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {zones.map((zone) => {
            const isSelected = zone.id === selectedZoneId;
            return (
              <button
                key={zone.id}
                type="button"
                onClick={() => setSelectedZoneId(zone.id)}
                className={getSeverityBoxStyle(zone.severity, isSelected)}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-slate-900 px-1.5 py-0.5 rounded bg-white border border-slate-200">
                    {zone.sectorCode}
                  </span>
                  <Badge variant={getSeverityBadgeVariant(zone.severity)} className="font-sans text-[10px]">
                    {zone.severity}
                  </Badge>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 text-xs truncate">{zone.name}</h4>
                  <p className="text-[11px] text-slate-600 truncate mt-0.5">{zone.primaryRisk}</p>
                </div>

                <div className="flex items-center justify-between text-[11px] font-sans pt-2 border-t border-slate-200/60 text-slate-700">
                  <span className="font-semibold">{zone.incidentCount} Active Incidents</span>
                  <span className="font-mono text-slate-600">{zone.waterLevelDepth}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Zone Operational Detail Drawer */}
        {selectedZone && (
          <div className="p-4 rounded-lg border border-slate-200 bg-slate-50 space-y-3 font-sans text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-slate-900 text-white font-mono font-bold text-xs">
                  {selectedZone.sectorCode}
                </span>
                <h4 className="text-sm font-bold text-slate-900">{selectedZone.name}</h4>
              </div>
              <Badge variant={getSeverityBadgeVariant(selectedZone.severity)}>
                Operational Severity: {selectedZone.severity}
              </Badge>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-2.5 rounded bg-white border border-slate-200 space-y-0.5">
                <span className="text-[11px] text-slate-500 font-semibold uppercase flex items-center gap-1">
                  <AlertTriangle size={12} className="text-rose-600" />
                  Active Incidents
                </span>
                <span className="text-base font-extrabold text-slate-900 font-mono">
                  {selectedZone.incidentCount} Reported
                </span>
              </div>

              <div className="p-2.5 rounded bg-white border border-slate-200 space-y-0.5">
                <span className="text-[11px] text-slate-500 font-semibold uppercase flex items-center gap-1">
                  <Droplets size={12} className="text-sky-600" />
                  Water Depth
                </span>
                <span className="text-base font-extrabold text-slate-900 font-mono">
                  {selectedZone.waterLevelDepth}
                </span>
              </div>

              <div className="p-2.5 rounded bg-white border border-slate-200 space-y-0.5">
                <span className="text-[11px] text-slate-500 font-semibold uppercase flex items-center gap-1">
                  <Users size={12} className="text-emerald-600" />
                  Deployed Teams
                </span>
                <span className="text-base font-extrabold text-slate-900 font-mono">
                  {selectedZone.deployedTeamsCount} Units
                </span>
              </div>

              <div className="p-2.5 rounded bg-white border border-slate-200 space-y-0.5">
                <span className="text-[11px] text-slate-500 font-semibold uppercase flex items-center gap-1">
                  <Navigation size={12} className="text-amber-600" />
                  Route Status
                </span>
                <span
                  className={`text-xs font-bold font-mono ${
                    selectedZone.routeStatus === 'CLEAR'
                      ? 'text-emerald-700'
                      : selectedZone.routeStatus === 'PARTIALLY_BLOCKED'
                      ? 'text-amber-700'
                      : 'text-rose-700'
                  }`}
                >
                  {selectedZone.routeStatus}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-600 pt-1">
              <span>Primary Risk Profile: <strong>{selectedZone.primaryRisk}</strong></span>
              <span className="text-slate-500 italic">Click any sector card above to inspect zone details.</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
