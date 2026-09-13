'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BrandLogo } from '@/components/shared/brand-logo';
import {
  Menu,
  X,
  Home,
  Target,
  FileText,
  Users,
  Box,
  MessageSquare,
  UserCheck,
  Building2,
  ChevronDown,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const volunteerPrimaryNav = [
  { label: 'Home', href: '/volunteer/home', icon: Home },
  { label: 'My Mission', href: '/volunteer/my-mission', icon: Target },
  { label: 'Report Situation', href: '/volunteer/report-situation', icon: FileText },
];

const volunteerSecondaryNav = [
  { label: 'Team', href: '/volunteer/team', icon: Users },
  { label: 'Resources', href: '/volunteer/resources', icon: Box },
  { label: 'Communication', href: '/volunteer/communication', icon: MessageSquare },
  { label: 'Profile / Availability', href: '/volunteer/profile-availability', icon: UserCheck },
];

export const VolunteerNavbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const isSecondaryActive =
    volunteerSecondaryNav.some((item) => pathname === item.href) || pathname === '/volunteer/ngo';

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsMoreOpen(false);
      }
    };

    if (isMoreOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMoreOpen]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-14 md:h-16 flex items-center justify-between">
        {/* Brand & Field Operational Context */}
        <div className="flex items-center gap-3">
          <BrandLogo role="Volunteer Response Center" size="md" />
          <div className="hidden lg:flex items-center gap-2 pl-3 border-l border-slate-200">
            <Badge variant="success" className="font-mono text-xs px-2 py-0.5">
              FIELD ACTIVE
            </Badge>
          </div>
        </div>

        {/* Desktop Primary Navigation */}
        <nav className="hidden lg:flex items-center space-x-1">
          {volunteerPrimaryNav.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-sans font-semibold transition-all ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon size={14} className={isActive ? 'text-white' : 'text-slate-500'} />
                <span>{item.label}</span>
              </Link>
            );
          })}

          {/* More Menu Dropdown for Secondary Field Views */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsMoreOpen((prev) => !prev)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-sans font-semibold transition-all cursor-pointer ${
                isSecondaryActive
                  ? 'bg-slate-100 text-slate-900 border border-slate-300'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span>Field Tools</span>
              <ChevronDown size={13} className={`transition-transform ${isMoreOpen ? 'rotate-180' : ''}`} />
            </button>

            {isMoreOpen && (
              <div className="absolute right-0 mt-1 w-56 bg-white border border-slate-200 rounded-xl shadow-lg p-1.5 z-50 space-y-0.5 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Field Operations
                </div>
                {volunteerSecondaryNav.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMoreOpen(false)}
                      className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-sans font-medium transition-colors ${
                        isActive
                          ? 'bg-slate-900 text-white font-semibold'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Icon size={14} className={isActive ? 'text-white' : 'text-slate-500'} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}

                <div className="pt-1.5 border-t border-slate-100 mt-1">
                  <Link
                    href="/volunteer/ngo"
                    onClick={() => setIsMoreOpen(false)}
                    className={`flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-sans font-medium transition-colors ${
                      pathname === '/volunteer/ngo'
                        ? 'bg-sky-50 text-sky-900 font-bold border border-sky-200'
                        : 'text-sky-800 hover:bg-sky-50'
                    }`}
                  >
                    <Building2 size={14} className="text-sky-600" />
                    <span>NGO Coordinator Panel</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Right Actions & Mobile Hamburger Button */}
        <div className="flex items-center gap-3">
          <Link href="/volunteer/my-mission" className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-900 text-[11px] font-bold">
            <Target size={12} className="text-blue-600" />
            <span>MSN-018</span>
          </Link>

          <Link href="/auth/volunteer" className="hidden sm:inline-block">
            <Button variant="outline" size="sm" className="text-xs font-sans text-slate-700 border-slate-300">
              Registration
            </Button>
          </Link>

          {/* Hamburger Menu Toggle for Mobile & Secondary Navigation */}
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className="p-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:text-slate-900 hover:bg-slate-100 focus:outline-none cursor-pointer lg:hidden"
            aria-label="Toggle Navigation Menu"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Hamburger Drawer */}
      {isOpen && (
        <div className="lg:hidden border-b border-slate-200 bg-white px-4 py-4 space-y-4 shadow-lg animate-in slide-in-from-top-2 duration-150">
          <div className="space-y-1">
            <div className="px-2 py-1 text-[10px] font-bold uppercase text-slate-400 tracking-wider">
              Primary Destinations
            </div>
            {volunteerPrimaryNav.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-sans font-semibold transition-colors ${
                    isActive ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Icon size={16} className={isActive ? 'text-white' : 'text-slate-500'} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="space-y-1 pt-2 border-t border-slate-100">
            <div className="px-2 py-1 text-[10px] font-bold uppercase text-slate-400 tracking-wider">
              Secondary Field Views
            </div>
            {volunteerSecondaryNav.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-sans font-medium transition-colors ${
                    isActive ? 'bg-slate-900 text-white font-semibold' : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Icon size={16} className={isActive ? 'text-white' : 'text-slate-500'} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-200 space-y-2">
            <Link
              href="/volunteer/ngo"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center gap-2 w-full text-center text-xs font-sans font-semibold py-2 rounded-lg bg-sky-50 border border-sky-200 text-sky-900 hover:bg-sky-100"
            >
              <Building2 size={14} className="text-sky-600" />
              NGO Coordinator Layer
            </Link>

            <Link
              href="/auth/volunteer"
              onClick={() => setIsOpen(false)}
              className="block w-full text-center text-xs font-sans font-medium py-2 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200"
            >
              Volunteer Authentication Portal
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
