import React from 'react';
import Link from 'next/link';
import { Shield } from 'lucide-react';

interface BrandLogoProps {
  role?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ role, size = 'md' }) => {
  const sizeClasses = {
    sm: 'text-base gap-1.5',
    md: 'text-lg gap-2',
    lg: 'text-2xl gap-2.5',
  };

  const iconSizes = {
    sm: 18,
    md: 22,
    lg: 28,
  };

  return (
    <Link href="/" className="inline-flex items-center group focus:outline-none">
      <div className="flex items-center justify-center rounded-lg bg-slate-900 text-amber-400 p-1.5 shadow-sm group-hover:bg-slate-800 transition-colors">
        <Shield size={iconSizes[size]} className="stroke-[2.2] fill-amber-400/20" />
      </div>
      <div className={`flex flex-col tracking-tight font-bold ${sizeClasses[size]}`}>
        <div className="flex items-center gap-1.5">
          <span className="text-slate-900 font-extrabold tracking-tight">
            Rakshak<span className="text-amber-600">OS</span>
          </span>
          <span className="text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-600">
            v1.0
          </span>
        </div>
        {role && (
          <span className="text-xs font-sans font-medium text-slate-500 -mt-1">
            {role}
          </span>
        )}
      </div>
    </Link>
  );
};
