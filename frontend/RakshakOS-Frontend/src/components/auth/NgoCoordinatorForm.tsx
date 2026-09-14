import React, { useState } from 'react';
import { NgoCoordinatorRegistration, NgoTeamMember, AuthValidationErrors } from '@/lib/types/auth';
import { Button } from '@/components/ui/button';
import { FileSpreadsheet, UserPlus, CheckCircle2 } from 'lucide-react';
import { CvUpload } from '@/components/auth/CvUpload';
import { ExcelUpload } from '@/components/auth/ExcelUpload';
import { TeamMemberManualForm } from '@/components/auth/TeamMemberManualForm';
import { TeamMemberList } from '@/components/auth/TeamMemberList';

interface NgoCoordinatorFormProps {
  onSubmit: (formData: NgoCoordinatorRegistration) => void;
  isLoading: boolean;
}

const inputBase =
  'w-full bg-white border rounded-md px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 transition-colors';
const inputNormal = 'border-slate-300 focus:border-slate-700 focus:ring-slate-700/10';
const inputError = 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/10';

const sectionLabel = 'text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3 block';
const fieldLabel = 'block text-xs font-semibold text-slate-700 mb-1.5';
const errorMsg = 'mt-1 text-[11px] text-rose-600';

export const NgoCoordinatorForm: React.FC<NgoCoordinatorFormProps> = ({ onSubmit, isLoading }) => {
  const [coordinatorName, setCoordinatorName] = useState('');
  const [coordinatorMobile, setCoordinatorMobile] = useState('');
  const [coordinatorEmail, setCoordinatorEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [regionLocation, setRegionLocation] = useState('');
  const [ngoName, setNgoName] = useState('');
  const [organizationDetails, setOrganizationDetails] = useState('');

  const [leaderCvFileName, setLeaderCvFileName] = useState<string | null>(null);
  const [leaderCvFileSize, setLeaderCvFileSize] = useState<number | null>(null);

  const [registrationMethod, setRegistrationMethod] = useState<'manual' | 'excel' | 'hybrid'>('manual');
  const [teamMembers, setTeamMembers] = useState<NgoTeamMember[]>([]);
  const [excelFileName, setExcelFileName] = useState<string | null>(null);
  const [excelFileSize, setExcelFileSize] = useState<number | null>(null);

  const [errors, setErrors] = useState<AuthValidationErrors>({});

  const handleAddManualMember = (newMember: NgoTeamMember) => {
    setTeamMembers((prev) => [...prev, newMember]);
  };

  const handleRemoveManualMember = (id: string) => {
    setTeamMembers((prev) => prev.filter((m) => m.id !== id));
  };

  const validate = (): boolean => {
    const e: AuthValidationErrors = {};
    if (!coordinatorName.trim()) e.coordinatorName = 'Coordinator name is required.';
    if (!coordinatorMobile.trim()) e.coordinatorMobile = 'Contact number is required.';
    else if (coordinatorMobile.trim().length < 8) e.coordinatorMobile = 'Must be at least 8 digits.';
    if (!coordinatorEmail.trim()) e.coordinatorEmail = 'Email is required.';
    else if (!coordinatorEmail.includes('@') || !coordinatorEmail.includes('.')) e.coordinatorEmail = 'Enter a valid email address.';
    if (password.length < 8) e.password = 'Password must be at least 8 characters.';
    if (password !== passwordConfirmation) e.passwordConfirmation = 'Passwords do not match.';
    if (!regionLocation.trim()) e.regionLocation = 'Region is required.';
    if (!ngoName.trim()) e.ngoName = 'NGO name is required.';
    if (teamMembers.length === 0 && !excelFileName) e.teamMembers = 'Add team members manually or upload an Excel file.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    let computedMethod: 'manual' | 'excel' | 'hybrid' = registrationMethod;
    if (teamMembers.length > 0 && excelFileName) computedMethod = 'hybrid';
    else if (excelFileName) computedMethod = 'excel';
    else computedMethod = 'manual';

    const registrationPayload: NgoCoordinatorRegistration = {
      coordinatorFullName: coordinatorName.trim(),
      coordinatorMobile: coordinatorMobile.trim(),
      coordinatorEmail: coordinatorEmail.trim(),
      password,
      regionLocation: regionLocation.trim(),
      ngoName: ngoName.trim(),
      organizationDetails: organizationDetails.trim(),
      coordinatorCvFileName: leaderCvFileName,
      registrationMethod: computedMethod,
      teamMembers,
      excelFileName,
      excelFileSize,
    };

    onSubmit(registrationPayload);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl overflow-hidden">

      {/* ── COORDINATOR DETAILS ───────────────────────────── */}
      <div className="px-6 pt-6 pb-5 border-b border-slate-100">
        <span className={sectionLabel}>Coordinator Details</span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          <div>
            <label className={fieldLabel}>Full Name <span className="text-rose-500">*</span></label>
            <input
              type="text"
              value={coordinatorName}
              onChange={(e) => setCoordinatorName(e.target.value)}
              placeholder="e.g. Anil Kumar"
              className={`${inputBase} ${errors.coordinatorName ? inputError : inputNormal}`}
            />
            {errors.coordinatorName && <p className={errorMsg}>{errors.coordinatorName}</p>}
          </div>

          <div>
            <label className={fieldLabel}>Mobile <span className="text-rose-500">*</span></label>
            <input
              type="text"
              value={coordinatorMobile}
              onChange={(e) => setCoordinatorMobile(e.target.value)}
              placeholder="+91 9988776655"
              className={`${inputBase} font-mono ${errors.coordinatorMobile ? inputError : inputNormal}`}
            />
            {errors.coordinatorMobile && <p className={errorMsg}>{errors.coordinatorMobile}</p>}
          </div>

          <div>
            <label className={fieldLabel}>Email <span className="text-rose-500">*</span></label>
            <input
              type="email"
              value={coordinatorEmail}
              onChange={(e) => setCoordinatorEmail(e.target.value)}
              placeholder="coordinator@reliefngo.org"
              className={`${inputBase} ${errors.coordinatorEmail ? inputError : inputNormal}`}
            />
            {errors.coordinatorEmail && <p className={errorMsg}>{errors.coordinatorEmail}</p>}
          </div>

          <div>
            <label className={fieldLabel}>Region / Operating Area <span className="text-rose-500">*</span></label>
            <input
              type="text"
              value={regionLocation}
              onChange={(e) => setRegionLocation(e.target.value)}
              placeholder="e.g. North Zone, District 2"
              className={`${inputBase} ${errors.regionLocation ? inputError : inputNormal}`}
            />
            {errors.regionLocation && <p className={errorMsg}>{errors.regionLocation}</p>}
          </div>

          <div>
            <label className={fieldLabel}>Password <span className="text-rose-500">*</span></label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              className={`${inputBase} ${errors.password ? inputError : inputNormal}`}
              autoComplete="new-password"
            />
            {errors.password && <p className={errorMsg}>{errors.password}</p>}
          </div>

          <div>
            <label className={fieldLabel}>Confirm Password <span className="text-rose-500">*</span></label>
            <input
              type="password"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              placeholder="Re-enter your password"
              className={`${inputBase} ${errors.passwordConfirmation ? inputError : inputNormal}`}
              autoComplete="new-password"
            />
            {errors.passwordConfirmation && <p className={errorMsg}>{errors.passwordConfirmation}</p>}
          </div>
        </div>
      </div>

      {/* ── ORGANIZATION ──────────────────────────────────── */}
      <div className="px-6 pt-5 pb-5 border-b border-slate-100">
        <span className={sectionLabel}>Organization</span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          <div>
            <label className={fieldLabel}>NGO Name <span className="text-rose-500">*</span></label>
            <input
              type="text"
              value={ngoName}
              onChange={(e) => setNgoName(e.target.value)}
              placeholder="e.g. Disaster Relief Action NGO"
              className={`${inputBase} ${errors.ngoName ? inputError : inputNormal}`}
            />
            {errors.ngoName && <p className={errorMsg}>{errors.ngoName}</p>}
          </div>

          <div>
            <label className={fieldLabel}>Organization Details <span className="text-slate-400 font-normal">— optional</span></label>
            <input
              type="text"
              value={organizationDetails}
              onChange={(e) => setOrganizationDetails(e.target.value)}
              placeholder="e.g. Registered under MHA, Est. 2012"
              className={`${inputBase} ${inputNormal}`}
            />
          </div>
        </div>

        <div className="mt-4">
          <CvUpload
            label="Coordinator CV / Organization Charter — optional"
            selectedFileName={leaderCvFileName}
            selectedFileSize={leaderCvFileSize}
            onFileSelect={(fName, fSize) => { setLeaderCvFileName(fName); setLeaderCvFileSize(fSize); }}
            onFileRemove={() => { setLeaderCvFileName(null); setLeaderCvFileSize(null); }}
            helperText="Upload coordinator credential or NGO registration document (.pdf / .docx)."
          />
        </div>
      </div>

      {/* ── TEAM MEMBERS ──────────────────────────────────── */}
      <div className="px-6 pt-5 pb-5 border-b border-slate-100">
        <div className="flex items-center justify-between mb-3">
          <span className={sectionLabel + ' mb-0'}>Team Members</span>
          {(teamMembers.length > 0 || excelFileName) && (
            <span className="text-[11px] text-slate-500 font-mono">
              {teamMembers.length} manual
              {excelFileName ? ' + 1 Excel file' : ''}
            </span>
          )}
        </div>

        {errors.teamMembers && (
          <div className="mb-4 p-3 rounded-md bg-rose-50 border border-rose-200 text-rose-800 text-xs">
            {errors.teamMembers}
          </div>
        )}

        {/* Method tabs */}
        <div className="flex border-b border-slate-200 mb-4">
          <button
            type="button"
            onClick={() => setRegistrationMethod('manual')}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              registrationMethod === 'manual'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <UserPlus size={13} />
            Manual Entry
            {teamMembers.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-slate-900 text-white text-[10px] font-bold leading-none">
                {teamMembers.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setRegistrationMethod('excel')}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              registrationMethod === 'excel'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <FileSpreadsheet size={13} />
            Excel Upload
            {excelFileName && (
              <CheckCircle2 size={12} className="text-emerald-600 ml-1" />
            )}
          </button>
        </div>

        {/* Method A: Manual */}
        {registrationMethod === 'manual' && (
          <div className="space-y-4">
            <TeamMemberManualForm onAddMember={handleAddManualMember} />
            <TeamMemberList members={teamMembers} onRemoveMember={handleRemoveManualMember} />
          </div>
        )}

        {/* Method B: Excel */}
        {registrationMethod === 'excel' && (
          <ExcelUpload
            selectedFileName={excelFileName}
            selectedFileSize={excelFileSize}
            onFileSelect={(fName, fSize) => { setExcelFileName(fName); setExcelFileSize(fSize); }}
            onFileRemove={() => { setExcelFileName(null); setExcelFileSize(null); }}
          />
        )}
      </div>

      {/* ── SUBMIT ───────────────────────────────────────── */}
      <div className="px-6 py-4 bg-slate-50 flex items-center justify-between gap-4">
        <p className="text-xs text-slate-500">
          Registering coordinator for <span className="font-semibold text-slate-700">{ngoName || '—'}</span>
        </p>
        <Button
          type="submit"
          disabled={isLoading}
          className="bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold px-6 h-10 shrink-0"
        >
          {isLoading ? 'Submitting…' : 'Register NGO Coordinator →'}
        </Button>
      </div>
    </form>
  );
};
