'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { PageHeader } from '@/components/official/PageHeader';
import { DetailModal, ModalContentData } from '@/components/official/DetailModal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { mockFullAgentActivityEvents, FullAgentActivityEvent } from '@/lib/mock/official-operations-data';
import { getAgentActivity, AgentEvent } from '@/lib/api';
import {
  Activity,
  Filter,
  Search,
  Zap,
  Clock,
  AlertTriangle,
  GitBranch,
  RefreshCw,
  X,
} from 'lucide-react';

// Incident ID matches the demo payload used by the Command Center.
const DEMO_INCIDENT_ID = 'INC-DEMO-001';

/** Map a backend AgentEvent to the FullAgentActivityEvent shape used by the existing render logic. */
function mapAgentEvent(evt: AgentEvent): FullAgentActivityEvent {
  const details = evt.details as Record<string, unknown>;
  // Try to extract useful sub-fields from the specialist result payload
  const plan   = (details.plan   ?? {}) as Record<string, unknown>;
  const decision = (details.decision ?? {}) as Record<string, unknown>;
  const assessment = (details.assessment ?? {}) as Record<string, unknown>;

  const affectedResources: string[] = [];
  const assignmentsRaw = (decision.assignments ?? []) as unknown[];
  for (const a of assignmentsRaw) {
    if (a && typeof a === 'object') {
      const id = (a as Record<string, unknown>).resource_id;
      if (typeof id === 'string') affectedResources.push(id);
    }
  }

  return {
    id: evt.id,
    eventType: (evt.category === 'REPLANNING' ? 'REPLAN_TRIGGERED'
      : evt.category === 'PLANNING'    ? 'PLAN_UPDATED'
      : evt.category === 'ALLOCATION'  ? 'RESOURCE_ALLOCATED'
      : evt.category === 'ASSESSMENT'  ? 'INCIDENT_ASSESSED'
      : 'PLAN_UPDATED'),
    category: evt.category as FullAgentActivityEvent['category'],
    description: evt.description,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    status: 'COMPLETED',
    incidentId: evt.incident_id,
    actionPerformed: String(
      plan.objective ?? decision.rationale ?? assessment.reason ?? evt.description
    ).slice(0, 200),
    trigger: `${evt.label} processed incident ${evt.incident_id}.`,
    affectedTeamName: undefined,
    affectedResources: affectedResources.length > 0 ? affectedResources : undefined,
  };
}

