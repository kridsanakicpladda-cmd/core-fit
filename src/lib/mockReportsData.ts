import { HeadlineStats, Efficiency, Quality, StageStats, Position, SourceCost, Candidate } from '@/types/reports';

export const getHeadlineStats = (): HeadlineStats => ({
  applicants: { current: 1234, mom: 0.125 },
  openRoles: { current: 45, mom: 0.052 },
  hiringRate: { current: 0.85, mom: 0.031 },
  screeningPassed: { current: 260, mom: 0.089 },
  interviewed: { current: 155, mom: -0.042 },
  hired: { current: 55, mom: 0.15 }
});

export const getEfficiency = (): Efficiency => ({
  timeToHireAvg: 40,
  acceptanceRate: 0.85,
  costPerHire: 45000
});

export const getQuality = (): Quality => ({
  aiFitScoreAvg: 78,
  interviewPassRate: 0.45,
  hrSatisfaction: 4.5
});

export const getStageStats = (): StageStats => ({
  applicants: 413,
  screening: 260,
  interview: 155,
  offer: 78,
  hired: 55,
  rejected: 90
});

export const getPositions = (): Position[] => [
  { id: 'p1', title: 'Senior Software Engineer', department: 'วิศวกรรม', applicants: 124, interviewed: 45, passed: 20, failed: 25, status: 'เต็มแล้ว' },
  { id: 'p2', title: 'Product Manager', department: 'ผลิตภัณฑ์', applicants: 89, interviewed: 30, passed: 15, failed: 15, status: 'เต็มแล้ว' },
  { id: 'p3', title: 'UX Designer', department: 'ออกแบบ', applicants: 67, interviewed: 28, passed: 12, failed: 16, status: 'เต็มแล้ว' },
  { id: 'p4', title: 'Data Analyst', department: 'วิเคราะห์ข้อมูล', applicants: 45, interviewed: 18, passed: 8, failed: 10, status: 'เปิดรับ' },
  { id: 'p5', title: 'Marketing Manager', department: 'การตลาด', applicants: 32, interviewed: 12, passed: 5, failed: 7, status: 'เปิดรับ' },
  { id: 'p6', title: 'DevOps Engineer', department: 'วิศวกรรม', applicants: 56, interviewed: 22, passed: 10, failed: 12, status: 'เต็มแล้ว' }
];

export const getSourcesCost = (): SourceCost[] => [
  { source: 'LinkedIn', applicants: 300, hires: 18, spend: 180000 },
  { source: 'Website', applicants: 280, hires: 16, spend: 90000 },
  { source: 'Referral', applicants: 200, hires: 14, spend: 40000 },
  { source: 'Job Board', applicants: 160, hires: 7, spend: 60000 },
  { source: 'อื่นๆ', applicants: 70, hires: 0, spend: 15000 }
];

export const getCandidates = (): Candidate[] => {
  const positions = getPositions();
  const stages: Candidate['stage'][] = ['New', 'Screening', 'Interview', 'Offer', 'Hired', 'Rejected'];
  const names = ['สมชาย ใจดี', 'สมหญิง รักสงบ', 'วิชัย มั่นคง', 'นิภา สุขใจ', 'ประยุทธ เจริญ', 'สุดา แจ่มใส', 'ธนากร รุ่งเรือง', 'พิมพ์ชนก ศรีสุข'];
  
  return Array.from({ length: 30 }, (_, i) => {
    const pos = positions[i % positions.length];
    return {
      id: `c${i + 1}`,
      name: names[i % names.length] + ` ${i + 1}`,
      positionId: pos.id,
      positionTitle: pos.title,
      department: pos.department,
      stage: stages[Math.floor(Math.random() * stages.length)],
      aiFitScore: Math.floor(Math.random() * 40) + 60,
      interviewScore: Math.random() > 0.5 ? Math.floor(Math.random() * 40) + 60 : undefined,
      updatedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
    };
  });
};

export const getTrendData = () => {
  const days = 30;
  return Array.from({ length: days }, (_, i) => ({
    date: new Date(Date.now() - (days - i) * 24 * 60 * 60 * 1000).toLocaleDateString('th-TH', { day: '2-digit', month: 'short' }),
    applicants: Math.floor(Math.random() * 30) + 20,
    interviewed: Math.floor(Math.random() * 15) + 5,
    hired: Math.floor(Math.random() * 5) + 1
  }));
};
