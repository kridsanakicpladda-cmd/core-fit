import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState, useMemo } from "react";
import { CompanyProfile } from "@/components/dashboard/CompanyProfile";
import { ContactMap } from "@/components/dashboard/ContactMap";
import { EmployeeBenefits } from "@/components/dashboard/EmployeeBenefits";
import { JobDetailDialog } from "@/components/jobs/JobDetailDialog";
import { CandidateDetailDialog } from "@/components/candidates/CandidateDetailDialog";
import { Candidate } from "@/contexts/CandidatesContext";
import { useJobPositions } from "@/hooks/useJobPositions";
import { useCandidatesData } from "@/hooks/useCandidatesData";


export default function Dashboard() {
  // Fetch real data from database
  const { data: jobPositions = [], isLoading: isLoadingJobs } = useJobPositions();
  const { candidates, isLoading: isLoadingCandidates } = useCandidatesData();

  // Filter only open positions
  const openPositions = useMemo(() => {
    return jobPositions
      .filter(job => job.status === 'open')
      .map(job => {
        // Count candidates for this position by matching position_id OR position_title
        const applicantCount = candidates.filter(
          c => c.job_position_id === job.id || c.position_title === job.title
        ).length;

        return {
          id: job.id,
          title: job.title,
          department: job.department || 'ไม่ระบุ',
          location: job.location || 'กรุงเทพฯ',
          type: job.type || 'Full-time',
          applicants: applicantCount,
          postedDate: job.created_at ? new Date(job.created_at).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' }) : 'ไม่ระบุ',
          status: job.status as 'open' | 'closed',
          avgScore: 0,
          salaryRange: job.salary_range || 'ตามตกลง',
          numberOfPositions: job.number_of_positions?.toString() || '1',
          jobGrade: job.job_grade || '-',
          description: job.description || '',
          requirements: job.requirements || [],
          responsibilities: job.responsibilities || [],
          interviewStats: { total: applicantCount, passed: 0, failed: 0 }
        };
      });
  }, [jobPositions, candidates]);

  const [selectedJob, setSelectedJob] = useState<typeof openPositions[0] | null>(null);
  const [jobDialogOpen, setJobDialogOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [candidateDialogOpen, setCandidateDialogOpen] = useState(false);

  const handleJobClick = (job: typeof openPositions[0]) => {
    setSelectedJob(job);
    setJobDialogOpen(true);
  };

  const handleCandidateClick = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setCandidateDialogOpen(true);
  };
  return (
    <div className="space-y-8 pb-8">
      {/* Hero Section - Company Profile */}
      <section className="animate-fade-in">
        <CompanyProfile />
      </section>

      {/* Benefits Section */}
      <section className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <EmployeeBenefits />
      </section>

      {/* Divider */}
      <div className="relative py-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border/50"></div>
        </div>
        <div className="relative flex justify-center">
          <span className="bg-background px-4 text-sm text-muted-foreground font-medium">
            ร่วมงานกับเรา
          </span>
        </div>
      </div>

      {/* Open Positions Section */}
      <section className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
        <Card className="hover:shadow-lg transition-all duration-300 border-border/50">
          <CardHeader className="pb-4 space-y-2">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-2xl">
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                ตำแหน่งที่เปิดรับสมัคร
              </CardTitle>
              <Badge variant="outline" className="text-sm">
                {openPositions.length} ตำแหน่ง
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              เลือกตำแหน่งที่เหมาะสมกับคุณและก้าวสู่ความสำเร็จไปกับเรา
            </p>
          </CardHeader>
          <CardContent>
            {(isLoadingJobs || isLoadingCandidates) ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">กำลังโหลดข้อมูล...</span>
              </div>
            ) : openPositions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>ยังไม่มีตำแหน่งงานที่เปิดรับสมัคร</p>
              </div>
            ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {openPositions.map((position) => (
                <div
                  key={position.id}
                  className="group relative p-5 rounded-xl bg-gradient-to-br from-card to-accent/5 hover:from-primary/5 hover:to-primary/10 border border-border/50 hover:border-primary/40 transition-all duration-300 cursor-pointer hover:shadow-lg hover:-translate-y-1"
                  onClick={() => handleJobClick(position)}
                >
                  {/* Position Badge */}
                  <div className="absolute top-3 right-3">
                    <Badge 
                      variant={position.status === "open" ? "default" : "secondary"} 
                      className="text-xs shadow-sm"
                    >
                      {position.status === "open" ? "เปิดรับ" : "ปิดรับ"}
                    </Badge>
                  </div>

                  <div className="space-y-3 pr-16">
                    {/* Title & Department */}
                    <div>
                      <h3 className="font-bold text-base group-hover:text-primary transition-colors mb-1 line-clamp-2">
                        {position.title}
                      </h3>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <div className="h-1 w-1 rounded-full bg-muted-foreground/50" />
                        {position.department}
                      </p>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-xs pt-2 border-t border-border/30">
                      <div className="flex items-center gap-1.5">
                        <div className="h-2 w-2 rounded-full bg-primary/60" />
                        <span className="text-muted-foreground">
                          <span className="font-semibold text-foreground">{position.numberOfPositions}</span> อัตรา
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="h-2 w-2 rounded-full bg-success/60" />
                        <span className="text-muted-foreground">
                          <span className="font-semibold text-foreground">{position.applicants}</span> ผู้สมัคร
                        </span>
                      </div>
                    </div>

                    {/* Hover Effect */}
                    <div className="pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-xs text-primary font-medium flex items-center gap-1">
                        ดูรายละเอียด
                        <span className="group-hover:translate-x-1 transition-transform">→</span>
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Divider */}
      <div className="relative py-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border/50"></div>
        </div>
        <div className="relative flex justify-center">
          <span className="bg-background px-4 text-sm text-muted-foreground font-medium">
            ติดต่อเรา
          </span>
        </div>
      </div>

      {/* Contact & Map Section */}
      <section className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
        <ContactMap />
      </section>

      {/* Job Detail Dialog */}
      <JobDetailDialog 
        job={selectedJob}
        open={jobDialogOpen}
        onOpenChange={setJobDialogOpen}
        onEdit={() => {}}
        onDelete={() => {}}
        onViewCandidates={() => {}}
      />

      {/* Candidate Detail Dialog */}
      <CandidateDetailDialog
        candidate={selectedCandidate}
        open={candidateDialogOpen}
        onOpenChange={setCandidateDialogOpen}
        onEdit={() => {}}
        onDelete={() => {}}
        onInterviewUpdate={() => {}}
        onTestScoreUpdate={() => {}}
        onStatusChange={() => {}}
      />
    </div>
  );
}
