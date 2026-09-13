import React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AgentActivitySummaryEvent } from '@/lib/types/official';
import { Activity, ArrowRight, ChevronRight, Clock } from 'lucide-react';

interface AgentActivitySummaryListProps {
  events: AgentActivitySummaryEvent[];
  onSelectEvent: (evt: AgentActivitySummaryEvent) => void;
}

export const AgentActivitySummaryList: React.FC<AgentActivitySummaryListProps> = ({ events, onSelectEvent }) => {
  const getEventBadge = (type: AgentActivitySummaryEvent['eventType']) => {
    switch (type) {
      case 'REPLAN_TRIGGERED':
        return <Badge variant="critical">REPLAN TRIGGERED</Badge>;
      case 'PLAN_UPDATED':
        return <Badge variant="warning">PLAN UPDATED</Badge>;
      case 'TEAM_ASSIGNED':
        return <Badge variant="success">TEAM ASSIGNED</Badge>;
      case 'RESOURCE_ALLOCATED':
        return <Badge variant="info">RESOURCE ALLOCATED</Badge>;
      case 'INCIDENT_ASSESSED':
        return <Badge variant="outline">INCIDENT ASSESSED</Badge>;
      default:
        return <Badge variant="default">{type}</Badge>;
    }
  };

  return (
    <Card className="border-slate-200 bg-white">
      <CardHeader className="bg-slate-50/50 p-4 border-b border-slate-100 flex flex-row items-center justify-between">
        <div className="space-y-0.5">
          <CardTitle className="flex items-center gap-2 text-slate-900 text-sm font-bold">
            <Activity className="w-4 h-4 text-slate-800" />
            Recent Agent Operational Actions
          </CardTitle>
          <CardDescription className="text-xs">
            Timestamped execution log from multi-agent observation loop.
          </CardDescription>
        </div>

        <Link
          href="/official/agent-activity"
          className="text-xs font-sans font-semibold text-slate-900 hover:underline flex items-center gap-1 shrink-0"
        >
          <span>View all activity</span>
          <ArrowRight size={14} />
        </Link>
      </CardHeader>

      <CardContent className="p-4 space-y-2.5 font-sans text-xs">
        {events.map((evt) => (
          <div
            key={evt.id}
            onClick={() => onSelectEvent(evt)}
            className="p-3 rounded-lg border border-slate-200 bg-slate-50 space-y-1.5 transition-all hover:bg-white hover:border-slate-300 hover:shadow-2xs cursor-pointer group"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {getEventBadge(evt.eventType)}
                <span className="font-mono text-[10px] text-slate-500 flex items-center gap-1">
                  <Clock size={11} />
                  {evt.timestamp}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <span className="text-[10px] font-mono font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                  {evt.status}
                </span>
                <ChevronRight size={14} className="text-slate-400 group-hover:text-slate-800 transition-colors" />
              </div>
            </div>

            <p className="text-slate-800 font-semibold leading-normal text-xs group-hover:text-slate-900">
              {evt.description}
            </p>

            <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono pt-1 border-t border-slate-200/60">
              {evt.incidentId && <span>Ref Incident: <strong>{evt.incidentId}</strong></span>}
              {evt.teamId && <span>Team: <strong>{evt.teamId}</strong></span>}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
