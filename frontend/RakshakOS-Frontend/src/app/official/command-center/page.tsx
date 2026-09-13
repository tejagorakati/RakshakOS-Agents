'use client';

import React, { useState } from 'react';
import { PageHeader } from '@/components/official/PageHeader';
import { OperationalStatCard } from '@/components/official/OperationalStatCard';
import { SituationOverviewMap } from '@/components/official/SituationOverviewMap';
import { AgentActivitySummaryList } from '@/components/official/AgentActivitySummaryList';
import { HumanAttentionPanel } from '@/components/official/HumanAttentionPanel';
import { ResponseStateCard } from '@/components/official/ResponseStateCard';
import { DetailModal, ModalContentData } from '@/components/official/DetailModal';
import { mockCommandCenterOverview } from '@/lib/mock/command-center-data';
import { OperationalStat, AgentActivitySummaryEvent } from '@/lib/types/official';
import { Filter } from 'lucide-react';

export default function CommandCenterPage() {
  const data = mockCommandCenterOverview;

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
