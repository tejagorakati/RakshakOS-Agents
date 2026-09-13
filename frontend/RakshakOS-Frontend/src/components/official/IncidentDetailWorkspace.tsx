'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ResponseOperationItem, PlanHistoryVersion, OperationalChangeEvent } from '@/lib/types/official';
import {
  ShieldAlert,
  Users,
  Route,
  RefreshCw,
  Clock,
  AlertTriangle,
  FileText,
  CheckCircle2,
  ChevronRight,
  Layers,
} from 'lucide-react';

interface IncidentDetailWorkspaceProps {
  operation: ResponseOperationItem;
}

export const IncidentDetailWorkspace: React.FC<IncidentDetailWorkspaceProps> = ({ operation }) => {
  const [selectedPlanVersion, setSelectedPlanVersion] = useState<string>(operation.currentPlanVersion);
  const [activeTab, setActiveTab] = useState<'PLAN' | 'TEAM' | 'CHANGES'>('PLAN');

  // Active or selected plan version object
  const activePlan =
    operation.plans.find((p) => p.version === selectedPlanVersion) || operation.plans[0];

  const getPlanStatusBadgeVariant = (status: PlanHistoryVersion['status']) => {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'INVALIDATED':
        return 'critical';
      case 'SUPERSEDED':
        return 'warning';
      case 'DRAFT':
        return 'outline';
    }
  };

  return (
    <Card className="border-slate-200 bg-white shadow-2xs font-sans space-y-0">
      {/* Workspace Header */}
      <CardHeader className="bg-slate-50/60 p-5 border-b border-slate-100 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-900 text-amber-400">
                {operation.code}
              </span>
              <Badge variant={operation.severity === 'CRITICAL' ? 'critical' : 'warning'}>
                {operation.severity}
              </Badge>
              <Badge variant="outline" className="font-sans text-slate-700 bg-white">
                {operation.status.replace('_', ' ')}
              </Badge>
            </div>
            <h3 className="text-base md:text-lg font-bold text-slate-900 tracking-tight">
              {operation.title}
            </h3>
            <span className="text-xs text-slate-600 font-sans block">{operation.location}</span>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <div className="px-3 py-1.5 rounded-md border border-slate-200 bg-white text-right font-sans text-xs">
              <span className="text-[10px] text-slate-500 font-semibold uppercase block">Active Response Plan</span>
              <span className="font-mono font-bold text-emerald-700">Plan {operation.currentPlanVersion}</span>
            </div>
          </div>
        </div>

        {/* Situation Summary Banner */}
        <div className="p-3 rounded-md bg-white border border-slate-200 text-xs text-slate-800 leading-relaxed font-sans">
          <strong className="text-slate-900 font-semibold block text-[11px] uppercase tracking-wider mb-0.5">
            Operational Situation Summary:
          </strong>
          {operation.situation}
        </div>

        {/* Workspace Tab Switcher */}
        <div className="flex border-b border-slate-200 font-sans pt-1">
          <button
            type="button"
            onClick={() => setActiveTab('PLAN')}
            className={`flex items-center gap-2 px-4 py-2 font-sans text-xs uppercase tracking-wider font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'PLAN'
                ? 'border-slate-900 text-slate-900 bg-white shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <RefreshCw size={14} />
            Response Plan & History ({operation.plans.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('TEAM')}
            className={`flex items-center gap-2 px-4 py-2 font-sans text-xs uppercase tracking-wider font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'TEAM'
                ? 'border-slate-900 text-slate-900 bg-white shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users size={14} />
            Assigned Team & Assets
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('CHANGES')}
            className={`flex items-center gap-2 px-4 py-2 font-sans text-xs uppercase tracking-wider font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'CHANGES'
                ? 'border-slate-900 text-slate-900 bg-white shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <AlertTriangle size={14} />
            Operational Log ({operation.changes.length})
          </button>
        </div>
      </CardHeader>

      <CardContent className="p-5 space-y-6">
        {/* TAB 1: RESPONSE PLAN & HISTORY */}
        {activeTab === 'PLAN' && (
          <div className="space-y-6">
            {/* Version Switcher Bar */}
            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 font-sans font-semibold text-slate-800">
                <Layers size={16} className="text-slate-700" />
                <span>Response Plan Version History:</span>
              </div>

              <div className="flex items-center gap-2">
                {operation.plans.map((plan) => {
                  const isSelected = plan.version === selectedPlanVersion;
                  return (
                    <button
                      key={plan.version}
                      type="button"
                      onClick={() => setSelectedPlanVersion(plan.version)}
                      className={`px-3 py-1.5 rounded-md font-mono text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span>Plan {plan.version}</span>
                      <Badge variant={getPlanStatusBadgeVariant(plan.status)} className="text-[9px] px-1 py-0 font-sans">
                        {plan.status}
                      </Badge>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Plan Details */}
            {activePlan && (
              <div className="space-y-4 font-sans text-xs">
                <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-slate-900">
                        Response Plan {activePlan.version}
                      </span>
                      <Badge variant={getPlanStatusBadgeVariant(activePlan.status)}>
                        {activePlan.status}
                      </Badge>
                    </div>
                    <span className="font-mono text-[11px] text-slate-500 flex items-center gap-1">
                      <Clock size={12} />
                      {activePlan.timestamp}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Plan Objective:</span>
                      <p className="font-bold text-slate-900 text-xs mt-0.5">{activePlan.objective}</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div className="p-2.5 rounded-md bg-white border border-slate-200 space-y-1">
                        <span className="text-[10px] uppercase font-semibold text-slate-500 block">Assigned Responder Team:</span>
                        <span className="font-bold text-slate-900 block">{activePlan.assignedTeam}</span>
                      </div>

                      <div className="p-2.5 rounded-md bg-white border border-slate-200 space-y-1">
                        <span className="text-[10px] uppercase font-semibold text-slate-500 block">Navigation Vector Route:</span>
                        <span className="font-semibold text-slate-900 block">{activePlan.route}</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-md bg-white border border-slate-200 space-y-1">
                      <span className="text-[10px] uppercase font-semibold text-slate-500 block">Plan Trigger Event & Reason:</span>
                      <p className="text-slate-800 text-xs">{activePlan.trigger}</p>
                      <p className="text-slate-600 text-xs italic">{activePlan.changeReason}</p>
                    </div>

                    <div className="p-3 rounded-md bg-slate-900 text-white space-y-1">
                      <span className="text-[10px] uppercase font-semibold text-amber-400 block font-mono">
                        System Execution Trace:
                      </span>
                      <p className="text-xs text-slate-200 font-sans">{activePlan.agentAction}</p>
                    </div>
                  </div>
                </div>

                {/* Plan History Replanning Timeline */}
                <div className="space-y-2 pt-2">
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wide block">
                    Replanning Event Timeline for {operation.code}
                  </span>
                  <div className="space-y-2">
                    {operation.plans.map((p, idx) => (
                      <div
                        key={p.version}
                        className={`p-3 rounded-md border text-xs font-sans flex items-start justify-between gap-3 ${
                          p.status === 'ACTIVE'
                            ? 'bg-emerald-50/50 border-emerald-300 text-emerald-950'
                            : 'bg-slate-50 border-slate-200 text-slate-700'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-slate-900">Plan {p.version}</span>
                            <Badge variant={getPlanStatusBadgeVariant(p.status)} className="text-[10px]">
                              {p.status}
                            </Badge>
                          </div>
                          <p className="text-xs">{p.objective}</p>
                          <span className="text-[11px] text-slate-500 block italic">Reason: {p.changeReason}</span>
                        </div>
                        <span className="font-mono text-[10px] text-slate-500 shrink-0">{p.timestamp}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ASSIGNED TEAM & RESOURCES */}
        {activeTab === 'TEAM' && (
          <div className="space-y-4 font-sans text-xs">
            <div className="p-4 rounded-lg border border-slate-200 bg-slate-50 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div className="flex items-center gap-2">
                  <Users size={18} className="text-slate-800" />
                  <h4 className="font-bold text-slate-900 text-sm">{operation.assignedTeamDetail.teamName}</h4>
                </div>
                <Badge variant="success" className="font-sans">
                  {operation.assignedTeamDetail.status}
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-2.5 rounded-md bg-white border border-slate-200 space-y-0.5">
                  <span className="text-[10px] text-slate-500 font-semibold uppercase">Unit Type</span>
                  <span className="font-bold text-slate-900 block">{operation.assignedTeamDetail.type}</span>
                </div>

                <div className="p-2.5 rounded-md bg-white border border-slate-200 space-y-0.5">
                  <span className="text-[10px] text-slate-500 font-semibold uppercase">Team Leader</span>
                  <span className="font-bold text-slate-900 block">{operation.assignedTeamDetail.leaderName}</span>
                </div>

                <div className="p-2.5 rounded-md bg-white border border-slate-200 space-y-0.5">
                  <span className="text-[10px] text-slate-500 font-semibold uppercase">Active Responders</span>
                  <span className="font-mono font-bold text-slate-900 block">{operation.assignedTeamDetail.membersCount} Members</span>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wide block">
                  Allocated Equipment Assets & Vehicles:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {operation.assignedTeamDetail.assignedEquipment.map((eq, idx) => (
                    <div key={idx} className="p-2.5 rounded-md bg-white border border-slate-200 flex items-center gap-2 text-xs text-slate-800">
                      <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                      <span>{eq}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: OPERATIONAL LOG & CHANGES */}
        {activeTab === 'CHANGES' && (
          <div className="space-y-3 font-sans text-xs">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wide block">
              Recent Operational Events Affecting {operation.code}
            </span>

            {operation.changes.map((chg) => (
              <div key={chg.id} className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="warning" className="font-sans text-[10px]">
                      {chg.changeType.replace('_', ' ')}
                    </Badge>
                    <span className="font-bold text-slate-900">{chg.title}</span>
                  </div>
                  <span className="font-mono text-[10px] text-slate-500">{chg.timestamp}</span>
                </div>

                <p className="text-slate-700 text-xs leading-relaxed">{chg.description}</p>

                <div className="text-[11px] text-slate-500 pt-1 font-mono border-t border-slate-200/60">
                  Affected Response Plan Version: <strong>Plan {chg.affectedPlanVersion}</strong>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
