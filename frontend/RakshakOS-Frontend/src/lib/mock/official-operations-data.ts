import {
  AgentActivitySummaryEvent,
  ResponseTeamItem,
  ResourceItem,
  HumanAttentionItem,
  OperationalAlert,
} from '@/lib/types/official';

export interface FullAgentActivityEvent extends AgentActivitySummaryEvent {
  category: 'ASSESSMENT' | 'PLANNING' | 'ALLOCATION' | 'EXECUTION' | 'MONITORING' | 'REPLANNING' | 'COMMUNICATION';
  actionPerformed: string;
  trigger: string;
  affectedTeamName?: string;
  affectedResources?: string[];
}

export interface DetailedContact {
  id: string;
  name: string;
  organization: string;
  category: 'RESPONSE_TEAMS' | 'AGENCIES' | 'NGO_COORDINATORS' | 'EMERGENCY_CONTACTS';
  contactPerson: string;
  phone: string;
  radioFrequency: string;
  currentLocation: string;
  currentMission: string;
  availability: 'AVAILABLE' | 'EN_ROUTE' | 'ON_SITE' | 'BUSY';
}

export interface OperationalBroadcastMessage {
  id: string;
  audience: string;
  message: string;
  timestamp: string;
  sender: string;
  status: 'QUEUED_FOR_DISPATCH' | 'DISPATCHED';
}

export const mockFullAgentActivityEvents: FullAgentActivityEvent[] = [
  {
    id: 'evt-201',
    eventType: 'REPLAN_TRIGGERED',
    category: 'REPLANNING',
    description: 'Response Plan V2 activated for INC-032 / MSN-018 following route blockage.',
    timestamp: '14:34',
    status: 'COMPLETED',
    incidentId: 'INC-032',
    teamId: 'TEAM-09',
    actionPerformed: 'Route Alternative C via Eastern Peripheral Highway selected (+14m detour).',
    trigger: 'Route Alternative B (Canal Road R17) reported submerged under 1.4m water near North Canal Underpass.',
    affectedTeamName: 'Rescue Team Alpha',
    affectedResources: ['Inflatable Rescue Boat 02', 'Emergency Medical Kit Pack #4'],
  },
  {
    id: 'evt-202',
    eventType: 'ROUTE_ALTERED',
    category: 'MONITORING',
    description: 'Route Alternative B reported blocked by field telemetry.',
    timestamp: '14:31',
    status: 'COMPLETED',
    incidentId: 'INC-032',
    actionPerformed: 'Primary access vector marked IMPASSABLE in Hydro-Grid model.',
    trigger: 'Ground truth report RPT-041 confirmed water depth 1.4m near North Canal Underpass.',
  },
  {
    id: 'evt-203',
    eventType: 'RESOURCE_ALLOCATED',
    category: 'ALLOCATION',
    description: 'Inflatable Rescue Boat 02 & Emergency Medical Kit Pack #4 allocated to Rescue Team Alpha.',
    timestamp: '14:29',
    status: 'COMPLETED',
    incidentId: 'INC-032',
    teamId: 'TEAM-09',
    actionPerformed: 'Assets dispatched from Sector 1 Staging Base inventory.',
    trigger: 'Rescue Team Alpha dispatch requirement confirmed.',
    affectedTeamName: 'Rescue Team Alpha',
    affectedResources: ['Inflatable Rescue Boat 02', 'Emergency Medical Kit Pack #4'],
  },
  {
    id: 'evt-204',
    eventType: 'TEAM_ASSIGNED',
    category: 'EXECUTION',
    description: 'Rescue Team Alpha (NDRF Unit) dispatched to INC-032 / MSN-018.',
    timestamp: '14:26',
    status: 'COMPLETED',
    incidentId: 'INC-032',
    teamId: 'TEAM-09',
    actionPerformed: 'Team Alpha status updated to DEPLOYED / EN_ROUTE.',
    trigger: 'INC-032 severity rating CRITICAL at North Canal.',
    affectedTeamName: 'Rescue Team Alpha',
  },
  {
    id: 'evt-205',
    eventType: 'PLAN_UPDATED',
    category: 'PLANNING',
    description: 'Response Plan V1 created for INC-032 via Route Alternative B.',
    timestamp: '14:22',
    status: 'COMPLETED',
    incidentId: 'INC-032',
    actionPerformed: 'Initial dispatch plan generated targeting North Canal residential block.',
    trigger: 'Incident #302 verified by observation telemetry.',
  },
  {
    id: 'evt-206',
    eventType: 'INCIDENT_ASSESSED',
    category: 'ASSESSMENT',
    description: 'INC-032 classified as CRITICAL (14 stranded residential units).',
    timestamp: '14:20',
    status: 'COMPLETED',
    incidentId: 'INC-032',
    actionPerformed: 'Priority level set to CRITICAL; hydro-grid dispatch queued.',
    trigger: 'Citizen emergency calls & field observation telemetry.',
  },
  {
    id: 'evt-207',
    eventType: 'TEAM_ASSIGNED',
    category: 'EXECUTION',
    description: 'Medical Response Team 01 assigned to INC-029 medical evacuation.',
    timestamp: '14:12',
    status: 'COMPLETED',
    incidentId: 'INC-029',
    teamId: 'TEAM-14',
    actionPerformed: 'Amphibious Medical Transporter 01 dispatched to East Junction.',
    trigger: 'Trauma victim medical report #209.',
    affectedTeamName: 'Medical Response Team 01',
  },
  {
    id: 'evt-208',
    eventType: 'RESOURCE_ALLOCATED',
    category: 'ALLOCATION',
    description: 'Heavy Dewatering Pump 01 allocated to Substation #3 perimeter (INC-027).',
    timestamp: '13:45',
    status: 'COMPLETED',
    incidentId: 'INC-027',
    teamId: 'TEAM-03',
    actionPerformed: 'Heavy pump unit deployed from Public Works stockpile.',
    trigger: 'Grid outage warning at Riverside Confluence.',
    affectedTeamName: 'Rescue Team Bravo',
  },
];

