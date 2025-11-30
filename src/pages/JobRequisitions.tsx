import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Clock, CheckCircle, XCircle, Download, Upload, Briefcase, Users, FileText, Award, CalendarDays, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useJobRequisitions, JobRequisition } from "@/hooks/useJobRequisitions";
import { RequisitionDetailDialog } from "@/components/requisitions/RequisitionDetailDialog";
import { exportRequisitionsPDF } from "@/lib/exportRequisitionsPDF";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { addSparkleEffect } from "@/lib/sparkle";

const JobRequisitions = () => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [selectedRequisition, setSelectedRequisition] = useState<JobRequisition | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [canApprove, setCanApprove] = useState(false);
  const [jdFile, setJdFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const { requisitions, isLoading, createRequisition } = useJobRequisitions();

  const [currentPositions, setCurrentPositions] = useState([
    { position: "", count: "" },
    { position: "", count: "" },
  ]);

  useEffect(() => {
    const checkRole = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
      const userRoles = roles?.map((r) => r.role) || [];
      setCanApprove(userRoles.includes("admin") || userRoles.includes("hr_manager"));
    };
    checkRole();
  }, []);

  const [formData, setFormData] = useState({
    department: "",
    position: "",
    quantity: "1",
    date_needed: "",
    work_location: "",
    reports_to: "",
    hiring_type: "permanent" as "replacement" | "permanent" | "temporary",
    replacement_for: "",
    replacement_date: "",
    temporary_duration: "",
    justification: "",
    job_description_no: "",
    job_grade: "",
    job_duties: "",
    gender: "",
    max_age: "",
    min_experience: "",
    min_education: "",
    field_of_study: "",
    other_skills: "",
    marital_status: "",
    experience_in: "",
  });

  const departments = ["Engineering", "Marketing", "Sales", "Human Resources", "Finance", "Operations"];

  const jobGrades = [
    "JG 1.1 Staff",
    "JG 1.2 Senior Staff",
    "JG 2.1 Supervisor",
    "JG 2.1 Specialist",
    "JG 2.2 Assistant Manager",
    "JG 2.2 Senior Specialist",
    "JG 3.1 Manager",
    "JG 3.1 Lead Specialist",
    "JG 3.2 Senior Manager",
    "JG 3.2 Lead Specialist",
    "JG 4.1 Assistant Vice President",
    "JG 4.1 Lead Specialist",
    "JG 4.2 Vice President",
  ];

  const workLocations = ["สำนักงานใหญ่ สุรวงศ์", "โรงงานนครปฐม"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.department ||
      !formData.position ||
      !formData.date_needed ||
      !formData.work_location ||
      !formData.reports_to ||
      !formData.justification ||
      !formData.gender ||
      !formData.min_education
    ) {
      toast({ title: "กรุณากรอกข้อมูลให้ครบถ้วน", variant: "destructive" });
      return;
    }

    setUploading(true);
    let jdFileUrl: string | undefined;

    try {
      if (jdFile) {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("User not authenticated");

        const fileExt = jdFile.name.split(".").pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;

        const { error: uploadError, data } = await supabase.storage.from("job-descriptions").upload(fileName, jdFile);

        if (uploadError) throw uploadError;
        jdFileUrl = data.path;
      }

      await createRequisition.mutateAsync({
        ...formData,
        quantity: parseInt(formData.quantity),
        jd_file_url: jdFileUrl,
      });

      setOpen(false);
      setFormData({
        department: "",
        position: "",
        quantity: "1",
        date_needed: "",
        work_location: "",
        reports_to: "",
        hiring_type: "permanent",
        replacement_for: "",
        replacement_date: "",
        temporary_duration: "",
        justification: "",
        job_description_no: "",
        job_grade: "",
        job_duties: "",
        gender: "",
        max_age: "",
        min_experience: "",
        min_education: "",
        field_of_study: "",
        other_skills: "",
        marital_status: "",
        experience_in: "",
      });
      setJdFile(null);
      setCurrentPositions([{ position: "", count: "" }, { position: "", count: "" }]);
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error instanceof Error ? error.message : "ไม่สามารถอัปโหลดไฟล์ได้",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = { approved: "default", rejected: "destructive", pending: "secondary" } as const;
    const labels = { approved: "อนุมัติแล้ว", rejected: "ไม่อนุมัติ", pending: "รอพิจารณา" };
    const Icon = status === "approved" ? CheckCircle : status === "rejected" ? XCircle : Clock;
    return (
      <Badge variant={variants[status as keyof typeof variants]}>
        <Icon className="h-4 w-4 mr-1" />
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  const getHiringTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      permanent: "พนักงานประจำ",
      temporary: "พนักงานชั่วคราว",
      replacement: "ทดแทนตำแหน่ง",
    };
    return labels[type] || type;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8 text-center space-y-2">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
            แบบขออนุมัติกำลังพล
          </h1>
          <p className="text-muted-foreground text-lg">กรุณากรอกข้อมูลให้ครบถ้วนเพื่อขออนุมัติเปิดรับสมัครตำแหน่งงานใหม่</p>
        </div>

        <div className="flex justify-end gap-2 mb-6">
          <Button
            variant="outline"
            onClick={() => exportRequisitionsPDF(requisitions)}
            disabled={requisitions.length === 0}
            className="transition-all hover:scale-105"
          >
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button 
                className="transition-all hover:scale-105"
                onClick={(e) => addSparkleEffect(e)}
              >
                <Plus className="h-4 w-4 mr-2" />
                สร้างคำขอใหม่
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl">แบบขออนุมัติกำลังพล</DialogTitle>
                <DialogDescription>กรุณากรอกข้อมูลให้ครบถ้วนตามแบบฟอร์ม</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                {/* Section 1: Current Positions */}
                <Card className="border-primary/20 shadow-lg overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 border-b border-primary/10">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Users className="h-5 w-5 text-emerald-600" />
                      ปัจจุบันมีพนักงานในตำแหน่งงาน
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      {currentPositions.map((pos, index) => (
                        <div key={index} className="flex gap-3 items-end">
                          <div className="flex-1">
                            <Label className="text-sm">ตำแหน่ง {index + 1}</Label>
                            <Input
                              placeholder="เช่น พนักงานฝ่ายผลิต"
                              value={pos.position}
                              onChange={(e) => {
                                const updated = [...currentPositions];
                                updated[index].position = e.target.value;
                                setCurrentPositions(updated);
                              }}
                              className="mt-1"
                            />
                          </div>
                          <div className="w-32">
                            <Label className="text-sm">จำนวนคน</Label>
                            <Input
                              type="number"
                              placeholder="0"
                              value={pos.count}
                              onChange={(e) => {
                                const updated = [...currentPositions];
                                updated[index].count = e.target.value;
                                setCurrentPositions(updated);
                              }}
                              className="mt-1"
                            />
                          </div>
                          {currentPositions.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setCurrentPositions(currentPositions.filter((_, i) => i !== index));
                              }}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPositions([...currentPositions, { position: "", count: "" }])}
                        className="w-full mt-2"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        เพิ่มตำแหน่ง
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Section 2: Request Type & Position Details */}
                <Card className="border-primary/20 shadow-lg overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-violet-500/10 border-b border-primary/10">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Briefcase className="h-5 w-5 text-blue-600" />
                      ประเภท / เหตุผลของการขออนุญาต
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-4">
                    <div className="space-y-3">
                      <Label className="text-base font-medium">เลือกประเภทการจ้าง *</Label>
                      <RadioGroup
                        value={formData.hiring_type}
                        onValueChange={(v) =>
                          setFormData({ ...formData, hiring_type: v as "replacement" | "permanent" | "temporary" })
                        }
                        className="space-y-3"
                      >
                        <div className="flex items-center space-x-3 p-3 rounded-lg border-2 border-primary/20 hover:border-primary/40 transition-colors">
                          <RadioGroupItem value="replacement" id="replacement" />
                          <Label htmlFor="replacement" className="flex-1 cursor-pointer">
                            ตำแหน่งทดแทน (ทดแทนพนักงานที่ออก)
                          </Label>
                        </div>
                        <div className="flex items-center space-x-3 p-3 rounded-lg border-2 border-primary/20 hover:border-primary/40 transition-colors">
                          <RadioGroupItem value="permanent" id="permanent" />
                          <Label htmlFor="permanent" className="flex-1 cursor-pointer">
                            ตำแหน่งประจำที่ขอเพิ่ม
                          </Label>
                        </div>
                        <div className="flex items-center space-x-3 p-3 rounded-lg border-2 border-primary/20 hover:border-primary/40 transition-colors">
                          <RadioGroupItem value="temporary" id="temporary" />
                          <Label htmlFor="temporary" className="flex-1 cursor-pointer">
                            ตำแหน่งชั่วคราว
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {formData.hiring_type === "replacement" && (
                      <div className="grid grid-cols-2 gap-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
                        <div className="space-y-2">
                          <Label>ทดแทนใคร</Label>
                          <Input
                            placeholder="ชื่อพนักงานที่ออก"
                            value={formData.replacement_for}
                            onChange={(e) => setFormData({ ...formData, replacement_for: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>วันที่ออก</Label>
                          <Input
                            type="date"
                            value={formData.replacement_date}
                            onChange={(e) => setFormData({ ...formData, replacement_date: e.target.value })}
                          />
                        </div>
                      </div>
                    )}

                    {formData.hiring_type === "temporary" && (
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="space-y-2">
                          <Label>ระยะเวลาการจ้าง</Label>
                          <Input
                            placeholder="เช่น 3 เดือน, 6 เดือน, 1 ปี"
                            value={formData.temporary_duration}
                            onChange={(e) => setFormData({ ...formData, temporary_duration: e.target.value })}
                          />
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>ฝ่าย/แผนก *</Label>
                        <Select
                          value={formData.department}
                          onValueChange={(v) => setFormData({ ...formData, department: v })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="เลือกฝ่าย/แผนก" />
                          </SelectTrigger>
                          <SelectContent>
                            {departments.map((d) => (
                              <SelectItem key={d} value={d}>
                                {d}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>ตำแหน่งที่ขอ *</Label>
                        <Input
                          placeholder="ระบุตำแหน่งที่ต้องการ"
                          value={formData.position}
                          onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>จำนวนที่ขอ *</Label>
                        <Input
                          type="number"
                          min="1"
                          value={formData.quantity}
                          onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>วันที่ต้องการ *</Label>
                        <Input
                          type="date"
                          value={formData.date_needed}
                          onChange={(e) => setFormData({ ...formData, date_needed: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Job Grade</Label>
                        <Select
                          value={formData.job_grade}
                          onValueChange={(v) => setFormData({ ...formData, job_grade: v })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="เลือก Job Grade" />
                          </SelectTrigger>
                          <SelectContent>
                            {jobGrades.map((jg) => (
                              <SelectItem key={jg} value={jg}>
                                {jg}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>สถานที่ทำงาน *</Label>
                        <Select
                          value={formData.work_location}
                          onValueChange={(v) => setFormData({ ...formData, work_location: v })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="เลือกสถานที่" />
                          </SelectTrigger>
                          <SelectContent>
                            {workLocations.map((loc) => (
                              <SelectItem key={loc} value={loc}>
                                {loc}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2 col-span-2">
                        <Label>รายงานต่อ *</Label>
                        <Input
                          placeholder="ชื่อหัวหน้างานโดยตรง"
                          value={formData.reports_to}
                          onChange={(e) => setFormData({ ...formData, reports_to: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-base font-medium">เหตุผลในการขอเพิ่ม *</Label>
                      <Textarea
                        placeholder="กรุณาระบุเหตุผลและความจำเป็นในการขอเพิ่มตำแหน่งงานนี้..."
                        value={formData.justification}
                        onChange={(e) => setFormData({ ...formData, justification: e.target.value })}
                        rows={4}
                        className="resize-none"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Section 3: Job Duties */}
                <Card className="border-primary/20 shadow-lg overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-rose-500/10 border-b border-primary/10">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <FileText className="h-5 w-5 text-purple-600" />
                      หน้าที่และความรับผิดชอบ
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-2">
                      <Label className="text-base font-medium">
                        หน้าที่โดยสังเขปตาม Job Description
                        <span className="text-sm text-muted-foreground ml-2">(หากยังไม่มี JD กรุณาแนบมาด้วย)</span>
                      </Label>
                      <Textarea
                        placeholder="ระบุหน้าที่และความรับผิดชอบของตำแหน่งงานนี้..."
                        value={formData.job_duties}
                        onChange={(e) => setFormData({ ...formData, job_duties: e.target.value })}
                        rows={5}
                        className="resize-none"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Section 4: Qualifications */}
                <Card className="border-primary/20 shadow-lg overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-yellow-500/10 border-b border-primary/10">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Award className="h-5 w-5 text-orange-600" />
                      คุณสมบัติเบื้องต้น
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>เพศ *</Label>
                        <Select value={formData.gender} onValueChange={(v) => setFormData({ ...formData, gender: v })}>
                          <SelectTrigger>
                            <SelectValue placeholder="เลือกเพศ" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ไม่ระบุ">ไม่ระบุ</SelectItem>
                            <SelectItem value="ชาย">ชาย</SelectItem>
                            <SelectItem value="หญิง">หญิง</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>อายุไม่เกิน</Label>
                        <Input
                          type="number"
                          placeholder="เช่น 35"
                          value={formData.max_age}
                          onChange={(e) => setFormData({ ...formData, max_age: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>การศึกษาขั้นต่ำ *</Label>
                        <Select
                          value={formData.min_education}
                          onValueChange={(v) => setFormData({ ...formData, min_education: v })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="เลือกวุฒิการศึกษา" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="มัธยมศึกษา">มัธยมศึกษา</SelectItem>
                            <SelectItem value="ปวช.">ปวช.</SelectItem>
                            <SelectItem value="ปวส.">ปวส.</SelectItem>
                            <SelectItem value="ปริญญาตรี">ปริญญาตรี</SelectItem>
                            <SelectItem value="ปริญญาโท">ปริญญาโท</SelectItem>
                            <SelectItem value="ปริญญาเอก">ปริญญาเอก</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>สาขาวิชา</Label>
                        <Input
                          placeholder="เช่น วิศวกรรมศาสตร์, บริหารธุรกิจ"
                          value={formData.field_of_study}
                          onChange={(e) => setFormData({ ...formData, field_of_study: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>ประสบการณ์ในตำแหน่ง</Label>
                        <Input
                          placeholder="เช่น 2 ปี, 5 ปี"
                          value={formData.min_experience}
                          onChange={(e) => setFormData({ ...formData, min_experience: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>ประสบการณ์ด้าน</Label>
                        <Input
                          placeholder="เช่น การผลิต, การตลาด"
                          value={formData.experience_in}
                          onChange={(e) => setFormData({ ...formData, experience_in: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>สถานะสมรส</Label>
                        <Select
                          value={formData.marital_status}
                          onValueChange={(v) => setFormData({ ...formData, marital_status: v })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="เลือกสถานะสมรส" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ไม่ระบุ">ไม่ระบุ</SelectItem>
                            <SelectItem value="โสด">โสด</SelectItem>
                            <SelectItem value="สมรส">สมรส</SelectItem>
                            <SelectItem value="หย่า">หย่า</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2 mt-4">
                      <Label className="text-base font-medium">
                        ความสามารถ / ความชำนาญอื่นๆ
                        <span className="text-sm text-muted-foreground ml-2">
                          (ภาษาต่างประเทศ คอมพิวเตอร์ ขับรถยนต์ ทำงานต่างจังหวัด ฯลฯ)
                        </span>
                      </Label>
                      <Textarea
                        placeholder="ระบุทักษะและความสามารถพิเศษที่ต้องการ..."
                        value={formData.other_skills}
                        onChange={(e) => setFormData({ ...formData, other_skills: e.target.value })}
                        rows={3}
                        className="resize-none"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Section 5: JD Upload */}
                <Card className="border-primary/20 shadow-lg overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-slate-500/10 via-gray-500/10 to-zinc-500/10 border-b border-primary/10">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Upload className="h-5 w-5 text-slate-600" />
                      แนบเอกสาร Job Description
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="border-2 border-dashed border-primary/30 rounded-lg p-8 hover:border-primary/50 transition-all hover:bg-primary/5">
                      <div className="flex flex-col items-center gap-4">
                        <div className="p-4 rounded-full bg-gradient-to-br from-primary/20 to-primary/10">
                          <Upload className="h-10 w-10 text-primary" />
                        </div>
                        <div className="text-center">
                          <Input
                            type="file"
                            accept=".pdf,.doc,.docx"
                            className="hidden"
                            id="jd-upload"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                if (file.size > 20 * 1024 * 1024) {
                                  toast({
                                    title: "ไฟล์ใหญ่เกินไป",
                                    description: "ไฟล์ต้องมีขนาดไม่เกิน 20MB",
                                    variant: "destructive",
                                  });
                                  return;
                                }
                                setJdFile(file);
                              }
                            }}
                          />
                          <Label htmlFor="jd-upload" className="cursor-pointer">
                            <Button type="button" size="lg" className="gap-2" asChild>
                              <span>
                                <FileText className="h-5 w-5" />
                                เลือกไฟล์ JD
                              </span>
                            </Button>
                          </Label>
                          <p className="text-sm text-muted-foreground mt-2">
                            รองรับไฟล์ PDF, DOC, DOCX (ขนาดไม่เกิน 20MB)
                          </p>
                        </div>
                        {jdFile && (
                          <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg w-full">
                            <div className="p-2 rounded-lg bg-green-100">
                              <FileText className="h-6 w-6 text-green-600" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-green-900">{jdFile.name}</p>
                              <p className="text-sm text-green-700">
                                {(jdFile.size / 1024).toFixed(2)} KB
                              </p>
                            </div>
                            <Button type="button" variant="ghost" size="sm" onClick={() => setJdFile(null)}>
                              <XCircle className="h-5 w-5" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Submit Button */}
                <div className="sticky bottom-0 bg-gradient-to-t from-background via-background to-transparent pt-6 pb-4 -mx-6 px-6">
                  <div className="flex justify-end gap-3">
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="lg"
                      onClick={() => setOpen(false)}
                      className="min-w-32"
                    >
                      ยกเลิก
                    </Button>
                    <Button 
                      type="submit" 
                      size="lg"
                      disabled={uploading}
                      onClick={(e) => addSparkleEffect(e)}
                      className="min-w-48 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all hover:scale-105 shadow-lg"
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          กำลังส่งคำขอ...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-5 w-5 mr-2" />
                          ส่งคำขออนุมัติ
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Requisitions Table */}
        <Card className="shadow-xl border-primary/20">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-primary" />
              รายการคำขออนุมัติ
            </CardTitle>
            <CardDescription>รายการคำขออนุมัติกำลังพลทั้งหมด</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="text-center py-8">กำลังโหลด...</div>
            ) : requisitions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">ยังไม่มีคำขออนุมัติ</div>
            ) : (
              <div className="rounded-lg border border-primary/20 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold">เลขที่คำขอ</TableHead>
                      <TableHead className="font-semibold">ตำแหน่ง</TableHead>
                      <TableHead className="font-semibold">ฝ่าย/แผนก</TableHead>
                      <TableHead className="font-semibold">จำนวน</TableHead>
                      <TableHead className="font-semibold">ประเภท</TableHead>
                      <TableHead className="font-semibold">สถานะ</TableHead>
                      <TableHead className="font-semibold">วันที่ขอ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {requisitions.map((req) => (
                      <TableRow
                        key={req.id}
                        className="cursor-pointer hover:bg-primary/5 transition-colors"
                        onClick={() => {
                          setSelectedRequisition(req);
                          setDetailOpen(true);
                        }}
                      >
                        <TableCell className="font-medium text-primary">{req.requisition_number}</TableCell>
                        <TableCell className="font-medium">{req.position}</TableCell>
                        <TableCell>{req.department}</TableCell>
                        <TableCell>{req.quantity}</TableCell>
                        <TableCell>{getHiringTypeLabel(req.hiring_type)}</TableCell>
                        <TableCell>{getStatusBadge(req.status)}</TableCell>
                        <TableCell>{req.created_at ? format(new Date(req.created_at), "dd/MM/yyyy") : "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <RequisitionDetailDialog
        requisition={selectedRequisition}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        canApprove={canApprove}
      />
    </div>
  );
};

export default JobRequisitions;
