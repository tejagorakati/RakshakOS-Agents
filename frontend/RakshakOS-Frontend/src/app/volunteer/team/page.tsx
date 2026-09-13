'use client';

import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DetailModal, ModalContentData } from '@/components/official/DetailModal';
import { mockVolunteerMission, MissionTeamMember } from '@/lib/mock/volunteer-operations-data';
import { useVolunteerSession } from '@/lib/volunteer-session';
import { Users, Phone, MapPin } from 'lucide-react';

export default function VolunteerTeamPage() {
  const { session } = useVolunteerSession();
  const [mission] = useState(mockVolunteerMission);
  const [selectedMember, setSelectedMember] = useState<MissionTeamMember | null>(null);

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

  const getMemberModalData = (mem: MissionTeamMember): ModalContentData => ({
    type: 'TEAM',
    title: mem.name,
    subtitle: mem.role,
    badgeText: mem.status,
    badgeVariant: mem.status === 'En Route' ? 'warning' : 'success',
    description: `Assigned to ${mission.assignedTeam} on active rescue operation.`,
    fields: [
      { label: 'Responder Name', value: mem.name },
      { label: 'Assigned Role', value: mem.role },
      { label: 'Mobile Contact', value: mem.contactPhone, mono: true },
      { label: 'Deployment Status', value: mem.status, mono: true },
      { label: 'Specialized Skills', value: mem.skills.join(', ') },
      { label: 'Target Mission', value: mission.id, mono: true },
    ],
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 md:px-6 py-6 font-sans">
      {/* Header Card */}
      <Card className="p-5 md:p-6 border-slate-200 bg-white shadow-2xs space-y-4 rounded-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="border-slate-300 text-slate-800 font-semibold bg-slate-50">
              <Users className="w-3.5 h-3.5 mr-1 text-slate-700 inline" />
              {mission.assignedTeam}
            </Badge>
            <Badge variant="warning" className="text-xs uppercase font-mono">
              STATUS: {mission.status}
            </Badge>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-600 font-mono">
            <MapPin size={13} className="text-slate-400" />
            <span>{mission.location}</span>
          </div>
        </div>

        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Assigned Response Team Roster
          </h1>
          <p className="text-xs md:text-sm text-slate-600 font-sans">
            Registered responders assigned to Mission <strong className="text-slate-800">{mission.id}</strong> ({mission.incidentId}).
          </p>
        </div>
      </Card>

      {/* Member Roster Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {activeTeamMembers.map((mem) => (
          <Card
            key={mem.id}
            onClick={() => setSelectedMember(mem)}
            className="p-5 border-slate-200 bg-white hover:border-slate-300 transition-all shadow-2xs space-y-4 cursor-pointer rounded-xl"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant={mem.status === 'En Route' ? 'warning' : 'success'} className="text-xs font-mono uppercase">
                    {mem.status}
                  </Badge>
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-1">{mem.name}</h3>
                <p className="text-xs text-slate-500 font-medium">{mem.role}</p>
              </div>

              <Button variant="outline" size="sm" className="text-xs text-slate-700 hover:bg-slate-100 cursor-pointer shrink-0">
                Inspect
              </Button>
            </div>

            <div className="space-y-1.5 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-1">
                  <Phone size={11} className="text-slate-400" /> Mobile Line:
                </span>
                <span className="font-mono font-bold text-slate-900">{mem.contactPhone}</span>
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Specialized Skills:
              </span>
              <div className="flex flex-wrap gap-1">
                {mem.skills.map((skill, i) => (
                  <span
                    key={i}
                    className="text-[11px] font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Member Modal */}
      {selectedMember && (
        <DetailModal
          isOpen={!!selectedMember}
          onClose={() => setSelectedMember(null)}
          data={getMemberModalData(selectedMember)}
        />
      )}
    </div>
  );
}

