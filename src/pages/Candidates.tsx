import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Filter, Star, UserPlus } from "lucide-react";
import { CandidateDetailDialog } from "@/components/candidates/CandidateDetailDialog";
import { CandidateFormDialog } from "@/components/candidates/CandidateFormDialog";
import { SendToManagerDialog } from "@/components/candidates/SendToManagerDialog";
import { useToast } from "@/hooks/use-toast";
import { useNotifications } from "@/contexts/NotificationContext";
import { useCandidates, Candidate } from "@/contexts/CandidatesContext";

const initialCandidates = [
  {
    id: 1,
    name: "สมชาย ใจดี",
    position: "Senior Developer",
    experience: "5 ปี",
    score: 89,
    skills: ["React", "Node.js", "TypeScript"],
    appliedDate: "2 วันที่แล้ว",
    status: "screening",
    pipelineStatus: "interview_1",
    email: "somchai@email.com",
    phone: "081-234-5678",
    location: "กรุงเทพมหานคร",
    education: "ปริญญาตรี วิทยาการคอมพิวเตอร์",
    summary: "มีประสบการณ์ในการพัฒนา Web Application ด้วย React และ Node.js มากกว่า 5 ปี เคยทำงานในโปรเจกต์ขนาดใหญ่หลายโปรเจกต์",
    previousCompany: "Tech Solutions Co.",
    testScores: {
      hrTest: 85,
      departmentTest: 92,
    },
    interviews: {
      hr: { date: "15/03/2024", passed: true, feedback: "มีทักษะการสื่อสารที่ดี" },
      manager: { date: "18/03/2024", passed: true, feedback: "มีความรู้ทางเทคนิคสูง" },
      isTeam: { date: "20/03/2024", passed: true, feedback: "แก้ปัญหาได้ดีมาก" },
    },
  },
  {
    id: 2,
    name: "สมหญิง รักดี",
    position: "UX Designer",
    experience: "3 ปี",
    score: 92,
    skills: ["Figma", "UI/UX", "Design Systems"],
    appliedDate: "1 วันที่แล้ว",
    status: "interview",
    pipelineStatus: "interview_2",
    email: "somying@email.com",
    phone: "082-345-6789",
    location: "กรุงเทพมหานคร",
    education: "ปริญญาตรี การออกแบบนิเทศศิลป์",
    summary: "UX Designer ที่มีความชำนาญในการออกแบบ User Interface และ User Experience สำหรับแอปพลิเคชันและเว็บไซต์",
    previousCompany: "Design Studio Ltd.",
    testScores: {
      hrTest: 88,
      departmentTest: 95,
    },
    interviews: {
      hr: { date: "10/03/2024", passed: true, feedback: "สร้างสรรค์และมืออาชีพ" },
      manager: { date: "12/03/2024", passed: true, feedback: "พอร์ตโฟลิโอยอดเยี่ยม" },
    },
  },
  {
    id: 3,
    name: "ประเสริฐ วงศ์ดี",
    position: "Data Scientist",
    experience: "6 ปี",
    score: 87,
    skills: ["Python", "Machine Learning", "SQL"],
    appliedDate: "3 วันที่แล้ว",
    status: "screening",
    pipelineStatus: "pre_screening",
    email: "prasert@email.com",
    phone: "083-456-7890",
    location: "นนทบุรี",
    education: "ปริญญาโท Data Science",
    summary: "Data Scientist ที่มีความเชี่ยวชาญในการวิเคราะห์ข้อมูลและสร้างโมเดล Machine Learning เพื่อแก้ปัญหาทางธุรกิจ",
    previousCompany: "Analytics Corp.",
  },
  {
    id: 4,
    name: "วิชัย สุขใจ",
    position: "Product Manager",
    experience: "4 ปี",
    score: 84,
    skills: ["Product Strategy", "Agile", "Analytics"],
    appliedDate: "4 วันที่แล้ว",
    status: "shortlisted",
    pipelineStatus: "offer",
    email: "wichai@email.com",
    phone: "084-567-8901",
    location: "กรุงเทพมหานคร",
    education: "ปริญญาโท MBA",
    summary: "Product Manager ที่มีประสบการณ์ในการวางแผนกลยุทธ์ผลิตภัณฑ์และบริหารทีมพัฒนา ทำงานในรูปแบบ Agile",
    previousCompany: "StartUp XYZ",
  },
  {
    id: 5,
    name: "นภา ใจงาม",
    position: "Frontend Developer",
    experience: "3 ปี",
    score: 91,
    skills: ["Vue.js", "CSS", "JavaScript"],
    appliedDate: "5 วันที่แล้ว",
    status: "interview",
    pipelineStatus: "interview_1",
    email: "napa@email.com",
    phone: "085-678-9012",
    location: "ปทุมธานี",
    education: "ปริญญาตรี วิศวกรรมซอฟต์แวร์",
    summary: "Frontend Developer ที่เชี่ยวชาญ Vue.js และมีความสนใจในการพัฒนา UI/UX ที่ดี มีประสบการณ์ทำงานกับทีม",
    previousCompany: "Web Agency Co.",
  },
  {
    id: 6,
    name: "ธนพล มั่งคั่ง",
    position: "Backend Developer",
    experience: "7 ปี",
    score: 86,
    skills: ["Java", "Spring Boot", "Microservices"],
    appliedDate: "1 สัปดาห์ที่แล้ว",
    status: "screening",
    pipelineStatus: "pre_screening",
    email: "thanapol@email.com",
    phone: "086-789-0123",
    location: "สมุทรปราการ",
    education: "ปริญญาตรี วิศวกรรมคอมพิวเตอร์",
    summary: "Backend Developer ที่มีประสบการณ์สูงในการพัฒนาระบบ Microservices ด้วย Java และ Spring Boot",
    previousCompany: "Enterprise Solutions Inc.",
  },
];

