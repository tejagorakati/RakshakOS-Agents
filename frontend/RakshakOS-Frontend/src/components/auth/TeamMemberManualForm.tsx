import React, { useState } from 'react';
import { NgoTeamMember } from '@/lib/types/auth';
import { UserPlus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CvUpload } from '@/components/auth/CvUpload';

interface TeamMemberManualFormProps {
  onAddMember: (member: NgoTeamMember) => void;
}

export const TeamMemberManualForm: React.FC<TeamMemberManualFormProps> = ({
  onAddMember,
}) => {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [cvFileName, setCvFileName] = useState<string | null>(null);
  const [cvFileSize, setCvFileSize] = useState<number | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const handleAdd = () => {
    setFormError(null);

    if (!name.trim()) {
      setFormError('Member name is required.');
      return;
    }
    if (!mobile.trim()) {
      setFormError('Member contact number is required.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setFormError('Valid member email is required.');
      return;
    }

    const newMember: NgoTeamMember = {
      id: `member-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      fullName: name.trim(),
      mobileNumber: mobile.trim(),
      email: email.trim(),
      cvFileName: cvFileName,
      cvFileSize: cvFileSize,
    };

    onAddMember(newMember);

    // Reset member form
    setName('');
    setMobile('');
    setEmail('');
    setCvFileName(null);
    setCvFileSize(null);
  };

  return (
    <div className="p-4 rounded-md border border-slate-200 bg-slate-50 space-y-4 font-sans text-xs">
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <span className="font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5 text-xs">
          <UserPlus size={15} className="text-slate-700" />
          Add Individual Team Member
        </span>
        <span className="text-[11px] text-slate-500 font-sans">Method A: Manual Entry</span>
      </div>

      {formError && (
        <div className="p-2.5 rounded-md bg-rose-50 border border-rose-200 text-rose-800 text-xs font-sans">
          ⚠️ {formError}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="space-y-1">
          <label className="text-slate-700 uppercase text-[10px] font-semibold">Member Full Name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Priya Sundaram"
            className="w-full bg-white border border-slate-300 rounded-md p-2 text-slate-900 focus:outline-none focus:border-slate-800 text-xs font-sans"
          />
        </div>

        <div className="space-y-1">
          <label className="text-slate-700 uppercase text-[10px] font-semibold">Mobile / Contact *</label>
          <input
            type="text"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            placeholder="+91 9876500011"
            className="w-full bg-white border border-slate-300 rounded-md p-2 text-slate-900 focus:outline-none focus:border-slate-800 text-xs font-sans"
          />
        </div>

        <div className="space-y-1">
          <label className="text-slate-700 uppercase text-[10px] font-semibold">Member Email *</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="priya@ngo.org"
            className="w-full bg-white border border-slate-300 rounded-md p-2 text-slate-900 focus:outline-none focus:border-slate-800 text-xs font-sans"
          />
        </div>
      </div>

      {/* Member CV Upload */}
      <div className="pt-2 border-t border-slate-200">
        <CvUpload
          label="Optional Member CV Upload"
          selectedFileName={cvFileName}
          selectedFileSize={cvFileSize}
          onFileSelect={(fName, fSize) => {
            setCvFileName(fName);
            setCvFileSize(fSize);
          }}
          onFileRemove={() => {
            setCvFileName(null);
            setCvFileSize(null);
          }}
          helperText="Upload member resume/CV for team capability records."
        />
      </div>

      <div className="flex justify-end pt-1">
        <Button type="button" onClick={handleAdd} size="sm" className="bg-slate-900 hover:bg-slate-800 text-white gap-1.5">
          <Plus size={14} />
          Add Member to Team List
        </Button>
      </div>
    </div>
  );
};
