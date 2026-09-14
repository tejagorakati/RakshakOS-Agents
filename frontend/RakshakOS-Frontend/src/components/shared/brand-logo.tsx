import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface BrandLogoProps {
  role?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  role,
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'text-base gap-1.5',
    md: 'text-lg gap-2',
    lg: 'text-2xl gap-2.5',
  };

  const logoSizes = {
    sm: { width: 32, height: 32 },
    md: { width: 38, height: 38 },
    lg: { width: 48, height: 48 },
  };

  return (
    <Link href="/" className="inline-flex items-center group focus:outline-none">
      <div className="flex items-center justify-center">
        <Image
          src="/rakshak-logo.png"
          alt="RakshakOS"
          width={logoSizes[size].width}
          height={logoSizes[size].height}
          className="object-contain"
          priority
        />
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