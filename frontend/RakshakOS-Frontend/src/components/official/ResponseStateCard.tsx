import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ActiveOperationalState } from '@/lib/types/official';
import { Activity, ShieldAlert, Users, Route, RefreshCw } from 'lucide-react';

interface ResponseStateCardProps {
  state: ActiveOperationalState;
  onInspectIncident: (code: string) => void;
  onInspectTeam: (teamName: string) => void;
}

export const ResponseStateCard: React.FC<ResponseStateCardProps> = ({
  state,
  onInspectIncident,
  onInspectTeam,
}) => {
  return (
    <Card className="border-slate-200 bg-white shadow-2xs">
      <CardHeader className="bg-slate-50/50 p-4 border-b border-slate-100 flex flex-row items-center justify-between">
        <div className="space-y-0.5">
          <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-700" />
            Current Active Operational State
          </CardTitle>
          <CardDescription className="text-xs">
            Primary active response plan tracking current execution vector.
          </CardDescription>
        </div>

        <Badge variant="critical" className="font-mono text-[10px]">
          {state.priority} PRIORITY
        </Badge>
      </CardHeader>

      <CardContent className="p-4 font-sans text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Active Incident */}
          <button
            type="button"
            onClick={() => onInspectIncident(state.incidentCode)}
            className="p-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100/80 transition-colors text-left space-y-1 cursor-pointer"
          >
            <span className="text-[10px] font-semibold text-slate-500 uppercase flex items-center gap-1">
              <ShieldAlert size={12} className="text-rose-600" />
              Active Incident
            </span>
            <div className="font-mono font-bold text-slate-900 text-xs">
              {state.incidentCode}
            </div>
            <p className="text-[11px] text-slate-700 truncate font-sans">{state.incidentTitle}</p>
          </button>

          {/* Response Plan Version */}
          <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 space-y-1">
            <span className="text-[10px] font-semibold text-slate-500 uppercase flex items-center gap-1">
              <RefreshCw size={12} className="text-emerald-600" />
              Active Response Plan
            </span>
            <div className="font-mono font-bold text-emerald-700 text-xs">
              {state.planVersion}
            </div>
            <p className="text-[11px] text-slate-600 truncate font-sans">Trigger: {state.lastChange}</p>
          </div>

          {/* Assigned Team */}
          <button
            type="button"
            onClick={() => onInspectTeam(state.assignedTeam)}
            className="p-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100/80 transition-colors text-left space-y-1 cursor-pointer"
          >
            <span className="text-[10px] font-semibold text-slate-500 uppercase flex items-center gap-1">
              <Users size={12} className="text-sky-600" />
              Assigned Responder Unit
            </span>
            <div className="font-semibold text-slate-900 text-xs truncate">
              {state.assignedTeam}
            </div>
            <p className="text-[11px] text-slate-500 font-sans">Click to inspect team roster</p>
          </button>

          {/* Active Navigation Route */}
          <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 space-y-1">
            <span className="text-[10px] font-semibold text-slate-500 uppercase flex items-center gap-1">
              <Route size={12} className="text-amber-600" />
              Active Navigation Vector
            </span>
            <div className="font-semibold text-slate-900 text-xs truncate">
              {state.route}
            </div>
            <p className="text-[11px] text-slate-500 font-sans">Detour ETA: +14m</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
