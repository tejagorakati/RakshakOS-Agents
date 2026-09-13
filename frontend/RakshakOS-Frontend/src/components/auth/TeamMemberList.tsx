import React from 'react';
import { NgoTeamMember } from '@/lib/types/auth';
import { Trash2, FileText, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface TeamMemberListProps {
  members: NgoTeamMember[];
  onRemoveMember: (id: string) => void;
}

export const TeamMemberList: React.FC<TeamMemberListProps> = ({
  members,
  onRemoveMember,
}) => {
  if (members.length === 0) {
    return (
      <div className="p-6 text-center border border-dashed border-slate-300 rounded-md bg-slate-50 space-y-1 font-sans">
        <Users className="w-8 h-8 mx-auto text-slate-400 mb-2" />
        <span className="text-xs text-slate-700 font-bold block uppercase">No Manual Team Members Added Yet</span>
        <span className="text-xs text-slate-500 font-sans block">
          Use the manual form above to add team members individually, or switch to Excel Bulk Upload.
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-2 font-sans text-xs">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase font-bold text-slate-700 tracking-wider flex items-center gap-2">
          Registered Team Members List
        </span>
        <Badge variant="outline" className="font-sans font-medium text-slate-700 bg-white">
          {members.length} {members.length === 1 ? 'Member' : 'Members'} Added
        </Badge>
      </div>

      <div className="overflow-x-auto rounded-md border border-slate-200 bg-white">
        <table className="w-full text-left border-collapse text-xs font-sans">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 uppercase text-[10px] font-semibold">
              <th className="p-3">#</th>
              <th className="p-3">Full Name</th>
              <th className="p-3">Mobile / Contact</th>
              <th className="p-3">Email</th>
              <th className="p-3">CV Attachment</th>
              <th className="p-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-800">
            {members.map((member, index) => (
              <tr key={member.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-3 text-slate-400 font-mono text-[11px]">{index + 1}</td>
                <td className="p-3 font-semibold text-slate-900">{member.fullName}</td>
                <td className="p-3 text-slate-700 font-mono">{member.mobileNumber}</td>
                <td className="p-3 text-slate-700">{member.email}</td>
                <td className="p-3">
                  {member.cvFileName ? (
                    <span className="inline-flex items-center gap-1 text-[11px] text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
                      <FileText size={12} className="text-slate-600" />
                      {member.cvFileName}
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-400 italic">No CV</span>
                  )}
                </td>
                <td className="p-3 text-right">
                  <button
                    type="button"
                    onClick={() => onRemoveMember(member.id)}
                    className="p-1.5 rounded text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition-colors cursor-pointer"
                    title="Remove member"
                  >
                    <Trash2 size={15} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
