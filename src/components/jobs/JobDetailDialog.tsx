import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { MapPin, Briefcase, DollarSign, Users, CheckCircle, Edit, Trash2, FileText, UserCheck } from "lucide-react";
import { useHiredCandidates } from "@/hooks/useHiredCandidates";

interface JobDetailDialogProps {
  job: {
    id: number | string;
    title: string;
    department: string;
    location: string;
    type: string;
    applicants: number;
    postedDate: string;
    status: "open" | "closed";
    avgScore: number;
    salaryRange: string;
    numberOfPositions: string;
    jobGrade: string;
    description: string;
    requirements: string[];
    responsibilities: string[];
    additionalInfo?: string;
    interviewStats: {
      total: number;
      passed: number;
      failed: number;
    };
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
  onViewCandidates: () => void;
}

export function JobDetailDialog({ job, open, onOpenChange, onEdit, onDelete, onViewCandidates }: JobDetailDialogProps) {
  const navigate = useNavigate();
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);

  const positionId = job && typeof job.id === "string" ? job.id : null;
  const { data: hiredCandidates = [], isLoading: hiredLoading } = useHiredCandidates(positionId);

  if (!job) return null;

  const requiredCount = parseInt(job.numberOfPositions) || null;
  const hiredCount = hiredCandidates.length;
  const progressPercent = requiredCount ? Math.min((hiredCount / requiredCount) * 100, 100) : 0;

  const handleDeleteClick = () => {
    setShowDeleteAlert(true);
  };

  const handleConfirmDelete = () => {
    setShowDeleteAlert(false);
    onDelete();
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <DialogTitle className="text-2xl font-bold">{job.title}</DialogTitle>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="secondary" className="font-normal">
                  <Briefcase className="h-3 w-3 mr-1" />
                  {job.department}
                </Badge>
                <Badge variant="outline" className="font-normal">
                  <MapPin className="h-3 w-3 mr-1" />
                  {job.location}
                </Badge>
                <Badge variant="outline" className="font-normal">
                  {job.type}
                </Badge>
                <Badge
                  variant={job.status === "open" ? "default" : "secondary"}
                  className="font-normal"
                >
                  {job.status === "open" ? "เปิดรับสมัคร" : "ปิดรับสมัคร"}
                </Badge>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={onEdit}>
                <Edit className="h-4 w-4 mr-2" />
                แก้ไข
              </Button>
              <Button variant="destructive" size="sm" onClick={handleDeleteClick}>
                <Trash2 className="h-4 w-4 mr-2" />
                ลบ
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Job Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-lg">เงินเดือน</h3>
              </div>
              <p className="text-2xl font-bold text-primary">{job.salaryRange}</p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-lg">จำนวนอัตรา</h3>
              </div>
              <p className="text-2xl font-bold text-blue-600">{job.numberOfPositions}</p>
              {requiredCount && (
                <div className="mt-2">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-muted-foreground">จ้างแล้ว</span>
                    <span className="font-medium">{hiredCount}/{requiredCount}</span>
                  </div>
                  <Progress value={progressPercent} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    {hiredCount >= requiredCount
                      ? "รับครบตามจำนวนแล้ว"
                      : `เหลืออีก ${requiredCount - hiredCount} อัตรา`}
                  </p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Job Description */}
          <div>
            <h3 className="font-semibold text-lg mb-3">รายละเอียดงาน</h3>
            <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
              {job.description
                .replace(/\*\*เหตุผลในการเปิดรับ:\*\*[\s\S]*$/, '')
                .replace(/\*\*หน้าที่และความรับผิดชอบ:\*\*/g, '')
                .trim()}
            </p>
          </div>

          <Separator />

          {/* Requirements */}
          <div>
            <h3 className="font-semibold text-lg mb-3">คุณสมบัติที่ต้องการ</h3>
            <ul className="space-y-2">
              {job.requirements.map((req, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">{req}</span>
                </li>
              ))}
            </ul>
          </div>

          <Separator />

          {/* Hired Candidates Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-emerald-600" />
                ผู้ที่ได้รับการจ้างงาน
              </h3>
              {requiredCount && (
                <Badge variant={hiredCount >= requiredCount ? "default" : "secondary"}>
                  {hiredCount} / {requiredCount} อัตรา
                </Badge>
              )}
            </div>

            {hiredLoading ? (
              <p className="text-sm text-muted-foreground py-4 text-center">กำลังโหลด...</p>
            ) : hiredCandidates.length > 0 ? (
              <div className="space-y-3">
                {hiredCandidates.map((candidate) => (
                  <div key={candidate.id} className="flex items-center gap-3 p-3 border rounded-lg bg-emerald-50/50">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={candidate.photo_url || undefined} />
                      <AvatarFallback className="bg-emerald-100 text-emerald-700">
                        {candidate.name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{candidate.name}</div>
                      <div className="text-xs text-muted-foreground truncate">{candidate.email}</div>
                    </div>
                    <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 shrink-0">
                      Hired
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-4 text-center">ยังไม่มีผู้ที่ได้รับการจ้างงาน</p>
            )}
          </div>

          {/* Footer Info */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              เปิดรับสมัครเมื่อ: {job.postedDate}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            ปิด
          </Button>
          <Button onClick={() => navigate('/job-application', { state: { jobTitle: job.title } })}>
            <FileText className="h-4 w-4 mr-2" />
            สมัครงาน
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>ยืนยันการลบตำแหน่งงาน</AlertDialogTitle>
          <AlertDialogDescription>
            คุณต้องการลบตำแหน่ง <strong>{job.title}</strong> ใช่หรือไม่?
            <br />
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
  </>
  );
}
