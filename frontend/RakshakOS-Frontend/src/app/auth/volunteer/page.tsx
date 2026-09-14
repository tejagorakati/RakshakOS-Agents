'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BrandLogo } from '@/components/shared/brand-logo';
import { RoleSelector } from '@/components/auth/RoleSelector';
import { IndividualVolunteerForm } from '@/components/auth/IndividualVolunteerForm';
import { NgoCoordinatorForm } from '@/components/auth/NgoCoordinatorForm';
import { VolunteerRoleType, IndividualVolunteerRegistration, NgoCoordinatorRegistration } from '@/lib/types/auth';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, CheckCircle2, RefreshCw, AlertTriangle } from 'lucide-react';
import { Footer } from '@/components/navigation/footer';

import {
  getVolunteerSession,
  saveVolunteerSession,
  VolunteerSessionData,
} from '@/lib/volunteer-session';
import { registerUser, loginUser, addNgoMember, ApiError } from '@/lib/api';

export default function VolunteerAuthPage() {
  const router = useRouter();
  useEffect(() => {
  const existingSession = getVolunteerSession();

  if (existingSession) {
    router.replace('/volunteer/home');
  }
}, [router]);
  const [selectedRole, setSelectedRole] = useState<VolunteerRoleType>('individual');
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [accountCredentials, setAccountCredentials] = useState<{ email: string; password: string } | null>(null);
  const [submittedData, setSubmittedData] = useState<{
    role: VolunteerRoleType;
    data: IndividualVolunteerRegistration | NgoCoordinatorRegistration;
    cvDetails?: { name: string; size: number } | null;
    timestamp: string;
  } | null>(null);

  const handleIndividualSubmit = async (
    formData: IndividualVolunteerRegistration,
    cvDetails?: { name: string; size: number } | null
  ) => {
    setIsLoading(true);
    setApiError(null);

    try {
      // Build the profile blob matching what the backend stores in profile_json
      const profile: Record<string, unknown> = {
        fullName: formData.fullName,
        age: formData.age !== '' ? formData.age : undefined,
        sex: formData.sex !== '' ? formData.sex : undefined,
        mobileNumber: formData.mobileNumber,
        regionLocation: formData.regionLocation,
        skills: formData.skills,
        availability: formData.availability.toUpperCase(),
      };

      let userId: string;

      try {
        const password = formData.password;
        const result = await registerUser({
          role: 'individual',
          email: formData.email,
          password,
          profile,
        });
        userId = result.user.id;
      } catch (err) {
        if (err instanceof ApiError && err.status === 409) {
          // Account already exists — log them in to retrieve the real ID
          const password = formData.password;
          const loginResult = await loginUser({ email: formData.email, password });
          userId = loginResult.user.id;
        } else {
          throw err;
        }
      }

      const sessionData: VolunteerSessionData = {
        id: userId,
        role: 'individual',
        fullName: formData.fullName,
        age: formData.age !== '' ? formData.age : undefined,
        sex: formData.sex !== '' ? formData.sex : undefined,
        mobileNumber: formData.mobileNumber,
        email: formData.email,
        regionLocation: formData.regionLocation,
        skills: formData.skills,
        availability: (formData.availability.toUpperCase() as 'AVAILABLE' | 'BUSY' | 'UNAVAILABLE') || 'AVAILABLE',
        createdAt: new Date().toISOString(),
      };
      saveVolunteerSession(sessionData);
      setAccountCredentials({ email: formData.email, password: formData.password });

      setSubmittedData({
        role: 'individual',
        data: formData,
        cvDetails: cvDetails,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
          ? err.message
          : 'Registration failed. Please check your connection and try again.';
      setApiError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNgoSubmit = async (formData: NgoCoordinatorRegistration) => {
    setIsLoading(true);
    setApiError(null);

    try {
      const profile: Record<string, unknown> = {
        fullName: formData.coordinatorFullName,
        mobileNumber: formData.coordinatorMobile,
        regionLocation: formData.regionLocation,
        ngoName: formData.ngoName,
        organizationDetails: formData.organizationDetails ?? '',
        skills: ['NGO Coordination', 'Resource Logistics', 'Roster Management'],
        availability: 'AVAILABLE',
      };

      let userId: string;

      try {
        const password = formData.password;
        const result = await registerUser({
          role: 'ngo_coordinator',
          email: formData.coordinatorEmail,
          password,
          profile,
        });
        userId = result.user.id;
      } catch (err) {
        if (err instanceof ApiError && err.status === 409) {
          const password = formData.password;
          const loginResult = await loginUser({
            email: formData.coordinatorEmail,
            password,
          });
          userId = loginResult.user.id;
        } else {
          throw err;
        }
      }

      // Register each manually added team member against the coordinator's ID
      if (formData.registrationMethod !== 'excel' && formData.teamMembers.length > 0) {
        for (const member of formData.teamMembers) {
          try {
            await addNgoMember(userId, {
              name: member.fullName,
              email: member.email,
              mobile: member.mobileNumber,
              skills: member.skills ?? [],
            });
          } catch {
            // Non-fatal: member add failure should not block coordinator registration
          }
        }
      }

      const sessionData: VolunteerSessionData = {
        id: userId,
        role: 'ngo_coordinator',
        fullName: formData.coordinatorFullName,
        mobileNumber: formData.coordinatorMobile,
        email: formData.coordinatorEmail,
        regionLocation: formData.regionLocation,
        skills: ['NGO Coordination', 'Resource Logistics', 'Roster Management'],
        availability: 'AVAILABLE',
        ngoName: formData.ngoName,
        organizationDetails: formData.organizationDetails,
        createdAt: new Date().toISOString(),
      };
      saveVolunteerSession(sessionData);
      setAccountCredentials({ email: formData.coordinatorEmail, password: formData.password });

      setSubmittedData({
        role: 'ngo_coordinator',
        data: formData,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
          ? err.message
          : 'Registration failed. Please check your connection and try again.';
      setApiError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white px-4 md:px-8 py-3.5 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <BrandLogo size="md" />
          <Link href="/">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs text-slate-600 h-8">
              <ArrowLeft size={13} /> Back
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto px-4 py-8 w-full space-y-6">

        {/* Page heading */}
        {!submittedData && (
          <div className="space-y-1">
            <p className="text-[11px] font-mono font-semibold text-slate-500 uppercase tracking-widest">
              Responder Onboarding
            </p>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Join the Response Network
            </h1>
            <p className="text-sm text-slate-500">
              Choose your participation role and complete registration.
            </p>
            <p className="text-xs text-slate-500 pt-2">
              Already registered?{' '}
              <Link href="/auth/login" className="font-semibold text-emerald-700 hover:text-emerald-800">
                Sign in with email and password
              </Link>
            </p>
          </div>
        )}

        {/* Backend error notice */}
        {apiError && !submittedData && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 text-xs">
            <AlertTriangle size={16} className="text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-bold text-rose-900">Registration could not be completed</p>
              <p className="text-rose-800">{apiError}</p>
            </div>
          </div>
        )}

        {/* Registration success */}
        {submittedData ? (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            {/* Success header strip */}
            <div className="bg-emerald-700 px-6 py-4 flex items-center gap-3">
              <CheckCircle2 className="text-white w-5 h-5 shrink-0" />
              <div>
                <p className="text-white font-bold text-sm">
                  {submittedData.role === 'individual'
                    ? 'Individual Volunteer Registered'
                    : 'NGO Coordinator Registered'}
                </p>
                <p className="text-emerald-200 text-xs mt-0.5">
                  Profile saved · {new Date(submittedData.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-700">
                Your responder profile has been registered. You can now access the Volunteer Response Center.
              </p>

              {accountCredentials && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 space-y-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-amber-900">Your login credentials</p>
                  <p className="text-xs text-amber-900">Save these details. Your password is stored securely and cannot be recovered from the server.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="rounded border border-amber-200 bg-white px-3 py-2">
                      <span className="block text-[10px] uppercase text-amber-700">Email</span>
                      <span className="font-mono font-semibold text-slate-900 break-all">{accountCredentials.email}</span>
                    </div>
                    <div className="rounded border border-amber-200 bg-white px-3 py-2">
                      <span className="block text-[10px] uppercase text-amber-700">Password</span>
                      <span className="font-mono font-semibold text-slate-900">{accountCredentials.password}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-3 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { setSubmittedData(null); setApiError(null); setAccountCredentials(null); }}
                  className="gap-1.5 text-slate-700 text-xs"
                >
                  <RefreshCw size={13} /> Register another profile
                </Button>

                {submittedData.role === 'ngo_coordinator' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push('/volunteer/ngo')}
                    className="text-sky-800 border-sky-300 bg-sky-50 hover:bg-sky-100 text-xs"
                  >
                    Open NGO Management →
                  </Button>
                )}

                <Button
                  onClick={() => {
                    window.location.href = '/volunteer/home';
                  }}
                  className="bg-slate-900 hover:bg-slate-800 text-white text-xs gap-1.5"
                >
                  Proceed to Response Center
                  <ArrowRight size={14} />
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <RoleSelector selectedRole={selectedRole} onSelectRole={setSelectedRole} />

            {selectedRole === 'individual' ? (
              <IndividualVolunteerForm onSubmit={handleIndividualSubmit} isLoading={isLoading} />
            ) : (
              <NgoCoordinatorForm onSubmit={handleNgoSubmit} isLoading={isLoading} />
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
