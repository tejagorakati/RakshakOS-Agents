export type OfficialAgencyRole =
  | 'EOC / Government'
  | 'Police'
  | 'Fire & Rescue'
  | 'Medical'
  | 'Public Works';

export type OperationalScreen =
  | 'command-center'
  | 'response-operations'
  | 'agent-activity'
  | 'teams-resources'
  | 'exceptions-approvals'
  | 'communications';

export type SeverityLevel = 'CRITICAL' | 'WARNING' | 'ACTIVE' | 'NORMAL';

export interface PlanHistoryVersion {
  version: string;
  status: 'ACTIVE' | 'INVALIDATED' | 'SUPERSEDED' | 'DRAFT';
  objective: string;
  assignedTeam: string;
  resources: string[];
  route: string;
  trigger: string;
  changeReason: string;
  timestamp: string;
  agentAction: string;
}

export interface OperationalChangeEvent {
  id: string;
  incidentId: string;
  title: string;
  description: string;
  timestamp: string;
  changeType: 'ROAD_BLOCKED' | 'TEAM_DELAYED' | 'SURVIVOR_REPORT' | 'CAPACITY_REACHED' | 'WATER_RISING';
  affectedPlanVersion: string;
}

export interface AssignedTeamDetail {
  teamId: string;
  teamName: string;
  type: string;
  leaderName: string;
  membersCount: number;
  status: string;
  assignedEquipment: string[];
}

export interface ResponseOperationItem {
  id: string;
  code: string;
  title: string;
  severity: SeverityLevel;
  status: 'RESPONSE_ACTIVE' | 'MONITORING' | 'PENDING' | 'RESOLVED';
  location: string;
  zoneId: string;
  situation: string;
  currentPlanVersion: string;
  routeStatus: string;
  plans: PlanHistoryVersion[];
  changes: OperationalChangeEvent[];
  assignedTeamDetail: AssignedTeamDetail;
  allocatedResources: string[];
}

export interface IncidentItem {
  id: string;
  code: string;
  title: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'REPORTED' | 'ASSESSING' | 'DISPATCHED' | 'ON_SITE' | 'RESOLVED';
  location: string;
  situation: string;
  assignedTeam?: string;
  resources: string[];
  routeStatus: string;
  agentStatus: string;
  planVersion: string;
}

export interface ResponseTeamItem {
  id: string;
  code: string;
  name: string;
  type: string;
  membersCount: number;
  status: 'DEPLOYED' | 'STANDBY' | 'EN_ROUTE';
  currentAssignment: string;
  location: string;
  equipment: string[];
}

export interface ResourceItem {
  id: string;
  name: string;
  category: 'VEHICLE' | 'BOAT' | 'MEDICAL' | 'EQUIPMENT' | 'SUPPLY';
  totalCount: number;
  deployedCount: number;
  unit: string;
  status: 'OPTIMAL' | 'HIGH_DEMAND' | 'CRITICAL_SHORTAGE';
}

export interface OperationalStat {
  id: string;
  key: 'incidents' | 'critical' | 'teams' | 'resources';
  label: string;
  value: string | number;
  statusText: string;
  supportingDetail?: string;
  statusVariant: 'normal' | 'active' | 'warning' | 'critical';
}

export interface ResponseZone {
  id: string;
  name: string;
  sectorCode: string;
  severity: SeverityLevel;
  incidentCount: number;
  waterLevelDepth: string;
  deployedTeamsCount: number;
  primaryRisk: string;
  routeStatus: 'CLEAR' | 'PARTIALLY_BLOCKED' | 'IMPASSABLE';
  incidentIds: string[];
}

export interface OperationalAlert {
  id: string;
  title: string;
  message: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  timestamp: string;
  location: string;
  incidentId?: string;
  teamId?: string;
}

export interface AgentActivitySummaryEvent {
  id: string;
  eventType: 'INCIDENT_ASSESSED' | 'TEAM_ASSIGNED' | 'RESOURCE_ALLOCATED' | 'PLAN_UPDATED' | 'ROUTE_ALTERED' | 'REPLAN_TRIGGERED';
  description: string;
  timestamp: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'REPLANNING';
  incidentId?: string;
  teamId?: string;
  details?: string;
}

export interface HumanAttentionItem {
  id: string;
  title: string;
  proposedAction: string;
  reason: string;
  impact: string;
  requestingAgent: string;
  timestamp: string;
  riskLevel: 'HIGH_RISK' | 'OUT_OF_BOUNDS' | 'POLICY_OVERRIDE';
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'MODIFIED';
}

export interface ActiveOperationalState {
  incidentCode: string;
  incidentTitle: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  planVersion: string;
  assignedTeam: string;
  route: string;
  lastChange: string;
}

export interface CommandCenterOverview {
  disasterScenarioName: string;
  regionLocation: string;
  operationStatus: string;
  lastUpdated: string;
  stats: OperationalStat[];
  incidents: IncidentItem[];
  teams: ResponseTeamItem[];
  resources: ResourceItem[];
  zones: ResponseZone[];
  alerts: OperationalAlert[];
  agentActivity: AgentActivitySummaryEvent[];
  humanAttentionItems: HumanAttentionItem[];
  activeState: ActiveOperationalState;
  responseConclusion?: string;
  responseConclusionLines?: string[];
  resourceInventory?: Array<{
    resourceId: string;
    resourceType: string;
    capability: string;
    status: string;
    location: string;
    available: boolean;
  }>;
  planLifecycle?: Array<{
    version: string;
    status: string;
    objective: string;
    priority: string;
    requiredResources: string[];
    assignedResources: string[];
    shortages: string[];
    route: string;
    hazards: string[];
    nextActions: string[];
    trigger: string;
  }>;
}
