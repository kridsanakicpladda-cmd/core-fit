import { useState } from "react";
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
import { Mail, Phone, MapPin, Calendar, Briefcase, GraduationCap, Star, FileText, Edit, Trash2, CheckCircle2, Circle, Heart, X } from "lucide-react";
import { SingleInterviewDialog } from "./SingleInterviewDialog";
import { TestScoreDialog } from "./TestScoreDialog";
import { ResumeDialog } from "./ResumeDialog";

interface CandidateDetailDialogProps {
  candidate: {
    id: number;
    name: string;
    position: string;
    experience: string;
    score: number;
    skills: string[];
    appliedDate: string;
    status: string;
    pipelineStatus?: string;
    email: string;
    phone: string;
    location?: string;
    education?: string;
    summary?: string;
    previousCompany?: string;
    photoUrl?: string;
    resumeUrl?: string;
    testScores?: {
      hrTest?: number;
      departmentTest?: number;
    };
    interviews?: {
      hr?: { date: string; passed: boolean; feedback: string };
      manager?: { date: string; passed: boolean; feedback: string };
      isTeam?: { date: string; passed: boolean; feedback: string };
    };
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
  onInterviewUpdate: (candidateId: number, interviews: any) => void;
  onTestScoreUpdate: (candidateId: number, testScores: any) => void;
  onStatusChange?: (candidateId: number, status: string) => void;
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
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [showTestScoreDialog, setShowTestScoreDialog] = useState(false);
  const [showResumeDialog, setShowResumeDialog] = useState(false);
  const [activeInterview, setActiveInterview] = useState<'hr' | 'manager' | 'isTeam' | null>(null);
  const [showPipelineConfirm, setShowPipelineConfirm] = useState(false);
  const [selectedPipelineStep, setSelectedPipelineStep] = useState<string | null>(null);
  
  if (!candidate) return null;

  const currentPipelineIndex = pipelineSteps.findIndex(step => step.key === candidate.pipelineStatus);
  
  const handleStatusChange = (status: string) => {
    if (onStatusChange) {
      const statusLabelsMap: Record<string, string> = {
        shortlisted: "Shortlist",
        interested: "Interested",
        not_interested: "Not interested",
      };
      
      onStatusChange(candidate.id, status);
      
      addNotification({
        type: 'status_change',
        title: 'เปลี่ยนสถานะผู้สมัคร',
        description: `ย้าย ${candidate.name} ไปยังแท็บ ${statusLabelsMap[status]}`,
        candidateName: candidate.name,
        oldStatus: statusLabelsMap[candidate.status],
        newStatus: statusLabelsMap[status],
      });
      
      onOpenChange(false);
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

  const handleTestScoreSave = (testScores: any) => {
    onTestScoreUpdate(candidate.id, testScores);
  };

  const handleSingleInterviewSave = (interviewData: any) => {
    const updatedInterviews = {
      ...candidate.interviews,
      [activeInterview as string]: interviewData,
    };
    onInterviewUpdate(candidate.id, updatedInterviews);
    setActiveInterview(null);
  };

  const handleInterviewEdit = (type: 'hr' | 'manager' | 'isTeam') => {
    setActiveInterview(type);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              {/* Candidate Photo */}
              <Avatar className="h-20 w-20 border-4 border-primary/20 shadow-lg">
                <AvatarImage src={candidate.photoUrl} alt={candidate.name} />
                <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-primary to-primary/80 text-white">
                  {candidate.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              
              {/* Candidate Info */}
              <div className="flex-1">
                <DialogTitle className="text-2xl mb-2">{candidate.name}</DialogTitle>
                <div className="flex items-center gap-2">
                  <Badge className={statusColors[candidate.status as keyof typeof statusColors]}>
                    {statusLabels[candidate.status as keyof typeof statusLabels]}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    สมัครเมื่อ: {candidate.appliedDate}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Score Badge - Moved to top right */}
            <div className="relative flex-shrink-0">
              <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                {candidate.score}
              </div>
              {candidate.score >= 90 && (
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
              variant={candidate.status === 'shortlisted' ? 'default' : 'outline'}
              className="flex-1"
              onClick={() => handleStatusChange('shortlisted')}
            >
              <Star className="h-4 w-4 mr-2" />
              Shortlist
            </Button>
            <Button 
              variant={candidate.status === 'interested' ? 'default' : 'outline'}
              className="flex-1"
              onClick={() => handleStatusChange('interested')}
            >
              <Heart className="h-4 w-4 mr-2" />
              Interested
            </Button>
            <Button 
              variant={candidate.status === 'not_interested' ? 'destructive' : 'outline'}
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
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{candidate.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{candidate.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{candidate.location}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Position & Experience */}
          <div>
            <h3 className="text-lg font-semibold mb-3">ตำแหน่งที่สมัคร</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <div>
                  <span className="font-medium">{candidate.position}</span>
                  <span className="text-muted-foreground ml-2">• {candidate.experience}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
                <span>{candidate.education}</span>
              </div>
              {candidate.previousCompany && (
                <div className="flex items-center gap-3 text-sm">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <span>บริษัทเดิม: {candidate.previousCompany}</span>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Summary */}
          <div>
            <h3 className="text-lg font-semibold mb-3">ข้อมูลสรุป</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {candidate.summary}
            </p>
          </div>

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

          {/* AI Fit Score Breakdown */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">AI Fit Score</h3>
              <div className="text-2xl font-bold text-primary">
                {candidate.score}%
                <span className="text-sm text-muted-foreground ml-1">JD Match</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Conformity to Job description (50%)</span>
                <div className="flex items-center gap-2">
                  <div className="w-48 bg-secondary rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                  <span className="text-sm font-medium w-12 text-right">85%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Work experience consistent (20%)</span>
                <div className="flex items-center gap-2">
                  <div className="w-48 bg-secondary rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '92%' }}></div>
                  </div>
                  <span className="text-sm font-medium w-12 text-right">92%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Other Skill and abilities (10%)</span>
                <div className="flex items-center gap-2">
                  <div className="w-48 bg-secondary rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '88%' }}></div>
                  </div>
                  <span className="text-sm font-medium w-12 text-right">88%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Educational qualification (10%)</span>
                <div className="flex items-center gap-2">
                  <div className="w-48 bg-secondary rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '90%' }}></div>
                  </div>
                  <span className="text-sm font-medium w-12 text-right">90%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">GPA (10%)</span>
                <div className="flex items-center gap-2">
                  <div className="w-48 bg-secondary rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '95%' }}></div>
                  </div>
                  <span className="text-sm font-medium w-12 text-right">95%</span>
                </div>
              </div>
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
                  {candidate.testScores?.hrTest || "-"}
                </div>
              </div>
              <div className="p-4 border rounded-lg bg-muted/20">
                <div className="text-sm text-muted-foreground mb-1">แบบทดสอบเฉพาะแผนก</div>
                <div className="text-3xl font-bold text-primary">
                  {candidate.testScores?.departmentTest || "-"}
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
                  <div className="font-semibold text-sm">สัมภาษณ์โดย HR</div>
                  <Button variant="ghost" size="sm" onClick={() => handleInterviewEdit('hr')}>
                    <Edit className="h-4 w-4 mr-1" />
                    แก้ไข
                  </Button>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground mb-1">วันที่สัมภาษณ์</div>
                    <div>{candidate.interviews?.hr?.date || "-"}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground mb-1">ผลการสัมภาษณ์</div>
                    <div>
                      {candidate.interviews?.hr?.passed !== undefined ? (
                        <Badge variant={candidate.interviews.hr.passed ? "default" : "destructive"}>
                          {candidate.interviews.hr.passed ? "ผ่าน" : "ไม่ผ่าน"}
                        </Badge>
                      ) : "-"}
                    </div>
                  </div>
                  <div className="col-span-3">
                    <div className="text-muted-foreground mb-1">ข้อคิดเห็น</div>
                    <div>{candidate.interviews?.hr?.feedback || "-"}</div>
                  </div>
                </div>
              </div>

              {/* Manager Interview */}
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="font-semibold text-sm">สัมภาษณ์โดยหัวหน้าแผนก</div>
                  <Button variant="ghost" size="sm" onClick={() => handleInterviewEdit('manager')}>
                    <Edit className="h-4 w-4 mr-1" />
                    แก้ไข
                  </Button>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground mb-1">วันที่สัมภาษณ์</div>
                    <div>{candidate.interviews?.manager?.date || "-"}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground mb-1">ผลการสัมภาษณ์</div>
                    <div>
                      {candidate.interviews?.manager?.passed !== undefined ? (
                        <Badge variant={candidate.interviews.manager.passed ? "default" : "destructive"}>
                          {candidate.interviews.manager.passed ? "ผ่าน" : "ไม่ผ่าน"}
                        </Badge>
                      ) : "-"}
                    </div>
                  </div>
                  <div className="col-span-3">
                    <div className="text-muted-foreground mb-1">ข้อคิดเห็น</div>
                    <div>{candidate.interviews?.manager?.feedback || "-"}</div>
                  </div>
                </div>
              </div>

              {/* IS Team Interview */}
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="font-semibold text-sm">สัมภาษณ์โดยทีม IS</div>
                  <Button variant="ghost" size="sm" onClick={() => handleInterviewEdit('isTeam')}>
                    <Edit className="h-4 w-4 mr-1" />
                    แก้ไข
                  </Button>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground mb-1">วันที่สัมภาษณ์</div>
                    <div>{candidate.interviews?.isTeam?.date || "-"}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground mb-1">ผลการสัมภาษณ์</div>
                    <div>
                      {candidate.interviews?.isTeam?.passed !== undefined ? (
                        <Badge variant={candidate.interviews.isTeam.passed ? "default" : "destructive"}>
                          {candidate.interviews.isTeam.passed ? "ผ่าน" : "ไม่ผ่าน"}
                        </Badge>
                      ) : "-"}
                    </div>
                  </div>
                  <div className="col-span-3">
                    <div className="text-muted-foreground mb-1">ข้อคิดเห็น</div>
                    <div>{candidate.interviews?.isTeam?.feedback || "-"}</div>
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
          {candidate.resumeUrl && (
            <Button onClick={() => window.open(candidate.resumeUrl, '_blank')}>
              <FileText className="h-4 w-4 mr-2" />
              ดู Resume ฉบับเต็ม
            </Button>
          )}
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
        testScores={candidate.testScores}
        open={showTestScoreDialog}
        onOpenChange={setShowTestScoreDialog}
        onSave={handleTestScoreSave}
      />

      <SingleInterviewDialog
        title={
          activeInterview === 'hr' ? 'แก้ไขการสัมภาษณ์โดย HR' :
          activeInterview === 'manager' ? 'แก้ไขการสัมภาษณ์โดยหัวหน้าแผนก' :
          'แก้ไขการสัมภาษณ์โดยทีม IS'
        }
        interview={
          activeInterview === 'hr' ? candidate.interviews?.hr :
          activeInterview === 'manager' ? candidate.interviews?.manager :
          candidate.interviews?.isTeam
        }
        open={activeInterview !== null}
        onOpenChange={(open) => !open && setActiveInterview(null)}
        onSave={handleSingleInterviewSave}
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
