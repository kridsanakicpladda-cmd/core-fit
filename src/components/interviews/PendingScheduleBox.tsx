import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Mail } from "lucide-react";
import { Interview } from "./InterviewFormDialog";
import { toast } from "sonner";
import { addSparkleEffect } from "@/lib/sparkle";
import { cn } from "@/lib/utils";

interface PendingScheduleBoxProps {
  candidates: Interview[];
  onSchedule: (candidateId: string, timeSlot: string) => void;
  bookedSlots: Set<string>;
}

const TIME_SLOTS = [
  "09:00 - 10:00",
  "10:00 - 11:00", 
  "11:00 - 12:00",
  "13:00 - 14:00",
  "14:00 - 15:00",
  "15:00 - 16:00",
  "16:00 - 17:00",
];

export function PendingScheduleBox({ candidates, onSchedule, bookedSlots }: PendingScheduleBoxProps) {
  const handleSchedule = (candidate: Interview, timeSlot: string, e: React.MouseEvent) => {
    addSparkleEffect(e);
    onSchedule(candidate.id, timeSlot);
    
    // Simulate sending emails
    toast.success(
      <div className="space-y-1">
        <p className="font-semibold">นัดสัมภาษณ์สำเร็จ!</p>
        <p className="text-sm">ส่งอีเมลแจ้งเตือนไปยัง:</p>
        <ul className="text-xs space-y-0.5 ml-4">
          <li>✓ ผู้สมัคร: {candidate.candidateEmail || candidate.name}</li>
          <li>✓ ผู้จัดการ: {candidate.managerEmail || candidate.interviewer}</li>
          <li>✓ เพิ่มในปฏิทินแล้ว</li>
        </ul>
      </div>
    );
  };

  return (
    <Card className="glow-on-hover hover:-translate-y-1 transition-all duration-300">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-yellow-500 animate-pulse" />
          รอนัดสัมภาษณ์
          <Badge variant="secondary" className="ml-auto">{candidates.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {candidates.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            ไม่มีผู้สมัครที่รอนัดสัมภาษณ์
          </p>
        ) : (
          candidates.map((candidate) => (
            <div
              key={candidate.id}
              className="p-3 rounded-lg border border-border/50 bg-card/50 space-y-2 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold">{candidate.name}</p>
                  <p className="text-sm text-muted-foreground">{candidate.position}</p>
                  {candidate.candidateEmail && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <Mail className="h-3 w-3" />
                      {candidate.candidateEmail}
                    </p>
                  )}
                </div>
                <Badge variant="outline" className="text-xs">
                  {candidate.interviewRound === "first" ? "รอบแรก" : "รอบสุดท้าย"}
                </Badge>
              </div>
              
              {candidate.proposedSlots && candidate.proposedSlots.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">
                    เวลาที่ผู้สมัครเสนอ:
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {candidate.proposedSlots.map((slot) => (
                      <Button
                        key={slot}
                        size="sm"
                        variant="outline"
                        onClick={(e) => handleSchedule(candidate, slot, e)}
                        disabled={bookedSlots.has(slot)}
                        className={cn(
                          "text-xs transition-all",
                          bookedSlots.has(slot) 
                            ? "opacity-40 cursor-not-allowed bg-muted" 
                            : "hover:bg-primary hover:text-primary-foreground hover:scale-105"
                        )}
                      >
                        <Clock className="h-3 w-3 mr-1" />
                        {slot}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex flex-wrap gap-1">
                {TIME_SLOTS.filter(slot => !candidate.proposedSlots?.includes(slot)).slice(0, 3).map((slot) => (
                  <Button
                    key={slot}
                    size="sm"
                    variant="ghost"
                    onClick={(e) => handleSchedule(candidate, slot, e)}
                    disabled={bookedSlots.has(slot)}
                    className={cn(
                      "text-xs h-7 transition-all",
                      bookedSlots.has(slot) 
                        ? "opacity-40 cursor-not-allowed" 
                        : "hover:bg-accent hover:scale-105"
                    )}
                  >
                    {slot}
                  </Button>
                ))}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
