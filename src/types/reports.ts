export interface Position {
  id: string;
  title: string;
  department: string;
  applicants: number;
  interviewed: number;
  passed: number;
  failed: number;
  status: 'เปิดรับ' | 'เต็มแล้ว';
}

export interface StageStats {
  applicants: number;
  screening: number;
  interview: number;
  offer: number;
  hired: number;
  rejected: number;
}

export interface Efficiency {
  timeToHireAvg: number;
  acceptanceRate: number;
  costPerHire: number;
}

export interface Quality {
  aiFitScoreAvg: number;
  interviewPassRate: number;
  hrSatisfaction: number;
}

export interface MoM {
  current: number;
  mom: number;
}

export interface SourceCost {
  source: string;
  applicants: number;
  hires: number;
  spend: number;
}

export interface Candidate {
  id: string;
  name: string;
  positionId: string;
  positionTitle: string;
  department: string;
  stage: 'New' | 'Screening' | 'Interview' | 'Offer' | 'Hired' | 'Rejected';
  aiFitScore?: number;
  interviewScore?: number;
  updatedAt: string;
}

export interface DashboardFilters {
  dateRange?: string;
  department?: string;
  position?: string;
  source?: string;
  stage?: string;
  search?: string;
}

export interface HeadlineStats {
  applicants: MoM;
  openRoles: MoM;
  hiringRate: MoM;
  screeningPassed: MoM;
  interviewed: MoM;
  hired: MoM;
}
