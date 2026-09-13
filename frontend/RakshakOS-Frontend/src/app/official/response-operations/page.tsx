'use client';

import React, { useState } from 'react';
import { PageHeader } from '@/components/official/PageHeader';
import { IncidentListPanel } from '@/components/official/IncidentListPanel';
import { OperationsMapVisualization } from '@/components/official/OperationsMapVisualization';
import { IncidentDetailWorkspace } from '@/components/official/IncidentDetailWorkspace';
import { mockResponseOperations, mockOperationZones } from '@/lib/mock/response-operations-data';
import { ResponseOperationItem } from '@/lib/types/official';
import { ShieldAlert, MapPin, RefreshCw, Users, Activity, ArrowRight } from 'lucide-react';

export default function ResponseOperationsPage() {
  const operations = mockResponseOperations;
  const zones = mockOperationZones;

  // Interactivity State
  const [selectedOperationId, setSelectedOperationId] = useState<string>(operations[0].id);
  const [selectedZoneId, setSelectedZoneId] = useState<string>(operations[0].zoneId);
  const [activeFilter, setActiveFilter] = useState<string>('ALL');

  // Active operation object
  const selectedOperation =
    operations.find((op) => op.id === selectedOperationId) || operations[0];

  // Filtered operations list based on filter bar and active zone selection
  const filteredOperations = operations.filter((op) => {
    if (activeFilter === 'CRITICAL' && op.severity !== 'CRITICAL') return false;
    if (activeFilter === 'WARNING' && op.severity !== 'WARNING') return false;
    if (activeFilter === 'ACTIVE' && op.status !== 'RESPONSE_ACTIVE') return false;
    if (activeFilter === 'MONITORING' && op.status !== 'MONITORING') return false;
    return true;
  });

  const handleSelectOperation = (op: ResponseOperationItem) => {
    setSelectedOperationId(op.id);
    setSelectedZoneId(op.zoneId);
  };

  const handleSelectZone = (zoneId: string) => {
    setSelectedZoneId(zoneId);
    const zoneOp = operations.find((op) => op.zoneId === zoneId);
    if (zoneOp) {
      setSelectedOperationId(zoneOp.id);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 md:px-6 py-6 font-sans">
      {/* Page Header */}
      <PageHeader
        title="Response Operations"
        subtitle="Active disaster response operations, incident management, and versioned rescue plans."
        scenarioName="Metro City Flood Response — Monsoon Emergency"
        regionLocation="North Sector EOC Operations Desk"
        operationStatus="RESPONSE ACTIVE"
        lastUpdated="14:34:00"
      />

      {/* OPERATIONAL WORKFLOW PIPELINE BAR */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 font-mono">
          Operational Response Workflow Pipeline:
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-sans">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 text-white font-bold">
            <ShieldAlert size={14} className="text-amber-400" />
            <span>INCIDENT ({selectedOperation.code})</span>
          </div>

          <ArrowRight size={14} className="text-slate-400 hidden sm:block" />

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-800 font-semibold">
            <MapPin size={14} className="text-slate-600" />
            <span>SITUATION ({selectedOperation.location.split(',')[0]})</span>
          </div>

          <ArrowRight size={14} className="text-slate-400 hidden sm:block" />

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 font-semibold">
            <RefreshCw size={14} className="text-emerald-700" />
            <span>ACTIVE PLAN ({selectedOperation.currentPlanVersion})</span>
          </div>

          <ArrowRight size={14} className="text-slate-400 hidden sm:block" />

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-800 font-semibold">
            <Users size={14} className="text-slate-600" />
            <span>TEAM ({selectedOperation.assignedTeamDetail.teamName})</span>
          </div>

          <ArrowRight size={14} className="text-slate-400 hidden sm:block" />

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 font-bold font-mono">
            <Activity size={14} className="text-blue-600" />
            <span>{selectedOperation.status}</span>
          </div>
        </div>
      </div>

      {/* UNIFIED OPERATIONAL WORKSPACE (3-Area Combined Layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* A. INCIDENTS / OPERATIONS QUEUE LIST */}
        <div className="lg:col-span-4 h-full">
          <IncidentListPanel
            operations={filteredOperations}
            selectedOperationId={selectedOperationId}
            onSelectOperation={handleSelectOperation}
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
          />
        </div>

        {/* B & C. OPERATIONS MAP & SELECTED INCIDENT / PLAN WORKSPACE */}
        <div className="lg:col-span-8 space-y-6">
          {/* Situation Map Visualization */}
          <OperationsMapVisualization
            zones={zones}
            selectedZoneId={selectedZoneId}
            onSelectZone={handleSelectZone}
            selectedOperation={selectedOperation}
          />

          {/* Selected Incident & Response Plan Details Workspace */}
          <IncidentDetailWorkspace operation={selectedOperation} />
        </div>
      </div>
    </div>
  );
}
