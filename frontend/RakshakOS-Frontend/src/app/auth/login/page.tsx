'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BrandLogo } from '@/components/shared/brand-logo';
import { Button } from '@/components/ui/button';
import { ApiError, loginUser } from '@/lib/api';
import { saveVolunteerSession } from '@/lib/volunteer-session';
import { ArrowLeft, ArrowRight, AlertTriangle, Lock, LogIn } from 'lucide-react';
import { Footer } from '@/components/navigation/footer';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await loginUser({ email: email.trim(), password });
      const profile = response.user.profile ?? {};
      const role = response.user.role === 'ngo_coordinator' ? 'ngo_coordinator' : 'individual';

      saveVolunteerSession({
        id: response.user.id,
        role,
        fullName: String(profile.fullName ?? ''),
        age: typeof profile.age === 'number' ? profile.age : undefined,
        sex: typeof profile.sex === 'string' ? profile.sex : undefined,
        mobileNumber: String(profile.mobileNumber ?? ''),
        email: response.user.email,
        regionLocation: String(profile.regionLocation ?? ''),
        skills: Array.isArray(profile.skills) ? profile.skills.map(String) : [],
        availability: profile.availability === 'BUSY' || profile.availability === 'UNAVAILABLE'
          ? profile.availability
          : 'AVAILABLE',
        ngoName: typeof profile.ngoName === 'string' ? profile.ngoName : undefined,
        organizationDetails: typeof profile.organizationDetails === 'string' ? profile.organizationDetails : undefined,
        createdAt: new Date().toISOString(),
      });

      router.push('/volunteer/home');
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
          ? err.message
          : 'Unable to sign in. Please try again.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      <header className="border-b border-slate-200 bg-white px-4 md:px-8 py-3.5">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <BrandLogo size="md" />
          <Link href="/">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs text-slate-600 h-8">
              <ArrowLeft size={13} /> Back
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-md mx-auto px-4 py-12 w-full">
        <div className="mb-6 space-y-1">
          <p className="text-[11px] font-mono font-semibold text-slate-500 uppercase tracking-widest">Responder access</p>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Sign in to RakshakOS</h1>
          <p className="text-sm text-slate-500">Use the email and password you created during registration.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-5">
          {error && (
            <div className="p-3 rounded-lg border border-rose-200 bg-rose-50 text-rose-900 text-xs flex items-start gap-2">
              <AlertTriangle size={15} className="text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label htmlFor="login-email" className="block text-xs font-bold uppercase tracking-wider text-slate-700">Email</label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/15"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="login-password" className="block text-xs font-bold uppercase tracking-wider text-slate-700">Password</label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Your password"
              autoComplete="current-password"
              required
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/15"
            />
          </div>

          <Button type="submit" disabled={isLoading} className="w-full bg-emerald-700 hover:bg-emerald-600 text-white gap-2">
            <LogIn size={15} />
            {isLoading ? 'Signing in…' : 'Sign in'}
          </Button>

          <div className="flex items-center justify-between gap-3 pt-1 text-xs">
            <span className="text-slate-500">No responder profile yet?</span>
            <Link href="/auth/volunteer" className="font-semibold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1">
              Register <ArrowRight size={13} />
            </Link>
          </div>
        </form>

        <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
          <Lock size={12} /> Passwords are verified securely by the backend.
        </div>
      </main>

      <Footer />
    </div>
  );
}
