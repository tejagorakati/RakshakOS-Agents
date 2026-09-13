import React, { useEffect } from 'react';
import { X, ShieldAlert, MapPin, Users, Activity, FileText, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export interface ModalContentData {
  type: 'INCIDENT' | 'ALERT' | 'AGENT_EVENT' | 'ZONE' | 'TEAM' | 'STAT_FILTER';
  title: string;
  subtitle?: string;
  badgeText?: string;
  badgeVariant?: 'default' | 'critical' | 'warning' | 'success' | 'info' | 'outline';
  fields: { label: string; value: string | React.ReactNode; mono?: boolean }[];
  description?: string;
  listItems?: { title: string; detail: string }[];
  actions?: { label: string; onClick: () => void; variant?: 'default' | 'outline' | 'destructive' }[];
}

interface DetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ModalContentData | null;
}

export const DetailModal: React.FC<DetailModalProps> = ({ isOpen, onClose, data }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !data) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-sans animate-in fade-in duration-150">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden z-10 space-y-0">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant={data.badgeVariant || 'default'} className="font-sans text-xs">
                {data.badgeText || data.type}
              </Badge>
              {data.subtitle && (
                <span className="text-xs text-slate-500 font-mono">{data.subtitle}</span>
              )}
            </div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">{data.title}</h3>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-200/60 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto text-xs text-slate-800">
          {data.description && (
            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1 leading-relaxed">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Operational Overview:
              </span>
              <p className="text-slate-800 text-xs font-sans">{data.description}</p>
            </div>
          )}

          {/* Fields Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {data.fields.map((field, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-slate-50/60 border border-slate-200 space-y-0.5">
                <span className="text-[10px] font-semibold uppercase text-slate-500 block">
                  {field.label}
                </span>
                <span className={`text-xs font-semibold text-slate-900 ${field.mono ? 'font-mono' : ''}`}>
                  {field.value}
                </span>
              </div>
            ))}
          </div>

          {/* List Items if any */}
          {data.listItems && data.listItems.length > 0 && (
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase text-slate-500 tracking-wider block">
                Associated Items / Roster:
              </span>
              <div className="space-y-1.5">
                {data.listItems.map((item, idx) => (
                  <div key={idx} className="p-2.5 rounded-md bg-white border border-slate-200 flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-900">{item.title}</span>
                    <span className="text-slate-600 font-mono text-[11px]">{item.detail}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/80 flex items-center justify-end gap-2">
          {data.actions && data.actions.map((act, idx) => (
            <Button key={idx} variant={act.variant || 'default'} size="sm" onClick={act.onClick}>
              {act.label}
            </Button>
          ))}
          <Button variant="outline" size="sm" onClick={onClose} className="text-slate-700">
            Close Details
          </Button>
        </div>
      </div>
    </div>
  );
};