export default function AgentActivityPage() {
  const [events, setEvents] = useState<FullAgentActivityEvent[]>(mockFullAgentActivityEvents);
  const [isLive, setIsLive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedModalEvent, setSelectedModalEvent] = useState<FullAgentActivityEvent | null>(null);

  const loadLiveEvents = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const res = await getAgentActivity(DEMO_INCIDENT_ID);
      if (res.agent_events.length > 0) {
        setEvents(res.agent_events.map((e) => mapAgentEvent(e)));
        setIsLive(true);
      }
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Could not connect to backend.');
      // Keep mock data visible
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadLiveEvents();
  }, [loadLiveEvents]);

  const categories = [
    { key: 'ALL', label: 'All Categories' },
    { key: 'ASSESSMENT', label: 'Assessment' },
    { key: 'PLANNING', label: 'Planning' },
    { key: 'ALLOCATION', label: 'Allocation' },
    { key: 'EXECUTION', label: 'Execution' },
    { key: 'MONITORING', label: 'Monitoring' },
    { key: 'REPLANNING', label: 'Replanning' },
  ];

  const filteredEvents = events.filter((evt) => {
    const matchesCategory = selectedCategory === 'ALL' || evt.category === selectedCategory;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      evt.description.toLowerCase().includes(query) ||
      evt.actionPerformed.toLowerCase().includes(query) ||
      (evt.incidentId && evt.incidentId.toLowerCase().includes(query)) ||
      (evt.affectedTeamName && evt.affectedTeamName.toLowerCase().includes(query));
    return matchesCategory && matchesSearch;
  });

  const getCategoryBadgeVariant = (cat: string): 'critical' | 'info' | 'default' | 'warning' | 'success' | 'outline' => {
    switch (cat) {
      case 'REPLANNING':
        return 'critical';
      case 'ASSESSMENT':
        return 'info';
      case 'PLANNING':
        return 'default';
      case 'ALLOCATION':
        return 'warning';
      case 'EXECUTION':
        return 'success';
      case 'MONITORING':
        return 'outline';
      default:
        return 'default';
    }
  };

  const getModalData = (evt: FullAgentActivityEvent): ModalContentData => {
    return {
      type: 'AGENT_EVENT',
      title: evt.description,
      subtitle: `Timestamp: ${evt.timestamp} | ID: ${evt.id}`,
      badgeText: evt.category,
      badgeVariant: getCategoryBadgeVariant(evt.category),
      description: evt.actionPerformed,
      fields: [
        { label: 'Event ID', value: evt.id, mono: true },
        { label: 'Event Category', value: evt.category, mono: true },
        { label: 'Status', value: evt.status, mono: true },
        { label: 'Trigger Context', value: evt.trigger },
        { label: 'Incident Target', value: evt.incidentId || 'System Wide', mono: true },
        { label: 'Assigned Team', value: evt.affectedTeamName || 'N/A' },
      ],
      listItems: evt.affectedResources?.map((res) => ({
        title: res,
        detail: 'Allocated Field Asset',
      })),
    };
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 md:px-6 py-6 font-sans">
      {/* Live data status strip */}
      {isLoading && (
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-xs text-slate-600 font-sans">
          <RefreshCw size={13} className="animate-spin text-slate-500 shrink-0" />
          <span>Loading agent activity from backend…</span>
        </div>
      )}
      {loadError && !isLoading && (
        <div className="flex items-start gap-2 px-4 py-2.5 rounded-lg border border-amber-200 bg-amber-50 text-xs text-amber-900 font-sans">
          <AlertTriangle size={13} className="text-amber-600 shrink-0 mt-0.5" />
          <span className="flex-1">Backend unavailable — showing prototype data. ({loadError})</span>
          <button type="button" onClick={() => setLoadError(null)} className="text-amber-600 hover:text-amber-800 cursor-pointer shrink-0" aria-label="Dismiss"><X size={13} /></button>
        </div>
      )}
      {isLive && !isLoading && (
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-emerald-200 bg-emerald-50 text-xs text-emerald-800 font-sans">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <span>Live agent activity — incident <span className="font-mono font-bold">{DEMO_INCIDENT_ID}</span>.</span>
          <button type="button" onClick={loadLiveEvents} className="ml-auto flex items-center gap-1 text-emerald-700 hover:text-emerald-900 cursor-pointer font-semibold">
            <RefreshCw size={11} /> Refresh
          </button>
        </div>
      )}
      {/* Top Operations Header */}
      <PageHeader
        title="Agent Activity Log"
        subtitle="Live event stream tracking autonomous multi-agent reasoning, plan invalidations, and dispatch executions"
        scenarioName="Metro City Flood Response — Monsoon Emergency"
        regionLocation="North Command Sector"
        operationStatus="REAL-TIME AGENT LOOP ACTIVE"
        lastUpdated="14:35:00"
      />

      {/* Quick Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-4 border-slate-200 bg-white shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Events</span>
            <Activity className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 font-mono mt-1">{events.length}</p>
          <span className="text-[11px] text-emerald-600 font-medium">{isLive ? 'From backend' : 'Prototype data'}</span>
        </Card>

        <Card className="p-4 border-slate-200 bg-white shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Re-Plans Triggered</span>
            <RefreshCw className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-extrabold text-amber-700 font-mono mt-1">
            {events.filter((e) => e.category === 'REPLANNING').length || events.filter((e) => e.eventType === 'REPLAN_TRIGGERED').length}
          </p>
          <span className="text-[11px] text-slate-600">Adaptive plan changes</span>
        </Card>

        <Card className="p-4 border-slate-200 bg-white shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Active Agents</span>
            <Zap className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 font-mono mt-1">5</p>
          <span className="text-[11px] text-slate-600">Multi-Agent Loop</span>
        </Card>

        <Card className="p-4 border-slate-200 bg-white shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Avg Latency</span>
            <Clock className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-700 font-mono mt-1">1.2s</p>
          <span className="text-[11px] text-slate-600">Event evaluation speed</span>
        </Card>
      </div>

      {/* Filters & Search Control Bar */}
      <Card className="p-4 border-slate-200 bg-white shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search event log by keyword, incident ref, or team..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/20 font-sans"
            />
          </div>

          {/* Event Count Indicator */}
          <div className="text-xs text-slate-500 font-mono self-center">
            Showing <span className="font-bold text-slate-900">{filteredEvents.length}</span> of{' '}
            <span className="font-bold text-slate-900">{events.length}</span> events
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-400 text-[11px] font-bold uppercase tracking-wider mr-1 flex items-center gap-1">
            <Filter size={12} /> Category:
          </span>
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-colors whitespace-nowrap cursor-pointer ${
                selectedCategory === cat.key
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </Card>

      {/* Activity Timeline Stream */}
      <div className="space-y-3">
        {filteredEvents.length === 0 ? (
          <Card className="p-8 text-center border-slate-200 bg-white space-y-2">
            <AlertTriangle className="w-8 h-8 text-slate-400 mx-auto" />
            <h4 className="text-sm font-bold text-slate-800">No Agent Events Found</h4>
            <p className="text-xs text-slate-500">
              No events match the selected category filter or search query. Try clearing filters.
            </p>
          </Card>
        ) : (
          filteredEvents.map((evt) => (
            <Card
              key={evt.id}
              className="p-4 border-slate-200 bg-white hover:border-slate-300 transition-all shadow-2xs space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 flex items-center gap-1">
                    <Clock size={12} className="text-slate-500" />
                    {evt.timestamp}
                  </span>
                  <Badge variant={getCategoryBadgeVariant(evt.category)} className="text-xs uppercase">
                    {evt.category}
                  </Badge>
                  <Badge variant="outline" className="text-xs font-mono text-slate-600">
                    {evt.eventType}
                  </Badge>
                </div>

                <div className="flex items-center gap-2">
                  {evt.incidentId && (
                    <span className="text-[11px] font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {evt.incidentId}
                    </span>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedModalEvent(evt)}
                    className="text-xs text-slate-700 hover:bg-slate-100 h-7 px-2.5 cursor-pointer"
                  >
                    Inspect Trace
                  </Button>
                </div>
              </div>

              <div className="space-y-1.5">
                <h4 className="text-sm font-bold text-slate-900 leading-snug">{evt.description}</h4>
                <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200/80 leading-relaxed font-sans">
                  <strong className="text-slate-900">Action:</strong> {evt.actionPerformed}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                <div className="flex items-start gap-1.5 text-slate-600">
                  <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-slate-800">Trigger:</strong> {evt.trigger}
                  </span>
                </div>

                {evt.affectedTeamName && (
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <GitBranch className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <span>
                      <strong className="text-slate-800">Team:</strong> {evt.affectedTeamName}
                    </span>
                  </div>
                )}
              </div>

              {evt.affectedResources && evt.affectedResources.length > 0 && (
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Resources Allocated:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {evt.affectedResources.map((res, i) => (
                      <span
                        key={i}
                        className="text-[11px] font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200"
                      >
                        {res}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          ))
        )}
      </div>

      {/* Detail Inspector Modal */}
      {selectedModalEvent && (
        <DetailModal
          isOpen={!!selectedModalEvent}
          onClose={() => setSelectedModalEvent(null)}
          data={getModalData(selectedModalEvent)}
        />
      )}
    </div>
  );
}
