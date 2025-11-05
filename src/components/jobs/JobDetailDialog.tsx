import { useState } from "react";
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
import { MapPin, Briefcase, DollarSign, Users, CheckCircle, XCircle, Clock, Edit, Trash2, UserSearch } from "lucide-react";

interface JobDetailDialogProps {
  job: {
    id: number;
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
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  
  if (!job) return null;

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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Briefcase className="h-5 w-5 text-purple-600" />
                <h3 className="font-semibold text-lg">Job Grade</h3>
              </div>
              <p className="text-2xl font-bold text-purple-600">{job.jobGrade}</p>
            </div>
          </div>

          <Separator />

          {/* Statistics */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Users className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-lg">สถิติการสมัคร</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="h-4 w-4 text-primary" />
                  <span className="text-sm text-muted-foreground">ผู้สมัครทั้งหมด</span>
                </div>
                <p className="text-3xl font-bold text-primary">{job.applicants}</p>
              </div>
              <div className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-muted-foreground">สัมภาษณ์แล้ว</span>
                </div>
                <p className="text-3xl font-bold text-blue-600">{job.interviewStats.total}</p>
              </div>
              <div className="bg-gradient-to-br from-green-500/10 to-green-500/5 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-muted-foreground">ผ่าน</span>
                </div>
                <p className="text-3xl font-bold text-green-600">{job.interviewStats.passed}</p>
              </div>
              <div className="bg-gradient-to-br from-red-500/10 to-red-500/5 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <span className="text-sm text-muted-foreground">ไม่ผ่าน</span>
                </div>
                <p className="text-3xl font-bold text-red-600">{job.interviewStats.failed}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Job Description */}
          <div>
            <h3 className="font-semibold text-lg mb-3">รายละเอียดงาน</h3>
            <p className="text-muted-foreground whitespace-pre-line leading-relaxed">{job.description}</p>
          </div>

          <Separator />

          {/* Responsibilities */}
          <div>
            <h3 className="font-semibold text-lg mb-3">หน้าที่ความรับผิดชอบ</h3>
            <ul className="space-y-2">
              {job.responsibilities.map((resp, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">{resp}</span>
                </li>
              ))}
            </ul>
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

          {/* Footer Info */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              เปิดรับสมัครเมื่อ: {job.postedDate}
            </div>
            <div className="flex items-center gap-2">
              <div className="text-sm text-muted-foreground">Avg Score:</div>
              <div className="inline-flex items-center justify-center h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-primary/80 text-white font-bold shadow-sm">
                {job.avgScore}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            ปิด
          </Button>
          <Button onClick={onViewCandidates}>
            <UserSearch className="h-4 w-4 mr-2" />
            ดูผู้สมัคร
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
