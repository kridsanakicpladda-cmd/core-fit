import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { HeadlineStats, Efficiency, Quality, StageStats, Position, SourceCost, Candidate } from '@/types/reports';

export function useReportsData() {
  // Fetch all data needed for reports
  const { data: positions, isLoading: positionsLoading } = useQuery({
    queryKey: ['report-positions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('job_positions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  const { data: candidates, isLoading: candidatesLoading } = useQuery({
    queryKey: ['report-candidates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('candidates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  const { data: applications, isLoading: applicationsLoading } = useQuery({
    queryKey: ['report-applications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          candidate:candidates(*),
          position:job_positions(*)
        `)
        .order('applied_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  const { data: interviews, isLoading: interviewsLoading } = useQuery({
    queryKey: ['report-interviews'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('interviews')
        .select(`
          *,
          application:applications(
            *,
            candidate:candidates(*),
            position:job_positions(*)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  const { data: costs, isLoading: costsLoading } = useQuery({
    queryKey: ['report-costs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('recruitment_costs')
        .select('*')
        .order('period_start', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  const isLoading = positionsLoading || candidatesLoading || applicationsLoading || interviewsLoading || costsLoading;

  // Helper: calculate MoM by comparing current month vs previous month
  const calcMoM = (currentVal: number, previousVal: number): number => {
    if (previousVal === 0) return currentVal > 0 ? 1 : 0;
    return (currentVal - previousVal) / previousVal;
  };

  // Calculate headline stats with real MoM
  const getHeadlineStats = (): HeadlineStats => {
    if (!applications || !positions || !interviews) {
      return {
        applicants: { current: 0, mom: 0 },
        openRoles: { current: 0, mom: 0 },
        hiringRate: { current: 0, mom: 0 },
        screeningPassed: { current: 0, mom: 0 },
        interviewed: { current: 0, mom: 0 },
        hired: { current: 0, mom: 0 },
        vacancyRate: { current: 0, mom: 0 },
        applicantsPerOpening: { current: 0, mom: 0 }
      };
    }

    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0); // last day of prev month

    const thisMonthApps = applications.filter(a => new Date(a.applied_at) >= thisMonthStart);
    const lastMonthApps = applications.filter(a => {
      const d = new Date(a.applied_at);
      return d >= lastMonthStart && d <= lastMonthEnd;
    });

    // Current totals
    const totalApplicants = applications.length;
    const openRoles = positions.filter(p => p.status === 'open').length;
    const totalJobs = positions.length;
    const screeningPassed = applications.filter(a => ['Screening', 'Interview', 'Offer', 'Hired'].includes(a.stage)).length;
    const interviewed = applications.filter(a => ['Interview', 'Offer', 'Hired'].includes(a.stage)).length;
    const hired = applications.filter(a => a.stage === 'Hired').length;
    const offers = applications.filter(a => ['Offer', 'Hired'].includes(a.stage)).length;
    const hiringRate = offers > 0 ? hired / offers : 0;
    const vacancyRate = totalJobs > 0 ? openRoles / totalJobs : 0;
    const applicantsPerOpening = openRoles > 0 ? totalApplicants / openRoles : 0;

    // MoM: this month new apps vs last month new apps
    const thisMonthScreening = thisMonthApps.filter(a => ['Screening', 'Interview', 'Offer', 'Hired'].includes(a.stage)).length;
    const lastMonthScreening = lastMonthApps.filter(a => ['Screening', 'Interview', 'Offer', 'Hired'].includes(a.stage)).length;
    const thisMonthInterviewed = thisMonthApps.filter(a => ['Interview', 'Offer', 'Hired'].includes(a.stage)).length;
    const lastMonthInterviewed = lastMonthApps.filter(a => ['Interview', 'Offer', 'Hired'].includes(a.stage)).length;
    const thisMonthHired = thisMonthApps.filter(a => a.stage === 'Hired').length;
    const lastMonthHired = lastMonthApps.filter(a => a.stage === 'Hired').length;
    const thisMonthOffers = thisMonthApps.filter(a => ['Offer', 'Hired'].includes(a.stage)).length;
    const lastMonthOffers = lastMonthApps.filter(a => ['Offer', 'Hired'].includes(a.stage)).length;
    const thisMonthHiringRate = thisMonthOffers > 0 ? thisMonthHired / thisMonthOffers : 0;
    const lastMonthHiringRate = lastMonthOffers > 0 ? lastMonthHired / lastMonthOffers : 0;

    return {
      applicants: { current: totalApplicants, mom: calcMoM(thisMonthApps.length, lastMonthApps.length) },
      openRoles: { current: openRoles, mom: 0 },
      hiringRate: { current: hiringRate, mom: calcMoM(thisMonthHiringRate, lastMonthHiringRate) },
      screeningPassed: { current: screeningPassed, mom: calcMoM(thisMonthScreening, lastMonthScreening) },
      interviewed: { current: interviewed, mom: calcMoM(thisMonthInterviewed, lastMonthInterviewed) },
      hired: { current: hired, mom: calcMoM(thisMonthHired, lastMonthHired) },
      vacancyRate: { current: vacancyRate, mom: 0 },
      applicantsPerOpening: { current: applicantsPerOpening, mom: calcMoM(thisMonthApps.length, lastMonthApps.length) }
    };
  };

  // Calculate efficiency metrics
  const getEfficiency = (): Efficiency => {
    if (!applications || !costs) {
      return {
        timeToHireAvg: 0,
        acceptanceRate: 0,
        costPerHire: 0
      };
    }

    const hiredApps = applications.filter(a => a.stage === 'Hired');
    const timeToHire = hiredApps.map(app => {
      const applied = new Date(app.applied_at);
      const updated = new Date(app.updated_at);
      return Math.floor((updated.getTime() - applied.getTime()) / (1000 * 60 * 60 * 24));
    });
    const timeToHireAvg = timeToHire.length > 0
      ? Math.round(timeToHire.reduce((a, b) => a + b, 0) / timeToHire.length)
      : 0;

    const offers = applications.filter(a => ['Offer', 'Hired'].includes(a.stage)).length;
    const acceptanceRate = offers > 0 ? hiredApps.length / offers : 0;

    const totalCost = costs.reduce((sum, c) => sum + Number(c.amount), 0);
    const costPerHire = hiredApps.length > 0 ? totalCost / hiredApps.length : 0;

    return {
      timeToHireAvg,
      acceptanceRate,
      costPerHire: Math.round(costPerHire)
    };
  };

  // Calculate quality metrics
  const getQuality = (): Quality => {
    if (!candidates || !interviews || !applications) {
      return {
        aiFitScoreAvg: 0,
        interviewPassRate: 0,
        hrSatisfaction: 0
      };
    }

    const candidatesWithScore = candidates.filter(c => c.ai_fit_score !== null);
    const aiFitScoreAvg = candidatesWithScore.length > 0
      ? Math.round(candidatesWithScore.reduce((sum, c) => sum + (c.ai_fit_score || 0), 0) / candidatesWithScore.length)
      : 0;

    const completedInterviews = interviews.filter(i => i.status === 'completed' && i.result);
    const passedInterviews = completedInterviews.filter(i => i.result === 'passed').length;
    const interviewPassRate = completedInterviews.length > 0
      ? passedInterviews / completedInterviews.length
      : 0;

    // Calculate HR satisfaction from average interview scores (0-70 → 0-5 scale)
    const interviewsWithScores = interviews.filter(i => i.score !== null && i.score > 0);
    const hrSatisfaction = interviewsWithScores.length > 0
      ? Math.round((interviewsWithScores.reduce((sum, i) => sum + (i.score || 0), 0) / interviewsWithScores.length / 70) * 5 * 10) / 10
      : 0;

    return {
      aiFitScoreAvg,
      interviewPassRate,
      hrSatisfaction
    };
  };

  // Calculate stage stats
  const getStageStats = (): StageStats => {
    if (!applications) {
      return {
        applicants: 0,
        screening: 0,
        interview: 0,
        offer: 0,
        hired: 0,
        rejected: 0
      };
    }

    return {
      applicants: applications.filter(a => a.stage === 'New').length,
      screening: applications.filter(a => a.stage === 'Screening').length,
      interview: applications.filter(a => a.stage === 'Interview').length,
      offer: applications.filter(a => a.stage === 'Offer').length,
      hired: applications.filter(a => a.stage === 'Hired').length,
      rejected: applications.filter(a => a.stage === 'Rejected').length
    };
  };

  // Format positions for table
  const getPositionsForTable = (): Position[] => {
    if (!positions || !applications || !interviews) return [];

    return positions.map(pos => {
      const posApps = applications.filter(a => a.position_id === pos.id);
      const posInterviews = interviews.filter(i =>
        posApps.some(app => app.id === i.application_id)
      );
      const completedInterviews = posInterviews.filter(i => i.status === 'completed' && i.result);

      return {
        id: pos.id,
        title: pos.title,
        department: pos.department,
        applicants: posApps.length,
        interviewed: completedInterviews.length,
        passed: completedInterviews.filter(i => i.result === 'passed').length,
        failed: completedInterviews.filter(i => i.result === 'failed').length,
        status: pos.status === 'open' ? 'เปิดรับ' : 'เต็มแล้ว'
      };
    });
  };

  // Get source costs — use real sources from candidates
  const getSourcesCost = (): SourceCost[] => {
    if (!candidates || !applications || !costs) return [];

    // Get unique sources from actual candidate data
    const sourceSet = new Set<string>();
    candidates.forEach(c => {
      if (c.source) sourceSet.add(c.source);
    });
    const sources = Array.from(sourceSet).sort();

    if (sources.length === 0) return [];

    return sources.map(source => {
      const sourceCandidates = candidates.filter(c => c.source === source);
      const sourceApps = applications.filter(a =>
        sourceCandidates.some(c => c.id === a.candidate_id)
      );
      const hires = sourceApps.filter(a => a.stage === 'Hired').length;
      const sourceCosts = costs.filter(c => c.source === source);
      const spend = sourceCosts.reduce((sum, c) => sum + Number(c.amount), 0);

      return {
        source,
        applicants: sourceCandidates.length,
        hires,
        spend
      };
    });
  };

  // Get candidates for display
  const getCandidatesForDisplay = (): Candidate[] => {
    if (!applications || !candidates || !positions) return [];

    return applications.slice(0, 30).map(app => {
      const candidate = candidates.find(c => c.id === app.candidate_id);
      const position = positions.find(p => p.id === app.position_id);

      // Find interview score for this application
      const appInterviews = interviews?.filter(i => i.application_id === app.id) || [];
      const latestScore = appInterviews
        .filter(i => i.score !== null)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]?.score;

      return {
        id: app.id,
        name: candidate?.name || 'Unknown',
        positionId: position?.id || '',
        positionTitle: position?.title || 'Unknown',
        department: position?.department || 'Unknown',
        stage: app.stage as Candidate['stage'],
        aiFitScore: candidate?.ai_fit_score || undefined,
        interviewScore: latestScore || undefined,
        updatedAt: app.updated_at
      };
    });
  };

  // Get trend data (last 30 days)
  const getTrendData = () => {
    if (!applications) return [];

    const days = 30;
    const today = new Date();

    return Array.from({ length: days }, (_, i) => {
      const date = new Date(today);
      date.setDate(date.getDate() - (days - i - 1));

      const dayApps = applications.filter(app => {
        const appDate = new Date(app.applied_at);
        return appDate.toDateString() === date.toDateString();
      });

      const interviewed = dayApps.filter(a => ['Interview', 'Offer', 'Hired'].includes(a.stage)).length;
      const hired = dayApps.filter(a => a.stage === 'Hired').length;

      return {
        date: date.toLocaleDateString('th-TH', { day: '2-digit', month: 'short' }),
        applicants: dayApps.length,
        interviewed,
        hired
      };
    });
  };

  // Get yield ratios for heatmap
  const getYieldRatios = () => {
    if (!positions || !applications || !interviews) return [];

    return positions.map(pos => {
      const posApps = applications.filter(a => a.position_id === pos.id);
      const total = posApps.length;
      const screening = posApps.filter(a => ['Screening', 'Interview', 'Offer', 'Hired'].includes(a.stage)).length;
      const interview = posApps.filter(a => ['Interview', 'Offer', 'Hired'].includes(a.stage)).length;
      const offer = posApps.filter(a => ['Offer', 'Hired'].includes(a.stage)).length;
      const hired = posApps.filter(a => a.stage === 'Hired').length;

      return {
        position: pos.title,
        department: pos.department,
        applyToScreen: total > 0 ? screening / total : 0,
        screenToInterview: screening > 0 ? interview / screening : 0,
        interviewToOffer: interview > 0 ? offer / interview : 0,
        offerToHire: offer > 0 ? hired / offer : 0
      };
    });
  };

  return {
    isLoading,
    headlineStats: getHeadlineStats(),
    efficiency: getEfficiency(),
    quality: getQuality(),
    stageStats: getStageStats(),
    positions: getPositionsForTable(),
    sourcesCost: getSourcesCost(),
    candidates: getCandidatesForDisplay(),
    trendData: getTrendData(),
    yieldRatios: getYieldRatios(),
  };
}
