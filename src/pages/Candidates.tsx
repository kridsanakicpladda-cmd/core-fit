import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Star, UserPlus } from "lucide-react";
import { CandidateDetailDialog } from "@/components/candidates/CandidateDetailDialog";
import { CandidateFormDialog } from "@/components/candidates/CandidateFormDialog";
import { useToast } from "@/hooks/use-toast";

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
    email: "somchai@email.com",
    phone: "081-234-5678",
    location: "กรุงเทพมหานคร",
    education: "ปริญญาตรี วิทยาการคอมพิวเตอร์",
    summary: "มีประสบการณ์ในการพัฒนา Web Application ด้วย React และ Node.js มากกว่า 5 ปี เคยทำงานในโปรเจกต์ขนาดใหญ่หลายโปรเจกต์",
    previousCompany: "Tech Solutions Co.",
    interviews: {
      hr: { date: "15/03/2024", passed: true, feedback: "Good communication skills" },
      manager: { date: "18/03/2024", passed: true, feedback: "Strong technical knowledge" },
      isTeam: { date: "20/03/2024", passed: true, feedback: "Excellent problem solving" },
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
    email: "somying@email.com",
    phone: "082-345-6789",
    location: "กรุงเทพมหานคร",
    education: "ปริญญาตรี การออกแบบนิเทศศิลป์",
    summary: "UX Designer ที่มีความชำนาญในการออกแบบ User Interface และ User Experience สำหรับแอปพลิเคชันและเว็บไซต์",
    previousCompany: "Design Studio Ltd.",
    interviews: {
      hr: { date: "10/03/2024", passed: true, feedback: "Creative and professional" },
      manager: { date: "12/03/2024", passed: true, feedback: "Great portfolio" },
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
};

const statusLabels = {
  screening: "กำลังคัดกรอง",
  interview: "รอสัมภาษณ์",
  shortlisted: "รายชื่อสั้น",
};

export default function Candidates() {
  const { toast } = useToast();
  const [candidates, setCandidates] = useState(initialCandidates);
  const [selectedCandidate, setSelectedCandidate] = useState<typeof initialCandidates[0] | null>(null);
  const [editingCandidate, setEditingCandidate] = useState<typeof initialCandidates[0] | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCandidates = candidates.filter(candidate =>
    candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    candidate.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
    candidate.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleViewDetails = (candidate: typeof initialCandidates[0]) => {
    setSelectedCandidate(candidate);
    setIsDetailOpen(true);
  };

  const handleEdit = (candidate: typeof initialCandidates[0]) => {
    setIsDetailOpen(false);
    setEditingCandidate(candidate);
    setIsFormOpen(true);
  };

  const handleDelete = (candidateId: number) => {
    const candidate = candidates.find(c => c.id === candidateId);
    setCandidates(candidates.filter(c => c.id !== candidateId));
    setIsDetailOpen(false);
    toast({
      title: "ลบผู้สมัครแล้ว",
      description: `ลบข้อมูล ${candidate?.name} เรียบร้อยแล้ว`,
      variant: "destructive",
    });
  };

  const handleSave = (candidateData: any) => {
    if (candidateData.id) {
      // Edit existing candidate
      setCandidates(candidates.map(c => 
        c.id === candidateData.id ? { ...candidateData } : c
      ));
      toast({
        title: "บันทึกข้อมูลแล้ว",
        description: "แก้ไขข้อมูลผู้สมัครเรียบร้อยแล้ว",
      });
    } else {
      // Add new candidate
      const newCandidate = { ...candidateData, id: Math.max(...candidates.map(c => c.id)) + 1 };
      setCandidates([...candidates, newCandidate]);
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
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          ตัวกรอง
        </Button>
      </div>

      <div className="grid gap-4">
        {filteredCandidates.map((candidate) => (
          <Card key={candidate.id} className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1">
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

      <CandidateDetailDialog
        candidate={selectedCandidate}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        onEdit={() => handleEdit(selectedCandidate!)}
        onDelete={() => selectedCandidate && handleDelete(selectedCandidate.id)}
      />

      <CandidateFormDialog
        candidate={editingCandidate}
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSave={handleSave}
      />
    </div>
  );
}
