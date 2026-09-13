'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DetailModal, ModalContentData } from '@/components/official/DetailModal';
import {
  mockVolunteerProfile,
  mockVolunteerMission,
  mockSensitivityZones,
  DisasterSensitivityZone,
} from '@/lib/mock/volunteer-operations-data';
import {
  UserCheck,
  Target,
  ArrowRight,
  MapPin,
  CheckCircle2,
  Radio,
  Shield,
  Flame,
} from 'lucide-react';

import { useVolunteerSession } from '@/lib/volunteer-session';
import { User, ShieldAlert } from 'lucide-react';

export default function VolunteerHomePage() {
  const { session, isLoaded, updateSession } = useVolunteerSession();
  const [mission] = useState(mockVolunteerMission);
  const [availabilityNotice, setAvailabilityNotice] = useState<string | null>(null);
  const [selectedZoneModal, setSelectedZoneModal] = useState<DisasterSensitivityZone | null>(null);

  const handleAvailabilityChange = (newStatus: 'AVAILABLE' | 'BUSY' | 'UNAVAILABLE') => {
    updateSession({ availability: newStatus });
    setAvailabilityNotice(`Availability updated to ${newStatus}`);
    setTimeout(() => setAvailabilityNotice(null), 3000);
  };

  const getZoneBadgeVariant = (level: string) => {
    switch (level) {
      case 'CRITICAL':
        return 'critical';
      case 'HIGH':
        return 'warning';
      default:
        return 'success';
    }
  };

  const getZoneModalData = (zone: DisasterSensitivityZone): ModalContentData => ({
    type: 'ZONE',
    title: zone.name,
    subtitle: `Disaster Sensitivity Rating: ${zone.riskLevel}`,
    badgeText: zone.riskLevel,
    badgeVariant: getZoneBadgeVariant(zone.riskLevel) as any,
    description: `Primary Risk: ${zone.primaryRisk}. Measured Water Depth: ${zone.waterDepth}.`,
    fields: [
      { label: 'Zone Name', value: zone.name },
      { label: 'Risk Rating', value: zone.riskLevel, mono: true },
      { label: 'Water Depth Level', value: zone.waterDepth, mono: true },
      { label: 'Active Mission Zone', value: zone.missionActive ? 'YES (MSN-018 Active)' : 'NO', mono: true },
      { label: 'Primary Hazard', value: zone.primaryRisk },
    ],
  });

  if (!isLoaded) {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 text-center font-sans text-xs text-slate-500">
        Loading responder session...
      </div>
    );
  }

  if (!session) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12 font-sans">
        <Card className="p-8 border-slate-200 bg-white shadow-2xs text-center space-y-4 rounded-xl">
          <div className="w-12 h-12 bg-amber-50 border border-amber-200 rounded-full flex items-center justify-center mx-auto text-amber-700 font-bold">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-extrabold text-slate-900">Volunteer Session Required</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              No active volunteer session was found for this browser. Please complete responder onboarding to access the field response dashboard.
            </p>
          </div>
          <div className="pt-2">
            <Link href="/auth/volunteer">
              <Button className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-5 py-2.5 cursor-pointer">
                Complete Volunteer Registration →
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const currentAvailability = session.availability || 'AVAILABLE';

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 md:px-6 py-6 font-sans">
      {/* Top Welcome Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 md:p-6 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-slate-300 text-slate-800 font-semibold bg-slate-50">
              <Shield className="w-3.5 h-3.5 mr-1 text-slate-700 inline" />
              Responder ID: {session.id}
            </Badge>
            <Badge variant="success" className="text-xs font-mono">
              FIELD ACTIVE
            </Badge>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Good morning, {session.fullName}.
          </h1>
          <p className="text-xs md:text-sm text-slate-600 font-sans">
            Ready for your current disaster response assignment in <strong className="text-slate-800">{session.regionLocation}</strong>.
          </p>
        </div>

        {/* Availability Switcher */}
        <div className="space-y-2 self-stretch md:self-auto bg-slate-50 p-3.5 rounded-lg border border-slate-200">
          <div className="flex items-center justify-between gap-3 text-xs font-semibold">
            <span className="text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <UserCheck size={14} className="text-slate-700" /> Availability:
            </span>
            <span className="font-mono text-slate-900 font-bold">{currentAvailability}</span>
          </div>

          <div className="flex items-center gap-1.5 pt-1">
            {(['AVAILABLE', 'BUSY', 'UNAVAILABLE'] as const).map((status) => (
              <button
                key={status}
                onClick={() => handleAvailabilityChange(status)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  currentAvailability === status
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {availabilityNotice && (
            <p className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1 pt-1 animate-in fade-in">
              <CheckCircle2 size={12} /> {availabilityNotice}
            </p>
          )}
        </div>
      </div>

      {/* Current Mission Summary Card */}
      <Card className="p-5 md:p-6 border-slate-200 bg-white shadow-2xs space-y-4 rounded-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              MISSION ID: {mission.id}
            </span>
            <span className="font-mono text-xs font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              INCIDENT: {mission.incidentId}
            </span>
            <Badge variant="critical" className="text-xs uppercase">
              {mission.priority} PRIORITY
            </Badge>
            <Badge variant="warning" className="text-xs uppercase font-mono">
              STATUS: {mission.status}
            </Badge>
          </div>

          <Link href="/volunteer/my-mission">
            <Button size="sm" className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-3.5 h-8 cursor-pointer flex items-center gap-1.5">
              View Mission <ArrowRight size={14} />
            </Button>
          </Link>
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">{mission.incidentTitle}</h2>
          <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed">
            <strong className="text-slate-900 block uppercase text-[10px] tracking-wider mb-0.5">Objective:</strong>
            {mission.objective}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <span className="text-[10px] text-slate-500 font-bold uppercase block">Assigned Team</span>
            <span className="font-bold text-slate-900">{mission.assignedTeam}</span>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <span className="text-[10px] text-slate-500 font-bold uppercase block">Active Route</span>
            <span className="font-semibold text-slate-800 truncate block">{mission.currentRoute}</span>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <span className="text-[10px] text-slate-500 font-bold uppercase block">Location</span>
            <span className="font-semibold text-slate-800 flex items-center gap-1">
              <MapPin size={11} className="text-slate-400" /> {mission.location}
            </span>
          </div>
        </div>
      </Card>

      {/* Relevant Operational Update */}
      <Card className="p-4 border-amber-200 bg-amber-50/70 text-amber-950 shadow-2xs flex items-start gap-3 rounded-xl">
        <Radio className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="space-y-0.5 text-xs flex-1">
          <span className="font-bold text-amber-900 uppercase tracking-wider block">
            Operational Route Advisory ({mission.incidentId}):
          </span>
          <p className="text-amber-900 leading-relaxed font-sans">
            Canal Road R17 reported submerged under 1.4m water. <strong className="text-amber-950 font-semibold">{mission.currentRoute}</strong> is active. All field responders rerouted accordingly.
          </p>
        </div>
        <Link href="/volunteer/my-mission" className="shrink-0">
          <Button variant="outline" size="sm" className="text-xs text-amber-900 border-amber-300 bg-white hover:bg-amber-100 cursor-pointer h-7 px-2">
            Details
          </Button>
        </Link>
      </Card>

      {/* Compact Disaster Sensitivity Visualizer */}
      <Card className="p-5 border-slate-200 bg-white shadow-2xs space-y-4 rounded-xl">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Flame className="w-4 h-4 text-red-600" /> Disaster Area Sensitivity Visualizer
            </h3>
            <p className="text-xs text-slate-500 font-sans">
              Compact zone sensitivity map for Sector 7 field operations
            </p>
          </div>
          <Badge variant="outline" className="text-xs font-mono">
            HYDRO-GRID DATA
          </Badge>
        </div>

        {/* Zones Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {mockSensitivityZones.map((zone) => (
            <div
              key={zone.id}
              onClick={() => setSelectedZoneModal(zone)}
              className={`p-3.5 rounded-lg border transition-all cursor-pointer space-y-2 ${
                zone.missionActive
                  ? 'border-red-300 bg-red-50/40 hover:border-red-400 ring-1 ring-red-200'
                  : 'border-slate-200 bg-slate-50 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">{zone.name}</span>
                <Badge variant={getZoneBadgeVariant(zone.riskLevel) as any} className="text-[10px] uppercase">
                  {zone.riskLevel}
                </Badge>
              </div>

              <div className="text-xs space-y-1">
                <div className="flex justify-between text-slate-600">
                  <span>Water Depth:</span>
                  <span className="font-mono font-bold text-slate-900">{zone.waterDepth}</span>
                </div>
                <div className="text-[11px] text-slate-500 leading-tight">
                  {zone.primaryRisk}
                </div>
              </div>

              {zone.missionActive && (
                <span className="inline-block text-[10px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded uppercase font-mono">
                  Current Mission Sector
                </span>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Zone Detail Modal */}
      {selectedZoneModal && (
        <DetailModal
          isOpen={!!selectedZoneModal}
          onClose={() => setSelectedZoneModal(null)}
          data={getZoneModalData(selectedZoneModal)}
        />
      )}
    </div>
  );
}
