'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useVolunteerSession } from '@/lib/volunteer-session';
import { UserCheck, MapPin, Award, CheckCircle2, User, ShieldAlert } from 'lucide-react';

export default function ProfileAvailabilityPage() {
  const { session, isLoaded, updateSession } = useVolunteerSession();
  const [notice, setNotice] = useState<string | null>(null);

  if (!isLoaded) {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 text-center font-sans text-xs text-slate-500">
        Loading responder profile...
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
              No active volunteer session was found for this browser. Please complete responder onboarding to access the profile & availability manager.
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

  const handleStatusChange = (newStatus: 'AVAILABLE' | 'BUSY' | 'UNAVAILABLE') => {
    updateSession({ availability: newStatus });
    setNotice(`Operational status set to ${newStatus}`);
    setTimeout(() => setNotice(null), 4000);
  };

  const displaySkills = session.skills && session.skills.length > 0
    ? session.skills
    : ['First Aid', 'Emergency Dispatch', 'Field Coordination'];

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 md:px-6 py-6 font-sans">
      {/* Header */}
      <Card className="p-5 md:p-6 border-slate-200 bg-white shadow-2xs space-y-4 rounded-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="border-slate-300 text-slate-800 font-semibold bg-slate-50">
              <User className="w-3.5 h-3.5 mr-1 text-slate-700 inline" />
              ID: {session.id}
            </Badge>
            <Badge variant="success" className="text-xs font-mono uppercase">
              REGISTERED RESPONDER
            </Badge>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-600 font-mono">
            <MapPin size={13} className="text-slate-400" />
            <span>{session.regionLocation}</span>
          </div>
        </div>

        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Volunteer Profile & Availability
          </h1>
          <p className="text-xs md:text-sm text-slate-600 font-sans">
            Registered volunteer responder details and real-time operational availability status.
          </p>
        </div>
      </Card>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Profile Info */}
        <Card className="lg:col-span-2 p-5 md:p-6 border-slate-200 bg-white shadow-2xs space-y-5 rounded-xl">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-blue-600" /> Personal & Qualification Details
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Full Name</span>
              <span className="font-bold text-slate-900 text-sm">{session.fullName}</span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Registered Role</span>
              <span className="font-bold text-slate-900 uppercase font-mono">
                {session.role === 'ngo_coordinator'
                  ? `NGO Coordinator ${session.ngoName ? `(${session.ngoName})` : ''}`
                  : 'Individual Responder'}
              </span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Age / Gender</span>
              <span className="font-semibold text-slate-800">
                {session.age ? `${session.age} years old` : 'Age N/A'}{' '}
                {session.sex ? `(${session.sex})` : ''}
              </span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Mobile Contact</span>
              <span className="font-bold text-slate-900 font-mono">{session.mobileNumber}</span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Email Address</span>
              <span className="font-semibold text-slate-800">{session.email}</span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Primary Sector</span>
              <span className="font-semibold text-slate-800">{session.regionLocation}</span>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Verified Rescue & Technical Skills:
            </span>
            <div className="flex flex-wrap gap-2">
              {displaySkills.map((skill, i) => (
                <span
                  key={i}
                  className="text-xs font-semibold bg-blue-50 text-blue-900 px-3 py-1 rounded-lg border border-blue-200 flex items-center gap-1.5"
                >
                  <Award size={13} className="text-blue-600" /> {skill}
                </span>
              ))}
            </div>
          </div>
        </Card>

        {/* Right Column (1 col): Availability Control */}
        <Card className="p-5 border-slate-200 bg-white shadow-2xs space-y-5 rounded-xl">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-emerald-600" /> Operational Availability
            </h3>
            <p className="text-xs text-slate-500">Toggle your field readiness status</p>
          </div>

          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-center space-y-2">
            <span className="text-xs font-bold text-slate-500 uppercase block tracking-wider">
              Current Status:
            </span>
            <Badge
              variant={
                session.availability === 'AVAILABLE'
                  ? 'success'
                  : session.availability === 'BUSY'
                  ? 'warning'
                  : 'critical'
              }
              className="text-sm font-bold uppercase font-mono px-4 py-1"
            >
              {session.availability}
            </Badge>
          </div>

          {notice && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-lg text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              <span>{notice}</span>
            </div>
          )}

          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Set Readiness State:
            </span>

            {(['AVAILABLE', 'BUSY', 'UNAVAILABLE'] as const).map((status) => (
              <button
                key={status}
                onClick={() => handleStatusChange(status)}
                className={`w-full p-3 rounded-lg text-xs font-bold transition-all cursor-pointer border flex items-center justify-between ${
                  session.availability === status
                    ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span>{status}</span>
                {session.availability === status && <CheckCircle2 size={16} className="text-emerald-400" />}
              </button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

