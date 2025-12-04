import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Star, Heart, X, Loader2 } from "lucide-react";
import { CandidateDetailDialog } from "@/components/candidates/CandidateDetailDialog";
import { TimeSlotSelectionDialog } from "@/components/candidates/TimeSlotSelectionDialog";
import { useToast } from "@/hooks/use-toast";
import { CandidateData } from "@/hooks/useCandidatesData";
import { supabase } from "@/integrations/supabase/client";

interface ManagerCandidateViewProps {
  candidates: CandidateData[];
  isLoading: boolean;
  formatAppliedDate: (date: string | null) => string;
  onStatusChange: (candidateId: string, stage: string) => void;
}

const stageColors: Record<string, string> = {
  New: "bg-blue-100 text-blue-700 border-blue-200",
  Screening: "bg-orange-100 text-orange-700 border-orange-200",
  Interview: "bg-purple-100 text-purple-700 border-purple-200",
  Offer: "bg-green-100 text-green-700 border-green-200",
  Hired: "bg-emerald-100 text-emerald-700 border-emerald-200",
  Rejected: "bg-gray-100 text-gray-700 border-gray-200",
  "Sent to Manager": "bg-indigo-100 text-indigo-700 border-indigo-200",
};

export function ManagerCandidateView({
  candidates,
  isLoading,
  formatAppliedDate,
  onStatusChange,
}: ManagerCandidateViewProps) {
  const { toast } = useToast();
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateData | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isTimeSlotOpen, setIsTimeSlotOpen] = useState(false);
  const [candidateForTimeSlot, setCandidateForTimeSlot] = useState<CandidateData | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter only candidates sent to manager (Screening stage or "Sent to Manager")
  const managerCandidates = candidates.filter(
    (c) => c.stage === "Screening" || c.stage === "Sent to Manager"
  );

  const filteredCandidates = managerCandidates.filter((candidate) => {
    const matchesSearch =
      candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (candidate.position_title?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (candidate.email?.toLowerCase() || "").includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const handleViewDetails = (candidate: CandidateData) => {
    setSelectedCandidate(candidate);
    setIsDetailOpen(true);
  };

  const handleNotInterested = (candidate: CandidateData) => {
    onStatusChange(candidate.id, "Rejected");
    toast({
      title: "อัพเดทสถานะแล้ว",
      description: `${candidate.name} ถูกทำเครื่องหมายว่า Not Interested`,
    });
  };

  const handleInterested = (candidate: CandidateData) => {
    setCandidateForTimeSlot(candidate);
    setIsTimeSlotOpen(true);
  };

  const handleTimeSlotConfirm = async (slots: { date: Date; time: string }[]) => {
    if (!candidateForTimeSlot) return;

    try {
      // Create interview record with proposed slots
      const proposedSlots = slots.map((slot) => ({
        date: slot.date.toISOString(),
        time: slot.time,
      }));

      // Update application stage to Interview and store proposed slots
      if (candidateForTimeSlot.application_id) {
        await supabase
          .from("applications")
          .update({
            stage: "Interview",
            notes: JSON.stringify({
              managerInterested: true,
              proposedSlots,
              proposedAt: new Date().toISOString(),
            }),
          })
          .eq("id", candidateForTimeSlot.application_id);
      }

      // Create a pending interview record
      if (candidateForTimeSlot.application_id) {
        await supabase.from("interviews").insert({
          application_id: candidateForTimeSlot.application_id,
          status: "pending",
          notes: JSON.stringify({
            proposedSlots,
            source: "manager_selection",
          }),
        });
      }

      toast({
        title: "ส่งข้อมูลสำเร็จ",
        description: `ส่ง Slot เวลาสำหรับ ${candidateForTimeSlot.name} ไปยัง Admin แล้ว`,
      });

      setCandidateForTimeSlot(null);
    } catch (error) {
      console.error("Error saving time slots:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถบันทึกข้อมูลได้",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            คัดเลือกผู้สมัคร
          </h1>
          <p className="text-muted-foreground">
            เลือกผู้สมัครที่สนใจเพื่อนัดสัมภาษณ์ ({managerCandidates.length} คน)
          </p>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="ค้นหาผู้สมัคร..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Tabs defaultValue="select" className="w-full">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="select">Select</TabsTrigger>
        </TabsList>

        <TabsContent value="select" className="mt-6">
          <div className="grid gap-4">
            {filteredCandidates.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">ไม่มีผู้สมัครที่รอการคัดเลือก</p>
                </CardContent>
              </Card>
            ) : (
              filteredCandidates.map((candidate) => (
                <Card
                  key={candidate.id}
                  className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/20"
                >
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4 flex-1">
                        <Avatar className="h-14 w-14 border-2 border-primary/40 shadow-sm">
                          <AvatarImage src={candidate.photo_url || undefined} alt={candidate.name} />
                          <AvatarFallback>{candidate.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="relative">
                          <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-white font-bold text-xl shadow-primary">
                            {candidate.ai_fit_score || "-"}
                          </div>
                          {candidate.ai_fit_score && candidate.ai_fit_score >= 90 && (
                            <div className="absolute -top-1 -right-1 h-5 w-5 bg-yellow-400 rounded-full flex items-center justify-center">
                              <Star className="h-3 w-3 text-white fill-white" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                              {candidate.name}
                            </h3>
                            <Badge className={stageColors[candidate.stage || "New"] || stageColors.New}>
                              {candidate.stage || "New"}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                            <span className="font-medium text-foreground">
                              {candidate.position_title || "ไม่ระบุตำแหน่ง"}
                            </span>
                            <span>•</span>
                            <span>สมัครเมื่อ: {formatAppliedDate(candidate.applied_at)}</span>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline" className="text-xs font-normal">
                              {candidate.source}
                            </Badge>
                            {candidate.email && (
                              <Badge variant="outline" className="text-xs font-normal">
                                {candidate.email}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          className="hover:bg-accent transition-colors"
                          onClick={() => handleViewDetails(candidate)}
                        >
                          ดูรายละเอียด
                        </Button>
                        <Button
                          variant="outline"
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => handleNotInterested(candidate)}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Not Interested
                        </Button>
                        <Button
                          className="bg-gradient-to-r from-primary to-primary/80 hover:shadow-glow"
                          onClick={() => handleInterested(candidate)}
                        >
                          <Heart className="h-4 w-4 mr-2" />
                          Interested
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      <CandidateDetailDialog
        candidate={selectedCandidate as any}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        onEdit={() => {}}
        onDelete={() => {}}
        onInterviewUpdate={() => {}}
        onTestScoreUpdate={() => {}}
        onStatusChange={() => {}}
      />

      <TimeSlotSelectionDialog
        open={isTimeSlotOpen}
        onOpenChange={setIsTimeSlotOpen}
        candidateName={candidateForTimeSlot?.name || ""}
        onConfirm={handleTimeSlotConfirm}
      />
    </div>
  );
}
