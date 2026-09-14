/**
 * RakshakOS API Client
 *
 * Thin typed fetch wrappers over the existing FastAPI backend.
 * Base URL is read from NEXT_PUBLIC_API_BASE_URL (.env.local).
 * This file only handles HTTP transport and basic error extraction.
 */

import { CommandCenterOverview } from '@/lib/types/official';

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000';

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    cache: 'no-store',
  });

  if (!res.ok) {
    let detail = `HTTP ${res.status}`;

    try {
      const err = await res.json();
      detail = err?.detail ?? err?.message ?? detail;

      if (typeof detail === 'object') {
        detail =
          (detail as Record<string, string>).message ??
          JSON.stringify(detail);
      }
    } catch {
      // Keep the HTTP status message when the error body is not JSON.
    }

    throw new ApiError(res.status, detail);
  }

  return res.json() as Promise<T>;
}

// ---------------------------------------------------------------------------
// Auth — register
// ---------------------------------------------------------------------------

export interface RegisterRequest {
  role: 'individual' | 'ngo_coordinator' | 'team_member';
  email: string;
  password: string;
  profile: Record<string, unknown>;
}

export interface BackendUser {
  id: string;
  email: string;
  role: string;
  profile: Record<string, unknown>;
}

export interface RegisterResponse {
  status: string;
  user: BackendUser;
}

export async function registerUser(
  req: RegisterRequest,
): Promise<RegisterResponse> {
  return apiPost<RegisterResponse>('/auth/register', req);
}

// ---------------------------------------------------------------------------
// Auth — login
// ---------------------------------------------------------------------------

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  status: string;
  user: BackendUser;
}

export async function loginUser(
  req: LoginRequest,
): Promise<LoginResponse> {
  return apiPost<LoginResponse>('/auth/login', req);
}

// ---------------------------------------------------------------------------
// Incident processing — Command Center
// ---------------------------------------------------------------------------

export interface ProcessIncidentRequest {
  incident_id: string;
  disaster_type: string;
  location: string;
  latitude: number;
  longitude: number;
  priority?: string;
  requirements?: string[];
  reports?: Array<Record<string, unknown>>;
  plan_version?: number;
}

export interface ProcessIncidentResponse {
  status: string;
  data: CommandCenterOverview;
}

export async function processIncident(
  req: ProcessIncidentRequest,
): Promise<ProcessIncidentResponse> {
  return apiPost<ProcessIncidentResponse>('/process_incident', req);
}

// ---------------------------------------------------------------------------
// Incident brief
// ---------------------------------------------------------------------------

export async function getIncidentBrief(
  incidentId: string,
): Promise<CommandCenterOverview> {
  const response = await fetch(
    `${BASE_URL}/incidents/${incidentId}/brief`,
    {
      cache: 'no-store',
    },
  );

  if (!response.ok) {
    throw new ApiError(
      response.status,
      'Failed to load incident',
    );
  }

  return response.json() as Promise<CommandCenterOverview>;
}

// ---------------------------------------------------------------------------
// Field report submission
// ---------------------------------------------------------------------------

export interface SubmitReportRequest {
  category: string;
  location: string;
  description: string;
  source_type?: string;
}

export interface SubmitReportResponse {
  status: string;
  incident_id: string;
  plan_version: number;
  data: CommandCenterOverview;
}

export async function submitFieldReport(
  incidentId: string,
  req: SubmitReportRequest,
): Promise<SubmitReportResponse> {
  return apiPost<SubmitReportResponse>(
    `/incidents/${incidentId}/reports`,
    req,
  );
}

// Backward-compatible alias for the existing senior API function.
export async function submitReport(
  incidentId: string,
  report: SubmitReportRequest,
): Promise<SubmitReportResponse> {
  return submitFieldReport(incidentId, report);
}

// ---------------------------------------------------------------------------
// NGO team members
// ---------------------------------------------------------------------------

export interface TeamMemberRequest {
  name: string;
  email: string;
  mobile: string;
  skills: string[];
}

export interface TeamMemberResponse {
  status: string;
  member: {
    id: string;
    name: string;
    email: string;
    mobile: string;
    skills: string[];
  };
}

export async function addNgoMember(
  ownerId: string,
  req: TeamMemberRequest,
): Promise<TeamMemberResponse> {
  return apiPost<TeamMemberResponse>(
    `/ngo/${ownerId}/members`,
    req,
  );
}

export interface ListMembersResponse {
  status: string;
  members: Array<{
    id: string;
    name: string;
    email: string;
    mobile: string;
    skills: string[];
  }>;
}

export async function listNgoMembers(
  ownerId: string,
): Promise<ListMembersResponse> {
  const res = await fetch(
    `${BASE_URL}/ngo/${ownerId}/members`,
    {
      cache: 'no-store',
    },
  );

  if (!res.ok) {
    throw new ApiError(
      res.status,
      `HTTP ${res.status}`,
    );
  }

  return res.json() as Promise<ListMembersResponse>;
}

export { ApiError };