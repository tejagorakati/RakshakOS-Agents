import React, { useState } from 'react';
import { IndividualVolunteerRegistration, AuthValidationErrors, AvailabilityStatus, SexCategory } from '@/lib/types/auth';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';
import { CvUpload } from '@/components/auth/CvUpload';

interface IndividualVolunteerFormProps {
  onSubmit: (formData: IndividualVolunteerRegistration, cvDetails?: { name: string; size: number } | null) => void;
  isLoading: boolean;
}

const AVAILABLE_SKILLS = [
  'First Aid / Paramedic',
  'Search & Rescue',
  'Boat Operations',
  'Shelter Management',
  'Debris & Road Clearance',
  'Radio Communications',
  'Logistics & Supply Chain',
  'Firefighting & Hazard Control',
];

const inputBase =
  'w-full bg-white border rounded-md px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 transition-colors';
const inputNormal = 'border-slate-300 focus:border-slate-700 focus:ring-slate-700/10';
const inputError = 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/10';

const sectionLabel = 'text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3 block';
const fieldLabel = 'block text-xs font-semibold text-slate-700 mb-1.5';
const errorMsg = 'mt-1 text-[11px] text-rose-600';

export const IndividualVolunteerForm: React.FC<IndividualVolunteerFormProps> = ({ onSubmit, isLoading }) => {
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState<number | ''>('');
  const [sex, setSex] = useState<SexCategory | ''>('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');
  const [regionLocation, setRegionLocation] = useState('');
  const [skills, setSkills] = useState<string[]>(['First Aid / Paramedic']);
  const [availability, setAvailability] = useState<AvailabilityStatus>('Available');
  const [cvFileName, setCvFileName] = useState<string | null>(null);
  const [cvFileSize, setCvFileSize] = useState<number | null>(null);
  const [errors, setErrors] = useState<AuthValidationErrors>({});

  const validate = (): boolean => {
    const e: AuthValidationErrors = {};
    if (!fullName.trim()) e.fullName = 'Full name is required.';
    if (age === '' || isNaN(Number(age))) e.age = 'Valid age is required.';
    else if (Number(age) < 18 || Number(age) > 99) e.age = 'Age must be 18–99.';
    if (!sex) e.sex = 'Please select sex.';
    if (!mobileNumber.trim()) e.mobileNumber = 'Mobile number is required.';
    else if (mobileNumber.trim().length < 8) e.mobileNumber = 'Must be at least 8 digits.';
    if (!email.trim()) e.email = 'Email is required.';
    else if (!email.includes('@') || !email.includes('.')) e.email = 'Enter a valid email address.';
    if (!regionLocation.trim()) e.regionLocation = 'Region is required.';
    if (skills.length === 0) e.skills = 'Select at least one skill.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleToggleSkill = (skill: string) => {
    setSkills((prev) => (prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const registrationData: IndividualVolunteerRegistration = {
      fullName: fullName.trim(),
      age: Number(age),
      sex: sex as SexCategory,
      mobileNumber: mobileNumber.trim(),
      email: email.trim(),
      regionLocation: regionLocation.trim(),
      skills,
      availability,
    };
    const cvDetails = cvFileName && cvFileSize ? { name: cvFileName, size: cvFileSize } : null;
    onSubmit(registrationData, cvDetails);
  };

  const availabilityColors: Record<AvailabilityStatus, { active: string; idle: string }> = {
    Available: {
      active: 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold',
      idle: 'border-slate-200 bg-white text-slate-600 hover:border-slate-300',
    },
    Busy: {
      active: 'border-amber-500 bg-amber-50 text-amber-900 font-bold',
      idle: 'border-slate-200 bg-white text-slate-600 hover:border-slate-300',
    },
    Unavailable: {
      active: 'border-rose-500 bg-rose-50 text-rose-900 font-bold',
      idle: 'border-slate-200 bg-white text-slate-600 hover:border-slate-300',
    },
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl overflow-hidden">

      {/* ── PERSONAL DETAILS ─────────────────────────────── */}
      <div className="px-6 pt-6 pb-5 border-b border-slate-100">
        <span className={sectionLabel}>Personal Details</span>
        <div className="grid grid-cols-1 sm:grid-cols-6 gap-4">

          {/* Full Name — spans 4 cols */}
          <div className="sm:col-span-4">
            <label className={fieldLabel}>Full Name <span className="text-rose-500">*</span></label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Vikram Malhotra"
              className={`${inputBase} ${errors.fullName ? inputError : inputNormal}`}
            />
            {errors.fullName && <p className={errorMsg}>{errors.fullName}</p>}
          </div>

          {/* Age — spans 2 cols */}
          <div className="sm:col-span-2">
            <label className={fieldLabel}>Age <span className="text-rose-500">*</span></label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="e.g. 26"
              className={`${inputBase} ${errors.age ? inputError : inputNormal}`}
            />
            {errors.age && <p className={errorMsg}>{errors.age}</p>}
          </div>

          {/* Sex — spans 2 cols */}
          <div className="sm:col-span-2">
            <label className={fieldLabel}>Sex <span className="text-rose-500">*</span></label>
            <select
              value={sex}
              onChange={(e) => setSex(e.target.value as SexCategory)}
              className={`${inputBase} ${errors.sex ? inputError : inputNormal}`}
            >
              <option value="">Select…</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
            {errors.sex && <p className={errorMsg}>{errors.sex}</p>}
          </div>

          {/* Mobile — spans 2 cols */}
          <div className="sm:col-span-2">
            <label className={fieldLabel}>Mobile <span className="text-rose-500">*</span></label>
            <input
              type="text"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              placeholder="+91 9876543210"
              className={`${inputBase} font-mono ${errors.mobileNumber ? inputError : inputNormal}`}
            />
            {errors.mobileNumber && <p className={errorMsg}>{errors.mobileNumber}</p>}
          </div>

          {/* Email — spans 2 cols */}
          <div className="sm:col-span-2">
            <label className={fieldLabel}>Email <span className="text-rose-500">*</span></label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vikram@responder.org"
              className={`${inputBase} ${errors.email ? inputError : inputNormal}`}
            />
            {errors.email && <p className={errorMsg}>{errors.email}</p>}
          </div>

          {/* Region — spans full */}
          <div className="sm:col-span-6">
            <label className={fieldLabel}>Region / Operating Location <span className="text-rose-500">*</span></label>
            <input
              type="text"
              value={regionLocation}
              onChange={(e) => setRegionLocation(e.target.value)}
              placeholder="e.g. Sector 4, Flood Relief Zone"
              className={`${inputBase} ${errors.regionLocation ? inputError : inputNormal}`}
            />
            {errors.regionLocation && <p className={errorMsg}>{errors.regionLocation}</p>}
          </div>
        </div>
      </div>

      {/* ── RESPONSE PROFILE ──────────────────────────────── */}
      <div className="px-6 pt-5 pb-5 border-b border-slate-100">
        <span className={sectionLabel}>Response Profile</span>

        {/* Skills */}
        <div className="mb-4">
          <label className={fieldLabel}>Skills <span className="text-rose-500">*</span></label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {AVAILABLE_SKILLS.map((skill) => {
              const selected = skills.includes(skill);
              return (
                <button
                  key={skill}
                  type="button"
                  onClick={() => handleToggleSkill(skill)}
                  className={`px-2.5 py-2 rounded-md border text-xs text-left flex items-center justify-between gap-1 transition-colors cursor-pointer ${
                    selected
                      ? 'bg-slate-900 border-slate-900 text-white'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <span className="truncate leading-snug">{skill}</span>
                  {selected && <CheckCircle2 size={12} className="shrink-0 text-emerald-400" />}
                </button>
              );
            })}
          </div>
          {errors.skills && <p className={errorMsg}>{errors.skills}</p>}
        </div>

        {/* Availability */}
        <div>
          <label className={fieldLabel}>Availability <span className="text-rose-500">*</span></label>
          <div className="grid grid-cols-3 gap-2">
            {(['Available', 'Busy', 'Unavailable'] as AvailabilityStatus[]).map((status) => {
              const isSelected = availability === status;
              return (
                <button
                  key={status}
                  type="button"
                  onClick={() => setAvailability(status)}
                  className={`py-2 px-3 rounded-md border text-xs font-semibold text-center transition-colors cursor-pointer ${
                    isSelected ? availabilityColors[status].active : availabilityColors[status].idle
                  }`}
                >
                  {status}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── CV UPLOAD (optional) ──────────────────────────── */}
      <div className="px-6 pt-5 pb-5 border-b border-slate-100">
        <span className={sectionLabel}>Qualification Document <span className="text-slate-400 normal-case font-normal tracking-normal">— optional</span></span>
        <CvUpload
          label="Upload CV / Paramedic Certificate"
          selectedFileName={cvFileName}
          selectedFileSize={cvFileSize}
          onFileSelect={(fName, fSize) => { setCvFileName(fName); setCvFileSize(fSize); }}
          onFileRemove={() => { setCvFileName(null); setCvFileSize(null); }}
          helperText="Attach CV or certification document (.pdf / .docx, max 10 MB)."
        />
      </div>

      {/* ── SUBMIT ───────────────────────────────────────── */}
      <div className="px-6 py-4 bg-slate-50 flex items-center justify-end">
        <Button
          type="submit"
          disabled={isLoading}
          className="bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold px-6 h-10"
        >
          {isLoading ? 'Submitting…' : 'Complete Registration →'}
        </Button>
      </div>
    </form>
  );
};
