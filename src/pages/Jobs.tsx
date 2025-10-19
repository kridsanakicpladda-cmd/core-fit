import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, MapPin, Clock, Users, TrendingUp, Briefcase } from "lucide-react";
import { JobDetailDialog } from "@/components/jobs/JobDetailDialog";
import { JobFormDialog } from "@/components/jobs/JobFormDialog";
import { useToast } from "@/hooks/use-toast";

const initialJobs = [
  {
    id: 1,
    title: "Senior Full-Stack Developer",
    department: "Engineering",
    location: "กรุงเทพฯ",
    type: "Full-time",
    applicants: 24,
    postedDate: "15 มี.ค. 2025",
    status: "open" as "open" | "closed",
    avgScore: 78,
    salaryRange: "฿50,000 - ฿80,000",
    numberOfPositions: "2 อัตรา",
    jobGrade: "JG6",
    description: "เรากำลังมองหา Senior Full-Stack Developer ที่มีประสบการณ์และความเชี่ยวชาญในการพัฒนาเว็บแอปพลิเคชันแบบครบวงจร เพื่อมาร่วมเป็นส่วนหนึ่งของทีมพัฒนาของเรา คุณจะได้ทำงานกับเทคโนโลยีที่ทันสมัยและโปรเจกต์ที่ท้าทายความสามารถ",
    responsibilities: [
      "พัฒนาและดูแลระบบเว็บแอปพลิเคชันทั้ง Frontend และ Backend",
      "ออกแบบและพัฒนา RESTful APIs และ GraphQL",
      "ทำงานร่วมกับทีม Product และ Design เพื่อสร้างฟีเจอร์ใหม่",
      "Code Review และให้คำแนะนำแก่ทีมพัฒนา",
      "ปรับปรุงประสิทธิภาพและความปลอดภัยของระบบ"
    ],
    requirements: [
      "ประสบการณ์ในการพัฒนาเว็บแอปพลิเคชัน 5 ปีขึ้นไป",
      "มีความเชี่ยวชาญใน React, Node.js, TypeScript",
      "มีประสบการณ์ในการใช้งาน Database (PostgreSQL, MongoDB)",
      "เข้าใจหลักการ CI/CD และ Cloud Services (AWS, GCP)",
      "มีทักษะการสื่อสารและทำงานเป็นทีมที่ดี",
      "สามารถสื่อสารภาษาอังกฤษได้ในระดับดี"
    ],
    interviewStats: {
      total: 15,
      passed: 8,
      failed: 7
    }
  },
  {
    id: 2,
    title: "UX/UI Designer",
    department: "Design",
    location: "Remote",
    type: "Full-time",
    applicants: 18,
    postedDate: "12 มี.ค. 2025",
    status: "open" as const,
    avgScore: 82,
    salaryRange: "฿40,000 - ฿65,000",
    numberOfPositions: "1 อัตรา",
    jobGrade: "JG5",
    description: "เรากำลังมองหา UX/UI Designer ที่มีความคิดสร้างสรรค์และความเข้าใจในประสบการณ์ผู้ใช้งานอย่างลึกซึ้ง เพื่อออกแบบและพัฒนาผลิตภัณฑ์ที่ตอบโจทย์ผู้ใช้งานได้อย่างแท้จริง",
    responsibilities: [
      "ออกแบบ User Interface และ User Experience สำหรับเว็บและแอปพลิเคชัน",
      "สร้าง Wireframe, Prototype และ Mockup",
      "ทำ User Research และวิเคราะห์ผลลัพธ์",
      "ทำงานร่วมกับทีม Product และ Engineering",
      "สร้างและดูแล Design System"
    ],
    requirements: [
      "ประสบการณ์ด้าน UX/UI Design อย่างน้อย 3 ปี",
      "เชี่ยวชาญในการใช้ Figma, Adobe XD หรือเครื่องมือ Design อื่นๆ",
      "มีความเข้าใจในหลักการ UX และ Design Thinking",
      "มี Portfolio ที่แสดงผลงานที่เคยทำ",
      "มีทักษะการสื่อสารและนำเสนอไอเดียได้ดี"
    ],
    interviewStats: {
      total: 10,
      passed: 6,
      failed: 4
    }
  },
  {
    id: 3,
    title: "Data Scientist",
    department: "Data & Analytics",
    location: "กรุงเทพฯ",
    type: "Full-time",
    applicants: 31,
    postedDate: "10 มี.ค. 2025",
    status: "open" as const,
    avgScore: 85,
    salaryRange: "฿60,000 - ฿100,000",
    numberOfPositions: "3 อัตรา",
    jobGrade: "JG6",
    description: "เรามองหา Data Scientist ที่มีทักษะในการวิเคราะห์ข้อมูลและสร้างโมเดล Machine Learning เพื่อช่วยในการตัดสินใจทางธุรกิจ และพัฒนาผลิตภัณฑ์ที่ขับเคลื่อนด้วยข้อมูล",
    responsibilities: [
      "วิเคราะห์ข้อมูลขนาดใหญ่เพื่อหา Insights ทางธุรกิจ",
      "สร้างและปรับปรุงโมเดล Machine Learning",
      "ทำ Data Visualization และนำเสนอผลการวิเคราะห์",
      "ทำงานร่วมกับทีม Engineering ในการ Deploy โมเดล",
      "ติดตามและประเมินผลโมเดลที่ใช้งานจริง"
    ],
    requirements: [
      "ปริญญาโทขึ้นไปในสาขา Data Science, Statistics, Computer Science หรือสาขาที่เกี่ยวข้อง",
      "ประสบการณ์ทำงานด้าน Data Science อย่างน้อย 3 ปี",
      "เชี่ยวชาญ Python และ Libraries สำหรับ Data Science (Pandas, NumPy, Scikit-learn)",
      "มีประสบการณ์ใน Deep Learning และ NLP",
      "เข้าใจ SQL และการทำงานกับ Big Data",
      "มีทักษะการสื่อสารเพื่ออธิบาย Technical concepts ได้ดี"
    ],
    interviewStats: {
      total: 18,
      passed: 12,
      failed: 6
    }
  },
  {
    id: 4,
    title: "Product Manager",
    department: "Product",
    location: "Hybrid",
    type: "Full-time",
    applicants: 15,
    postedDate: "8 มี.ค. 2025",
    status: "open" as const,
    avgScore: 75,
    salaryRange: "฿55,000 - ฿90,000",
    numberOfPositions: "1 อัตรา",
    jobGrade: "JG7",
    description: "เรากำลังมองหา Product Manager ที่มีวิสัยทัศน์และความสามารถในการนำทีมพัฒนาผลิตภัณฑ์ที่ตอบโจทย์ลูกค้าและธุรกิจ พร้อมขับเคลื่อนกลยุทธ์ผลิตภัณฑ์ให้ประสบความสำเร็จ",
    responsibilities: [
      "กำหนด Product Vision, Strategy และ Roadmap",
      "รวบรวมและวิเคราะห์ความต้องการของลูกค้าและตลาด",
      "กำหนด Product Requirements และ User Stories",
      "ทำงานร่วมกับทีม Engineering, Design และ Marketing",
      "วัดผลและติดตามความสำเร็จของผลิตภัณฑ์",
      "นำเสนอและสื่อสารกับ Stakeholders"
    ],
    requirements: [
      "ประสบการณ์ด้าน Product Management อย่างน้อย 4 ปี",
      "มีความเข้าใจในกระบวนการพัฒนาผลิตภัณฑ์และ Agile/Scrum",
      "มีทักษะการวิเคราะห์และตัดสินใจโดยใช้ข้อมูล",
      "มีความสามารถในการสื่อสารและนำเสนออย่างมีประสิทธิภาพ",
      "มี Leadership และสามารถทำงานร่วมกับทีมข้ามสายงานได้ดี",
      "เข้าใจ Technology และเทรนด์ในอุตสาหกรรม"
    ],
    interviewStats: {
      total: 8,
      passed: 5,
      failed: 3
    }
  },
];

