export type VolunteerScreen =
  | 'home'
  | 'my-mission'
  | 'report-situation'
  | 'team'
  | 'resources'
  | 'communication'
  | 'profile-availability';

export type MissionStatus =
  | 'Assigned'
  | 'Accepted'
  | 'En Route'
  | 'Arrived'
  | 'Completed';

export type VolunteerAvailability = 'Available' | 'Busy' | 'Unavailable';

export type SituationReportCategory =
  | 'New Survivor'
  | 'Injury'
  | 'Road Blocked'
  | 'Resource Shortage'
  | 'Unsafe Condition'
  | 'Other';
