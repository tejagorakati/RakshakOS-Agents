import React from 'react';
import { Shield } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-slate-200 bg-white py-6 text-slate-600 mt-auto font-sans">
      <div className="max-w-7xl mx-auto px-4 md:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-700">
          <Shield className="w-4 h-4 text-amber-600" />
          <span>
            <strong className="text-slate-900 font-bold">RakshakOS</strong> • Emergency Operations & Response Platform
          </span>
        </div>

        <div className="text-slate-500 font-mono text-[11px] flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>System Status: Operational</span>
        </div>
      </div>
    </footer>
  );
};