const statusColors = {
  screening: "bg-blue-100 text-blue-700 border-blue-200",
  interview: "bg-orange-100 text-orange-700 border-orange-200",
  shortlisted: "bg-green-100 text-green-700 border-green-200",
  interested: "bg-purple-100 text-purple-700 border-purple-200",
  not_interested: "bg-gray-100 text-gray-700 border-gray-200",
};

const statusLabels = {
  screening: "Screening",
  interview: "Interview",
  shortlisted: "Shortlisted",
  interested: "Interested",
  not_interested: "Not Interested",
};

export default function Candidates() {
  const { toast } = useToast();
  const { addNotification } = useNotifications();
  const { candidates, updateCandidate, deleteCandidate } = useCandidates();
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedPositions, setSelectedPositions] = useState<string[]>([]);
  const [selectedCandidates, setSelectedCandidates] = useState<number[]>([]);
  const [isSendToManagerOpen, setIsSendToManagerOpen] = useState(false);

  useEffect(() => {
    const handlePipelineChange = (event: CustomEvent) => {
      const { candidateId, newStatus } = event.detail;
      updateCandidate(candidateId, { pipelineStatus: newStatus });
      setSelectedCandidate(prev => 
        prev && prev.id === candidateId 
          ? { ...prev, pipelineStatus: newStatus }
          : prev
      );
    };

    window.addEventListener('pipelineStatusChange' as any, handlePipelineChange);
    return () => {
      window.removeEventListener('pipelineStatusChange' as any, handlePipelineChange);
    };
  }, [updateCandidate]);

  // Get unique positions for filter
  const uniquePositions = useMemo(() => {
    return Array.from(new Set(candidates.map(c => c.position))).sort();
  }, [candidates]);

  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesPosition = selectedPositions.length === 0 || selectedPositions.includes(candidate.position);

    let matchesTab = true;
    if (activeTab === "all") matchesTab = true;
    else if (activeTab === "shortlist") matchesTab = candidate.status === "shortlisted";
    else if (activeTab === "interested") matchesTab = candidate.status === "interested";
    else if (activeTab === "not_interested") matchesTab = candidate.status === "not_interested";
    
    return matchesSearch && matchesPosition && matchesTab;
  });

  const handleViewDetails = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setIsDetailOpen(true);
  };

  const handleEdit = (candidate: Candidate) => {
    setIsDetailOpen(false);
    setEditingCandidate(candidate);
    setIsFormOpen(true);
  };

  const handleDeleteCandidate = (candidateId: number) => {
    const candidate = candidates.find(c => c.id === candidateId);
    deleteCandidate(candidateId);
    setIsDetailOpen(false);
    toast({
      title: "ลบผู้สมัครแล้ว",
      description: `ลบข้อมูล ${candidate?.name} เรียบร้อยแล้ว`,
      variant: "destructive",
    });
  };

  const handleInterviewUpdate = (candidateId: number, interviews: any) => {
    updateCandidate(candidateId, { interviews } as any);
    setSelectedCandidate(prev => prev ? { ...prev, interviews } : null);
    toast({
      title: "บันทึกข้อมูลแล้ว",
      description: "แก้ไขข้อมูลการสัมภาษณ์เรียบร้อยแล้ว",
    });
  };

  const handleTestScoreUpdate = (candidateId: number, testScores: any) => {
    updateCandidate(candidateId, { testScores } as any);
    setSelectedCandidate(prev => prev ? { ...prev, testScores } : null);
    toast({
      title: "บันทึกข้อมูลแล้ว",
      description: "แก้ไขคะแนนทดสอบเรียบร้อยแล้ว",
    });
  };

  const handleSave = (candidateData: any) => {
    if (candidateData.id) {
      // Edit existing candidate
      updateCandidate(candidateData.id, candidateData);
      toast({
        title: "บันทึกข้อมูลแล้ว",
        description: "แก้ไขข้อมูลผู้สมัครเรียบร้อยแล้ว",
      });
    } else {
      // Add new candidate - handled by context
      toast({
        title: "เพิ่มผู้สมัครแล้ว",
        description: "เพิ่มข้อมูลผู้สมัครเรียบร้อยแล้ว",
      });
    }
    setEditingCandidate(null);
  };

  const handleAddNew = () => {
    setEditingCandidate(null);
    setIsFormOpen(true);
  };

  const handleStatusChange = (candidateId: number, status: string) => {
    const candidate = candidates.find(c => c.id === candidateId);
    
    updateCandidate(candidateId, { status: status as Candidate['status'] });
    setSelectedCandidate(prev => prev ? { ...prev, status: status as Candidate['status'] } : null);
    
    const statusLabelsMap: Record<string, string> = {
      shortlisted: "Shortlist",
      interested: "Interested",
      not_interested: "Not interested",
    };
    
    if (candidate) {
      addNotification({
        type: 'status_change',
        title: 'เปลี่ยนสถานะผู้สมัคร',
        description: `ย้าย ${candidate.name} ไปยังแท็บ ${statusLabelsMap[status]}`,
        candidateName: candidate.name,
        oldStatus: statusLabels[candidate.status as keyof typeof statusLabels],
        newStatus: statusLabelsMap[status],
      });
    }
    
    toast({
      title: "เปลี่ยนสถานะแล้ว",
      description: `ย้ายไปยังแท็บ ${statusLabelsMap[status]} แล้ว`,
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

  const toggleCandidateSelection = (candidateId: number) => {
    setSelectedCandidates(prev =>
      prev.includes(candidateId)
        ? prev.filter(id => id !== candidateId)
        : [...prev, candidateId]
    );
  };

  const handleBulkAction = (action: 'send_to_manager' | 'not_interested') => {
    if (action === 'send_to_manager') {
      setIsSendToManagerOpen(true);
      return;
    }

    const actionMap = {
      send_to_manager: 'interested',
      not_interested: 'not_interested'
    };
    
    selectedCandidates.forEach(candidateId => {
      handleStatusChange(candidateId, actionMap[action]);
    });
    
    setSelectedCandidates([]);
    toast({
      title: "อัพเดทเรียบร้อยแล้ว",
      description: `อัพเดทสถานะของผู้สมัคร ${selectedCandidates.length} คนแล้ว`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            ผู้สมัคร
          </h1>
          <p className="text-muted-foreground">
            จัดการและติดตามสถานะผู้สมัครทั้งหมด
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
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="shortlist">Shortlist</TabsTrigger>
          <TabsTrigger value="interested">Interested</TabsTrigger>
          <TabsTrigger value="not_interested">Not interested</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <div className="grid gap-4">
            {filteredCandidates.map((candidate) => (
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
                    <AvatarImage src={candidate.photoUrl} alt={candidate.name} />
                    <AvatarFallback>
                      {candidate.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="relative">
                    <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-white font-bold text-xl shadow-primary">
                      {candidate.score}
                    </div>
                    {candidate.score >= 90 && (
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
                      <Badge className={statusColors[candidate.status as keyof typeof statusColors]}>
                        {statusLabels[candidate.status as keyof typeof statusLabels]}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <span className="font-medium text-foreground">{candidate.position}</span>
                      <span>•</span>
                      <span>{candidate.experience}</span>
                      <span>•</span>
                      <span>สมัครเมื่อ: {candidate.appliedDate}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {candidate.skills.map((skill, i) => (
                        <Badge key={i} variant="outline" className="text-xs font-normal">
                          {skill}
                        </Badge>
                      ))}
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
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
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
        candidate={selectedCandidate}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        onEdit={() => handleEdit(selectedCandidate!)}
        onDelete={() => selectedCandidate && handleDeleteCandidate(selectedCandidate.id)}
        onInterviewUpdate={handleInterviewUpdate}
        onTestScoreUpdate={handleTestScoreUpdate}
        onStatusChange={handleStatusChange}
      />

      <CandidateFormDialog
        candidate={editingCandidate}
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
            id,
            name: candidate?.name || '',
            position: candidate?.position || '',
            score: candidate?.score,
            preScreenComment: candidate?.interviews?.hr?.feedback
          };
        })}
        onSent={() => {
          selectedCandidates.forEach(candidateId => {
            handleStatusChange(candidateId, 'interested');
          });
          setSelectedCandidates([]);
        }}
      />
    </div>
  );
}
