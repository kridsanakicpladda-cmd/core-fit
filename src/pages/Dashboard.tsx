import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { CompanyProfile } from "@/components/dashboard/CompanyProfile";
import { ContactMap } from "@/components/dashboard/ContactMap";
import { JobDetailDialog } from "@/components/jobs/JobDetailDialog";

const recentCandidates = [
  { name: "สมชาย ใจดี", position: "Senior Developer", score: 89, time: "5 นาทีที่แล้ว" },
  { name: "สมหญิง รักดี", position: "UX Designer", score: 92, time: "15 นาทีที่แล้ว" },
  { name: "ประเสริฐ วงศ์ดี", position: "Data Scientist", score: 87, time: "1 ชั่วโมงที่แล้ว" },
  { name: "วิชัย สุขใจ", position: "Product Manager", score: 84, time: "2 ชั่วโมงที่แล้ว" },
  { name: "นภา ใจงาม", position: "Frontend Developer", score: 91, time: "3 ชั่วโมงที่แล้ว" },
];

const todayInterviews = [
  { name: "อรุณ สว่างไสว", position: "Senior Developer", time: "10:00 - 11:00", status: "completed" },
  { name: "ธนพล มั่งคั่ง", position: "UX Designer", time: "14:00 - 15:00", status: "upcoming" },
  { name: "ศิริพร แสงจันทร์", position: "Data Scientist", time: "15:30 - 16:30", status: "upcoming" },
];

const initialOpenPositions = [
  { 
    id: 1, 
    title: "Senior Developer", 
    department: "วิศวกรรม",
    location: "กรุงเทพฯ",
    type: "Full-time",
    applicants: 45,
    postedDate: "15 ม.ค. 2567",
    status: "open" as const,
    avgScore: 87,
    salaryRange: "60,000 - 80,000 บาท",
    numberOfPositions: "3",
    jobGrade: "P5",
    description: "เรากำลังมองหา Senior Developer ที่มีประสบการณ์ในการพัฒนาระบบ เพื่อร่วมงานกับทีมพัฒนาผลิตภัณฑ์",
    requirements: [
      "ปริญญาตรี วิทยาการคอมพิวเตอร์ หรือสาขาที่เกี่ยวข้อง",
      "ประสบการณ์ 5 ปีขึ้นไป",
      "มีทักษะ React, Node.js, TypeScript"
    ],
    responsibilities: [
      "พัฒนาและดูแลระบบ",
      "ทำงานร่วมกับทีม",
      "Code Review"
    ],
    interviewStats: { total: 45, passed: 30, failed: 15 }
  },
  { 
    id: 2, 
    title: "UX Designer", 
    department: "ออกแบบ",
    location: "กรุงเทพฯ",
    type: "Full-time",
    applicants: 32,
    postedDate: "18 ม.ค. 2567",
    status: "open" as const,
    avgScore: 91,
    salaryRange: "45,000 - 65,000 บาท",
    numberOfPositions: "2",
    jobGrade: "P4",
    description: "มองหา UX Designer ที่มีความคิดสร้างสรรค์ เพื่อออกแบบประสบการณ์ผู้ใช้ที่ดี",
    requirements: [
      "ปริญญาตรี ออกแบบ หรือสาขาที่เกี่ยวข้อง",
      "ประสบการณ์ 3 ปีขึ้นไป",
      "มีทักษะ Figma, Adobe XD"
    ],
    responsibilities: [
      "ออกแบบ UI/UX",
      "ทำ User Research",
      "สร้าง Prototype"
    ],
    interviewStats: { total: 32, passed: 25, failed: 7 }
  },
  { 
    id: 3, 
    title: "Data Scientist", 
    department: "ข้อมูล",
    location: "กรุงเทพฯ",
    type: "Full-time",
    applicants: 18,
    postedDate: "20 ม.ค. 2567",
    status: "open" as const,
    avgScore: 89,
    salaryRange: "70,000 - 90,000 บาท",
    numberOfPositions: "1",
    jobGrade: "P6",
    description: "มองหา Data Scientist เพื่อวิเคราะห์ข้อมูลและสร้างโมเดล AI",
    requirements: [
      "ปริญญาโท สถิติ หรือสาขาที่เกี่ยวข้อง",
      "ประสบการณ์ 4 ปีขึ้นไป",
      "มีทักษะ Python, Machine Learning"
    ],
    responsibilities: [
      "วิเคราะห์ข้อมูล",
      "สร้างโมเดล ML",
      "นำเสนอผลการวิเคราะห์"
    ],
    interviewStats: { total: 18, passed: 12, failed: 6 }
  },
  { 
    id: 4, 
    title: "Product Manager", 
    department: "ผลิตภัณฑ์",
    location: "กรุงเทพฯ",
    type: "Full-time",
    applicants: 28,
    postedDate: "22 ม.ค. 2567",
    status: "open" as const,
    avgScore: 85,
    salaryRange: "55,000 - 75,000 บาท",
    numberOfPositions: "2",
    jobGrade: "P5",
    description: "มองหา Product Manager เพื่อบริหารและพัฒนาผลิตภัณฑ์",
    requirements: [
      "ปริญญาตรี บริหารธุรกิจ หรือสาขาที่เกี่ยวข้อง",
      "ประสบการณ์ 4 ปีขึ้นไป",
      "มีทักษะการวางแผนและบริหาร"
    ],
    responsibilities: [
      "วางแผนพัฒนาผลิตภัณฑ์",
      "ประสานงานทีม",
      "วิเคราะห์ตลาด"
    ],
    interviewStats: { total: 28, passed: 20, failed: 8 }
  },
  { 
    id: 5, 
    title: "Frontend Developer", 
    department: "วิศวกรรม",
    location: "กรุงเทพฯ",
    type: "Full-time",
    applicants: 52,
    postedDate: "25 ม.ค. 2567",
    status: "open" as const,
    avgScore: 83,
    salaryRange: "40,000 - 60,000 บาท",
    numberOfPositions: "4",
    jobGrade: "P3",
    description: "มองหา Frontend Developer เพื่อพัฒนาส่วน UI ของระบบ",
    requirements: [
      "ปริญญาตรี วิทยาการคอมพิวเตอร์ หรือสาขาที่เกี่ยวข้อง",
      "ประสบการณ์ 2 ปีขึ้นไป",
      "มีทักษะ React, JavaScript, CSS"
    ],
    responsibilities: [
      "พัฒนา Frontend",
      "ทำ Responsive Design",
      "ทำงานร่วมกับทีม Backend"
    ],
    interviewStats: { total: 52, passed: 35, failed: 17 }
  },
];

