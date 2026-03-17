import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Filter, Star, UserPlus, Loader2, Sparkles, Users, Heart, Building2, CalendarDays, Ruler, Weight, DollarSign } from "lucide-react";
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
import { CandidateDetailDialog } from "@/components/candidates/CandidateDetailDialog";
import { CandidateFormDialog } from "@/components/candidates/CandidateFormDialog";
import { SendToManagerDialog } from "@/components/candidates/SendToManagerDialog";
import { ManagerCandidateView } from "@/components/candidates/ManagerCandidateView";
import { useToast } from "@/hooks/use-toast";
import { useNotifications } from "@/contexts/NotificationContext";
import { useCandidatesData, CandidateData } from "@/hooks/useCandidatesData";
import { useUserRoles } from "@/hooks/useUserRoles";
import { useCalculateFitScore } from "@/hooks/useCalculateFitScore";
import { getScoreColor, getScoreLabel } from "@/lib/calculateJobFitScore";
import { useHiringLogic } from "@/hooks/useHiringLogic";
import { supabase } from "@/integrations/supabase/client";

const stageColors: Record<string, string> = {
  "Short CV": "bg-slate-100 text-slate-700 border-slate-200",
  "Pending": "bg-amber-100 text-amber-700 border-amber-200",
  "Full CV": "bg-blue-100 text-blue-700 border-blue-200",
  "Manager-Review": "bg-indigo-100 text-indigo-700 border-indigo-200",
  "Interview-Scheduled": "bg-violet-100 text-violet-700 border-violet-200",
  "Main Interview": "bg-purple-100 text-purple-700 border-purple-200",
  "Interview-Scheduled(Final)": "bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200",
  "Final Interview": "bg-pink-100 text-pink-700 border-pink-200",
  "Compare Candidate": "bg-orange-100 text-orange-700 border-orange-200",
  "Offer": "bg-green-100 text-green-700 border-green-200",
  "Hire": "bg-emerald-100 text-emerald-700 border-emerald-200",
  "Reject": "bg-red-100 text-red-700 border-red-200",
};

const stageLabels: Record<string, string> = {
  "Short CV": "Short CV",
  "Pending": "Pending",
  "Full CV": "Full CV",
  "Manager-Review": "Manager Review",
  "Interview-Scheduled": "Interview Scheduled",
  "Main Interview": "Main Interview",
  "Interview-Scheduled(Final)": "Final Scheduled",
  "Final Interview": "Final Interview",
  "Compare Candidate": "Compare",
  "Offer": "Offer",
  "Hire": "Hired",
  "Reject": "Rejected",
};

const stageOrder = [
  "Short CV", "Pending", "Full CV", "Manager-Review",
  "Interview-Scheduled", "Main Interview", "Interview-Scheduled(Final)",
  "Final Interview", "Compare Candidate", "Offer", "Hire", "Reject",
];