export default function Jobs() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState(initialJobs);
  const [selectedJob, setSelectedJob] = useState<typeof initialJobs[0] | null>(null);
  const [editingJob, setEditingJob] = useState<typeof initialJobs[0] | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleViewDetails = (job: typeof initialJobs[0]) => {
    setSelectedJob(job);
    setIsDetailOpen(true);
  };

  const handleEdit = (job?: typeof initialJobs[0]) => {
    setEditingJob(job || null);
    setIsFormOpen(true);
    setIsDetailOpen(false);
  };

  const handleSave = (data: any) => {
    if (editingJob) {
      // Update existing job
      setJobs(jobs.map(job => 
        job.id === editingJob.id 
          ? { ...job, ...data }
          : job
      ));
    } else {
      // Add new job
      const newJob = {
        id: Math.max(...jobs.map(j => j.id)) + 1,
        ...data,
        applicants: 0,
        postedDate: new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' }),
        avgScore: 0,
        interviewStats: {
          total: 0,
          passed: 0,
          failed: 0
        }
      };
      setJobs([...jobs, newJob]);
    }
    setEditingJob(null);
  };

  const handleAddNew = () => {
    setEditingJob(null);
    setIsFormOpen(true);
  };

  const handleToggleStatus = (jobId: number) => {
    setJobs(jobs.map(job => {
      if (job.id === jobId) {
        const newStatus: "open" | "closed" = job.status === "open" ? "closed" : "open";
        toast({
          title: newStatus === "open" ? "เปิดรับสมัครแล้ว" : "ปิดรับสมัครแล้ว",
          description: `ตำแหน่ง ${job.title} ได้รับการอัปเดตสถานะเป็น${newStatus === "open" ? "เปิดรับสมัคร" : "ปิดรับสมัคร"}`,
        });
        return { ...job, status: newStatus };
      }
      return job;
    }));
  };

  const handleDelete = (jobId: number) => {
    const job = jobs.find(j => j.id === jobId);
    setJobs(jobs.filter(j => j.id !== jobId));
    setIsDetailOpen(false);
    toast({
      title: "ลบตำแหน่งงานแล้ว",
      description: `ตำแหน่ง ${job?.title} ถูกลบเรียบร้อยแล้ว`,
      variant: "destructive"
    });
  };

  const handleViewCandidates = (jobId: number) => {
    navigate("/candidates");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            ตำแหน่งงาน
          </h1>
          <p className="text-muted-foreground">
            จัดการตำแหน่งงานที่เปิดรับสมัครทั้งหมด
          </p>
        </div>
        <Button onClick={handleAddNew} className="shadow-primary hover:shadow-lg transition-all">
          <Plus className="h-4 w-4 mr-2" />
          เพิ่มตำแหน่งงาน
        </Button>
      </div>

      <div className="grid gap-4">
        {jobs.map((job) => (
          <Card key={job.id} className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/20">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center justify-between gap-4">
                    <CardTitle className="text-xl group-hover:text-primary transition-colors">
                      {job.title}
                    </CardTitle>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">
                        {job.status === "open" ? "เปิดรับสมัคร" : "ปิดรับสมัคร"}
                      </span>
                      <Switch
                        checked={job.status === "open"}
                        onCheckedChange={() => handleToggleStatus(job.id)}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="secondary" className="font-normal">
                      <Briefcase className="h-3 w-3 mr-1" />
                      {job.department}
                    </Badge>
                    <Badge variant="outline" className="font-normal">
                      <MapPin className="h-3 w-3 mr-1" />
                      {job.location}
                    </Badge>
                    <Badge variant="outline" className="font-normal">
                      {job.type}
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <div className="inline-flex items-center justify-center h-14 w-14 rounded-xl bg-gradient-to-br from-primary to-primary/80 text-white font-bold text-lg shadow-primary">
                    {job.avgScore}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Avg Score</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span className="font-medium text-foreground">{job.applicants}</span>
                    <span>ผู้สมัคร</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>เปิดรับ: {job.postedDate}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => handleViewDetails(job)} className="hover:bg-accent transition-colors">
                    ดูรายละเอียด
                  </Button>
                  <Button onClick={() => handleViewCandidates(job.id)} className="shadow-sm hover:shadow-md transition-all">
                    ดูผู้สมัคร
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-dashed border-2 hover:border-primary/50 transition-colors">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Plus className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold mb-2">สร้างตำแหน่งงานใหม่</h3>
          <p className="text-muted-foreground mb-4 text-center max-w-md">
            เพิ่มตำแหน่งงานใหม่และเริ่มต้นรับสมัครผู้สมัครที่มีคุณสมบัติเหมาะสม
          </p>
          <Button onClick={handleAddNew} variant="outline" className="hover:bg-primary hover:text-primary-foreground transition-colors">
            เพิ่มตำแหน่งงาน
          </Button>
        </CardContent>
      </Card>

      <JobDetailDialog
        job={selectedJob}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        onEdit={() => handleEdit(selectedJob!)}
        onDelete={() => selectedJob && handleDelete(selectedJob.id)}
        onViewCandidates={() => selectedJob && handleViewCandidates(selectedJob.id)}
      />

      <JobFormDialog
        job={editingJob}
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSave={handleSave}
      />
    </div>
  );
}
