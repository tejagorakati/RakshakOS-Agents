'use client';

import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DetailModal, ModalContentData } from '@/components/official/DetailModal';
import { ExcelUpload } from '@/components/auth/ExcelUpload';
import { CvUpload } from '@/components/auth/CvUpload';
import {
  mockNgoData,
  NgoMember,
} from '@/lib/mock/volunteer-operations-data';
import { useVolunteerSession } from '@/lib/volunteer-session';
import {
  Building2,
  Users,
  UserPlus,
  FileSpreadsheet,
  MessageSquare,
  CheckCircle2,
  Send,
  Paperclip,
} from 'lucide-react';

export default function NgoCoordinatorPage() {
  const { session } = useVolunteerSession();
  const [ngoInfo] = useState(mockNgoData);
  const [members, setMembers] = useState<NgoMember[]>(mockNgoData.registeredMembers);
  const [selectedMemberModal, setSelectedMemberModal] = useState<NgoMember | null>(null);

  const coordinatorName = session?.fullName || ngoInfo.coordinatorName;
  const ngoName = session?.ngoName || ngoInfo.ngoName;

  // Manual Add Form State
  const [newName, setNewName] = useState('');
  const [newMobile, setNewMobile] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newSkills, setNewSkills] = useState('');
  const [addNotice, setAddNotice] = useState<string | null>(null);

  // Excel Upload State
  const [excelFileName, setExcelFileName] = useState<string | null>(null);
  const [excelFileSize, setExcelFileSize] = useState<number | null>(null);

  // CV Upload State
  const [cvMemberId, setCvMemberId] = useState<string>(members[0]?.id || '');
  const [cvFileName, setCvFileName] = useState<string | null>(null);
  const [cvFileSize, setCvFileSize] = useState<number | null>(null);
  const [cvNotice, setCvNotice] = useState<string | null>(null);

  // NGO Team Communication State
  const [commTargetId, setCommTargetId] = useState<string>(members[0]?.id || '');
  const [commMessageText, setCommMessageText] = useState('');
  const [ngoMessages, setNgoMessages] = useState<
    { id: string; targetName: string; message: string; timestamp: string }[]
  >([
    {
      id: 'ngo-msg-1',
      targetName: 'Siddharth Rao',
      message: 'Maintain standby at Sector 7 Staging Base for inflatable boat dispatch.',
      timestamp: '14:20',
    },
  ]);

  // Handle Manual Add Member
  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newMobile.trim() || !newEmail.trim()) return;

    const newMember: NgoMember = {
      id: `ngo-mem-${Date.now().toString().slice(-4)}`,
      name: newName.trim(),
      mobile: newMobile.trim(),
      email: newEmail.trim(),
      skills: newSkills
        ? newSkills.split(',').map((s) => s.trim())
        : ['General Rescue Assistant', 'First Aid'],
      availability: 'Available',
      currentMission: 'Unassigned (Standby)',
      cvStatus: 'No CV Attached',
    };

    setMembers([...members, newMember]);
    setNewName('');
    setNewMobile('');
    setNewEmail('');
    setNewSkills('');
    setAddNotice(`Member "${newMember.name}" successfully added to NGO roster.`);
    setTimeout(() => setAddNotice(null), 4000);
  };

  // Handle CV Attachment
  const handleCvSelect = (fileName: string, fileSize: number) => {
    setCvFileName(fileName);
    setCvFileSize(fileSize);
    setMembers((prev) =>
      prev.map((m) => (m.id === cvMemberId ? { ...m, cvStatus: 'CV Attached' } : m))
    );
    const target = members.find((m) => m.id === cvMemberId);
    setCvNotice(`CV document attached for ${target?.name || 'selected member'}.`);
    setTimeout(() => setCvNotice(null), 4000);
  };

  // Handle Send NGO Member Message
  const handleSendNgoMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commMessageText.trim()) return;

    const targetMem = members.find((m) => m.id === commTargetId);
    const newMsg = {
      id: `ngo-msg-${Date.now().toString().slice(-4)}`,
      targetName: targetMem ? targetMem.name : 'All Members',
      message: commMessageText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setNgoMessages([newMsg, ...ngoMessages]);
    setCommMessageText('');
  };

  const getMemberModalData = (mem: NgoMember): ModalContentData => ({
    type: 'TEAM',
    title: mem.name,
    subtitle: `Registered NGO Member | ${ngoInfo.ngoName}`,
    badgeText: mem.availability,
    badgeVariant: mem.availability === 'Available' ? 'success' : 'warning',
    description: `Current Mission: ${mem.currentMission}`,
    fields: [
      { label: 'Member Name', value: mem.name },
      { label: 'Mobile Line', value: mem.mobile, mono: true },
      { label: 'Email Address', value: mem.email },
      { label: 'Availability', value: mem.availability, mono: true },
      { label: 'Current Assignment', value: mem.currentMission },
      { label: 'Qualification CV', value: mem.cvStatus, mono: true },
      { label: 'Skills', value: mem.skills.join(', ') },
    ],
  });

  const availableCount = members.filter((m) => m.availability === 'Available').length;
  const onMissionCount = members.filter((m) => m.currentMission !== 'Unassigned (Standby)').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 md:px-6 py-6 font-sans">
      {/* Header Summary */}
      <Card className="p-5 md:p-6 border-slate-200 bg-white shadow-2xs space-y-4 rounded-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="border-sky-300 text-sky-900 bg-sky-50 font-semibold">
              <Building2 className="w-3.5 h-3.5 mr-1 text-sky-700 inline" />
              {ngoName}
            </Badge>
            <Badge variant="success" className="text-xs font-mono uppercase">
              COORDINATOR LAYER ACTIVE
            </Badge>
          </div>

          <span className="text-xs text-slate-500 font-mono">
            Coordinator: <strong className="text-slate-900">{coordinatorName}</strong>
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-[10px] text-slate-500 font-bold uppercase block">Registered Roster</span>
            <span className="text-xl font-extrabold text-slate-900">{members.length} Members</span>
          </div>

          <div className="p-3 bg-emerald-50/60 rounded-lg border border-emerald-200">
            <span className="text-[10px] text-emerald-800 font-bold uppercase block">Available Standby</span>
            <span className="text-xl font-extrabold text-emerald-900">{availableCount} Responders</span>
          </div>

          <div className="p-3 bg-sky-50/60 rounded-lg border border-sky-200">
            <span className="text-[10px] text-sky-800 font-bold uppercase block">Deployed on Mission</span>
            <span className="text-xl font-extrabold text-sky-900">{onMissionCount} Active</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-[10px] text-slate-500 font-bold uppercase block">CV Verification</span>
            <span className="text-xl font-extrabold text-slate-900">
              {members.filter((m) => m.cvStatus === 'CV Attached').length} Attached
            </span>
          </div>
        </div>
      </Card>

      {/* Roster & Detail Section */}
      <Card className="p-5 md:p-6 border-slate-200 bg-white shadow-2xs space-y-4 rounded-xl">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-sky-600" /> NGO Team Roster
            </h2>
            <p className="text-xs text-slate-500 font-sans">
              Manage team members, view availability, and inspect qualification CVs.
            </p>
          </div>
          <Badge variant="outline" className="text-xs font-mono">
            ROSTER COUNT: {members.length}
          </Badge>
        </div>

        {/* Member Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {members.map((mem) => (
            <div
              key={mem.id}
              onClick={() => setSelectedMemberModal(mem)}
              className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3 hover:border-slate-300 transition-all cursor-pointer text-xs"
            >
              <div className="flex items-center justify-between">
                <Badge
                  variant={mem.availability === 'Available' ? 'success' : 'warning'}
                  className="text-[10px] uppercase font-mono"
                >
                  {mem.availability}
                </Badge>
                <span className="text-[10px] font-mono text-slate-500">{mem.cvStatus}</span>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 text-sm">{mem.name}</h3>
                <span className="text-slate-500 block text-[11px]">{mem.email}</span>
              </div>

              <div className="p-2 bg-white rounded border border-slate-200 text-[11px]">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Current Mission:</span>
                <span className="font-semibold text-slate-800 truncate block">{mem.currentMission}</span>
              </div>

              <div className="flex flex-wrap gap-1">
                {mem.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* 2-Column Grid: Manual Add & Excel Batch Upload */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Manual Member Entry */}
        <Card className="p-5 border-slate-200 bg-white shadow-2xs space-y-4 rounded-xl">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-sky-600" /> Manual Member Entry
            </h3>
            <p className="text-xs text-slate-500">Register an individual member into your NGO roster</p>
          </div>

          {addNotice && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-lg text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              <span>{addNotice}</span>
            </div>
          )}

          <form onSubmit={handleAddMember} className="space-y-3 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 uppercase text-[10px]">Member Full Name *</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Ramesh Chandra"
                className="w-full p-2 border border-slate-300 rounded-lg font-sans focus:ring-2 focus:ring-slate-900/20"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase text-[10px]">Mobile Contact *</label>
                <input
                  type="text"
                  value={newMobile}
                  onChange={(e) => setNewMobile(e.target.value)}
                  placeholder="+91 98765-XXXXX"
                  className="w-full p-2 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-slate-900/20"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase text-[10px]">Email Address *</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="name@civilnet.org"
                  className="w-full p-2 border border-slate-300 rounded-lg font-sans focus:ring-2 focus:ring-slate-900/20"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 uppercase text-[10px]">Skills (comma-separated)</label>
              <input
                type="text"
                value={newSkills}
                onChange={(e) => setNewSkills(e.target.value)}
                placeholder="First Aid, Water Rescue, Logistics"
                className="w-full p-2 border border-slate-300 rounded-lg font-sans focus:ring-2 focus:ring-slate-900/20"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2.5 cursor-pointer flex items-center justify-center gap-2 shadow-2xs"
            >
              <UserPlus size={14} /> Add Member to Roster
            </Button>
          </form>
        </Card>

        {/* Excel Batch Roster Upload */}
        <Card className="p-5 border-slate-200 bg-white shadow-2xs space-y-4 rounded-xl">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Excel Batch Roster Upload
            </h3>
            <p className="text-xs text-slate-500">Batch import registered NGO team members via spreadsheet</p>
          </div>

          <ExcelUpload
            selectedFileName={excelFileName}
            selectedFileSize={excelFileSize}
            onFileSelect={(name, size) => {
              setExcelFileName(name);
              setExcelFileSize(size);
            }}
            onFileRemove={() => {
              setExcelFileName(null);
              setExcelFileSize(null);
            }}
          />
        </Card>
      </div>

      {/* 2-Column Grid: CV Attachment & Member Communications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CV Attachment Component */}
        <Card className="p-5 border-slate-200 bg-white shadow-2xs space-y-4 rounded-xl">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Paperclip className="w-4 h-4 text-sky-600" /> Member CV Attachment
            </h3>
            <p className="text-xs text-slate-500">Attach qualification documents to member profiles</p>
          </div>

          {cvNotice && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-lg text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              <span>{cvNotice}</span>
            </div>
          )}

          <div className="space-y-3 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 uppercase text-[10px]">Select Target Member *</label>
              <select
                value={cvMemberId}
                onChange={(e) => setCvMemberId(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg bg-slate-50 font-sans"
              >
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.cvStatus})
                  </option>
                ))}
              </select>
            </div>

            <CvUpload
              selectedFileName={cvFileName}
              selectedFileSize={cvFileSize}
              onFileSelect={handleCvSelect}
              onFileRemove={() => {
                setCvFileName(null);
                setCvFileSize(null);
              }}
            />
          </div>
        </Card>

        {/* NGO Team Member Communication */}
        <Card className="p-5 border-slate-200 bg-white shadow-2xs space-y-4 rounded-xl">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-purple-600" /> NGO Team Direct Messaging
            </h3>
            <p className="text-xs text-slate-500">Communicate directly with registered members of your NGO</p>
          </div>

          <form onSubmit={handleSendNgoMessage} className="space-y-3 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 uppercase text-[10px]">Select NGO Member *</label>
              <select
                value={commTargetId}
                onChange={(e) => setCommTargetId(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg bg-slate-50 font-sans"
              >
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} — {m.currentMission}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 uppercase text-[10px]">Directive Message *</label>
              <textarea
                rows={2}
                value={commMessageText}
                onChange={(e) => setCommMessageText(e.target.value)}
                placeholder="Type instructions or check-in request for member..."
                className="w-full p-2 border border-slate-300 rounded-lg font-sans focus:ring-2 focus:ring-slate-900/20 resize-none"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2.5 cursor-pointer flex items-center justify-center gap-2 shadow-2xs"
            >
              <Send size={14} /> Send NGO Member Message
            </Button>
          </form>

          {/* NGO Message Stream */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Recent NGO Messages ({ngoMessages.length}):
            </span>
            <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
              {ngoMessages.map((msg) => (
                <div key={msg.id} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
                  <div className="flex justify-between font-mono text-[10px] text-slate-500">
                    <span className="font-bold text-slate-900">To: {msg.targetName}</span>
                    <span>{msg.timestamp}</span>
                  </div>
                  <p className="text-slate-800 font-medium">{msg.message}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Member Modal */}
      {selectedMemberModal && (
        <DetailModal
          isOpen={!!selectedMemberModal}
          onClose={() => setSelectedMemberModal(null)}
          data={getMemberModalData(selectedMemberModal)}
        />
      )}
    </div>
  );
}
