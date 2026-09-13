'use client';

import { useState, useEffect } from 'react';

export interface VolunteerSessionData {
  id: string; // e.g. VOL-MOCK-7F3A
  role: 'individual' | 'ngo_coordinator';
  fullName: string;
  age?: number;
  sex?: string;
  mobileNumber: string;
  email: string;
  regionLocation: string;
  skills: string[];
  availability: 'AVAILABLE' | 'BUSY' | 'UNAVAILABLE';
  ngoName?: string;
  organizationDetails?: string;
  createdAt: string;
}

const STORAGE_KEY = 'rakshakos-volunteer-session';

/**
 * Retrieve current mock volunteer session from localStorage safely (client-only).
 */
export function getVolunteerSession(): VolunteerSessionData | null {
  if (typeof window === 'undefined') return null;
  try {
    const item = localStorage.getItem(STORAGE_KEY);
    if (!item) return null;
    return JSON.parse(item) as VolunteerSessionData;
  } catch (err) {
    console.error('Error reading volunteer session from localStorage:', err);
    return null;
  }
}

/**
 * Save mock volunteer session to localStorage (client-only).
 */
export function saveVolunteerSession(session: VolunteerSessionData): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch (err) {
    console.error('Error saving volunteer session to localStorage:', err);
  }
}

/**
 * Clear mock volunteer session from localStorage (client-only).
 */
export function clearVolunteerSession(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Error clearing volunteer session from localStorage:', err);
  }
}

/**
 * Custom React Hook for volunteer session state with SSR hydration safety.
 */
export function useVolunteerSession() {
  const [session, setSessionState] = useState<VolunteerSessionData | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setSessionState(getVolunteerSession());
    setIsLoaded(true);
  }, []);

  const updateSession = (partial: Partial<VolunteerSessionData>) => {
    setSessionState((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...partial };
      saveVolunteerSession(updated);
      return updated;
    });
  };

  const setSession = (data: VolunteerSessionData) => {
    saveVolunteerSession(data);
    setSessionState(data);
  };

  const clearSession = () => {
    clearVolunteerSession();
    setSessionState(null);
  };

  return {
    session,
    isLoaded,
    updateSession,
    setSession,
    clearSession,
  };
}
