import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Mail, Phone, MapPin, Briefcase, GraduationCap, Calendar, FileText, ExternalLink } from "lucide-react";

interface ResumeDialogProps {
  candidate: {
    name: string;
    position?: string;
    position_title?: string;
    email?: string;
    phone?: string | null;
    location?: string;
    education?: string;
    experience?: string;
    previousCompany?: string;
    summary?: string;
    skills?: string[];
    resumeUrl?: string;
    resume_url?: string | null;
    source?: string;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ResumeDialog({ candidate, open, onOpenChange }: ResumeDialogProps) {
  if (!candidate) return null;

  const resumeUrl = candidate.resumeUrl || candidate.resume_url;
  const position = candidate.position || candidate.position_title || 'ไม่ระบุตำแหน่ง';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl">เรซูเม่</DialogTitle>
            {resumeUrl && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(resumeUrl, '_blank')}
                className="gap-2"
              >
                <FileText className="h-4 w-4" />
                ดาวน์โหลด PDF
                <ExternalLink className="h-3 w-3" />
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4 bg-background p-6 rounded-lg border">
          {/* Header */}
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold">{candidate.name}</h2>
            <p className="text-xl text-muted-foreground">{position}</p>
          </div>

          <Separator />

          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-semibold mb-3">ข้อมูลติดต่อ</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {candidate.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{candidate.email}</span>
                </div>
              )}
              {candidate.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{candidate.phone}</span>
                </div>
              )}
              {candidate.location && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{candidate.location}</span>
                </div>
              )}
            </div>
          </div>

          {candidate.summary && (
            <>
              <Separator />
              <div>
                <h3 className="text-lg font-semibold mb-3">ข้อมูลสรุป</h3>
                <p className="text-sm leading-relaxed">{candidate.summary}</p>
              </div>
            </>
          )}

          {(candidate.experience || candidate.previousCompany) && (
            <>
              <Separator />
              <div>
                <h3 className="text-lg font-semibold mb-3">ประสบการณ์ทำงาน</h3>
                <div className="space-y-2">
                  <div className="flex items-start gap-3">
                    <Briefcase className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      {candidate.previousCompany && (
                        <p className="font-medium">{candidate.previousCompany}</p>
                      )}
                      <p className="text-sm text-muted-foreground">{position}</p>
                      {candidate.experience && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <Calendar className="h-3 w-3" />
                          <span>ประสบการณ์: {candidate.experience}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {candidate.education && (
            <>
              <Separator />
              <div>
                <h3 className="text-lg font-semibold mb-3">การศึกษา</h3>
                <div className="flex items-start gap-3">
                  <GraduationCap className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">{candidate.education}</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {candidate.skills && candidate.skills.length > 0 && (
            <>
              <Separator />
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
            </>
          )}

          {/* Resume Link if no detailed info */}
          {resumeUrl && !candidate.summary && !candidate.education && (
            <>
              <Separator />
              <div className="text-center py-4">
                <Button
                  onClick={() => window.open(resumeUrl, '_blank')}
                  className="gap-2"
                >
                  <FileText className="h-4 w-4" />
                  ดู Resume ฉบับเต็ม
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
