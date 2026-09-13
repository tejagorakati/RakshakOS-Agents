'use client';

import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DetailModal, ModalContentData } from '@/components/official/DetailModal';
import { mockVolunteerMission, MissionTeamMember, MissionResourceItem } from '@/lib/mock/volunteer-operations-data';
import { useVolunteerSession } from '@/lib/volunteer-session';
import {
  Target,
  CheckCircle2,
  Navigation,
  Users,
  Box,
  MapPin,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';

export default function MyMissionPage() {
  const { session } = useVolunteerSession();
  const [mission, setMission] = useState(mockVolunteerMission);
  const [selectedMemberModal, setSelectedMemberModal] = useState<MissionTeamMember | null>(null);
  const [selectedResourceModal, setSelectedResourceModal] = useState<MissionResourceItem | null>(null);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  const statusSteps: ('Assigned' | 'Accepted' | 'En Route' | 'Arrived' | 'Completed')[] = [
    'Assigned',
    'Accepted',
    'En Route',
    'Arrived',
    'Completed',
  ];

  const currentStepIndex = statusSteps.indexOf(mission.status);

  const handleAdvanceStatus = () => {
    if (currentStepIndex < statusSteps.length - 1) {
      const nextStatus = statusSteps[currentStepIndex + 1];
      setMission((prev) => ({ ...prev, status: nextStatus }));
      setStatusNotice(`Mission status updated to "${nextStatus}"`);
      setTimeout(() => setStatusNotice(null), 4000);
    }
  };

  const getMemberModalData = (mem: MissionTeamMember): ModalContentData => ({
    type: 'TEAM',
    title: mem.name,
    subtitle: mem.role,
    badgeText: mem.status,
    badgeVariant: mem.status === 'En Route' ? 'warning' : 'success',
    description: `Assigned to ${mission.assignedTeam} for ${mission.incidentId}.`,
    fields: [
      { label: 'Name', value: mem.name },
      { label: 'Role', value: mem.role },
      { label: 'Phone Contact', value: mem.contactPhone, mono: true },
      { label: 'Status', value: mem.status, mono: true },
      { label: 'Skills', value: mem.skills.join(', ') },
    ],
  });

  const getResourceModalData = (res: MissionResourceItem): ModalContentData => ({
    type: 'STAT_FILTER',
    title: res.name,
    subtitle: `Type: ${res.type}`,
    badgeText: res.status,
    badgeVariant: 'success',
    description: res.operationalNote,
    fields: [
      { label: 'Asset ID', value: res.id, mono: true },
      { label: 'Asset Name', value: res.name },
      { label: 'Category', value: res.type },
      { label: 'Allocation Status', value: res.status, mono: true },
      { label: 'Staging Location', value: res.location },
    ],
  });

  const activeTeamMembers = mission.teamMembers.map((mem) => {
    if (mem.name.includes('(You)') || mem.name === 'Arun Kumar (You)') {
      return {
        ...mem,
        name: session?.fullName ? `${session.fullName} (You)` : mem.name,
        contactPhone: session?.mobileNumber || mem.contactPhone,
      };
    }
    return mem;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 md:px-6 py-6 font-sans">
      {/* Mission Header */}
      <Card className="p-5 md:p-6 border-slate-200 bg-white shadow-2xs space-y-4 rounded-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded border border-slate-200">
              MISSION ID: {mission.id}
            </span>
            <span className="font-mono text-xs font-bold text-blue-800 bg-blue-50 px-2.5 py-1 rounded border border-blue-200">
              INCIDENT: {mission.incidentId}
            </span>
            <Badge variant="critical" className="text-xs uppercase">
              {mission.priority} PRIORITY
            </Badge>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-600 font-mono">
            <MapPin size={13} className="text-slate-400" />
            <span>{mission.location}</span>
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
            {mission.incidentTitle}
          </h1>
          <p className="text-xs md:text-sm text-slate-700 bg-slate-50 p-3.5 rounded-lg border border-slate-200 leading-relaxed">
            <strong className="text-slate-900 block uppercase text-[10px] tracking-wider mb-1">Operational Objective:</strong>
            {mission.objective}
          </p>
        </div>
      </Card>

      {/* Interactive Mission Status Tracker */}
      <Card className="p-5 md:p-6 border-slate-200 bg-white shadow-2xs space-y-4 rounded-xl">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Target className="w-4 h-4 text-blue-600" /> Mission Execution Tracker
          </h2>
          <Badge variant="warning" className="text-xs font-mono uppercase">
            STATUS: {mission.status}
          </Badge>
        </div>

        {statusNotice && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-lg text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span>{statusNotice}</span>
          </div>
        )}

        {/* Status Stepper Progress Bar */}
        <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
          {statusSteps.map((step, idx) => {
            const isDone = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;
            return (
              <div
                key={step}
                className={`p-2.5 sm:p-3 rounded-lg border text-center transition-all space-y-1 ${
                  isCurrent
                    ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                    : isDone
                    ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                    : 'bg-slate-50 text-slate-400 border-slate-200'
                }`}
              >
                <span className="text-[10px] font-bold uppercase block tracking-wider font-mono">
                  Step 0{idx + 1}
                </span>
                <span className="text-xs font-bold block truncate">{step}</span>
              </div>
            );
          })}
        </div>

        {/* Action Button to Progress Mission */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <span className="text-xs text-slate-500 font-sans">
            {mission.status === 'Completed'
              ? 'Mission completed. Operational log archived.'
              : 'Progress mission status as field actions are executed.'}
          </span>

          {currentStepIndex < statusSteps.length - 1 && (
            <Button
              onClick={handleAdvanceStatus}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 h-9 cursor-pointer flex items-center gap-1.5 shadow-2xs w-full sm:w-auto justify-center"
            >
              {mission.status === 'Assigned' && 'Accept Mission'}
              {mission.status === 'Accepted' && 'Start Travel (En Route)'}
              {mission.status === 'En Route' && 'Mark Arrived on Site'}
              {mission.status === 'Arrived' && 'Complete Mission'}
              <ArrowRight size={14} />
            </Button>
          )}
        </div>
      </Card>

      {/* 2-Column Grid: Team Roster & Allocated Resources */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assigned Team */}
        <Card className="p-5 border-slate-200 bg-white shadow-2xs space-y-4 rounded-xl">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" /> Assigned Response Team
              </h3>
              <p className="text-xs text-slate-500 font-sans">{mission.assignedTeam}</p>
            </div>
            <Badge variant="outline" className="text-xs font-mono">
              {activeTeamMembers.length} Responders
            </Badge>
          </div>

          <div className="space-y-2.5">
            {activeTeamMembers.map((mem) => (
              <div
                key={mem.id}
                onClick={() => setSelectedMemberModal(mem)}
                className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between gap-2 hover:border-slate-300 transition-all cursor-pointer text-xs"
              >
                <div>
                  <h4 className="font-bold text-slate-900">{mem.name}</h4>
                  <span className="text-[11px] text-slate-500 block">{mem.role}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px] font-mono">
                    {mem.status}
                  </Badge>
                  <Button variant="outline" size="sm" className="text-[10px] h-6 px-2 text-slate-700">
                    Inspect
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Allocated Resources */}
        <Card className="p-5 border-slate-200 bg-white shadow-2xs space-y-4 rounded-xl">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Box className="w-4 h-4 text-amber-600" /> Allocated Field Assets
              </h3>
              <p className="text-xs text-slate-500 font-sans">Assigned to {mission.id}</p>
            </div>
            <Badge variant="success" className="text-xs font-mono">
              {mission.resources.length} Assets
            </Badge>
          </div>

          <div className="space-y-2.5">
            {mission.resources.map((res) => (
              <div
                key={res.id}
                onClick={() => setSelectedResourceModal(res)}
                className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between gap-2 hover:border-slate-300 transition-all cursor-pointer text-xs"
              >
                <div>
                  <h4 className="font-bold text-slate-900">{res.name}</h4>
                  <span className="text-[11px] text-slate-500 block">Staging: {res.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="success" className="text-[10px]">
                    {res.status}
                  </Badge>
                  <Button variant="outline" size="sm" className="text-[10px] h-6 px-2 text-slate-700">
                    Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Active Route Advisory Block */}
      <Card className="p-5 border-slate-200 bg-white shadow-2xs space-y-3 rounded-xl">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Navigation className="w-4 h-4 text-emerald-600" /> Tactical Navigation Route
          </h3>
          <Badge variant="warning" className="text-xs font-mono">
            {mission.routeStatus}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-emerald-50/60 rounded-lg border border-emerald-200 space-y-1">
            <span className="text-[10px] font-bold text-emerald-800 uppercase block">Active Navigation Route:</span>
            <p className="text-emerald-950 font-bold">{mission.currentRoute}</p>
          </div>

          {mission.previousRoute && (
            <div className="p-3 bg-slate-100 rounded-lg border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Previous Impassable Route:</span>
              <p className="text-slate-700 line-through font-mono">{mission.previousRoute}</p>
            </div>
          )}
        </div>
      </Card>

      {/* Plan V1 → V2 Explanation */}
      <Card className="p-5 border-slate-200 bg-white shadow-2xs space-y-4 rounded-xl">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-blue-600" /> Why the Response Plan Changed
          </h3>
          <p className="text-xs text-slate-500 font-sans mt-0.5">
            Understanding Plan V1 and Plan V2 for this mission
          </p>
        </div>

        <div className="space-y-3 text-xs">
          {/* Plan V1 */}
          <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-slate-900 text-xs">Plan V1</span>
              <Badge variant="critical" className="text-[10px] uppercase">No Longer Valid</Badge>
            </div>
            <p className="text-slate-700 leading-relaxed">
              This was the <strong className="text-slate-900">initial response plan</strong> created when the mission was first assigned, based on the situation information available at that time.
            </p>
            {mission.previousRoute && (
              <p className="text-slate-500 text-[11px] italic">
                Original route: <span className="font-mono line-through">{mission.previousRoute}</span>
              </p>
            )}
          </div>

          {/* What changed */}
          <div className="p-3.5 rounded-lg border border-amber-200 bg-amber-50/60 space-y-1.5">
            <span className="text-[10px] font-bold text-amber-800 uppercase block">What changed on the ground:</span>
            <p className="text-amber-950 leading-relaxed">
              A field report confirmed that a key condition used in Plan V1 had changed — the original route was found to be impassable. Because the plan was based on that route being accessible, Plan V1 was no longer valid for the current situation.
            </p>
          </div>

          {/* Plan V2 */}
          <div className="p-3.5 rounded-lg border border-emerald-300 bg-emerald-50/60 space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-slate-900 text-xs">Plan V2</span>
              <Badge variant="success" className="text-[10px] uppercase">Current Plan</Badge>
            </div>
            <p className="text-emerald-950 leading-relaxed">
              This is the <strong className="text-emerald-900">updated response plan</strong>, created to adapt the mission to the new ground situation. It uses a different route and reflects the latest information from the field.
            </p>
            <p className="text-emerald-800 text-[11px] font-semibold">
              Active route: {mission.currentRoute}
            </p>
          </div>
        </div>
      </Card>

      {/* Modals */}
      {selectedMemberModal && (
        <DetailModal
          isOpen={!!selectedMemberModal}
          onClose={() => setSelectedMemberModal(null)}
          data={getMemberModalData(selectedMemberModal)}
        />
      )}

      {selectedResourceModal && (
        <DetailModal
          isOpen={!!selectedResourceModal}
          onClose={() => setSelectedResourceModal(null)}
          data={getResourceModalData(selectedResourceModal)}
        />
      )}
    </div>
  );
}
