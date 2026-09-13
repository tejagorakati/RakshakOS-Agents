export type VolunteerRoleType = 'individual' | 'ngo_coordinator';

export type AvailabilityStatus = 'Available' | 'Busy' | 'Unavailable';

export type SexCategory = 'Male' | 'Female' | 'Other';

export interface IndividualVolunteerRegistration {
  fullName: string;
  age: number | '';
  sex: SexCategory | '';
  mobileNumber: string;
  email: string;
  regionLocation: string;
  skills: string[];
  availability: AvailabilityStatus;
}

export interface NgoTeamMember {
  id: string;
  fullName: string;
  mobileNumber: string;
  email: string;
  skills?: string[];
  cvFileName?: string | null;
  cvFileSize?: number | null;
}

export interface NgoCoordinatorRegistration {
  coordinatorFullName: string;
  coordinatorMobile: string;
  coordinatorEmail: string;
  regionLocation: string;
  ngoName: string;
  organizationDetails?: string;
  coordinatorCvFileName?: string | null;
  registrationMethod: 'manual' | 'excel' | 'hybrid';
  teamMembers: NgoTeamMember[];
  excelFileName?: string | null;
  excelFileSize?: number | null;
}

export interface AuthValidationErrors {
  [key: string]: string;
}