export default function Candidates() {
  const { toast } = useToast();
  const { addNotification } = useNotifications();
  const { candidates, isLoading, updateApplicationStage, updateCandidateStage, formatAppliedDate } = useCandidatesData();
  const { isManager, isAdmin, isHRManager, isRecruiter, isLoading: rolesLoading } = useUserRoles();
  const calculateFitScore = useCalculateFitScore();
  const { checkAndUpdateJobStatus } = useHiringLogic();
  const [calculatingScores, setCalculatingScores] = useState<Set<string>>(new Set());
  
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateData | null>(null);
  const [editingCandidate, setEditingCandidate] = useState<CandidateData | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [interestDialogOpen, setInterestDialogOpen] = useState(false);
  const [selectedInterestCandidate, setSelectedInterestCandidate] = useState<CandidateData | null>(null);

  // Auto-calculate scores for candidates without scores
  useEffect(() => {
    if (!isLoading && candidates.length > 0) {
      candidates.forEach((candidate) => {
        if (
          !candidate.ai_fit_score &&
          candidate.application_id &&
          candidate.job_position_id &&
          !calculatingScores.has(candidate.id)
        ) {
          setCalculatingScores((prev) => new Set(prev).add(candidate.id));
          calculateFitScore.mutate(
            {
              candidateId: candidate.id,
              applicationId: candidate.application_id,
              jobPositionId: candidate.job_position_id,
            },
            {
              onSettled: () => {
                setCalculatingScores((prev) => {
                  const newSet = new Set(prev);
                  newSet.delete(candidate.id);
                  return newSet;
                });
              },
            }
          );
        }
      });
    }
  }, [candidates, isLoading]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedPositions, setSelectedPositions] = useState<string[]>([]);
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);
  const [isSendToManagerOpen, setIsSendToManagerOpen] = useState(false);
  const [selectedSources, setSelectedSources] = useState<string[]>([]);

  // Show Manager view if user only has manager role (not admin/hr/recruiter)
  const showManagerView = isManager && !isAdmin && !isHRManager && !isRecruiter;

  // Get unique positions for filter
  const uniquePositions = useMemo(() => {
    const positions = candidates
      .map(c => c.position_title)
      .filter((p): p is string => !!p);
    return Array.from(new Set(positions)).sort();
  }, [candidates]);

  // Get unique sources (companies) for filter
  const uniqueSources = useMemo(() => {
    const sources = candidates
      .map(c => c.source)
      .filter((s): s is string => !!s);
    return Array.from(new Set(sources)).sort();
  }, [candidates]);

  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (candidate.position_title?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (candidate.email?.toLowerCase() || '').includes(searchQuery.toLowerCase());

    const matchesPosition = selectedPositions.length === 0 ||
      (candidate.position_title && selectedPositions.includes(candidate.position_title));

    const matchesSource = selectedSources.length === 0 ||
      selectedSources.includes(candidate.source);

    let matchesTab = true;
    const stage = candidate.stage || "Short CV";

    if (activeTab === "all") {
      matchesTab = true; // Show all candidates
    } else if (activeTab === "reject") {
      matchesTab = stage === "Reject";
    } else {
      matchesTab = stage === activeTab;
    }

    return matchesSearch && matchesPosition && matchesSource && matchesTab;
  });

  // Count candidates per tab
  const tabCounts = useMemo(() => {
    const filtered = candidates.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.position_title?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (c.email?.toLowerCase() || '').includes(searchQuery.toLowerCase());
      const matchesPosition = selectedPositions.length === 0 ||
        (c.position_title && selectedPositions.includes(c.position_title));
      const matchesSource = selectedSources.length === 0 ||
        selectedSources.includes(c.source);
      return matchesSearch && matchesPosition && matchesSource;
    });

    const stage = (c: CandidateData) => c.stage || "Short CV";
    const counts: Record<string, number> = {
      all: filtered.length,
    };
    stageOrder.forEach(s => {
      counts[s] = filtered.filter(c => stage(c) === s).length;
    });
    return counts;
  }, [candidates, searchQuery, selectedPositions, selectedSources]);

  const handleViewDetails = (candidate: CandidateData) => {
    setSelectedCandidate(candidate);
    setIsDetailOpen(true);
  };

  const handleEdit = (candidate: CandidateData) => {
    setIsDetailOpen(false);
    setEditingCandidate(candidate);
    setIsFormOpen(true);
  };

  const handleDeleteCandidate = async (candidateId: string) => {
    try {
      // Delete candidate from database
      const { error } = await supabase
        .from('candidates')
        .delete()
        .eq('id', candidateId);

      if (error) throw error;

      toast({
        title: "ลบสำเร็จ",
        description: "ลบข้อมูลผู้สมัครเรียบร้อยแล้ว",
      });

      // Close dialog and refresh
      setIsDetailOpen(false);
      setSelectedCandidate(null);
      
      // Refresh candidates list
      window.location.reload();
    } catch (error: any) {
      console.error('Error deleting candidate:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message || "ไม่สามารถลบผู้สมัครได้",
        variant: "destructive",
      });
    }
  };

  const handleInterviewUpdate = (candidateId: string, interviews: any) => {
    toast({
      title: "บันทึกข้อมูลแล้ว",
      description: "แก้ไขข้อมูลการสัมภาษณ์เรียบร้อยแล้ว",
    });
  };

  const handleTestScoreUpdate = (candidateId: string, testScores: any) => {
    toast({
      title: "บันทึกข้อมูลแล้ว",
      description: "แก้ไขคะแนนทดสอบเรียบร้อยแล้ว",
    });
  };

  const handleSave = (candidateData: any) => {
    toast({
      title: "บันทึกข้อมูลแล้ว",
      description: "แก้ไขข้อมูลผู้สมัครเรียบร้อยแล้ว",
    });
    setEditingCandidate(null);
  };

  const handleAddNew = () => {
    setEditingCandidate(null);
    setIsFormOpen(true);
  };

  const handleStatusChange = (candidateId: string | number, stage: string) => {
    console.log('handleStatusChange called:', { candidateId, stage });
    
    // Convert candidateId to string for comparison
    const candidateIdStr = String(candidateId);
    const candidate = candidates.find(c => c.id === candidateIdStr);
    
    if (!candidate) {
      console.error('Candidate not found:', candidateId);
      toast({
        title: "ไม่พบผู้สมัคร",
        description: "ไม่พบข้อมูลผู้สมัครนี้",
        variant: "destructive",
      });
      return;
    }

    const oldStage = candidate.stage || "Short CV";

    // If rejecting, track which stage the rejection happened at
    if (stage === "Reject") {
      supabase
        .from("candidates")
        .update({ rejected_at_stage: oldStage })
        .eq("id", candidateIdStr)
        .then();
    }

    // Update stage in candidates table directly
    updateCandidateStage({ candidateId: candidateIdStr, stage });

    // Also update application stage if application exists
    if (candidate.application_id) {
      updateApplicationStage({ applicationId: candidate.application_id, stage });
    }

    // Auto-close/reopen job position based on hired count
    if (candidate.position_id && (stage === "Hire" || oldStage === "Hire")) {
      checkAndUpdateJobStatus(candidate.position_id, stage, oldStage);
    }

    addNotification({
      type: 'status_change',
      title: 'เปลี่ยนสถานะผู้สมัคร',
      description: `ย้าย ${candidate.name} ไปยัง ${stage}`,
      candidateName: candidate.name,
      oldStatus: candidate.stage || "New",
      newStatus: stage,
    });
    
    toast({
      title: "เปลี่ยนสถานะแล้ว",
      description: `ย้ายไปยัง ${stage} แล้ว`,
    });
  };

  const togglePosition = (position: string) => {
    setSelectedPositions(prev => 
      prev.includes(position)
        ? prev.filter(p => p !== position)
        : [...prev, position]
    );
  };

  const toggleSource = (source: string) => {
    setSelectedSources(prev =>
      prev.includes(source)
        ? prev.filter(s => s !== source)
        : [...prev, source]
    );
  };

  const clearFilters = () => {
    setSelectedPositions([]);
    setSelectedSources([]);
  };

  const toggleCandidateSelection = (candidateId: string) => {
    setSelectedCandidates(prev =>
      prev.includes(candidateId)
        ? prev.filter(id => id !== candidateId)
        : [...prev, candidateId]
    );
  };

  const handleGenerateFitScore = async (candidate: CandidateData) => {
    if (!candidate.job_position_id) {
      toast({
        title: "ไม่สามารถคำนวณได้",
        description: "ผู้สมัครยังไม่ได้สมัครตำแหน่งงาน",
        variant: "destructive",
      });
      return;
    }

    setCalculatingScores((prev) => new Set(prev).add(candidate.id));

    calculateFitScore.mutate(
      {
        candidateId: candidate.id,
        applicationId: candidate.application_id,
        jobPositionId: candidate.job_position_id,
      },
      {
        onSettled: () => {
          setCalculatingScores((prev) => {
            const newSet = new Set(prev);
            newSet.delete(candidate.id);
            return newSet;
          });
        },
      }
    );
  };

  const handleSendFullApplication = async () => {
    if (!selectedInterestCandidate) return;

    try {
      // Check if candidate has email
      if (!selectedInterestCandidate.email) {
        toast({
          title: "ไม่พบอีเมล",
          description: "ผู้สมัครนี้ไม่มีอีเมลในระบบ ไม่สามารถส่งใบสมัครได้",
          variant: "destructive",
        });
        return;
      }

      // Call edge function to send invite email
      const { data, error } = await supabase.functions.invoke('send-application-invite', {
        body: {
          candidateId: selectedInterestCandidate.id,
          candidateName: selectedInterestCandidate.name,
          candidateEmail: selectedInterestCandidate.email,
          position: selectedInterestCandidate.position_title || undefined,
        }
      });

      if (error) {
        throw error;
      }

      // Update candidate stage to Pending (waiting for full application)
      updateCandidateStage({ candidateId: selectedInterestCandidate.id, stage: 'Pending' });

      toast({
        title: "ส่งใบสมัครฉบับเต็มแล้ว",
        description: `ส่งอีเมลเชิญให้ ${selectedInterestCandidate.name} กรอกใบสมัครฉบับเต็มเรียบร้อยแล้ว`,
      });

      addNotification({
        type: 'status_change',
        title: 'ส่งใบสมัครฉบับเต็ม',
        description: `ส่งอีเมลเชิญให้ ${selectedInterestCandidate.name} กรอกใบสมัครฉบับเต็ม`,
        candidateName: selectedInterestCandidate.name,
        oldStatus: selectedInterestCandidate.stage || 'Short CV',
        newStatus: 'Pending',
      });

      setInterestDialogOpen(false);
      setSelectedInterestCandidate(null);
    } catch (error: any) {
      console.error('Error sending full application:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message || "ไม่สามารถส่งใบสมัครฉบับเต็มได้",
        variant: "destructive",
      });
    }
  };

  const handleBulkAction = (action: 'send_to_manager' | 'not_interested') => {
    if (action === 'send_to_manager') {
      setIsSendToManagerOpen(true);
      return;
    }

    selectedCandidates.forEach(candidateId => {
      handleStatusChange(candidateId, 'Reject');
    });
    
    setSelectedCandidates([]);
    toast({
      title: "อัพเดทเรียบร้อยแล้ว",
      description: `อัพเดทสถานะของผู้สมัคร ${selectedCandidates.length} คนแล้ว`,
    });
  };

  if (isLoading || rolesLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show Manager-specific view
  if (showManagerView) {
    return (
      <ManagerCandidateView
        candidates={candidates}
        isLoading={isLoading}
        formatAppliedDate={formatAppliedDate}
        onStatusChange={handleStatusChange}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            ผู้สมัคร
          </h1>
          <p className="text-muted-foreground">
            จัดการและติดตามสถานะผู้สมัครทั้งหมด ({candidates.length} คน)
          </p>
        </div>
        <Button onClick={handleAddNew}>
          <UserPlus className="h-4 w-4 mr-2" />
          เพิ่มผู้สมัคร
        </Button>
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
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              ตัวกรอง
              {(selectedPositions.length + selectedSources.length) > 0 && (
                <Badge variant="secondary" className="ml-2 rounded-full px-2">
                  {selectedPositions.length + selectedSources.length}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">ตัวกรอง</h4>
                {(selectedPositions.length + selectedSources.length) > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    ล้างทั้งหมด
                  </Button>
                )}
              </div>
              {/* Position Filter */}
              <div>
                <h5 className="text-sm font-medium mb-2">ตำแหน่ง</h5>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {uniquePositions.map((position) => (
                    <div key={position} className="flex items-center space-x-2">
                      <Checkbox
                        id={`pos-${position}`}
                        checked={selectedPositions.includes(position)}
                        onCheckedChange={() => togglePosition(position)}
                      />
                      <label htmlFor={`pos-${position}`} className="text-sm cursor-pointer">
                        {position}
                      </label>
                    </div>
                  ))}
                  {uniquePositions.length === 0 && (
                    <p className="text-sm text-muted-foreground">ไม่มีตำแหน่ง</p>
                  )}
                </div>
              </div>
              {/* Source/Company Filter */}
              <div>
                <h5 className="text-sm font-medium mb-2">แหล่งที่มา</h5>
                <div className="space-y-2">
                  {uniqueSources.map((source) => (
                    <div key={source} className="flex items-center space-x-2">
                      <Checkbox
                        id={`src-${source}`}
                        checked={selectedSources.includes(source)}
                        onCheckedChange={() => toggleSource(source)}
                      />
                      <label htmlFor={`src-${source}`} className="text-sm cursor-pointer">
                        {source}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full justify-start flex-wrap h-auto gap-1 p-1">
          {[
            { value: "all", label: "ALL" },
            ...stageOrder.map(s => ({ value: s, label: stageLabels[s] || s })),
          ].map((tab) => {
            const count = tabCounts[tab.value] || 0;
            return (
              <TabsTrigger key={tab.value} value={tab.value} className="gap-1.5 text-xs">
                {tab.label}
                {count > 0 && (
                  <Badge variant={activeTab === tab.value ? "default" : "secondary"} className="h-5 min-w-[20px] px-1.5 text-xs">
                    {count}
                  </Badge>
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <div className="grid gap-3">
            {filteredCandidates.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">ไม่พบผู้สมัคร</p>
                </CardContent>
              </Card>
            ) : (
              filteredCandidates.map((candidate) => (
                <Card key={candidate.id} className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/20">
                  <CardContent className="py-4">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={selectedCandidates.includes(candidate.id)}
                        onCheckedChange={() => toggleCandidateSelection(candidate.id)}
                      />
                      <Avatar className="h-11 w-11 border-2 border-primary/40 shadow-sm flex-shrink-0">
                        <AvatarImage src={candidate.photo_url || undefined} alt={candidate.name} />
                        <AvatarFallback className="text-sm">
                          {candidate.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      {/* AI Score */}
                      <div className="relative group/score flex-shrink-0">
                        <div className={`h-11 w-11 rounded-lg bg-gradient-to-br ${
                          candidate.ai_fit_score
                            ? getScoreColor(candidate.ai_fit_score)
                            : calculatingScores.has(candidate.id)
                            ? 'from-blue-500 to-blue-600 animate-pulse'
                            : 'from-gray-400 to-gray-500'
                        } flex items-center justify-center text-white font-bold shadow-sm`}>
                          {calculatingScores.has(candidate.id) ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : candidate.ai_fit_score ? (
                            <span className="text-base">{candidate.ai_fit_score}</span>
                          ) : (
                            <span className="text-base">-</span>
                          )}
                        </div>
                        {candidate.ai_fit_score && candidate.ai_fit_score >= 90 && (
                          <div className="absolute -top-1 -right-1 h-4 w-4 bg-yellow-400 rounded-full flex items-center justify-center animate-pulse">
                            <Star className="h-2.5 w-2.5 text-white fill-white" />
                          </div>
                        )}
                      </div>
                      {/* Main Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
                            {candidate.name}
                          </h3>
                          <Badge className={`text-[10px] ${stageColors[candidate.stage || "Short CV"] || stageColors["Short CV"]}`}>
                            {stageLabels[candidate.stage || "Short CV"] || candidate.stage || "Short CV"}
                          </Badge>
                          {candidate.stage === "Reject" && candidate.rejected_at_stage && (
                            <span className="text-[10px] text-red-500">(จาก {stageLabels[candidate.rejected_at_stage] || candidate.rejected_at_stage})</span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="font-medium text-foreground">{candidate.position_title || "ไม่ระบุตำแหน่ง"}</span>
                          <span>|</span>
                          <Badge variant="outline" className="text-[10px] h-5 font-normal">
                            {candidate.source}
                          </Badge>
                        </div>
                      </div>
                      {/* Data Columns */}
                      <div className="hidden lg:flex items-center gap-4 text-xs text-muted-foreground flex-shrink-0">
                        <div className="text-center w-12" title="อายุ">
                          <div className="text-[10px] text-muted-foreground/60">อายุ</div>
                          <div className="font-medium text-foreground">{candidate.age || '-'}</div>
                        </div>
                        <div className="text-center w-16" title="เงินเดือน">
                          <div className="text-[10px] text-muted-foreground/60">เงินเดือน</div>
                          <div className="font-medium text-foreground">{candidate.expected_salary ? `${Number(candidate.expected_salary).toLocaleString()}` : '-'}</div>
                        </div>
                        <div className="text-center w-12" title="ส่วนสูง">
                          <div className="text-[10px] text-muted-foreground/60">ส่วนสูง</div>
                          <div className="font-medium text-foreground">{candidate.height || '-'}</div>
                        </div>
                        <div className="text-center w-12" title="น้ำหนัก">
                          <div className="text-[10px] text-muted-foreground/60">น้ำหนัก</div>
                          <div className="font-medium text-foreground">{candidate.weight || '-'}</div>
                        </div>
                        <div className="text-center w-24" title="วันที่สมัคร">
                          <div className="text-[10px] text-muted-foreground/60">วันที่สมัคร</div>
                          <div className="font-medium text-foreground">{candidate.applied_at ? new Date(candidate.applied_at).toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: '2-digit' }) : '-'}</div>
                        </div>
                      </div>
                      {/* Actions */}
                      <div className="flex gap-2 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full hover:bg-primary/10"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleGenerateFitScore(candidate);
                          }}
                          disabled={calculatingScores.has(candidate.id)}
                          title="คำนวณ AI Fit Score ใหม่"
                        >
                          {calculatingScores.has(candidate.id) ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Sparkles className="h-4 w-4 text-primary" />
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="hover:bg-accent transition-colors"
                          onClick={() => handleViewDetails(candidate)}
                        >
                          ดูรายละเอียด
                        </Button>
                        {(candidate.stage || 'Short CV') === 'Short CV' && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="hover:bg-pink-50 hover:text-pink-600 hover:border-pink-300 transition-colors gap-1"
                            onClick={() => {
                              setSelectedInterestCandidate(candidate);
                              setInterestDialogOpen(true);
                            }}
                          >
                            <Heart className="h-3.5 w-3.5" />
                            Interest
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Bulk Action Popup */}
      {selectedCandidates.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-5">
          <Card className="shadow-lg border-2">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">
                  เลือก {selectedCandidates.length} คน
                </span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleBulkAction('send_to_manager')}
                  >
                    Send to Manager
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleBulkAction('not_interested')}
                  >
                    Not Interested
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setSelectedCandidates([])}
                  >
                    ยกเลิก
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <CandidateDetailDialog
        candidate={selectedCandidate as any}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        onEdit={() => handleEdit(selectedCandidate!)}
        onDelete={() => selectedCandidate && handleDeleteCandidate(selectedCandidate.id)}
        onInterviewUpdate={handleInterviewUpdate as any}
        onTestScoreUpdate={handleTestScoreUpdate as any}
        onStatusChange={handleStatusChange as any}
      />

      <CandidateFormDialog
        candidate={editingCandidate as any}
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSave={handleSave}
      />

      <SendToManagerDialog
        open={isSendToManagerOpen}
        onOpenChange={setIsSendToManagerOpen}
        candidates={selectedCandidates.map(id => {
          const candidate = candidates.find(c => c.id === id);
          return {
            id: id,
            name: candidate?.name ?? '',
            position: candidate?.position_title ?? 'ไม่ระบุตำแหน่ง',
            score: candidate?.ai_fit_score ?? 0,
            resumeFile: candidate?.resume_url ?? undefined,
            preScreenComment: candidate?.pre_screen_comment ?? '-',
            age: candidate?.age ?? null,
            expectedSalary: candidate?.expected_salary ?? null,
          };
        })}
        onSent={() => {
          selectedCandidates.forEach(candidateId => {
            handleStatusChange(candidateId, 'Manager-Review');
          });
          setSelectedCandidates([]);
        }}
      />

      {/* Interest Confirmation Dialog */}
      <AlertDialog open={interestDialogOpen} onOpenChange={setInterestDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-pink-500" />
              ส่งใบสมัครฉบับเต็มให้ผู้สมัคร
            </AlertDialogTitle>
            <AlertDialogDescription>
              {selectedInterestCandidate && (
                <>
                  คุณต้องการส่งใบสมัครฉบับเต็มให้กับ <strong>{selectedInterestCandidate.name}</strong> หรือไม่?
                  <br />
                  <span className="text-muted-foreground">
                    ระบบจะส่ง email แจ้งให้ผู้สมัครกรอกข้อมูลเพิ่มเติมในใบสมัครฉบับเต็ม
                  </span>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction
              className="bg-pink-500 hover:bg-pink-600"
              onClick={handleSendFullApplication}
            >
              ส่งใบสมัครฉบับเต็ม
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