export const mockDetailedTeams: ResponseTeamItem[] = [
  {
    id: 'TEAM-09',
    code: 'TEAM-09',
    name: 'Rescue Team Alpha',
    type: 'NDRF Water Rescue Unit',
    membersCount: 8,
    status: 'DEPLOYED',
    currentAssignment: 'INC-032 / MSN-018: North Canal Evacuation',
    location: 'Sector 7 (SEC-07)',
    equipment: ['Inflatable Rescue Boat 02', 'Emergency Medical Kit Pack #4', 'Rope Launchers', 'Life Jackets (30)'],
  },
  {
    id: 'TEAM-03',
    code: 'TEAM-03',
    name: 'Rescue Team Bravo',
    type: 'Fire & Rescue Special Ops',
    membersCount: 6,
    status: 'DEPLOYED',
    currentAssignment: 'INC-027: Riverside Dewatering',
    location: 'Sector 2 (SEC-02)',
    equipment: ['Heavy Dewatering Pump 01', 'Cutting Tools', 'Floodlights'],
  },
  {
    id: 'TEAM-14',
    code: 'TEAM-14',
    name: 'Medical Response Team 01',
    type: 'Emergency Medical Unit',
    membersCount: 4,
    status: 'DEPLOYED',
    currentAssignment: 'INC-029: Medical Evacuation',
    location: 'Sector 4 (SEC-04)',
    equipment: ['Amphibious Medical Transporter 01', 'Defibrillator', 'Trauma Kits'],
  },
  {
    id: 'TEAM-04',
    code: 'TEAM-04',
    name: 'Fire & Rescue Unit 04',
    type: 'Heavy Engineering Unit',
    membersCount: 10,
    status: 'STANDBY',
    currentAssignment: 'Standby for Sluice Gate 3 Emergency Breach',
    location: 'Sector 1 Staging Base (SEC-01)',
    equipment: ['Bulldozer', 'Sandbag Launchers', 'Mobile Generator'],
  },
];

export const mockDetailedResources: ResourceItem[] = [
  {
    id: 'res-boat-02',
    name: 'Inflatable Rescue Boat 02',
    category: 'BOAT',
    totalCount: 10,
    deployedCount: 8,
    unit: 'Boats',
    status: 'HIGH_DEMAND',
  },
  {
    id: 'res-amb-01',
    name: 'Amphibious Medical Transporter 01',
    category: 'VEHICLE',
    totalCount: 15,
    deployedCount: 12,
    unit: 'Vehicles',
    status: 'OPTIMAL',
  },
  {
    id: 'res-pump-01',
    name: 'Heavy Dewatering Pump 01',
    category: 'EQUIPMENT',
    totalCount: 8,
    deployedCount: 6,
    unit: 'Pumps',
    status: 'HIGH_DEMAND',
  },
  {
    id: 'res-medkit-04',
    name: 'Emergency Medical Kit Pack #4',
    category: 'MEDICAL',
    totalCount: 200,
    deployedCount: 160,
    unit: 'Kits',
    status: 'OPTIMAL',
  },
];

