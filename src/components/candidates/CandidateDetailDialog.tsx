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
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Mail, Phone, MapPin, Calendar, Briefcase, GraduationCap, Star, FileText, Edit, Trash2 } from "lucide-react";

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
    email: string;
    phone: string;
    location: string;
    education: string;
    summary: string;
    previousCompany: string;
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

export function CandidateDetailDialog({ candidate, open, onOpenChange, onEdit, onDelete }: CandidateDetailDialogProps) {
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  
  if (!candidate) return null;

  const handleDeleteClick = () => {
    setShowDeleteAlert(true);
  };

  const handleConfirmDelete = () => {
    onDelete();
    setShowDeleteAlert(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative">
                <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                  {candidate.score}
                </div>
                {candidate.score >= 90 && (
                  <div className="absolute -top-1 -right-1 h-6 w-6 bg-yellow-400 rounded-full flex items-center justify-center">
                    <Star className="h-3 w-3 text-white fill-white" />
                  </div>
                )}
              </div>
              <div>
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
            <h3 className="text-lg font-semibold mb-3">รายละเอียด AI Fit Score</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">ทักษะที่ตรงกัน</span>
                <div className="flex items-center gap-2">
                  <div className="w-48 bg-secondary rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                  <span className="text-sm font-medium w-12 text-right">85%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">ประสบการณ์</span>
                <div className="flex items-center gap-2">
                  <div className="w-48 bg-secondary rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '92%' }}></div>
                  </div>
                  <span className="text-sm font-medium w-12 text-right">92%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">การศึกษา</span>
                <div className="flex items-center gap-2">
                  <div className="w-48 bg-secondary rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '90%' }}></div>
                  </div>
                  <span className="text-sm font-medium w-12 text-right">90%</span>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Test Score - Interview Details */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Test Score</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-semibold text-sm bg-muted/50">Interviews By HR</th>
                    <th className="text-left p-3 font-semibold text-sm bg-muted/50">Interview Date</th>
                    <th className="text-left p-3 font-semibold text-sm bg-muted/50">Yes/No</th>
                    <th className="text-left p-3 font-semibold text-sm bg-muted/50">Feedback Interview</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="p-3 text-sm"></td>
                    <td className="p-3 text-sm">{candidate.interviews?.hr?.date || "-"}</td>
                    <td className="p-3 text-sm">
                      {candidate.interviews?.hr?.passed !== undefined ? (
                        <Badge variant={candidate.interviews.hr.passed ? "default" : "destructive"}>
                          {candidate.interviews.hr.passed ? "Yes" : "No"}
                        </Badge>
                      ) : "-"}
                    </td>
                    <td className="p-3 text-sm">{candidate.interviews?.hr?.feedback || "-"}</td>
                  </tr>
                </tbody>
              </table>

              <table className="w-full border-collapse mt-4">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-semibold text-sm bg-muted/50">Interviews By Department</th>
                    <th className="text-left p-3 font-semibold text-sm bg-muted/50">Interview Date</th>
                    <th className="text-left p-3 font-semibold text-sm bg-muted/50">Yes/No</th>
                    <th className="text-left p-3 font-semibold text-sm bg-muted/50">Feedback Interview</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="p-3 text-sm"></td>
                    <td className="p-3 text-sm">{candidate.interviews?.manager?.date || "-"}</td>
                    <td className="p-3 text-sm">
                      {candidate.interviews?.manager?.passed !== undefined ? (
                        <Badge variant={candidate.interviews.manager.passed ? "default" : "destructive"}>
                          {candidate.interviews.manager.passed ? "Yes" : "No"}
                        </Badge>
                      ) : "-"}
                    </td>
                    <td className="p-3 text-sm">{candidate.interviews?.manager?.feedback || "-"}</td>
                  </tr>
                </tbody>
              </table>

              <table className="w-full border-collapse mt-4">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-semibold text-sm bg-muted/50">Interviews By IS Team</th>
                    <th className="text-left p-3 font-semibold text-sm bg-muted/50">Interview Date</th>
                    <th className="text-left p-3 font-semibold text-sm bg-muted/50">Yes/No</th>
                    <th className="text-left p-3 font-semibold text-sm bg-muted/50">Feedback Interview</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="p-3 text-sm"></td>
                    <td className="p-3 text-sm">{candidate.interviews?.isTeam?.date || "-"}</td>
                    <td className="p-3 text-sm">
                      {candidate.interviews?.isTeam?.passed !== undefined ? (
                        <Badge variant={candidate.interviews.isTeam.passed ? "default" : "destructive"}>
                          {candidate.interviews.isTeam.passed ? "Yes" : "No"}
                        </Badge>
                      ) : "-"}
                    </td>
                    <td className="p-3 text-sm">{candidate.interviews?.isTeam?.feedback || "-"}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            ปิด
          </Button>
          <Button>
            <FileText className="h-4 w-4 mr-2" />
            ดูเรซูเม่
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
    </Dialog>
  );
}
