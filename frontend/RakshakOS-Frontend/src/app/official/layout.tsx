import React from 'react';
import { OfficialNavbar } from '@/components/navigation/official-navbar';
import { Footer } from '@/components/navigation/footer';

export const metadata = {
  title: 'RakshakOS - Official Command Center',
  description: 'Emergency Operations Center Command & Response System',
};

export default function OfficialLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-slate-900 selection:text-white">
      <OfficialNavbar />
      <main className="flex-1 pb-8">{children}</main>
      <Footer />
    </div>
  );
}
