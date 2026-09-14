'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { PageHeader } from '@/components/official/PageHeader';
import { OperationalStatCard } from '@/components/official/OperationalStatCard';
import { SituationOverviewMap } from '@/components/official/SituationOverviewMap';
import { AgentActivitySummaryList } from '@/components/official/AgentActivitySummaryList';
import { HumanAttentionPanel } from '@/components/official/HumanAttentionPanel';
import { ResponseStateCard } from '@/components/official/ResponseStateCard';
import { DetailModal, ModalContentData } from '@/components/official/DetailModal';
import { mockCommandCenterOverview } from '@/lib/mock/command-center-data';
import { CommandCenterOverview, OperationalStat, AgentActivitySummaryEvent } from '@/lib/types/official';
import { processIncident, listApprovalRequests, decideApprovalRequest, ApprovalRequest } from '@/lib/api';
import { saveVolunteerSession, getVolunteerSession } from '@/lib/volunteer-session';
import { Filter, RefreshCw, AlertTriangle, X, ShieldCheck } from 'lucide-react';

// Demo incident payload — matches the Vijayawada flood scenario the backend agents are tuned for.
// Coordinates: Vijayawada, Andhra Pradesh.
const DEMO_INCIDENT_PAYLOAD = {
  incident_id: 'INC-DEMO-001',
  disaster_type: 'flood',
  location: 'Vijayawada, Andhra Pradesh',
  latitude: 16.5062,
  longitude: 80.6480,
  start_lat: 16.5200,
  start_lon: 80.6200,
  end_lat: 16.4900,
  end_lon: 80.6700,
  priority: 'P1',
  requirements: ['rescue_team', 'ambulance', 'medical_kit'],
  reports: [],
  plan_version: 1,
} as const;