export default function Dashboard() {
  const [openPositions] = useState(initialOpenPositions);
  const [selectedJob, setSelectedJob] = useState<typeof initialOpenPositions[0] | null>(null);
  const [jobDialogOpen, setJobDialogOpen] = useState(false);

  const handleJobClick = (job: typeof initialOpenPositions[0]) => {
    setSelectedJob(job);
    setJobDialogOpen(true);
  };
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent"></h1>
        <p className="text-muted-foreground"></p>
      </div>

      {/* Company Profile */}
      <CompanyProfile />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">ตำแหน่งที่เปิดรับ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {openPositions.map((position) => (
                <div
                  key={position.id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                  onClick={() => handleJobClick(position)}
                >
                  <div className="flex-1">
                    <p className="font-medium hover:text-primary transition-colors">{position.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {position.numberOfPositions} อัตรา • {position.applicants} ผู้สมัคร
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              ผู้สมัครล่าสุด
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentCandidates.map((candidate, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/50 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-white font-bold shadow-sm group-hover:shadow-md transition-shadow">
                      {candidate.score}
                    </div>
                    <div>
                      <p className="font-medium group-hover:text-primary transition-colors">{candidate.name}</p>
                      <p className="text-sm text-muted-foreground">{candidate.position}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">{candidate.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              การสัมภาษณ์วันนี้
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {todayInterviews.map((interview, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div>
                    <p className="font-medium">{interview.name}</p>
                    <p className="text-sm text-muted-foreground">{interview.position}</p>
                    <p className="text-xs text-muted-foreground mt-1">{interview.time}</p>
                  </div>
                  <Badge
                    variant={interview.status === "completed" ? "secondary" : "default"}
                    className={interview.status === "upcoming" ? "bg-primary/10 text-primary border-primary/20" : ""}
                  >
                    {interview.status === "completed" ? "เสร็จสิ้น" : "กำลังจะถึง"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contact & Map Section */}
      <ContactMap />

      {/* Job Detail Dialog */}
      <JobDetailDialog 
        job={selectedJob}
        open={jobDialogOpen}
        onOpenChange={setJobDialogOpen}
        onEdit={() => {}}
        onDelete={() => {}}
        onViewCandidates={() => {}}
      />
    </div>
  );
}
