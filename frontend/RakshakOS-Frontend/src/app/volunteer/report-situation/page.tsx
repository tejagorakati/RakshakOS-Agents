'use client';

import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DetailModal, ModalContentData } from '@/components/official/DetailModal';
import { mockFieldReports, FieldSituationReport } from '@/lib/mock/volunteer-operations-data';
import { mockVolunteerMission } from '@/lib/mock/volunteer-operations-data';
import { getVolunteerSession } from '@/lib/volunteer-session';
import { submitFieldReport, ApiError } from '@/lib/api';
import {
  FileText,
  Send,
  CheckCircle2,
  MapPin,
  Clock,
  Paperclip,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';

export default function ReportSituationPage() {
  const [reportsHistory, setReportsHistory] = useState<FieldSituationReport[]>(mockFieldReports);

  // Form State
  const [selectedCategory, setSelectedCategory] = useState<FieldSituationReport['category']>('Road Blocked');
  const [locationInput, setLocationInput] = useState<string>('North Canal Road R17');
  const [descriptionInput, setDescriptionInput] = useState<string>('');
  const [attachmentName, setAttachmentName] = useState<string>('');

  // Submission state — tracks the active incident ID and backend response
  const [incidentId, setIncidentId] = useState<string>(mockVolunteerMission.incidentId);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedNotice, setSubmittedNotice] = useState<{ id: string; planVersion?: number } | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [selectedReportModal, setSelectedReportModal] = useState<FieldSituationReport | null>(null);

  // Approval Request State
  const [approvalItemInput, setApprovalItemInput] = useState<string>('');
  const [approvalDetailsInput, setApprovalDetailsInput] = useState<string>('');
  const [approvalSubmitted, setApprovalSubmitted] = useState<{ id: string; item: string } | null>(null);

  // Resolve the active incident ID from the volunteer session on mount.
  // The session's currentIncidentId is written by the command-center page
  // after a successful POST /process_incident call.
  // Falls back to the mission mock's incidentId when no session exists.
  useEffect(() => {
    const session = getVolunteerSession();
    if (session?.currentIncidentId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIncidentId(session.currentIncidentId);
    }
    // mockVolunteerMission.incidentId is the default already set in useState above
  }, []);

  const categories: FieldSituationReport['category'][] = [
    'New Survivor',
    'Injury',
    'Road Blocked',
    'Resource Shortage',
    'Unsafe Condition',
    'Other',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!descriptionInput.trim() || !locationInput.trim()) return;

    setIsSubmitting(true);
    setSubmitError(null);

    // Optimistic local report entry shown immediately in the history list
    const localId = `RPT-${Date.now().toString().slice(-4)}`;
    const localReport: FieldSituationReport = {
      id: localId,
      category: selectedCategory,
      description: descriptionInput.trim(),
      location: locationInput.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'Under Review',
      attachmentName: attachmentName ? attachmentName : undefined,
    };

    try {
      // POST to the existing backend endpoint.
      // The backend appends the report to the incident, increments plan_version,
      // reruns the full agent pipeline, and returns the updated CommandCenterOverview.
      const response = await submitFieldReport(incidentId, {
        category: selectedCategory,
        location: locationInput.trim(),
        description: descriptionInput.trim(),
        source_type: 'volunteer',
      });

      // Use the backend-assigned ID if available, otherwise keep the local one
      const confirmedId = response.incident_id
        ? `RPT-${response.incident_id.slice(-4)}`
        : localId;

      const confirmedReport: FieldSituationReport = {
        ...localReport,
        id: confirmedId,
        status: 'Under Review',
      };

      setReportsHistory((prev) => [confirmedReport, ...prev]);
      setDescriptionInput('');
      setAttachmentName('');
      setSubmittedNotice({ id: confirmedId, planVersion: response.plan_version });
      setTimeout(() => setSubmittedNotice(null), 6000);
    } catch (err) {
      // API failure — still show the report locally so the volunteer's
      // observation is not silently lost. Surface the error clearly.
      setReportsHistory((prev) => [localReport, ...prev]);
      setDescriptionInput('');
      setAttachmentName('');

      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
          ? err.message
          : 'Report could not reach the backend. It has been saved locally.';
      setSubmitError(message);
      setTimeout(() => setSubmitError(null), 8000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApprovalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!approvalItemInput.trim()) return;
    const requestId = `APR-${Date.now().toString().slice(-4)}`;
    setApprovalSubmitted({ id: requestId, item: approvalItemInput.trim() });
    setApprovalItemInput('');
    setApprovalDetailsInput('');
    setTimeout(() => setApprovalSubmitted(null), 6000);
  };

  const handleSimulateAttachment = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAttachmentName(e.target.files[0].name);
    }
  };

  const getReportModalData = (rpt: FieldSituationReport): ModalContentData => ({
    type: 'ALERT',
    title: `Field Report: ${rpt.id}`,
    subtitle: `Timestamp: ${rpt.timestamp}`,
    badgeText: rpt.status,
    badgeVariant: rpt.status === 'Actioned' ? 'success' : 'warning',
    description: rpt.description,
    fields: [
      { label: 'Report ID', value: rpt.id, mono: true },
      { label: 'Category', value: rpt.category, mono: true },
      { label: 'Location', value: rpt.location },
      { label: 'Submission Status', value: rpt.status, mono: true },
      { label: 'Attachment', value: rpt.attachmentName || 'No Media Attached' },
    ],
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Actioned':
        return <Badge variant="success" className="text-xs uppercase font-mono">Actioned</Badge>;
      case 'Under Review':
        return <Badge variant="warning" className="text-xs uppercase font-mono">Under Review</Badge>;
      default:
        return <Badge variant="info" className="text-xs uppercase font-mono">Received</Badge>;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 md:px-6 py-6 font-sans">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 md:p-6 shadow-2xs space-y-1">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-slate-300 text-slate-800 font-semibold bg-slate-50">
            <FileText className="w-3.5 h-3.5 mr-1 text-slate-700 inline" />
            FIELD TELEMETRY
          </Badge>
          <Badge variant="success" className="text-xs font-mono">
            LIVE DISPATCH LINK
          </Badge>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Report Ground Situation
        </h1>
        <p className="text-xs md:text-sm text-slate-600 font-sans">
          Transmit real-time ground truth reports directly to the operational observation loop.
        </p>
      </div>

      {/* Main 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Submission Form */}
        <Card className="lg:col-span-2 p-5 md:p-6 border-slate-200 bg-white shadow-2xs space-y-5 rounded-xl">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Send className="w-4 h-4 text-blue-600" /> Ground Situation Form
            </h2>
            <p className="text-xs text-slate-500">
              Provide accurate location and observations to assist multi-agent dispatch planning.
            </p>
          </div>

          {submittedNotice && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-950 rounded-lg text-xs font-semibold space-y-1 animate-in fade-in">
              <div className="flex items-center gap-2 text-emerald-900">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                <span className="font-bold text-sm">Report Submitted ({submittedNotice.id})</span>
              </div>
              <p className="text-emerald-900 text-xs pl-6">
                Report received by Command EOC and entered the agent pipeline.
                {submittedNotice.planVersion !== undefined && (
                  <span className="ml-1 font-mono font-bold">
                    Active plan: V{submittedNotice.planVersion}
                  </span>
                )}
              </p>
            </div>
          )}

          {submitError && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-950 rounded-lg text-xs font-semibold space-y-1 animate-in fade-in">
              <div className="flex items-center gap-2 text-rose-900">
                <AlertTriangle size={16} className="text-rose-600 shrink-0" />
                <span className="font-bold text-sm">Backend unreachable — report saved locally</span>
              </div>
              <p className="text-rose-800 text-xs pl-6">{submitError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Category Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Select Report Category *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`p-2.5 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Location Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Location Vector / Landmark *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  placeholder="e.g. Sector 7, North Canal Road R17 near Bridge 2"
                  className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-lg font-sans focus:ring-2 focus:ring-slate-900/20"
                  required
                />
              </div>
            </div>

            {/* Description Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Situation Observation Details *
              </label>
              <textarea
                rows={4}
                value={descriptionInput}
                onChange={(e) => setDescriptionInput(e.target.value)}
                placeholder="Describe ground observations, water depth, hazard extent, or survivor details clearly..."
                className="w-full p-3 text-xs border border-slate-300 rounded-lg font-sans focus:ring-2 focus:ring-slate-900/20 resize-none"
                required
              />
            </div>

            {/* Photo Attachment UI */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Photo / Attachment Media (Optional)
              </label>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 px-3 py-2 bg-slate-100 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-200 cursor-pointer">
                  <Paperclip size={14} /> Attach Photo / Media
                  <input type="file" onChange={handleSimulateAttachment} className="hidden" accept="image/*" />
                </label>
                {attachmentName && (
                  <span className="text-xs font-mono font-semibold text-slate-800 bg-slate-100 px-2.5 py-1 rounded border border-slate-200">
                    Attached: {attachmentName}
                  </span>
                )}
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2.5 cursor-pointer flex items-center justify-center gap-2 shadow-2xs disabled:opacity-60"
            >
              <Send size={14} />
              {isSubmitting ? 'Sending to Command EOC…' : 'Submit Ground Report'}
            </Button>
          </form>
        </Card>

        {/* Right Column (1 col): Reports History Stream */}
        <Card className="p-5 border-slate-200 bg-white shadow-2xs space-y-4 rounded-xl">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900">
              Submitted Reports Log ({reportsHistory.length})
            </h3>
            <p className="text-xs text-slate-500">Recently logged ground observations</p>
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {reportsHistory.map((rpt) => (
              <div
                key={rpt.id}
                onClick={() => setSelectedReportModal(rpt)}
                className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-2 hover:border-slate-300 transition-all cursor-pointer text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {rpt.id}
                  </span>
                  {getStatusBadge(rpt.status)}
                </div>

                <div className="space-y-1">
                  <Badge variant="outline" className="text-[10px] font-mono uppercase">
                    {rpt.category}
                  </Badge>
                  <p className="text-slate-900 font-medium leading-snug line-clamp-2">{rpt.description}</p>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/60 font-mono">
                  <span className="flex items-center gap-1">
                    <MapPin size={10} /> {rpt.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={10} /> {rpt.timestamp}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Report Modal */}
      {selectedReportModal && (
        <DetailModal
          isOpen={!!selectedReportModal}
          onClose={() => setSelectedReportModal(null)}
          data={getReportModalData(selectedReportModal)}
        />
      )}

      {/* Approval Request Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Approval Form (2 cols) */}
        <Card className="lg:col-span-2 p-5 md:p-6 border-slate-200 bg-white shadow-2xs space-y-5 rounded-xl">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-600" /> Approval Request
            </h2>
            <p className="text-xs text-slate-500">
              Request an additional resource or essential item from authorized officials. Use this if you are on-site and need something not yet allocated to your mission.
            </p>
          </div>

          {approvalSubmitted && (
            <div className="p-4 bg-amber-50 border border-amber-200 text-amber-950 rounded-lg text-xs font-semibold space-y-1 animate-in fade-in">
              <div className="flex items-center gap-2 text-amber-900">
                <CheckCircle2 size={16} className="text-amber-600 shrink-0" />
                <span className="font-bold text-sm">Request Submitted ({approvalSubmitted.id})</span>
              </div>
              <p className="text-amber-900 text-xs pl-6">
                Your request for <strong>{approvalSubmitted.item}</strong> has been sent to authorized officials for review.
              </p>
            </div>
          )}

          <form onSubmit={handleApprovalSubmit} className="space-y-4">
            {/* Item Needed */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Resource / Item Needed *
              </label>
              <input
                type="text"
                value={approvalItemInput}
                onChange={(e) => setApprovalItemInput(e.target.value)}
                placeholder="e.g. Medical kit, Drinking water, Emergency supplies"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-sans focus:ring-2 focus:ring-slate-900/20"
                required
              />
            </div>

            {/* Additional Details */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Additional Details (Optional)
              </label>
              <textarea
                rows={3}
                value={approvalDetailsInput}
                onChange={(e) => setApprovalDetailsInput(e.target.value)}
                placeholder="Describe why this resource is needed or the urgency of the situation..."
                className="w-full p-3 text-xs border border-slate-300 rounded-lg font-sans focus:ring-2 focus:ring-slate-900/20 resize-none"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs py-2.5 cursor-pointer flex items-center justify-center gap-2 shadow-2xs"
            >
              <ShieldCheck size={14} /> Ask Approval
            </Button>
          </form>
        </Card>

        {/* Right Column (1 col): What you can request */}
        <Card className="p-5 border-slate-200 bg-white shadow-2xs space-y-4 rounded-xl">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900">
              What can you request?
            </h3>
            <p className="text-xs text-slate-500">Examples of items you can ask approval for</p>
          </div>

          <div className="space-y-2 text-xs">
            {[
              'Medical kit or first aid supplies',
              'Drinking water for survivors',
              'Emergency food rations',
              'Additional rescue equipment',
              'Protective gear or safety equipment',
              'Communication device or radio',
              'Other essential supplies',
            ].map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
              >
                <CheckCircle2 size={13} className="text-amber-500 shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>

          <p className="text-[11px] text-slate-500 leading-relaxed pt-1 border-t border-slate-100">
            Your request will be reviewed by an authorized official. You will be notified once a decision is made.
          </p>
        </Card>
      </div>
    </div>
  );
}
