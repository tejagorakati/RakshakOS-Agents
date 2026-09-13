import React from 'react';
import { User, Building2 } from 'lucide-react';
import { VolunteerRoleType } from '@/lib/types/auth';

interface RoleSelectorProps {
  selectedRole: VolunteerRoleType;
  onSelectRole: (role: VolunteerRoleType) => void;
}

export const RoleSelector: React.FC<RoleSelectorProps> = ({ selectedRole, onSelectRole }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <button
        type="button"
        onClick={() => onSelectRole('individual')}
        className={`p-4 rounded-lg border text-left transition-colors cursor-pointer ${
          selectedRole === 'individual'
            ? 'border-slate-900 bg-white ring-1 ring-slate-900/10'
            : 'border-slate-200 bg-white hover:border-slate-300'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-md flex items-center justify-center shrink-0 ${
              selectedRole === 'individual'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-500'
            }`}
          >
            <User size={17} />
          </div>
          <div>
            <p className={`text-sm font-bold ${selectedRole === 'individual' ? 'text-slate-900' : 'text-slate-700'}`}>
              Individual Volunteer
            </p>
            <p className="text-xs text-slate-500 mt-0.5">Respond as an independent field responder.</p>
          </div>
        </div>
      </button>

      <button
        type="button"
        onClick={() => onSelectRole('ngo_coordinator')}
        className={`p-4 rounded-lg border text-left transition-colors cursor-pointer ${
          selectedRole === 'ngo_coordinator'
            ? 'border-slate-900 bg-white ring-1 ring-slate-900/10'
            : 'border-slate-200 bg-white hover:border-slate-300'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-md flex items-center justify-center shrink-0 ${
              selectedRole === 'ngo_coordinator'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-500'
            }`}
          >
            <Building2 size={17} />
          </div>
          <div>
            <p className={`text-sm font-bold ${selectedRole === 'ngo_coordinator' ? 'text-slate-900' : 'text-slate-700'}`}>
              NGO Coordinator
            </p>
            <p className="text-xs text-slate-500 mt-0.5">Register and coordinate an NGO response team.</p>
          </div>
        </div>
      </button>
    </div>
  );
};
