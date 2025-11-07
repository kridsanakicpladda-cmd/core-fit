import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Mail, Phone, MapPin, Briefcase, GraduationCap, Calendar } from "lucide-react";

interface ResumeDialogProps {
  candidate: {
    name: string;
    position: string;
    email: string;
    phone: string;
    location?: string;
    education?: string;
    experience: string;
    previousCompany?: string;
    summary?: string;
    skills: string[];
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ResumeDialog({ candidate, open, onOpenChange }: ResumeDialogProps) {
  if (!candidate) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">เรซูเม่</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4 bg-background p-6 rounded-lg border">
          {/* Header */}
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold">{candidate.name}</h2>
            <p className="text-xl text-muted-foreground">{candidate.position}</p>
          </div>

          <Separator />

          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-semibold mb-3">ข้อมูลติดต่อ</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{candidate.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{candidate.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{candidate.location}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Summary */}
          <div>
            <h3 className="text-lg font-semibold mb-3">ข้อมูลสรุป</h3>
            <p className="text-sm leading-relaxed">{candidate.summary}</p>
          </div>

          <Separator />

          {/* Experience */}
          <div>
            <h3 className="text-lg font-semibold mb-3">ประสบการณ์ทำงาน</h3>
            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <Briefcase className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">{candidate.previousCompany}</p>
                  <p className="text-sm text-muted-foreground">{candidate.position}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <Calendar className="h-3 w-3" />
                    <span>ประสบการณ์: {candidate.experience}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Education */}
          <div>
            <h3 className="text-lg font-semibold mb-3">การศึกษา</h3>
            <div className="flex items-start gap-3">
              <GraduationCap className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">{candidate.education}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Skills */}
          <div>
            <h3 className="text-lg font-semibold mb-3">ทักษะ</h3>
            <div className="flex flex-wrap gap-2">
              {candidate.skills.map((skill, index) => (
                <Badge key={index} variant="secondary" className="text-sm">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
