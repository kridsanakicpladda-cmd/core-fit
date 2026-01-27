import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Filter, Star, UserPlus, Loader2, Sparkles, Users, FileText, Heart } from "lucide-react";
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
import { supabase } from "@/integrations/supabase/client";

const stageColors: Record<string, string> = {
  Pending: "bg-slate-100 text-slate-700 border-slate-200",
  Interested: "bg-blue-100 text-blue-700 border-blue-200",
  Shortlist: "bg-yellow-100 text-yellow-700 border-yellow-200",
  Screening: "bg-orange-100 text-orange-700 border-orange-200",
  Interview: "bg-purple-100 text-purple-700 border-purple-200",
  Offer: "bg-green-100 text-green-700 border-green-200",
  Hired: "bg-emerald-100 text-emerald-700 border-emerald-200",
  Rejected: "bg-gray-100 text-gray-700 border-gray-200",
};

const stageLabels: Record<string, string> = {
  Pending: "Pending",
  Interested: "Interested",
  Shortlist: "Shortlist",
  Screening: "Screening",
  Interview: "Interview",
  Offer: "Offer",
  Hired: "Hired",
  Rejected: "Rejected",
};

export default function Candidates() {
  const { toast } = useToast();
  const { addNotification } = useNotifications();
  const { candidates, isLoading, updateApplicationStage, updateCandidateStage, formatAppliedDate } = useCandidatesData();
  const { isManager, isAdmin, isHRManager, isRecruiter, isLoading: rolesLoading } = useUserRoles();
  const calculateFitScore = useCalculateFitScore();
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
  const [viewMode, setViewMode] = useState<'candidates' | 'applicant-resume'>('candidates');

  // Show Manager view if user only has manager role (not admin/hr/recruiter)
  const showManagerView = isManager && !isAdmin && !isHRManager && !isRecruiter;

  // Get unique positions for filter
  const uniquePositions = useMemo(() => {
    const positions = candidates
      .map(c => c.position_title)
      .filter((p): p is string => !!p);
    return Array.from(new Set(positions)).sort();
  }, [candidates]);

  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (candidate.position_title?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (candidate.email?.toLowerCase() || '').includes(searchQuery.toLowerCase());

    const matchesPosition = selectedPositions.length === 0 ||
      (candidate.position_title && selectedPositions.includes(candidate.position_title));

    // Filter by view mode (source)
    const matchesViewMode = viewMode === 'candidates'
      ? candidate.source !== 'Quick Apply'
      : candidate.source === 'Quick Apply';

    let matchesTab = true;
    const stage = candidate.stage || "Pending";

    if (activeTab === "all") {
      matchesTab = true;
    } else if (activeTab === "shortlist") {
      matchesTab = stage === "Shortlist";
    } else if (activeTab === "interested") {
      matchesTab = stage === "Interested";
    } else if (activeTab === "not-interested") {
      matchesTab = stage === "Rejected";
    } else if (activeTab === "pre-screen") {
      matchesTab = stage === "Screening";
    } else if (activeTab === "interview1") {
      // Interview 1 = Interview stage (first round)
      matchesTab = stage === "Interview";
    } else if (activeTab === "interview2") {
      // Interview 2 = Interview stage (second round) - can be differentiated by interview count if needed
      matchesTab = stage === "Interview";
    } else if (activeTab === "offer") {
      matchesTab = stage === "Offer";
    } else if (activeTab === "hired") {
      matchesTab = stage === "Hired";
    }

    return matchesSearch && matchesPosition && matchesTab && matchesViewMode;
  });

  // Count candidates by source
  const candidatesCount = candidates.filter(c => c.source !== 'Quick Apply').length;
  const applicantResumeCount = candidates.filter(c => c.source === 'Quick Apply').length;

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

    // Update stage in candidates table directly
    updateCandidateStage({ candidateId: candidateIdStr, stage });
    
    // Also update application stage if application exists
    if (candidate.application_id) {
      updateApplicationStage({ applicationId: candidate.application_id, stage });
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

  const clearFilters = () => {
    setSelectedPositions([]);
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

      // Update candidate stage to Interested locally
      updateCandidateStage({ candidateId: selectedInterestCandidate.id, stage: 'Interested' });

      toast({
        title: "ส่งใบสมัครฉบับเต็มแล้ว",
        description: `ส่งอีเมลเชิญให้ ${selectedInterestCandidate.name} กรอกใบสมัครฉบับเต็มเรียบร้อยแล้ว`,
      });

      addNotification({
        type: 'status_change',
        title: 'ส่งใบสมัครฉบับเต็ม',
        description: `ส่งอีเมลเชิญให้ ${selectedInterestCandidate.name} กรอกใบสมัครฉบับเต็ม`,
        candidateName: selectedInterestCandidate.name,
        oldStatus: selectedInterestCandidate.stage || 'Pending',
        newStatus: 'Interested',
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
      handleStatusChange(candidateId, 'Rejected');
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
        <div className="flex items-center gap-4">
          {/* View Mode Toggle Buttons */}
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'candidates' ? 'default' : 'outline'}
              onClick={() => setViewMode('candidates')}
              className="gap-2"
            >
              <Users className="h-4 w-4" />
              ผู้สมัคร
              <Badge variant="secondary" className="ml-1">
                {candidatesCount}
              </Badge>
            </Button>
            <Button
              variant={viewMode === 'applicant-resume' ? 'default' : 'outline'}
              onClick={() => setViewMode('applicant-resume')}
              className="gap-2"
            >
              <FileText className="h-4 w-4" />
              Applicant Resume
              <Badge variant="secondary" className="ml-1">
                {applicantResumeCount}
              </Badge>
            </Button>
          </div>
        </div>
        <Button onClick={handleAddNew}>
          <UserPlus className="h-4 w-4 mr-2" />
          เพิ่มผู้สมัคร
        </Button>
      </div>

      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          {viewMode === 'candidates' ? 'ผู้สมัคร' : 'Applicant Resume'}
        </h1>
        <p className="text-muted-foreground">
          {viewMode === 'candidates'
            ? `จัดการและติดตามสถานะผู้สมัครทั้งหมด (${candidatesCount} คน)`
            : `รายการประวัติที่ฝากไว้ผ่าน Quick Apply (${applicantResumeCount} คน)`}
        </p>
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
              {selectedPositions.length > 0 && (
                <Badge variant="secondary" className="ml-2 rounded-full px-2">
                  {selectedPositions.length}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">กรองตามตำแหน่ง</h4>
                {selectedPositions.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    ล้างทั้งหมด
                  </Button>
                )}
              </div>
              <div className="space-y-3">
                {uniquePositions.map((position) => (
                  <div key={position} className="flex items-center space-x-2">
                    <Checkbox
                      id={position}
                      checked={selectedPositions.includes(position)}
                      onCheckedChange={() => togglePosition(position)}
                    />
                    <label
                      htmlFor={position}
                      className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {position}
                    </label>
                  </div>
                ))}
                {uniquePositions.length === 0 && (
                  <p className="text-sm text-muted-foreground">ไม่มีตำแหน่ง</p>
                )}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="all">ALL</TabsTrigger>
          <TabsTrigger value="shortlist">Shortlist</TabsTrigger>
          <TabsTrigger value="interested">Interested</TabsTrigger>
          <TabsTrigger value="not-interested">Not Interested</TabsTrigger>
          <TabsTrigger value="pre-screen">Pre Screen</TabsTrigger>
          <TabsTrigger value="interview1">Interview 1</TabsTrigger>
          <TabsTrigger value="interview2">Interview 2</TabsTrigger>
          <TabsTrigger value="offer">Offer</TabsTrigger>
          <TabsTrigger value="hired">Hired</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <div className="grid gap-4">
            {filteredCandidates.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">ไม่พบผู้สมัคร</p>
                </CardContent>
              </Card>
            ) : (
              filteredCandidates.map((candidate) => (
                <Card key={candidate.id} className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/20">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4 flex-1">
                        <Checkbox
                          checked={selectedCandidates.includes(candidate.id)}
                          onCheckedChange={() => toggleCandidateSelection(candidate.id)}
                          className="mt-1"
                        />
                        <Avatar className="h-14 w-14 border-2 border-primary/40 shadow-sm">
                          <AvatarImage src={candidate.photo_url || undefined} alt={candidate.name} />
                          <AvatarFallback>
                            {candidate.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex items-center gap-2">
                          <div className="relative group/score">
                            <div className={`h-14 w-14 rounded-xl bg-gradient-to-br ${
                              candidate.ai_fit_score
                                ? getScoreColor(candidate.ai_fit_score)
                                : calculatingScores.has(candidate.id)
                                ? 'from-blue-500 to-blue-600 animate-pulse'
                                : 'from-gray-400 to-gray-500'
                            } flex items-center justify-center text-white font-bold shadow-lg transition-transform group-hover/score:scale-110`}>
                              {calculatingScores.has(candidate.id) ? (
                                <Loader2 className="h-6 w-6 animate-spin" />
                              ) : candidate.ai_fit_score ? (
                                <span className="text-xl">{candidate.ai_fit_score}</span>
                              ) : (
                                <span className="text-xl">-</span>
                              )}
                            </div>
                            {candidate.ai_fit_score && candidate.ai_fit_score >= 90 && (
                              <div className="absolute -top-1 -right-1 h-5 w-5 bg-yellow-400 rounded-full flex items-center justify-center animate-pulse">
                                <Star className="h-3 w-3 text-white fill-white" />
                              </div>
                            )}
                            {candidate.ai_fit_score && (
                              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover/score:opacity-100 transition-opacity whitespace-nowrap">
                                <span className="text-xs font-medium text-muted-foreground">
                                  {getScoreLabel(candidate.ai_fit_score)}
                                </span>
                              </div>
                            )}
                          </div>
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
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                              {candidate.name}
                            </h3>
                            <Badge className={stageColors[candidate.stage || "New"] || stageColors.New}>
                              {stageLabels[candidate.stage || "New"] || candidate.stage || "New"}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                            <span className="font-medium text-foreground">{candidate.position_title || "ไม่ระบุตำแหน่ง"}</span>
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
                        {viewMode === 'applicant-resume' && (
                          <Button
                            variant="outline"
                            className="hover:bg-pink-50 hover:text-pink-600 hover:border-pink-300 transition-colors gap-2"
                            onClick={() => {
                              setSelectedInterestCandidate(candidate);
                              setInterestDialogOpen(true);
                            }}
                          >
                            <Heart className="h-4 w-4" />
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
          };
        })}
        onSent={() => {
          selectedCandidates.forEach(candidateId => {
            handleStatusChange(candidateId, 'Interview');
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