export const mockHumanApprovalsList: HumanAttentionItem[] = [
  {
    id: 'APP-014',
    title: 'Controlled Emergency Opening of Sluice Gate 3',
    proposedAction: 'Controlled emergency opening of Sluice Gate 3 to relieve Sector 7 riverbank water level by 0.6m.',
    reason: 'Prevent catastrophic breach of main river embankment protecting 1,200 residential units.',
    impact: 'May cause minor 0.15m water rise in downstream uninhabited agricultural buffer zone.',
    requestingAgent: 'Hydro-Grid Controller',
    timestamp: '14:24:00',
    riskLevel: 'HIGH_RISK',
    status: 'PENDING',
  },
  {
    id: 'APP-011',
    title: 'Reallocate Heavy Dewatering Pump 02 from Reserve Stockpile',
    proposedAction: 'Reallocate 1 heavy-duty pump reserved for EOC backup to Substation #3 perimeter.',
    reason: 'Prevent electrical grid trip affecting 4,000 households at Sector 2.',
    impact: 'Reduces EOC reserve buffer to 1 standby pump unit.',
    requestingAgent: 'Resource Dispatch Controller',
    timestamp: '14:15:30',
    riskLevel: 'POLICY_OVERRIDE',
    status: 'PENDING',
  },
  {
    id: 'APP-009',
    title: 'Prioritize INC-029 Evacuation Over Secondary Debris Clearance',
    proposedAction: 'Reassign Rescue Unit 04 from debris clearing to emergency medical corridor clearing.',
    reason: 'Critical trauma patient transfer requires clear transit lane.',
    impact: 'Debris clearing at Bridge 2 delayed by 30 minutes.',
    requestingAgent: 'EOC Command Desk',
    timestamp: '13:50:00',
    riskLevel: 'OUT_OF_BOUNDS',
    status: 'APPROVED',
  },
];

export const mockContactsDirectory: DetailedContact[] = [
  {
    id: 'cnt-01',
    name: 'Rescue Team Alpha (NDRF Unit)',
    organization: 'National Disaster Response Force',
    category: 'RESPONSE_TEAMS',
    contactPerson: 'Commander Arun Kumar',
    phone: '+91 98765-00101',
    radioFrequency: 'CH-04 Water Rescue',
    currentLocation: 'Sector 7 (SEC-07)',
    currentMission: 'INC-032 / MSN-018: North Canal Evacuation',
    availability: 'EN_ROUTE',
  },
  {
    id: 'cnt-02',
    name: 'Medical Response Team 01',
    organization: 'Emergency Medical Services',
    category: 'RESPONSE_TEAMS',
    contactPerson: 'Dr. Meera Reddy',
    phone: '+91 98765-00102',
    radioFrequency: 'CH-02 Medical Dispatch',
    currentLocation: 'Sector 4 (SEC-04)',
    currentMission: 'INC-029: Medical Evacuation',
    availability: 'ON_SITE',
  },
  {
    id: 'cnt-03',
    name: 'Police EOC Command Desk',
    organization: 'Metro City Police Department',
    category: 'AGENCIES',
    contactPerson: 'Inspector V. Ramesh',
    phone: '+91 98765-00201',
    radioFrequency: 'CH-01 Police Command',
    currentLocation: 'Central EOC Building',
    currentMission: 'Traffic Diversion & Evacuation Security',
    availability: 'AVAILABLE',
  },
  {
    id: 'cnt-04',
    name: 'Disaster Relief Action NGO',
    organization: 'Civil Response Network',
    category: 'NGO_COORDINATORS',
    contactPerson: 'Anil Kumar (NGO Leader)',
    phone: '+91 98765-00301',
    radioFrequency: 'CH-08 Volunteer Net',
    currentLocation: 'Sector 9 Staging Base',
    currentMission: 'Shelter Supply & Relief Distribution',
    availability: 'AVAILABLE',
  },
];

export const mockBroadcastFeed: OperationalBroadcastMessage[] = [
  {
    id: 'bcast-01',
    audience: 'All Response Teams & Coordinators',
    message: 'Advisory: Route Alternative B is impassable due to 1.4m flooding at North Canal Underpass. All Sector 7 dispatches rerouted via Route Alternative C (Eastern Peripheral Highway).',
    timestamp: '14:35',
    sender: 'EOC Command Authority Desk',
    status: 'DISPATCHED',
  },
  {
    id: 'bcast-02',
    audience: 'Medical Units',
    message: 'Notice: Central Shelter at Sector 9 medical desk active for trauma triage.',
    timestamp: '14:10',
    sender: 'Medical Dispatch Desk',
    status: 'DISPATCHED',
  },
];

