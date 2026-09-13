import React from 'react';
import Link from 'next/link';
import { BrandLogo } from '@/components/shared/brand-logo';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, Shield, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Footer } from '@/components/navigation/footer';

export default function OfficialAuthPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-slate-900 selection:text-white">
      <header className="border-b border-slate-200 bg-white px-4 md:px-8 py-4 shadow-2xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <BrandLogo size="md" />
          <Link href="/">
            <Button variant="outline" size="sm" className="gap-2 text-xs font-sans text-slate-700">
              <ArrowLeft size={14} /> Back to Portal
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto px-4 py-12 flex items-center justify-center w-full">
        <Card className="w-full border-slate-200 bg-white shadow-md">
          <CardHeader className="p-6 space-y-2 border-b border-slate-100 bg-slate-50/50 rounded-t-lg">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="font-sans text-slate-700 bg-white">
                Official Access
              </Badge>
              <span className="text-xs text-slate-500 font-sans">Authorized Personnel</span>
            </div>
            <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Lock size={20} className="text-slate-900" />
              Official Command Center Authentication
            </CardTitle>
            <CardDescription className="text-slate-600 text-xs">
              Secure sign-in portal for Emergency Operations Center (EOC), Police, Fire &amp; Rescue, Medical, and Public Works officials.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6 space-y-6 font-sans text-xs text-slate-700">
            <div className="p-4 rounded-md border border-slate-200 bg-slate-50 space-y-2">
              <div className="font-semibold flex items-center gap-2 text-slate-900">
                <Shield size={16} className="text-slate-800" />
                Government & Agency Authentication Notice
              </div>
              <p className="text-slate-600 text-xs leading-relaxed">
                Official access is restricted to verified agency commanders and EOC directors. Use your agency credentials to sign in.
              </p>
            </div>

            <div className="space-y-3">
              <span className="text-xs font-semibold text-slate-900 block uppercase tracking-wider">
                Supported Agency Roles:
              </span>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
                <li className="p-2.5 rounded-md bg-slate-50 border border-slate-200 flex items-center gap-2 font-medium">
                  <CheckCircle2 size={14} className="text-slate-700 shrink-0" />
                  EOC / Government Director
                </li>
                <li className="p-2.5 rounded-md bg-slate-50 border border-slate-200 flex items-center gap-2 font-medium">
                  <CheckCircle2 size={14} className="text-slate-700 shrink-0" />
                  Police Dispatch Chief
                </li>
                <li className="p-2.5 rounded-md bg-slate-50 border border-slate-200 flex items-center gap-2 font-medium">
                  <CheckCircle2 size={14} className="text-slate-700 shrink-0" />
                  Fire & Rescue Commander
                </li>
                <li className="p-2.5 rounded-md bg-slate-50 border border-slate-200 flex items-center gap-2 font-medium">
                  <CheckCircle2 size={14} className="text-slate-700 shrink-0" />
                  Medical Response Head
                </li>
              </ul>
            </div>
          </CardContent>

          <CardFooter className="p-6 border-t border-slate-100 bg-slate-50/50 rounded-b-lg flex flex-col sm:flex-row justify-between gap-3">
            <Link href="/">
              <Button variant="outline" className="w-full sm:w-auto text-slate-700 border-slate-300">
                Return to Main Portal
              </Button>
            </Link>
            <Link href="/official/command-center">
              <Button className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white font-sans text-xs">
                Proceed to Official Command Center Demo →
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