export default function CommandCenterPage() {
  const [data, setData] = useState<CommandCenterOverview>(mockCommandCenterOverview);
  const [isLive, setIsLive] = useState(false);
  const [isLoadingLive, setIsLoadingLive] = useState(false);
  const [liveError, setLiveError] = useState<string | null>(null);

  // Approval requests state
  const [approvals, setApprovals] = useState<ApprovalRequest[]>([]);
  const [isLoadingApprovals, setIsLoadingApprovals] = useState(false);
  const [decidingId, setDecidingId] = useState<string | null>(null);

  const loadApprovals = useCallback(async () => {
    setIsLoadingApprovals(true);
    try {
      const res = await listApprovalRequests(DEMO_INCIDENT_PAYLOAD.incident_id);
      setApprovals(res.approval_requests);
    } catch {
      // Non-fatal — approval panel stays empty rather than breaking the page
    } finally {
      setIsLoadingApprovals(false);
    }
  }, []);

  const handleDecide = async (requestId: string, decision: 'approved' | 'rejected') => {
    setDecidingId(requestId);
    try {
      const res = await decideApprovalRequest(requestId, {
        official_id: 'EOC-OFFICIAL',
        decision,
      });
      setApprovals((prev) =>
        prev.map((r) => (r.id === requestId ? res.approval_request : r)),
      );
    } catch {
      // Decision failure is surfaced by the button re-enabling
    } finally {
      setDecidingId(null);
    }
  };

  // Fetch live data from the backend on mount
  const loadLiveData = useCallback(async () => {
    setIsLoadingLive(true);
    setLiveError(null);
    try {
      const response = await processIncident({
        ...DEMO_INCIDENT_PAYLOAD,
        requirements: [...DEMO_INCIDENT_PAYLOAD.requirements],
        reports: [...DEMO_INCIDENT_PAYLOAD.reports],
      });
      if (response.data) {
        setData(response.data);
        setIsLive(true);
        // Persist the demo incident ID into the volunteer session so the
        // report-situation page can pass it to POST /incidents/{id}/reports.
        const session = getVolunteerSession();
        if (session) {
          saveVolunteerSession({ ...session, currentIncidentId: DEMO_INCIDENT_PAYLOAD.incident_id });
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Could not connect to backend.';
      setLiveError(msg);
      // Keep showing mock data — dashboard remains usable offline.
    } finally {
      setIsLoadingLive(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadLiveData();
    loadApprovals();
  }, [loadLiveData, loadApprovals]);

  // Local Interactivity State
  const [severityFilter, setSeverityFilter] = useState<'ALL' | 'CRITICAL' | 'WARNING' | 'ACTIVE'>('ALL');
  const [modalData, setModalData] = useState<ModalContentData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = (content: ModalContentData) => {
    setModalData(content);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalData(null);
  };

  // Filtered Agent Activity Stream
  const filteredAgentEvents = data.agentActivity.filter((evt) => {
    if (severityFilter === 'ALL') return true;
    if (severityFilter === 'CRITICAL') return evt.eventType === 'REPLAN_TRIGGERED';
    if (severityFilter === 'WARNING') return evt.eventType === 'PLAN_UPDATED' || evt.eventType === 'ROUTE_ALTERED';
    if (severityFilter === 'ACTIVE') return evt.status === 'IN_PROGRESS' || evt.eventType === 'TEAM_ASSIGNED';
    return true;
  });

  // Stat Card Click Interactions
  const handleStatCardClick = (statKey: OperationalStat['key']) => {
    if (statKey === 'incidents') {
      openModal({
        type: 'STAT_FILTER',
        title: 'Active Incidents Summary',
        subtitle: '18 Incidents Logged across North Command Sector',
        badgeText: '18 ACTIVE',
        badgeVariant: 'success',
        description: 'All 18 active incidents currently monitored by the observation loop. 14 in progress with dispatched responders.',
        fields: [
          { label: 'Critical Priority', value: '3 Incidents', mono: true },
          { label: 'Dispatched / On Site', value: '14 Teams', mono: true },
          { label: 'Pending Assessment', value: '4 Incidents', mono: true },
          { label: 'Primary Sector', value: 'Sector 7 & Sector 4' },
        ],
        listItems: data.incidents.map((inc) => ({
          title: `${inc.code}: ${inc.title}`,
          detail: `${inc.priority} • ${inc.status}`,
        })),
      });
    } else if (statKey === 'critical') {
      openModal({
        type: 'INCIDENT',
        title: 'Critical Incidents Queue (3 Active)',
        subtitle: 'High Severity Emergency Cases',
        badgeText: '3 CRITICAL',
        badgeVariant: 'critical',
        description: 'Critical incidents requiring immediate rescue operations. 1 action requires human authority approval.',
        fields: [
          { label: 'Incident 1', value: 'INC-032: Residents Stranded at North Canal' },
          { label: 'Incident 2', value: 'INC-029: Medical Evacuation Request at East Junction' },
          { label: 'Incident 3', value: 'INC-035: Flood Embankment Breach Threat' },
          { label: 'Human Approval Gate', value: 'INC-035 (Sluice Gate 3 Emergency Breach)' },
        ],
        listItems: data.incidents
          .filter((i) => i.priority === 'CRITICAL')
          .map((i) => ({
            title: `${i.code}: ${i.title}`,
            detail: `Location: ${i.location}`,
          })),
      });
    } else if (statKey === 'teams') {
      openModal({
        type: 'TEAM',
        title: 'Response Teams Roster & Deployment Status',
        subtitle: '12 Deployed / 4 Standby',
        badgeText: '75% DEPLOYED',
        badgeVariant: 'success',
        description: 'Active deployment breakdown across NDRF, Fire & Rescue, Paramedic, and Engineering units.',
        fields: [
          { label: 'Total Registered Teams', value: '16 Response Teams', mono: true },
          { label: 'Currently Deployed', value: '12 Units', mono: true },
          { label: 'On Standby Reserve', value: '4 Units', mono: true },
          { label: 'Primary Command Base', value: 'Sector 1 Staging Depot' },
        ],
        listItems: data.teams.map((t) => ({
          title: `${t.name} (${t.type})`,
          detail: `Status: ${t.status} • Assignment: ${t.currentAssignment}`,
        })),
      });
    } else if (statKey === 'resources') {
      openModal({
        type: 'STAT_FILTER',
        title: 'Equipment & Resource Allocation Roster',
        subtitle: '84% Overall Capacity Allocated',
        badgeText: '84% ALLOCATED',
        badgeVariant: 'warning',
        description: 'Resource fleet utilization across vehicles, rescue boats, dewatering pumps, and Mediacl kits.',
        fields: [
          { label: 'Rescue Boats', value: '8 Deployed / 10 Total', mono: true },
          { label: 'Ambulances', value: '12 Deployed / 15 Total', mono: true },
          { label: 'Heavy Dewatering Pumps', value: '6 Deployed / 8 Total', mono: true },
          { label: 'Medical First Aid Kits', value: '160 Distributed / 200 Total', mono: true },
        ],
        listItems: data.resources.map((r) => ({
          title: r.name,
          detail: `${r.deployedCount}/${r.totalCount} ${r.unit} (${r.status})`,
        })),
      });
    }
  };

  // Inspect Specific Incident
  const handleInspectIncident = (incidentCode: string) => {
    const inc = data.incidents.find((i) => i.code === incidentCode) || data.incidents[0];
    openModal({
      type: 'INCIDENT',
      title: `${inc.code}: ${inc.title}`,
      subtitle: `Status: ${inc.status}`,
      badgeText: inc.priority,
      badgeVariant: inc.priority === 'CRITICAL' ? 'critical' : 'warning',
      description: inc.situation,
      fields: [
        { label: 'Location', value: inc.location },
        { label: 'Assigned Team', value: inc.assignedTeam || 'Pending Assignment' },
        { label: 'Active Plan Version', value: inc.planVersion, mono: true },
        { label: 'Navigation Route', value: inc.routeStatus },
        { label: 'Agent Status', value: inc.agentStatus },
      ],
      listItems: inc.resources.map((res) => ({
        title: 'Allocated Asset',
        detail: res,
      })),
    });
  };

  // Inspect Specific Team
  const handleInspectTeam = (teamName: string) => {
    const team = data.teams.find((t) => t.name.toLowerCase().includes(teamName.toLowerCase()) || teamName.includes(t.name)) || data.teams[0];
    openModal({
      type: 'TEAM',
      title: `${team.name} (${team.code})`,
      subtitle: team.type,
      badgeText: team.status,
      badgeVariant: team.status === 'DEPLOYED' ? 'success' : 'outline',
      description: `Assigned Mission: ${team.currentAssignment}. Operating in ${team.location}.`,
      fields: [
        { label: 'Team Members Count', value: `${team.membersCount} Responders`, mono: true },
        { label: 'Current Sector Location', value: team.location },
        { label: 'Operational Status', value: team.status, mono: true },
        { label: 'Current Assignment', value: team.currentAssignment },
      ],
      listItems: team.equipment.map((eq) => ({
        title: 'Equipped Asset',
        detail: eq,
      })),
    });
  };

  // Select Agent Activity Event Detail
  const handleSelectAgentEvent = (evt: AgentActivitySummaryEvent) => {
    openModal({
      type: 'AGENT_EVENT',
      title: `${evt.eventType.replace('_', ' ')}`,
      subtitle: evt.timestamp,
      badgeText: evt.status,
      badgeVariant: evt.status === 'COMPLETED' ? 'success' : 'warning',
      description: evt.description,
      fields: [
        { label: 'Event Classification', value: evt.eventType, mono: true },
        { label: 'Execution Timestamp', value: evt.timestamp, mono: true },
        { label: 'Target Incident ID', value: evt.incidentId || 'System Wide', mono: true },
        { label: 'Associated Team ID', value: evt.teamId || 'None', mono: true },
        { label: 'Technical Event Trace', value: evt.details || 'Observation loop verified & executed.' },
      ],
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 md:px-6 py-6 font-sans">
      {/* Live data status strip */}
      {isLoadingLive && (
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-xs text-slate-600 font-sans">
          <RefreshCw size={13} className="animate-spin text-slate-500 shrink-0" />
          <span>Connecting to backend — processing incident through agent pipeline…</span>
        </div>
      )}
      {liveError && !isLoadingLive && (
        <div className="flex items-start gap-2 px-4 py-2.5 rounded-lg border border-amber-200 bg-amber-50 text-xs text-amber-900 font-sans">
          <AlertTriangle size={13} className="text-amber-600 shrink-0 mt-0.5" />
          <span className="flex-1">Backend unavailable — showing prototype data. ({liveError})</span>
          <button
            type="button"
            onClick={() => setLiveError(null)}
            className="text-amber-600 hover:text-amber-800 cursor-pointer shrink-0"
            aria-label="Dismiss"
          >
            <X size={13} />
          </button>
        </div>
      )}
      {isLive && !isLoadingLive && (
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-emerald-200 bg-emerald-50 text-xs text-emerald-800 font-sans">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <span>Live agent data — incident <span className="font-mono font-bold">{DEMO_INCIDENT_PAYLOAD.incident_id}</span> processed.</span>
          <button
            type="button"
            onClick={loadLiveData}
            className="ml-auto flex items-center gap-1 text-emerald-700 hover:text-emerald-900 cursor-pointer font-semibold"
          >
            <RefreshCw size={11} /> Reprocess
          </button>
        </div>
      )}
      {/* Page Header */}
      <PageHeader
        title="Command Center"
        subtitle="Operational overview of active disaster response."
        scenarioName={data.disasterScenarioName}
        regionLocation={data.regionLocation}
        operationStatus={data.operationStatus}
        lastUpdated={data.lastUpdated}
      />

      {/* FILTER BAR FOR INTERACTIVE SEVERITY SWITCHING */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
          <Filter size={14} className="text-slate-500" />
          <span>Filter Command View:</span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {(['ALL', 'CRITICAL', 'WARNING', 'ACTIVE'] as const).map((filterKey) => {
            const isSelected = severityFilter === filterKey;
            return (
              <button
                key={filterKey}
                onClick={() => setSeverityFilter(filterKey)}
                className={`px-3 py-1 rounded-lg text-xs font-sans font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {filterKey === 'ALL'
                  ? 'All Items'
                  : filterKey === 'CRITICAL'
                  ? 'Critical Only'
                  : filterKey === 'WARNING'
                  ? 'Warnings Only'
                  : 'Active Dispatches'}
              </button>
            );
          })}
        </div>
      </div>

      {/* SECTION 1 — OPERATIONAL SUMMARY CARDS */}
      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 font-sans">
            Key Operational Metrics
          </h2>
          <span className="text-[11px] font-mono text-slate-500">NORTH SECTOR TELEMETRY</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {data.stats.map((stat) => (
            <OperationalStatCard
              key={stat.id}
              stat={stat}
              onClick={handleStatCardClick}
            />
          ))}
        </div>
      </section>

      {/* SECTION 7 — CURRENT OPERATIONAL RESPONSE STATE PANEL */}
      <section>
        <ResponseStateCard
          state={data.activeState}
          onInspectIncident={handleInspectIncident}
          onInspectTeam={handleInspectTeam}
        />
      </section>

      {/* SECTION 6 — HUMAN ATTENTION (EXCEPTIONAL APPROVALS GATE) */}
      <section>
        <HumanAttentionPanel items={data.humanAttentionItems} />
      </section>

      {/* SECTION — VOLUNTEER APPROVAL REQUESTS */}
      <section>
        <div className="border border-slate-200 bg-white shadow-2xs rounded-xl overflow-hidden">
          {/* Header */}
          <div className="bg-slate-50/60 px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                Volunteer Approval Requests
              </h2>
              <p className="text-xs text-slate-500 font-sans">
                Resource requests submitted by field volunteers for this incident.
              </p>
            </div>
            <button
              type="button"
              onClick={loadApprovals}
              disabled={isLoadingApprovals}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw size={12} className={isLoadingApprovals ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>

          {/* Body */}
          <div className="p-5 font-sans text-xs">
            {isLoadingApprovals && approvals.length === 0 ? (
              <div className="flex items-center gap-2 text-slate-500 py-4">
                <RefreshCw size={13} className="animate-spin shrink-0" />
                <span>Loading approval requests…</span>
              </div>
            ) : approvals.length === 0 ? (
              <div className="py-6 text-center text-slate-400 text-xs">
                No approval requests for this incident yet.
              </div>
            ) : (
              <div className="space-y-3">
                {approvals.map((req) => (
                  <div
                    key={req.id}
                    className={`p-3.5 rounded-lg border flex flex-col sm:flex-row sm:items-start justify-between gap-3 ${
                      req.status === 'approved'
                        ? 'bg-emerald-50/50 border-emerald-200'
                        : req.status === 'rejected'
                        ? 'bg-rose-50/50 border-rose-200'
                        : 'bg-amber-50/50 border-amber-200'
                    }`}
                  >
                    {/* Left: request detail */}
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-bold text-slate-900 text-[11px]">{req.id}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase ${
                          req.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : req.status === 'rejected'
                            ? 'bg-rose-100 text-rose-800 border border-rose-300'
                            : 'bg-amber-100 text-amber-800 border border-amber-300'
                        }`}>
                          {req.status}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {new Date(req.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="font-semibold text-slate-900 truncate">{req.item}</p>
                      {req.details && (
                        <p className="text-slate-600 leading-relaxed">{req.details}</p>
                      )}
                      <p className="text-[10px] text-slate-400 font-mono">
                        Requester: {req.requester_id}
                      </p>
                      {req.decided_at && (
                        <p className="text-[10px] text-slate-500 font-mono">
                          Decided: {new Date(req.decided_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          {req.official_id ? ` · by ${req.official_id}` : ''}
                        </p>
                      )}
                    </div>

                    {/* Right: action buttons — only shown while pending */}
                    {req.status === 'pending' && (
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          disabled={decidingId === req.id}
                          onClick={() => handleDecide(req.id, 'approved')}
                          className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold disabled:opacity-50 cursor-pointer transition-colors"
                        >
                          {decidingId === req.id ? '…' : 'Approve'}
                        </button>
                        <button
                          type="button"
                          disabled={decidingId === req.id}
                          onClick={() => handleDecide(req.id, 'rejected')}
                          className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold disabled:opacity-50 cursor-pointer transition-colors"
                        >
                          {decidingId === req.id ? '…' : 'Reject'}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* SECTION 3 — SITUATION OVERVIEW MAP & SECTOR CONCENTRATION */}
      <section>
        <SituationOverviewMap zones={data.zones} />
      </section>

      {/* SECTION 4 — RECENT AGENT OPERATIONAL ACTIONS */}
      <section>
        <AgentActivitySummaryList events={filteredAgentEvents} onSelectEvent={handleSelectAgentEvent} />
      </section>

      {/* REUSABLE INTERACTIVE DETAIL MODAL */}
      <DetailModal
        isOpen={isModalOpen}
        onClose={closeModal}
        data={modalData}
      />
    </div>
  );
}
