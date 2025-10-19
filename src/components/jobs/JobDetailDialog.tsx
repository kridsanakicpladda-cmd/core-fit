import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { MapPin, Briefcase, DollarSign, Users, CheckCircle, XCircle, Clock, Edit } from "lucide-react";

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
    description: string;
    requirements: string[];
    responsibilities: string[];
    interviewStats: {
      total: number;
      passed: number;
      failed: number;
    };
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: () => void;
}

export function JobDetailDialog({ job, open, onOpenChange, onEdit }: JobDetailDialogProps) {
  if (!job) return null;

  return (
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
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Edit className="h-4 w-4 mr-2" />
              แก้ไข
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Salary Range */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-lg">เงินเดือน</h3>
            </div>
            <p className="text-2xl font-bold text-primary">{job.salaryRange}</p>
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
      </DialogContent>
    </Dialog>
  );
}
