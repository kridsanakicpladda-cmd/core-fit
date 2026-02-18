import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useNotifications } from "@/contexts/NotificationContext";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Mail, Phone, MapPin, Calendar, Briefcase, GraduationCap, Star, FileText, Edit, Trash2, CheckCircle2, Circle, Heart, X, Download, User, Sparkles, Loader2 } from "lucide-react";
import { SingleInterviewDialog } from "./SingleInterviewDialog";
import { CombinedInterviewDialog } from "./CombinedInterviewDialog";
import { TestScoreDialog } from "./TestScoreDialog";
import { ResumeDialog } from "./ResumeDialog";
import { exportCandidateEvaluationPDF } from "@/lib/exportCandidateEvaluationPDF";
import { useCandidateDetails } from "@/hooks/useCandidateDetails";
import { useCalculateFitScore } from "@/hooks/useCalculateFitScore";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

interface CandidateDetailDialogProps {
  candidate: {
    id: number | string;
    name: string;
    position?: string;
    position_title?: string;
    experience?: string;
    score?: number;
    ai_fit_score?: number | null;
    skills?: string[];
    appliedDate?: string;
    applied_at?: string;
    status?: string;
    stage?: string;
    pipelineStatus?: string;
    email?: string;
    phone?: string | null;
    location?: string;
    education?: string;
    summary?: string;
    previousCompany?: string;
    photoUrl?: string;
    photo_url?: string | null;
    resumeUrl?: string;
    resume_url?: string | null;
    source?: string;
    application_id?: string | null;
    job_position_id?: string | null;
    ai_fit_breakdown?: {
      experience?: number;
      qualifications?: number;
      education?: number;
      skills?: number;
    } | null;
    testScores?: {
      hrTest?: number;
      departmentTest?: number;
    };
    interviews?: {
      hr?: { date: string; passed: boolean; feedback: string };
      manager?: { 
        date: string; 
        passed: boolean; 
        feedback: string;
        total_score?: number;
        scores?: {
          skill_knowledge?: number;
          communication?: number;
          creativity?: number;
          motivation?: number;
          teamwork?: number;
          analytical?: number;
          culture_fit?: number;
        };
      };
      isTeam?: { 
        date: string; 
        passed: boolean; 
        feedback: string;
        total_score?: number;
        scores?: {
          skill_knowledge?: number;
          communication?: number;
          creativity?: number;
          motivation?: number;
          teamwork?: number;
          analytical?: number;
          culture_fit?: number;
        };
      };
    };
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
  onInterviewUpdate: (candidateId: number | string, interviews: any) => void;
  onTestScoreUpdate: (candidateId: number | string, testScores: any) => void;
  onStatusChange?: (candidateId: number | string, status: string) => void;
}

const statusColors = {
  screening: "bg-blue-100 text-blue-700 border-blue-200",
  interview: "bg-orange-100 text-orange-700 border-orange-200",
  shortlisted: "bg-green-100 text-green-700 border-green-200",
  rejected: "bg-red-100 text-red-700 border-red-200",
  hired: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

const statusLabels = {
  screening: "กำลังคัดกรอง",
  interview: "รอสัมภาษณ์",
  shortlisted: "รายชื่อสั้น",
  rejected: "ไม่ผ่านคัดเลือก",
  hired: "รับเข้าทำงาน",
};

const pipelineSteps = [
  { key: 'pre_screening', label: 'Pre-screening' },
  { key: 'interview_1', label: 'Interview 1' },
  { key: 'interview_2', label: 'Interview 2' },
  { key: 'offer', label: 'Offer' },
  { key: 'hired', label: 'Hired' },
];

export function CandidateDetailDialog({ candidate, open, onOpenChange, onEdit, onDelete, onInterviewUpdate, onTestScoreUpdate, onStatusChange }: CandidateDetailDialogProps) {
  const { addNotification } = useNotifications();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const calculateFitScore = useCalculateFitScore();
  const [isCalculatingScore, setIsCalculatingScore] = useState(false);
  const [currentScore, setCurrentScore] = useState<number | null>(null);
  const [scoreBreakdown, setScoreBreakdown] = useState<{
    experience?: number;
    qualifications?: number;
    education?: number;
    skills?: number;
  } | null>(null);

  // Reset state when candidate changes
  useEffect(() => {
    setCurrentScore(null);
    setScoreBreakdown(null);
  }, [candidate?.id]);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [showTestScoreDialog, setShowTestScoreDialog] = useState(false);
  const [showResumeDialog, setShowResumeDialog] = useState(false);
  const [activeInterview, setActiveInterview] = useState<'hr' | null>(null);
  const [combinedInterviewOpen, setCombinedInterviewOpen] = useState(false);
  const [showPipelineConfirm, setShowPipelineConfirm] = useState(false);
  const [selectedPipelineStep, setSelectedPipelineStep] = useState<string | null>(null);
  
  // Fetch candidate details from candidate_details table
  const { 
    data: candidateDetails, 
    isLoading: detailsLoading, 
    updateTestScores, 
    updatePreScreen, 
    updateFirstInterview,
    updateFinalInterview,
    preScreenInterview,
    firstInterview,
    finalInterview,
  } = useCandidateDetails(candidate?.id?.toString() || null);
  
  if (!candidate) return null;

  const currentPipelineIndex = pipelineSteps.findIndex(step => step.key === candidate.pipelineStatus);
  
  const handleStatusChange = (status: string) => {
    console.log('CandidateDetailDialog handleStatusChange:', { 
      status, 
      candidateId: candidate.id, 
      currentStage: candidate.stage,
      currentStatus: candidate.status 
    });
    
    if (onStatusChange) {
      const statusLabelsMap: Record<string, string> = {
        shortlisted: "Shortlist",
        interested: "Interested",
        not_interested: "Not interested",
      };
      
      // Map UI status to database stage
      const statusToStageMap: Record<string, string> = {
        shortlisted: "Shortlist",  // Shortlist maps to Shortlist stage
        interested: "Interested",   // Interested maps to Interested stage
        not_interested: "Rejected",  // Not interested maps to Rejected stage
      };
      
      const dbStage = statusToStageMap[status] || status;
      console.log('Calling onStatusChange with:', { candidateId: candidate.id, dbStage });
      onStatusChange(candidate.id, dbStage);
      
      addNotification({
        type: 'status_change',
        title: 'เปลี่ยนสถานะผู้สมัคร',
        description: `ย้าย ${candidate.name} ไปยังแท็บ ${statusLabelsMap[status]}`,
        candidateName: candidate.name,
        oldStatus: statusLabelsMap[candidate.status || ''] || candidate.stage || 'Pending',
        newStatus: statusLabelsMap[status],
      });
      
      onOpenChange(false);
    } else {
      console.error('onStatusChange is not defined!');
    }
  };

  const handlePipelineStepClick = (stepKey: string) => {
    if (stepKey !== candidate.pipelineStatus) {
      setSelectedPipelineStep(stepKey);
      setShowPipelineConfirm(true);
    }
  };

  const handleConfirmPipelineChange = () => {
    if (selectedPipelineStep && onStatusChange) {
      const stepLabels: Record<string, string> = {
        pre_screening: 'Pre-screening',
        interview_1: 'Interview 1',
        interview_2: 'Interview 2',
        offer: 'Offer',
        hired: 'Hired',
      };
      
      // Update pipeline status through a custom handler or adapt the existing one
      // For now, we'll use a workaround by updating the candidate directly
      const event = new CustomEvent('pipelineStatusChange', {
        detail: {
          candidateId: candidate.id,
          newStatus: selectedPipelineStep,
        }
      });
      window.dispatchEvent(event);
      
      addNotification({
        type: 'status_change',
        title: 'เปลี่ยน Pipeline Status',
        description: `เปลี่ยนสถานะของ ${candidate.name} เป็น ${stepLabels[selectedPipelineStep]}`,
        candidateName: candidate.name,
        oldStatus: stepLabels[candidate.pipelineStatus || 'pre_screening'],
        newStatus: stepLabels[selectedPipelineStep],
      });
      
      setShowPipelineConfirm(false);
      setSelectedPipelineStep(null);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteAlert(true);
  };

  const handleConfirmDelete = () => {
    onDelete();
    setShowDeleteAlert(false);
  };

  const handleTestScoreSave = (testScores: { hrTest?: number; departmentTest?: number }) => {
    updateTestScores({
      candidateId: candidate.id.toString(),
      hrTestScore: testScores.hrTest,
      departmentTestScore: testScores.departmentTest,
    });
    onTestScoreUpdate(candidate.id, testScores);
  };

  const handleSingleInterviewSave = (interviewData: { date: string; passed: boolean; feedback: string }) => {
    // Save to database if it's HR/Pre-screen interview
    if (activeInterview === 'hr' && candidate.application_id) {
      updatePreScreen({
        applicationId: candidate.application_id,
        date: interviewData.date,
        passed: interviewData.passed,
        feedback: interviewData.feedback,
      });
    }
    
    const updatedInterviews = {
      ...candidate.interviews,
      [activeInterview as string]: interviewData,
    };
    onInterviewUpdate(candidate.id, updatedInterviews);
    setActiveInterview(null);
  };

  const handleCombinedInterviewSave = async (interviews: any) => {
    console.log('handleCombinedInterviewSave called with:', interviews);
    console.log('candidate.application_id:', candidate.application_id);
    
    // Save to database
    if (candidate.application_id) {
      // Save First Interview (Manager)
      if (interviews.manager?.date) {
        console.log('Saving First Interview:', interviews.manager);
        updateFirstInterview({
          applicationId: candidate.application_id,
          date: interviews.manager.date,
          passed: interviews.manager.passed,
          feedback: interviews.manager.feedback,
          scores: interviews.manager.scores,
          totalScore: interviews.manager.total_score,
        });
      }
      
      // Save Final Interview (IS)
      if (interviews.isTeam?.date) {
        console.log('Saving Final Interview:', interviews.isTeam);
        updateFinalInterview({
          applicationId: candidate.application_id,
          date: interviews.isTeam.date,
          passed: interviews.isTeam.passed,
          feedback: interviews.isTeam.feedback,
          scores: interviews.isTeam.scores,
          totalScore: interviews.isTeam.total_score,
        });
      }
    } else {
      console.error('No application_id found for candidate:', candidate.id);
      console.log('Creating application first...');
      
      // Create application if not exists
      try {
        // First, try to get a position_id (use the first available position or create a default one)
        const { data: positions } = await supabase
          .from('job_positions')
          .select('id')
          .limit(1);
        
        const positionId = positions && positions.length > 0 ? positions[0].id : null;
        
        if (!positionId) {
          console.error('No position found. Cannot create application without position_id');
          return;
        }
        
        const { data: newApp, error } = await supabase
          .from('applications')
          .insert({
            candidate_id: candidate.id,
            position_id: positionId,
            stage: 'Screening',
          })
          .select()
          .single();
          
        if (error) throw error;
        
        console.log('Created application:', newApp);
        
        // Now save interviews with new application_id
        if (interviews.manager?.date && newApp) {
          updateFirstInterview({
            applicationId: newApp.id,
            date: interviews.manager.date,
            passed: interviews.manager.passed,
            feedback: interviews.manager.feedback,
            scores: interviews.manager.scores,
            totalScore: interviews.manager.total_score,
          });
        }
        
        if (interviews.isTeam?.date && newApp) {
          updateFinalInterview({
            applicationId: newApp.id,
            date: interviews.isTeam.date,
            passed: interviews.isTeam.passed,
            feedback: interviews.isTeam.feedback,
            scores: interviews.isTeam.scores,
            totalScore: interviews.isTeam.total_score,
          });
        }
      } catch (error) {
        console.error('Error creating application:', error);
      }
    }

    const updatedInterviews = {
      ...candidate.interviews,
      manager: interviews.manager,
      isTeam: interviews.isTeam,
    };
    onInterviewUpdate(candidate.id, updatedInterviews);
  };

  const handleInterviewEdit = (type: 'hr') => {
    setActiveInterview(type);
  };

  const handleGenerateAIScore = async () => {
    setIsCalculatingScore(true);

    try {
      let jobPositionId = candidate.job_position_id;

      // If no job_position_id but has position_title, try to find matching job position
      if (!jobPositionId && (candidate.position || candidate.position_title)) {
        const positionTitle = candidate.position || candidate.position_title;
        const { data: matchingPosition } = await supabase
          .from("job_positions")
          .select("id")
          .ilike("title", `%${positionTitle}%`)
          .limit(1)
          .single();

        if (matchingPosition) {
          jobPositionId = matchingPosition.id;
        }
      }

      if (!jobPositionId) {
        // Still no job position found, get first available position as fallback
        const { data: anyPosition } = await supabase
          .from("job_positions")
          .select("id")
          .limit(1)
          .single();

        if (anyPosition) {
          jobPositionId = anyPosition.id;
        } else {
          toast({
            title: "ไม่สามารถคำนวณได้",
            description: "ไม่พบตำแหน่งงานในระบบ กรุณาสร้างตำแหน่งงานก่อน",
            variant: "destructive",
          });
          setIsCalculatingScore(false);
          return;
        }
      }

      calculateFitScore.mutate(
        {
          candidateId: candidate.id.toString(),
          applicationId: candidate.application_id || undefined,
          jobPositionId: jobPositionId,
        },
        {
          onSuccess: (data) => {
            // Save the score and breakdown
            setCurrentScore(data.score);
            if (data.breakdown) {
              setScoreBreakdown(data.breakdown);
            }
            // Invalidate queries to refresh data
            queryClient.invalidateQueries({ queryKey: ["candidates-data"] });
          },
          onSettled: () => {
            setIsCalculatingScore(false);
          },
        }
      );
    } catch (error) {
      console.error("Error in handleGenerateAIScore:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถคำนวณคะแนนได้",
        variant: "destructive",
      });
      setIsCalculatingScore(false);
    }
  };

  const handleDownloadEvaluation = () => {
    // Map candidate data to the format expected by exportCandidateEvaluationPDF
    const candidateData = {
      name: candidate.name,
      email: candidate.email || '',
      phone: candidate.phone || '',
      position: candidate.position || candidate.position_title || '',
      source: candidate.source || 'Job Application',
      aiScore: candidate.score ?? candidate.ai_fit_score ?? 0,
      interviews: {
        hr: candidate.interviews?.hr ? {
          date: candidate.interviews.hr.date,
          passed: candidate.interviews.hr.passed,
          feedback: candidate.interviews.hr.feedback,
        } : undefined,
        manager: candidate.interviews?.manager ? {
          date: candidate.interviews.manager.date,
          passed: candidate.interviews.manager.passed,
          feedback: candidate.interviews.manager.feedback,
          scores: candidate.interviews.manager.scores,
          total_score: candidate.interviews.manager.total_score,
        } : undefined,
        isTeam: candidate.interviews?.isTeam ? {
          date: candidate.interviews.isTeam.date,
          passed: candidate.interviews.isTeam.passed,
          feedback: candidate.interviews.isTeam.feedback,
          scores: candidate.interviews.isTeam.scores,
          total_score: candidate.interviews.isTeam.total_score,
        } : undefined,
      },
    };
    
    exportCandidateEvaluationPDF(candidateData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              {/* Candidate Photo */}
              <Avatar className="h-20 w-20 border-4 border-primary/20 shadow-lg">
                <AvatarImage src={candidate.photoUrl || candidate.photo_url || undefined} alt={candidate.name} />
                <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-primary to-primary/80 text-white">
                  {candidate.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              
              {/* Candidate Info */}
              <div className="flex-1">
                <DialogTitle className="text-2xl mb-2">{candidate.name}</DialogTitle>
                <div className="flex items-center gap-2">
                  <Badge className={statusColors[(candidate.status || candidate.stage || 'screening') as keyof typeof statusColors] || statusColors.screening}>
                    {statusLabels[(candidate.status || candidate.stage || 'screening') as keyof typeof statusLabels] || (candidate.stage || 'New')}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    สมัครเมื่อ: {candidate.appliedDate || candidate.applied_at || 'ไม่ระบุ'}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Score Badge - Moved to top right */}
            <div className="relative flex-shrink-0">
              <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                {candidate.score ?? candidate.ai_fit_score ?? '-'}
              </div>
              {(candidate.score ?? candidate.ai_fit_score ?? 0) >= 90 && (
                <div className="absolute -top-1 -right-1 h-6 w-6 bg-yellow-400 rounded-full flex items-center justify-center">
                  <Star className="h-3 w-3 text-white fill-white" />
                </div>
              )}
            </div>
          </div>
        </DialogHeader>

        {/* Action Buttons - Moved to top */}
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-4">จัดการผู้สมัคร</h3>
          <div className="flex gap-3">
            <Button 
              variant={(candidate.status === 'shortlisted' || candidate.stage === 'Shortlist') ? 'default' : 'outline'}
              className="flex-1"
              onClick={() => handleStatusChange('shortlisted')}
            >
              <Star className="h-4 w-4 mr-2" />
              Shortlist
            </Button>
            <Button 
              variant={(candidate.status === 'interested' || candidate.stage === 'Interested') ? 'default' : 'outline'}
              className="flex-1"
              onClick={() => handleStatusChange('interested')}
            >
              <Heart className="h-4 w-4 mr-2" />
              Interested
            </Button>
            <Button 
              variant={(candidate.status === 'not_interested' || candidate.stage === 'Rejected') ? 'destructive' : 'outline'}
              className="flex-1"
              onClick={() => handleStatusChange('not_interested')}
            >
              <X className="h-4 w-4 mr-2" />
              Not interested
            </Button>
          </div>
        </div>

        <Separator className="my-6" />

        <div className="space-y-6 mt-4">
          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-semibold mb-3">ข้อมูลติดต่อ</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {candidate.email && (
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{candidate.email}</span>
                </div>
              )}
              {(candidate.phone || candidateDetails?.mobile_phone) && (
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{candidate.phone || candidateDetails?.mobile_phone}</span>
                </div>
              )}
              {(candidate.location || candidateDetails?.present_address) && (
                <div className="flex items-center gap-3 text-sm col-span-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {candidateDetails?.present_address 
                      ? `${candidateDetails.present_address}${candidateDetails.district ? `, ${candidateDetails.district}` : ''}${candidateDetails.province ? `, ${candidateDetails.province}` : ''}${candidateDetails.zip_code ? ` ${candidateDetails.zip_code}` : ''}`
                      : candidate.location}
                  </span>
                </div>
              )}
              {candidateDetails?.birth_date && (
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>วันเกิด: {new Date(candidateDetails.birth_date).toLocaleDateString('th-TH')}</span>
                </div>
              )}
              {candidateDetails?.id_card && (
                <div className="flex items-center gap-3 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>บัตรประชาชน: {candidateDetails.id_card}</span>
                </div>
              )}
            </div>
          </div>

          {/* Personal Information from Quick Apply */}
          {(candidateDetails?.sex || candidateDetails?.weight || candidateDetails?.height || candidateDetails?.age) && (
            <>
              <Separator />
              <div>
                <h3 className="text-lg font-semibold mb-3">ข้อมูลส่วนตัว</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {candidateDetails?.sex && (
                    <div className="p-3 border rounded-lg bg-muted/20 text-center">
                      <div className="text-xs text-muted-foreground mb-1">เพศ</div>
                      <div className="font-medium">{candidateDetails.sex}</div>
                    </div>
                  )}
                  {candidateDetails?.age && (
                    <div className="p-3 border rounded-lg bg-muted/20 text-center">
                      <div className="text-xs text-muted-foreground mb-1">อายุ</div>
                      <div className="font-medium">{candidateDetails.age} ปี</div>
                    </div>
                  )}
                  {candidateDetails?.weight && (
                    <div className="p-3 border rounded-lg bg-muted/20 text-center">
                      <div className="text-xs text-muted-foreground mb-1">น้ำหนัก</div>
                      <div className="font-medium">{candidateDetails.weight} กก.</div>
                    </div>
                  )}
                  {candidateDetails?.height && (
                    <div className="p-3 border rounded-lg bg-muted/20 text-center">
                      <div className="text-xs text-muted-foreground mb-1">ส่วนสูง</div>
                      <div className="font-medium">{candidateDetails.height} ซม.</div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          <Separator />

          {/* Resume File */}
          {(candidate.resumeUrl || candidate.resume_url) && (
            <div>
              <h3 className="text-lg font-semibold mb-3">เอกสารประกอบการสมัคร</h3>
              <div className="flex items-center gap-3 p-4 border rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors">
                <FileText className="h-8 w-8 text-primary" />
                <div className="flex-1">
                  <div className="font-medium">Resume / CV</div>
                  <div className="text-sm text-muted-foreground">คลิกเพื่อดูไฟล์ Resume ฉบับเต็ม</div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.open(candidate.resumeUrl || candidate.resume_url || '', '_blank')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  เปิดดู
                </Button>
              </div>
            </div>
          )}

          {(candidate.resumeUrl || candidate.resume_url) && <Separator />}

          {/* Position & Experience */}
          <div>
            <h3 className="text-lg font-semibold mb-3">ตำแหน่งที่สมัคร</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <div>
                  <span className="font-medium">
                    {candidateDetails?.position || candidate.position || candidate.position_title || 'ไม่ระบุ'}
                  </span>
                  {candidateDetails?.expected_salary && (
                    <span className="text-muted-foreground ml-2">• เงินเดือนที่คาดหวัง: {candidateDetails.expected_salary.toLocaleString()} บาท</span>
                  )}
                </div>
              </div>
              {candidate.education && (
                <div className="flex items-start gap-3 text-sm">
                  <GraduationCap className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <span className="whitespace-pre-wrap">{candidate.education}</span>
                </div>
              )}
              {candidate.previousCompany && (
                <div className="flex items-center gap-3 text-sm">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <span>บริษัทเดิม: {candidate.previousCompany}</span>
                </div>
              )}
              {candidateDetails?.training_curriculums && (
                <div className="flex items-center gap-3 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>ประเภทงาน: {candidateDetails.training_curriculums}</span>
                </div>
              )}
              {candidateDetails?.relatives_at_icp && (
                <div className="flex items-center gap-3 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>รู้จักบริษัทในเครือ ICPG: {candidateDetails.relatives_at_icp}</span>
                </div>
              )}
              {candidateDetails?.relatives_at_icp_details && (
                <div className="flex items-center gap-3 text-sm">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <span>ชื่อบริษัทที่รู้จัก: {candidateDetails.relatives_at_icp_details}</span>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Work Experience from Quick Apply (stored in other_skills) */}
          {(candidateDetails?.other_skills || candidateDetails?.work_experience) && (
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary" />
                ประสบการณ์ฝึกงาน/ทำงาน
              </h3>
              <div className="p-4 border rounded-lg bg-muted/20">
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {candidateDetails?.other_skills || candidateDetails?.work_experience}
                </p>
              </div>
            </div>
          )}

          {/* Employment Record */}
          {candidateDetails?.employment_records && candidateDetails.employment_records.length > 0 && (
            <>
              <Separator />
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-primary" />
                  ประวัติการทำงาน (รายละเอียด)
                </h3>
              <div className="space-y-4">
                {candidateDetails.employment_records.map((record: any, index: number) => (
                  <div key={index} className="p-4 border rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="font-semibold text-base">{record.position || 'ไม่ระบุตำแหน่ง'}</div>
                        <div className="text-sm text-primary font-medium">{record.company || 'ไม่ระบุบริษัท'}</div>
                      </div>
                      <Badge variant="outline" className="ml-2">
                        ประสบการณ์ที่ {index + 1}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                      {record.period_time && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">ระยะเวลา:</span>
                          <span className="font-medium">{record.period_time}</span>
                        </div>
                      )}
                      {record.salary && (
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">เงินเดือน:</span>
                          <span className="font-medium">{record.salary.toLocaleString()} บาท</span>
                        </div>
                      )}
                    </div>

                    {record.responsibilities && (
                      <div className="mb-3">
                        <div className="text-sm text-muted-foreground mb-1">หน้าที่รับผิดชอบ:</div>
                        <div className="text-sm whitespace-pre-wrap bg-background/50 p-3 rounded border">
                          {record.responsibilities}
                        </div>
                      </div>
                    )}

                    {record.reason_for_leaving && (
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">เหตุผลที่ลาออก:</div>
                        <div className="text-sm text-muted-foreground italic">
                          {record.reason_for_leaving}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            </>
          )}

          <Separator />

          {/* Summary / Skills */}
          {candidate.summary && (
            <div>
              <h3 className="text-lg font-semibold mb-3">ข้อมูลสรุป / ทักษะ</h3>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {candidate.summary}
              </p>
            </div>
          )}

          <Separator />

          {/* Pipeline Status */}
          <div>
            <h3 className="text-lg font-semibold mb-4">สถานะการสรรหา</h3>
            <div className="flex items-center justify-between gap-2">
              {pipelineSteps.map((step, index) => {
                const isCompleted = currentPipelineIndex >= index;
                const isCurrent = currentPipelineIndex === index;
                return (
                  <div key={step.key} className="flex items-center flex-1">
                    <div className="flex flex-col items-center flex-1">
                      <button
                        onClick={() => handlePipelineStepClick(step.key)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                          isCompleted 
                            ? 'bg-primary border-primary text-primary-foreground hover:scale-110' 
                            : 'bg-background border-muted-foreground/30 text-muted-foreground hover:border-primary/50 hover:scale-110'
                        } ${!isCurrent && 'cursor-pointer'}`}
                        disabled={isCurrent}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="h-5 w-5" />
                        ) : (
                          <Circle className="h-5 w-5" />
                        )}
                      </button>
                      <span className={`text-xs mt-2 text-center ${isCurrent ? 'font-semibold' : 'text-muted-foreground'}`}>
                        {step.label}
                      </span>
                    </div>
                    {index < pipelineSteps.length - 1 && (
                      <div className={`h-0.5 flex-1 -mt-6 ${
                        currentPipelineIndex > index ? 'bg-primary' : 'bg-muted-foreground/30'
                      }`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <Separator />

          {/* Skills */}
          {(candidate.skills && candidate.skills.length > 0) && (
            <div>
              <h3 className="text-lg font-semibold mb-3">ทักษะ</h3>
              <div className="flex flex-wrap gap-2">
                {candidate.skills.map((skill, index) => (
                  <Badge key={index} variant="outline" className="text-sm">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* AI Fit Score Breakdown */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-semibold">AI Fit Score</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateAIScore}
                  disabled={isCalculatingScore}
                  className="gap-2"
                >
                  {isCalculatingScore ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      กำลังคำนวณ...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Generate AI Score
                    </>
                  )}
                </Button>
              </div>
              <div className="text-2xl font-bold text-primary">
                {currentScore ?? candidate.score ?? candidate.ai_fit_score ?? '-'}%
                <span className="text-sm text-muted-foreground ml-1">Overall Match</span>
              </div>
            </div>
            <div className="space-y-3">
              {(() => {
                const breakdown = scoreBreakdown || candidate.ai_fit_breakdown;
                return (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">ประสบการณ์ทำงานที่ตรงกับตำแหน่งงาน (65%)</span>
                      <div className="flex items-center gap-2">
                        <div className="w-48 bg-secondary rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${breakdown?.experience ?? 0}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium w-12 text-right">
                          {breakdown?.experience !== undefined ? `${breakdown.experience}%` : '-'}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">คุณสมบัติ (10%)</span>
                      <div className="flex items-center gap-2">
                        <div className="w-48 bg-secondary rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${breakdown?.qualifications ?? 0}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium w-12 text-right">
                          {breakdown?.qualifications !== undefined ? `${breakdown.qualifications}%` : '-'}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">วุฒิการศึกษา (10%)</span>
                      <div className="flex items-center gap-2">
                        <div className="w-48 bg-secondary rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${breakdown?.education ?? 0}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium w-12 text-right">
                          {breakdown?.education !== undefined ? `${breakdown.education}%` : '-'}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">ทักษะและความสามารถอื่น ๆ (15%)</span>
                      <div className="flex items-center gap-2">
                        <div className="w-48 bg-secondary rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${breakdown?.skills ?? 0}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium w-12 text-right">
                          {breakdown?.skills !== undefined ? `${breakdown.skills}%` : '-'}
                        </span>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>

          <Separator />

          {/* Test Scores */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">คะแนนแบบทดสอบ</h3>
              <Button variant="outline" size="sm" onClick={() => setShowTestScoreDialog(true)}>
                <Edit className="h-4 w-4 mr-2" />
                แก้ไข
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg bg-muted/20">
                <div className="text-sm text-muted-foreground mb-1">แบบทดสอบส่วนกลาง (HR)</div>
                <div className="text-3xl font-bold text-primary">
                  {candidateDetails?.hr_test_score ?? candidate.testScores?.hrTest ?? "-"}
                </div>
              </div>
              <div className="p-4 border rounded-lg bg-muted/20">
                <div className="text-sm text-muted-foreground mb-1">แบบทดสอบเฉพาะแผนก</div>
                <div className="text-3xl font-bold text-primary">
                  {candidateDetails?.department_test_score ?? candidate.testScores?.departmentTest ?? "-"}
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Interview Details */}
          <div>
            <h3 className="text-lg font-semibold mb-4">ข้อมูลการสัมภาษณ์</h3>
            <div className="space-y-4">
              {/* HR Interview */}
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="font-semibold text-sm">Pre Screen</div>
                  <Button variant="ghost" size="sm" onClick={() => handleInterviewEdit('hr')}>
                    <Edit className="h-4 w-4 mr-1" />
                    แก้ไข
                  </Button>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground mb-1">วันที่สัมภาษณ์</div>
                    <div>
                      {preScreenInterview?.scheduled_at 
                        ? new Date(preScreenInterview.scheduled_at).toLocaleDateString('th-TH')
                        : candidate.interviews?.hr?.date || "-"}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground mb-1">ผลการสัมภาษณ์</div>
                    <div>
                      {preScreenInterview?.result ? (
                        <Badge variant={preScreenInterview.result === "passed" ? "default" : "destructive"}>
                          {preScreenInterview.result === "passed" ? "ผ่าน" : "ไม่ผ่าน"}
                        </Badge>
                      ) : candidate.interviews?.hr?.passed !== undefined ? (
                        <Badge variant={candidate.interviews.hr.passed ? "default" : "destructive"}>
                          {candidate.interviews.hr.passed ? "ผ่าน" : "ไม่ผ่าน"}
                        </Badge>
                      ) : "-"}
                    </div>
                  </div>
                  <div className="col-span-3">
                    <div className="text-muted-foreground mb-1">Comment</div>
                    <div>{preScreenInterview?.notes || candidate.interviews?.hr?.feedback || "-"}</div>
                  </div>
                </div>
              </div>

              {/* Combined Interview Section */}
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="font-semibold text-sm">การประเมินผลการสัมภาษณ์ (First Interview / Final Interview)</div>
                  <Button variant="ghost" size="sm" onClick={() => setCombinedInterviewOpen(true)}>
                    <Edit className="h-4 w-4 mr-1" />
                    แก้ไข
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  {/* First Interview (Manager) */}
                  <div className="space-y-3">
                    <div className="font-medium text-sm text-primary">First Interview (Manager)</div>
                    <div className="space-y-2 text-sm">
                      <div>
                        <div className="text-muted-foreground mb-1">วันที่สัมภาษณ์</div>
                        <div>
                          {firstInterview?.scheduled_at 
                            ? new Date(firstInterview.scheduled_at).toLocaleDateString('th-TH')
                            : candidate.interviews?.manager?.date || "-"}
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground mb-1">คะแนนรวม</div>
                        <div className="font-semibold text-primary">
                          {firstInterview?.score || candidate.interviews?.manager?.total_score || "-"} / 70
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground mb-1">ผลการสัมภาษณ์</div>
                        <div>
                          {firstInterview?.result ? (
                            <Badge variant={firstInterview.result === "passed" ? "default" : "destructive"}>
                              {firstInterview.result === "passed" ? "ผ่าน" : "ไม่ผ่าน"}
                            </Badge>
                          ) : candidate.interviews?.manager?.passed !== undefined ? (
                            <Badge variant={candidate.interviews.manager.passed ? "default" : "destructive"}>
                              {candidate.interviews.manager.passed ? "ผ่าน" : "ไม่ผ่าน"}
                            </Badge>
                          ) : "-"}
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground mb-1">Comment</div>
                        <div className="text-xs">
                          {(() => {
                            if (firstInterview?.notes) {
                              try {
                                const data = JSON.parse(firstInterview.notes);
                                return data.feedback || "-";
                              } catch {
                                return firstInterview.notes;
                              }
                            }
                            return candidate.interviews?.manager?.feedback || "-";
                          })()}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Final Interview (IS) */}
                  <div className="space-y-3">
                    <div className="font-medium text-sm text-primary">Final Interview (IS)</div>
                    <div className="space-y-2 text-sm">
                      <div>
                        <div className="text-muted-foreground mb-1">วันที่สัมภาษณ์</div>
                        <div>
                          {finalInterview?.scheduled_at 
                            ? new Date(finalInterview.scheduled_at).toLocaleDateString('th-TH')
                            : candidate.interviews?.isTeam?.date || "-"}
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground mb-1">คะแนนรวม</div>
                        <div className="font-semibold text-primary">
                          {finalInterview?.score || candidate.interviews?.isTeam?.total_score || "-"} / 70
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground mb-1">ผลการสัมภาษณ์</div>
                        <div>
                          {finalInterview?.result ? (
                            <Badge variant={finalInterview.result === "passed" ? "default" : "destructive"}>
                              {finalInterview.result === "passed" ? "ผ่าน" : "ไม่ผ่าน"}
                            </Badge>
                          ) : candidate.interviews?.isTeam?.passed !== undefined ? (
                            <Badge variant={candidate.interviews.isTeam.passed ? "default" : "destructive"}>
                              {candidate.interviews.isTeam.passed ? "ผ่าน" : "ไม่ผ่าน"}
                            </Badge>
                          ) : "-"}
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground mb-1">Comment</div>
                        <div className="text-xs">
                          {(() => {
                            if (finalInterview?.notes) {
                              try {
                                const data = JSON.parse(finalInterview.notes);
                                return data.feedback || "-";
                              } catch {
                                return finalInterview.notes;
                              }
                            }
                            return candidate.interviews?.isTeam?.feedback || "-";
                          })()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button variant="destructive" onClick={handleDeleteClick}>
            <Trash2 className="h-4 w-4 mr-2" />
            ลบ
          </Button>
          <div className="flex-1" />
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            ปิด
          </Button>
          <Button 
            onClick={handleDownloadEvaluation}
            variant="default"
            className="bg-gradient-to-r from-primary to-primary/80"
          >
            <Download className="h-4 w-4 mr-2" />
            ดาวน์โหลดผลประเมิน
          </Button>
        </DialogFooter>
      </DialogContent>

      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการลบผู้สมัคร</AlertDialogTitle>
            <AlertDialogDescription>
              คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลของ <span className="font-semibold">{candidate.name}</span>? 
              การดำเนินการนี้ไม่สามารถย้อนกลับได้
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              ลบ
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <TestScoreDialog
        testScores={{
          hrTest: candidateDetails?.hr_test_score ?? candidate.testScores?.hrTest,
          departmentTest: candidateDetails?.department_test_score ?? candidate.testScores?.departmentTest,
        }}
        open={showTestScoreDialog}
        onOpenChange={setShowTestScoreDialog}
        onSave={handleTestScoreSave}
      />

      <SingleInterviewDialog
        title="แก้ไขการสัมภาษณ์โดย HR"
        interview={preScreenInterview ? {
          date: preScreenInterview.scheduled_at 
            ? new Date(preScreenInterview.scheduled_at).toLocaleDateString('en-GB').split('/').join('/')
            : '',
          passed: preScreenInterview.result === "passed",
          feedback: preScreenInterview.notes || '',
        } : candidate.interviews?.hr}
        open={activeInterview === 'hr'}
        onOpenChange={(open) => !open && setActiveInterview(null)}
        onSave={handleSingleInterviewSave}
      />

      <CombinedInterviewDialog
        candidateName={candidate.name}
        position={candidate.position || candidate.position_title || ''}
        managerInterview={candidate.interviews?.manager}
        isInterview={candidate.interviews?.isTeam}
        open={combinedInterviewOpen}
        onOpenChange={setCombinedInterviewOpen}
        onSave={handleCombinedInterviewSave}
      />

      <ResumeDialog
        candidate={candidate}
        open={showResumeDialog}
        onOpenChange={setShowResumeDialog}
      />

      <AlertDialog open={showPipelineConfirm} onOpenChange={setShowPipelineConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการเปลี่ยน Pipeline Status</AlertDialogTitle>
            <AlertDialogDescription>
              คุณต้องการเปลี่ยนสถานะของ <span className="font-semibold">{candidate.name}</span> เป็น{' '}
              <span className="font-semibold">
                {pipelineSteps.find(s => s.key === selectedPipelineStep)?.label}
              </span>{' '}
              ใช่หรือไม่?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmPipelineChange}>
              ยืนยัน
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}
