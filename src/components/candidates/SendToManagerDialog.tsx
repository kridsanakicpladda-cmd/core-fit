import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useProfiles } from "@/hooks/useProfiles";
import { useToast } from "@/hooks/use-toast";
import { addSparkleEffect } from "@/lib/sparkle";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface SendToManagerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidates: Array<{ 
    id: number; 
    name: string; 
    position: string; 
    resumeFile?: string;
    score?: number;
    preScreenComment?: string;
  }>;
  onSent: () => void;
}

export function SendToManagerDialog({
  open,
  onOpenChange,
  candidates,
  onSent,
}: SendToManagerDialogProps) {
  const [selectedManagerId, setSelectedManagerId] = useState<string>("");
  const [isSending, setIsSending] = useState(false);
  const { profiles, isLoading } = useProfiles();
  const { toast } = useToast();
  const { user } = useAuth();

  // Get current user's role
  const currentUserProfile = profiles.find((p) => p.id === user?.id);
  const senderRole = currentUserProfile?.roles.includes("hr_manager") 
    ? "HR" 
    : currentUserProfile?.roles.includes("recruiter")
    ? "HR"
    : "IS";

  // Filter only managers
  const managers = profiles.filter(
    (profile) =>
      profile.roles.includes("manager") ||
      profile.roles.includes("hr_manager") ||
      profile.roles.includes("ceo")
  );

  const selectedManager = managers.find((m) => m.id === selectedManagerId);

  // Get unique positions from candidates
  const positions = [...new Set(candidates.map((c) => c.position))].join(", ");

  const handleSend = async (e: React.MouseEvent<HTMLButtonElement>) => {
    addSparkleEffect(e);

    if (!selectedManagerId) {
      toast({
        title: "กรุณาเลือก Manager",
        description: "กรุณาเลือก Manager ที่ต้องการส่ง Resume ไป",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);

    try {
      const { data, error } = await supabase.functions.invoke(
        'send-email-with-attachments',
        {
          body: {
            to: selectedManager?.email,
            toName: selectedManager?.name,
            department: selectedManager?.department || 'แผนก',
            senderRole,
            candidates: candidates.map(c => ({
              id: c.id,
              name: c.name,
              position: c.position,
              resume_url: c.resumeFile,
              ai_score: c.score || 0,
              pre_screen_comment: c.preScreenComment || '-',
            })),
            positions,
          },
        }
      );

      if (error) throw error;

      toast({
        title: "ส่งอีเมลสำเร็จ",
        description: `ส่ง Resume ของผู้สมัคร ${candidates.length} คนไปยัง ${selectedManager?.name} แล้ว`,
      });

      onSent();
      onOpenChange(false);
      setSelectedManagerId("");
    } catch (error: any) {
      console.error('Error sending email:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message || "ไม่สามารถส่งอีเมลได้ กรุณาลองใหม่อีกครั้ง",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            ส่ง Resume ไปยังผู้จัดการ
          </DialogTitle>
          <DialogDescription>
            เลือกผู้จัดการที่ต้องการส่ง Resume ของผู้สมัคร {candidates.length} คน
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">เลือกผู้จัดการ</label>
            <Select value={selectedManagerId} onValueChange={setSelectedManagerId}>
              <SelectTrigger className="border-border/50 focus:border-primary focus:shadow-accent transition-all">
                <SelectValue placeholder="เลือกผู้จัดการ..." />
              </SelectTrigger>
              <SelectContent>
                {isLoading ? (
                  <SelectItem value="loading" disabled>
                    กำลังโหลด...
                  </SelectItem>
                ) : managers.length === 0 ? (
                  <SelectItem value="empty" disabled>
                    ไม่พบผู้จัดการ
                  </SelectItem>
                ) : (
                  managers.map((manager) => (
                    <SelectItem key={manager.id} value={manager.id}>
                      {manager.name} - {manager.department || "ไม่ระบุแผนก"}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {selectedManager && (
            <div className="space-y-3">
              <label className="text-sm font-medium">ตัวอย่างอีเมล</label>
              <div className="border rounded-lg p-4 bg-secondary/10 space-y-4 text-sm">
                <p className="font-medium">
                  เรียน {selectedManager.name} ({selectedManager.department || "แผนก"})
                </p>
                <div className="text-muted-foreground leading-relaxed">
                  <p>
                    ฝ่าย <span className="font-semibold text-primary">{senderRole}</span> ขอส่งโปรไฟล์ผู้สมัครที่ผ่านการ Pre-Screen เบื้องต้นสำหรับตำแหน่ง{" "}
                    <span className="font-semibold text-foreground">{positions}</span>{" "}
                    เพื่อให้ท่านพิจารณาคัดเลือกผู้สมัครที่สนใจสัมภาษณ์ เพื่อไม่ให้เป็นการเสียเวลา กรุณาส่ง Resume ที่ต้องการนัดสัมภาษณ์กลับมาภายใน 24 ชั่วโมง
                  </p>
                </div>
                
                {/* Preview Table */}
                <div className="pt-3 border-t overflow-x-auto">
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="bg-primary/10">
                        <th className="border border-border/50 px-2 py-1.5 text-center w-12">ลำดับ</th>
                        <th className="border border-border/50 px-2 py-1.5 text-left">ชื่อผู้สมัคร</th>
                        <th className="border border-border/50 px-2 py-1.5 text-left">ตำแหน่งที่สมัคร</th>
                        <th className="border border-border/50 px-2 py-1.5 text-center w-20">AI Score</th>
                        <th className="border border-border/50 px-2 py-1.5 text-left">Comment Pre-Screen</th>
                      </tr>
                    </thead>
                    <tbody>
                      {candidates.slice(0, 5).map((candidate, index) => (
                        <tr key={candidate.id} className={index % 2 === 0 ? "bg-background" : "bg-muted/30"}>
                          <td className="border border-border/50 px-2 py-1.5 text-center font-medium">{index + 1}</td>
                          <td className="border border-border/50 px-2 py-1.5">{candidate.name}</td>
                          <td className="border border-border/50 px-2 py-1.5">{candidate.position}</td>
                          <td className="border border-border/50 px-2 py-1.5 text-center">
                            <span className="inline-block px-2 py-0.5 bg-primary/20 text-primary rounded-full font-medium">
                              {candidate.score || 0}%
                            </span>
                          </td>
                          <td className="border border-border/50 px-2 py-1.5 text-muted-foreground">
                            {candidate.preScreenComment || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {candidates.length > 5 && (
                    <p className="text-xs text-muted-foreground mt-2 text-center">
                      และอีก {candidates.length - 5} คน...
                    </p>
                  )}
                </div>
                
                <div className="pt-3 flex justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    className="pointer-events-none"
                  >
                    แจ้งผลการพิจารณา
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSending}
          >
            ยกเลิก
          </Button>
          <Button
            onClick={handleSend}
            disabled={!selectedManagerId || isSending}
            className="gap-2"
          >
            {isSending && <Loader2 className="h-4 w-4 animate-spin" />}
            {isSending ? "กำลังส่ง..." : "ส่งอีเมล"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
