export interface VolunteerProfile {
  id: string;
  name: string;
  role: 'individual_volunteer' | 'ngo_coordinator';
  age: number;
  sex: string;
  mobile: string;
  email: string;
  location: string;
  skills: string[];
  availability: 'AVAILABLE' | 'BUSY' | 'UNAVAILABLE';
}

export interface MissionTeamMember {
  id: string;
  name: string;
  role: string;
  skills: string[];
  status: 'Assigned' | 'Accepted' | 'En Route' | 'Arrived' | 'Completed' | 'Standby';
  contactPhone: string;
}

export interface MissionResourceItem {
  id: string;
  name: string;
  type: string;
  status: 'Allocated' | 'In Use' | 'Completed';
  location: string;
  operationalNote: string;
}

export interface VolunteerMission {
  id: string;
  incidentId: string;
  incidentTitle: string;
  objective: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  location: string;
  assignedTeam: string;
  teamLeader: string;
  status: 'Assigned' | 'Accepted' | 'En Route' | 'Arrived' | 'Completed';
  currentRoute: string;
  previousRoute?: string;
  routeStatus: string;
  teamMembers: MissionTeamMember[];
  resources: MissionResourceItem[];
}

export interface FieldSituationReport {
  id: string;
  category: 'New Survivor' | 'Injury' | 'Road Blocked' | 'Resource Shortage' | 'Unsafe Condition' | 'Other';
  description: string;
  location: string;
  timestamp: string;
  status: 'Received' | 'Under Review' | 'Actioned';
  attachmentName?: string;
}

export interface MissionMessage {
  id: string;
  sender: string;
  senderType: 'AGENT' | 'LEADER' | 'VOLUNTEER';
  message: string;
  timestamp: string;
  relatedContext?: string;
}

export interface NgoMember {
  id: string;
  name: string;
  mobile: string;
  email: string;
  skills: string[];
  availability: 'Available' | 'Busy' | 'Unavailable';
  currentMission: string;
  cvStatus: 'CV Attached' | 'No CV Attached';
}

export interface NgoData {
  ngoName: string;
  coordinatorName: string;
  registeredMembers: NgoMember[];
}

export interface DisasterSensitivityZone {
  id: string;
  name: string;
  riskLevel: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'NORMAL';
  waterDepth: string;
  missionActive: boolean;
  primaryRisk: string;
}

export const mockVolunteerProfile: VolunteerProfile = {
  id: 'VOL-9082',
  name: 'Arun Kumar',
  role: 'ngo_coordinator', // set to ngo_coordinator to support both individual & NGO Coordinator features in demo
  age: 29,
  sex: 'Male',
  mobile: '+91 98765-43210',
  email: 'arun.kumar@civilnet.org',
  location: 'Sector 7 (SEC-07), Metro City',
  skills: ['Water Rescue Level 1', 'First Aid / CPR', 'Boat Navigation', 'Emergency Communications'],
  availability: 'AVAILABLE',
};

export const mockVolunteerMission: VolunteerMission = {
  id: 'MSN-018',
  incidentId: 'INC-DEMO-001',
  incidentTitle: 'Residents Stranded at North Canal',
  objective: 'Reach stranded residents near North Canal, assist with boat evacuation, and deliver emergency medical supplies.',
  priority: 'CRITICAL',
  location: 'North Canal Residential Block, Sector 7',
  assignedTeam: 'Rescue Team Alpha',
  teamLeader: 'Commander Arun Kumar (NDRF)',
  status: 'En Route',
  currentRoute: 'Route Alternative C (via Eastern Peripheral Highway Detour)',
  previousRoute: 'Route Alternative B (Impassable — Submerged 1.4m at North Canal Underpass)',
  routeStatus: 'Route Plan V2 Active (+14m detour)',
  teamMembers: [
    {
      id: 'tm-1',
      name: 'Commander Arun Kumar',
      role: 'Team Leader & NDRF Specialist',
      skills: ['Water Rescue Master', 'Command & Control'],
      status: 'En Route',
      contactPhone: '+91 98765-00101',
    },
    {
      id: 'tm-2',
      name: 'Arun Kumar (You)',
      role: 'Field Volunteer Assistant',
      skills: ['First Aid / CPR', 'Boat Navigation'],
      status: 'En Route',
      contactPhone: '+91 98765-43210',
    },
    {
      id: 'tm-3',
      name: 'Priya Sharma',
      role: 'Emergency Medic',
      skills: ['Trauma Care', 'Triage'],
      status: 'En Route',
      contactPhone: '+91 98765-00102',
    },
    {
      id: 'tm-4',
      name: 'Rajesh Verma',
      role: 'Amphibious Vehicle Operator',
      skills: ['Heavy Equipment', 'Hazmat Handling'],
      status: 'En Route',
      contactPhone: '+91 98765-00103',
    },
  ],
  resources: [
    {
      id: 'res-boat-02',
      name: 'Inflatable Rescue Boat 02',
      type: 'Boat Asset',
      status: 'Allocated',
      location: 'North Canal Staging Point',
      operationalNote: 'Boat 02 equipped with outboard motor & 30 life jackets. Assigned for primary evacuation at North Canal.',
    },
    {
      id: 'res-medkit-04',
      name: 'Emergency Medical Kit Pack #4',
      type: 'Medical Asset',
      status: 'Allocated',
      location: 'Sector 7 Staging Base',
      operationalNote: 'Medical Kit 04 includes trauma dressings, IV fluids, and hypothermia thermal blankets.',
    },
  ],
};

