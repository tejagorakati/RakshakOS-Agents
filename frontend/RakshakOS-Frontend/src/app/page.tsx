import React from 'react';
import Link from 'next/link';
import { BrandLogo } from '@/components/shared/brand-logo';
import { Button } from '@/components/ui/button';
import { Shield, Users, ArrowRight, Lock, Building2 } from 'lucide-react';
import { Footer } from '@/components/navigation/footer';

export default function RootPortalPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white px-4 md:px-8 py-3.5">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <BrandLogo size="md" />
          <div className="flex items-center gap-2">
            <Link href="/auth/login">
              <Button variant="outline" size="sm" className="text-xs text-slate-600 h-8 gap-1.5">
                <Lock size={12} /> Responder Sign In
              </Button>
            </Link>
            <Link href="/auth/official">
              <Button variant="outline" size="sm" className="text-xs text-slate-600 h-8 gap-1.5">
                <Lock size={12} /> Official Sign In
              </Button>
            </Link>
            <Link href="/auth/volunteer">
              <Button size="sm" className="bg-slate-900 hover:bg-slate-800 text-white text-xs h-8 gap-1.5">
                <Users size={12} /> Volunteer Register
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto px-4 py-12 md:py-16 w-full">

        {/* Hero */}
        <div className="max-w-2xl mb-12">
          <p className="text-[11px] font-mono font-semibold text-slate-500 uppercase tracking-widest mb-3">
            Disaster Response and Resource Management
          </p>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mb-4">
            <span className="text-slate-900">Rakshak</span><span className="text-amber-600">OS</span>: A Multiagent Platform for Life Saving Action
          </h1>
        </div>

        {/* Entry points */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Official */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col">
            <div className="p-6 flex-1">
              <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center mb-4">
                <Shield size={20} className="text-amber-400" />
              </div>
              <h2 className="text-base font-bold text-slate-900 mb-1">Official Command Center</h2>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">
                For EOC commanders, police, fire & rescue, medical, and public works officials. Recieve access to incident management, agent activity, resource rosters, and human-in-the-loop approvals.
              </p>
              <div className="flex flex-wrap gap-1.5">
                {['EOC / Government', 'Police', 'Fire & Rescue', 'Medical', 'Public Works'].map((role) => (
                  <span
                    key={role}
                    className="text-[11px] px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-600 font-medium"
                  >
                    {role}
                  </span>
                ))}
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50">
              <Link href="/auth/official" className="w-full block">
                <Button className="w-full justify-between bg-slate-900 hover:bg-slate-800 text-white text-xs h-9">
                  <span className="flex items-center gap-1.5">
                    <Lock size={13} /> Official Sign In
                  </span>
                  <ArrowRight size={14} />
                </Button>
              </Link>
            </div>
          </div>

          {/* Volunteer */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col">
            <div className="p-6 flex-1">
              <div className="w-10 h-10 rounded-lg bg-emerald-700 flex items-center justify-center mb-4">
                <Users size={20} className="text-white" />
              </div>
              <h2 className="text-base font-bold text-slate-900 mb-1">Volunteer Response Center</h2>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">
                For individual volunteers and NGO coordinators. Receive assigned missions, submit ground-truth reports, view allocated equipment, and update availability.
              </p>
              <div className="flex flex-wrap gap-1.5">
                <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 font-medium">
                  Individual Responder
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded bg-sky-50 border border-sky-200 text-sky-800 font-medium flex items-center gap-1">
                  <Building2 size={11} /> NGO Coordinator
                </span>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50">
              <Link href="/auth/volunteer" className="w-full block">
                <Button className="w-full justify-between bg-emerald-700 hover:bg-emerald-600 text-white text-xs h-9">
                  <span className="flex items-center gap-1.5">
                    <Users size={13} /> Register
                  </span>
                  <ArrowRight size={14} />
                </Button>
              </Link>
            </div>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
