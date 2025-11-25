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

interface SendToManagerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidates: Array<{ id: number; name: string; position: string }>;
  onSent: () => void;
}

export function SendToManagerDialog({
  open,
  onOpenChange,
  candidates,
  onSent,
}: SendToManagerDialogProps) {
  const [selectedManagerId, setSelectedManagerId] = useState<string>("");
  const { profiles, isLoading } = useProfiles();
  const { toast } = useToast();

  // Filter only managers
  const managers = profiles.filter(
    (profile) =>
      profile.roles.includes("manager") ||
      profile.roles.includes("hr_manager") ||
      profile.roles.includes("ceo")
  );

  const selectedManager = managers.find((m) => m.id === selectedManagerId);

  const handleSend = (e: React.MouseEvent<HTMLButtonElement>) => {
    addSparkleEffect(e);

    if (!selectedManagerId) {
      toast({
        title: "กรุณาเลือกผู้จัดการ",
        description: "กรุณาเลือกผู้จัดการที่ต้องการส่ง Resume",
        variant: "destructive",
      });
      return;
    }

    // Build email body
    const candidatesList = candidates.map((c) => `- ${c.name} (${c.position})`).join('\n');
    const resumeLinks = candidates.map((c) => `Resume ${c.name}: https://your-domain.com/resumes/${c.id}`).join('\n');
    
    const emailBody = `เรียน ${selectedManager?.name} (${selectedManager?.department || 'แผนก'})

นำส่ง Resume ของผู้สมัครตำแหน่ง ${positions} และได้โทร Pre Screen เบื้องต้นแล้ว รบกวนพิจารณา Resume ให้ภายในวันพฤหัสบดี

รายชื่อผู้สมัคร:
${candidatesList}

ลิงก์ Resume:
${resumeLinks}

คลิกที่ลิงก์ด้านล่างเพื่อแจ้งผลพิจารณา:
https://your-domain.com/manager-review

ขอบคุณค่ะ`;

    const subject = `Resume ผู้สมัครตำแหน่ง ${positions} - รอพิจารณา`;
    const mailtoLink = `mailto:${selectedManager?.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;
    
    // Open Outlook/default email client
    window.open(mailtoLink, '_blank');

    toast({
      title: "เปิด Outlook แล้ว",
      description: `กำลังเปิดอีเมลสำหรับส่งไปยัง ${selectedManager?.name}`,
    });

    onSent();
    onOpenChange(false);
    setSelectedManagerId("");
  };

  // Get unique positions from candidates
  const positions = [...new Set(candidates.map((c) => c.position))].join(", ");

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
              <div className="border rounded-lg p-4 bg-secondary/10 space-y-3 text-sm">
                <p className="font-medium">
                  เรียน {selectedManager.name} ({selectedManager.department || "แผนก"})
                </p>
                <div className="space-y-2 text-muted-foreground">
                  <p>
                    นำส่ง Resume ของผู้สมัครตำแหน่ง <span className="font-medium text-foreground">{positions}</span>{" "}
                    และได้โทร Pre Screen เบื้องต้นแล้ว
                  </p>
                  <p>รบกวนพิจารณา Resume ให้ภายในวันพฤหัสบดี</p>
                </div>
                <div className="pt-3 border-t">
                  <p className="text-xs text-muted-foreground mb-2">
                    ผู้สมัครที่ส่ง ({candidates.length} คน):
                  </p>
                  <ul className="list-disc list-inside text-xs text-muted-foreground space-y-1">
                    {candidates.slice(0, 5).map((candidate) => (
                      <li key={candidate.id}>
                        {candidate.name} - {candidate.position}
                      </li>
                    ))}
                    {candidates.length > 5 && (
                      <li className="text-primary">และอีก {candidates.length - 5} คน...</li>
                    )}
                  </ul>
                </div>
                <div className="pt-3 flex justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    className="pointer-events-none"
                  >
                    แจ้งผลพิจารณา
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
          >
            ยกเลิก
          </Button>
          <Button
            onClick={handleSend}
            disabled={!selectedManagerId}
            className="gap-2"
          >
            ส่งผ่าน Outlook
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