export const mockFieldReports: FieldSituationReport[] = [
  {
    id: 'RPT-041',
    category: 'Road Blocked',
    description: 'Route Alternative B completely submerged under 1.4m floodwater near North Canal Underpass. Impassable for rescue vehicles.',
    location: 'North Canal — Route B',
    timestamp: '14:31',
    status: 'Actioned',
    attachmentName: 'water_depth_bridge2.jpg',
  },
  {
    id: 'RPT-038',
    category: 'New Survivor',
    description: '4 stranded individuals spotted on terrace near Sector 7 Housing Complex B. Medical assistance needed.',
    location: 'Sector 7 Housing Complex B',
    timestamp: '14:15',
    status: 'Under Review',
  },
];

export const mockMissionMessages: MissionMessage[] = [
  {
    id: 'msg-101',
    sender: 'System Dispatch Loop',
    senderType: 'AGENT',
    message: 'Response Plan V2 active. Route Alternative C assigned to Rescue Team Alpha with Boat 02 and Medical Kit 04. Route Alternative B marked IMPASSABLE.',
    timestamp: '14:34',
    relatedContext: 'Route Reroute',
  },
  {
    id: 'msg-102',
    sender: 'Commander Arun Kumar (Leader)',
    senderType: 'LEADER',
    message: 'Team Alpha, proceed via Route Alternative C towards North Canal staging point.',
    timestamp: '14:35',
    relatedContext: 'Tactical Directive',
  },
  {
    id: 'msg-103',
    sender: 'Field Telemetry Monitor',
    senderType: 'AGENT',
    message: 'Route Alternative B unavailable due to 1.4m flooding at North Canal Underpass.',
    timestamp: '14:31',
    relatedContext: 'Hazard Alert',
  },
];

export const mockNgoData: NgoData = {
  ngoName: 'Civil Response Network NGO',
  coordinatorName: 'Arun Kumar',
  registeredMembers: [
    {
      id: 'ngo-mem-01',
      name: 'Siddharth Rao',
      mobile: '+91 98765-11001',
      email: 'siddharth@civilnet.org',
      skills: ['First Aid', 'Logistics'],
      availability: 'Available',
      currentMission: 'MSN-018: North Canal Evacuation',
      cvStatus: 'CV Attached',
    },
    {
      id: 'ngo-mem-02',
      name: 'Kavita Patel',
      mobile: '+91 98765-11002',
      email: 'kavita@civilnet.org',
      skills: ['Food Distribution', 'Shelter Care'],
      availability: 'Busy',
      currentMission: 'MSN-012: Sector 9 Relief Camp',
      cvStatus: 'CV Attached',
    },
    {
      id: 'ngo-mem-03',
      name: 'Deepak Nair',
      mobile: '+91 98765-11003',
      email: 'deepak@civilnet.org',
      skills: ['Radio Communication', 'Vehicle Driver'],
      availability: 'Available',
      currentMission: 'Unassigned (Standby)',
      cvStatus: 'No CV Attached',
    },
  ],
};

export const mockSensitivityZones: DisasterSensitivityZone[] = [
  {
    id: 'zone-sec-7',
    name: 'Sector 7 (North Canal)',
    riskLevel: 'CRITICAL',
    waterDepth: '1.4m',
    missionActive: true,
    primaryRisk: 'Flash Flooding & Submerged Access Vectors',
  },
  {
    id: 'zone-sec-4',
    name: 'Sector 4 (East Junction)',
    riskLevel: 'HIGH',
    waterDepth: '0.8m',
    missionActive: false,
    primaryRisk: 'Electrical Substation Flood Threat',
  },
  {
    id: 'zone-sec-1',
    name: 'Sector 1 (Staging Base)',
    riskLevel: 'NORMAL',
    waterDepth: '0.1m',
    missionActive: false,
    primaryRisk: 'Safe Operational Staging Depot',
  },
];
