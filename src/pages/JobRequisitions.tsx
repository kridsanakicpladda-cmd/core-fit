import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Clock, CheckCircle, XCircle, Download, Upload, Briefcase, Users, FileText, Award, MapPin, CalendarDays } from "lucide-react";
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
      // Upload JD file if selected
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

      // Create requisition with JD file URL
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
        {/* Header */}
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
                <DialogTitle className="text-2xl">สร้างคำขออนุมัติกำลังพล</DialogTitle>
                <DialogDescription>กรุณากรอกข้อมูลให้ครบถ้วนตามแบบฟอร์ม</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                {/* ข้อมูลทั่วไป */}
                <Card className="border-primary/20 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
                    <CardTitle className="flex items-center gap-2">
                      <Briefcase className="h-5 w-5 text-primary" />
                      1. ข้อมูลตำแหน่งงาน
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
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
                      <Label>ตำแหน่งงาน *</Label>
                      <Input
                        value={formData.position}
                        onChange={(e) => setFormData({ ...formData, position: e.target.value })}
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
                      <Label>จำนวน *</Label>
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
                      <Label>สถานที่ *</Label>
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
                    <div className="space-y-2">
                      <Label>รายงานต่อ *</Label>
                      <Input
                        placeholder="ชื่อหัวหน้างานโดยตรง"
                        value={formData.reports_to}
                        onChange={(e) => setFormData({ ...formData, reports_to: e.target.value })}
                      />
                    </div>
                  </div>
                  </CardContent>
                </Card>

                {/* รายละเอียดการจ้างงาน */}
                <Card className="border-primary/20 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      2. ประเภท / เหตุผลของการขออนุมัติ
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-4">
                  <div className="space-y-2">
                    <Label>ประเภท/เหตุผลการจ้าง *</Label>
                    <Select
                      value={formData.hiring_type}
                      onValueChange={(v) =>
                        setFormData({ ...formData, hiring_type: v as "replacement" | "permanent" | "temporary" })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกประเภทการจ้าง" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="permanent">ตำแหน่งประจำที่ขอเพิ่ม</SelectItem>
                        <SelectItem value="replacement">ทดแทนตำแหน่ง</SelectItem>
                        <SelectItem value="temporary">พนักงานชั่วคราว</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>เหตุผลในการขอเพิ่ม *</Label>
                    <Textarea
                      placeholder="ระบุเหตุผลในการขอเพิ่มตำแหน่งงาน"
                      value={formData.justification}
                      onChange={(e) => setFormData({ ...formData, justification: e.target.value })}
                      rows={4}
                    />
                  </div>
                  </CardContent>
                </Card>

                {/* Job Description Upload */}
                <Card className="border-primary/20 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      Job Description
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-2">
                      <Label>อัปโหลดไฟล์ Job Description (PDF)</Label>
                      <div className="border-2 border-dashed border-primary/30 rounded-lg p-6 hover:border-primary/50 transition-colors">
                        <div className="flex flex-col items-center gap-4">
                          <div className="p-4 rounded-full bg-primary/10">
                            <Upload className="h-8 w-8 text-primary" />
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
                              <Button type="button" variant="outline" asChild>
                                <span>เลือกไฟล์</span>
                              </Button>
                            </Label>
                            <p className="text-sm text-muted-foreground mt-2">
                              รองรับไฟล์ PDF, DOC, DOCX (ขนาดไม่เกิน 20MB)
                            </p>
                          </div>
                          {jdFile && (
                            <div className="flex items-center gap-2 p-3 bg-primary/5 rounded-lg w-full">
                              <FileText className="h-5 w-5 text-primary" />
                              <div className="flex-1">
                                <p className="text-sm font-medium">{jdFile.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {(jdFile.size / 1024).toFixed(2)} KB
                                </p>
                              </div>
                              <Button type="button" variant="ghost" size="sm" onClick={() => setJdFile(null)}>
                                ลบ
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* คุณสมบัติและหน้าที่ */}
                <Card className="border-primary/20 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-primary" />
                      3. คุณสมบัติเบื้องต้น
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
                          <SelectItem value="ชาย">ชาय</SelectItem>
                          <SelectItem value="หญิง">หญิง</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>วุฒิการศึกษาขั้นต่ำ *</Label>
                      <Select
                        value={formData.min_education}
                        onValueChange={(v) => setFormData({ ...formData, min_education: v })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="เลือกวุฒิการศึกษา" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ปริญญาตรี">ปริญญาตรี</SelectItem>
                          <SelectItem value="ปริญญาโท">ปริญญาโท</SelectItem>
                          <SelectItem value="ปริญญาเอก">ปริญญาเอก</SelectItem>
                          <SelectItem value="ปวส.">ปวส.</SelectItem>
                          <SelectItem value="มัธยมศึกษา">มัธยมศึกษา</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>สาขาวิชา</Label>
                      <Input
                        placeholder="เช่น วิทยาการคอมพิวเตอร์, บริหารธุรกิจ, วิศวกรรมศาสตร์"
                        value={formData.field_of_study}
                        onChange={(e) => setFormData({ ...formData, field_of_study: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>ประสบการณ์ขั้นต่ำ</Label>
                      <Input
                        placeholder="เช่น การตลาดดิจิทัล, การพัฒนาซอฟต์แวร์"
                        value={formData.experience_in}
                        onChange={(e) => setFormData({ ...formData, experience_in: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>ประสบการณ์ขั้นต่ำ</Label>
                      <Input
                        placeholder="เช่น 1 ปี, 5 ปี"
                        value={formData.min_experience}
                        onChange={(e) => setFormData({ ...formData, min_experience: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>ความสามารถ / ความชำนาญอย่างอื่น</Label>
                    <Textarea
                      placeholder="ภาษาต่างประเทศ คอมพิวเตอร์ ขับรถยนต์ได้ไปอนุญาตชั้นขี้ ทำงานต่างจังหวัดได้ *ลฯ"
                      value={formData.other_skills}
                      onChange={(e) => setFormData({ ...formData, other_skills: e.target.value })}
                      rows={3}
                    />
                  </div>
                  </CardContent>
                </Card>

                <div className="flex justify-end gap-2 pt-4 sticky bottom-0 bg-background/95 backdrop-blur-sm p-4 -mx-6 -mb-6 border-t">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    ยกเลิก
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={uploading}
                    onClick={(e) => addSparkleEffect(e)}
                    className="transition-all hover:scale-105"
                  >
                    {uploading ? "กำลังบันทึก..." : "ส่งคำขออนุมัติ"}
                  </Button>
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
