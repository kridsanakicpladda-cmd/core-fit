import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Clock, CheckCircle, XCircle, Download, Upload, Briefcase, Users, FileText, Award, CalendarDays, Loader2, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useJobRequisitions, JobRequisition } from "@/hooks/useJobRequisitions";
import { RequisitionDetailDialog } from "@/components/requisitions/RequisitionDetailDialog";
import { exportRequisitionsPDF } from "@/lib/exportRequisitionsPDF";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { addSparkleEffect } from "@/lib/sparkle";
import * as pdfjsLib from "pdfjs-dist";

const JobRequisitions = () => {
  const { toast } = useToast();
  const [selectedRequisition, setSelectedRequisition] = useState<JobRequisition | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [canApprove, setCanApprove] = useState(false);
  const [jdFile, setJdFile] = useState<File | null>(null);
  const [requisitionFormFile, setRequisitionFormFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [parsingJD, setParsingJD] = useState(false);
  const [parsingReqForm, setParsingReqForm] = useState(false);
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

  // Set up PDF.js worker
  useEffect(() => {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
  }, []);

  const extractTextFromPDF = async (file: File): Promise<string> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = "";

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(" ");
        fullText += pageText + "\n";
      }

      return fullText;
    } catch (error) {
      console.error("Error extracting text from PDF:", error);
      throw new Error("ไม่สามารถอ่านไฟล์ PDF ได้");
    }
  };

  const parseJDWithAI = async () => {
    if (!jdFile) return;

    setParsingJD(true);
    try {
      toast({ title: "กำลัง Parse JD ด้วย AI...", description: "กรุณารอสักครู่" });

      const documentText = await extractTextFromPDF(jdFile);

      const { data: functionData, error: functionError } = await supabase.functions.invoke("parse-jd-document", {
        body: { documentText, documentType: "jd" },
      });

      if (functionError) throw functionError;

      if (functionData.success && functionData.data) {
        const parsed = functionData.data;
        
        // Auto-fill form with parsed data
        setFormData(prev => ({
          ...prev,
          ...(parsed.position && { position: parsed.position }),
          ...(parsed.department && { department: parsed.department }),
          ...(parsed.job_grade && { job_grade: parsed.job_grade }),
          ...(parsed.work_location && { work_location: parsed.work_location }),
          ...(parsed.reports_to && { reports_to: parsed.reports_to }),
          ...(parsed.job_duties && { job_duties: parsed.job_duties }),
          ...(parsed.gender && { gender: parsed.gender }),
          ...(parsed.max_age && { max_age: parsed.max_age }),
          ...(parsed.min_education && { min_education: parsed.min_education }),
          ...(parsed.field_of_study && { field_of_study: parsed.field_of_study }),
          ...(parsed.min_experience && { min_experience: parsed.min_experience }),
          ...(parsed.experience_in && { experience_in: parsed.experience_in }),
          ...(parsed.other_skills && { other_skills: parsed.other_skills }),
          ...(parsed.marital_status && { marital_status: parsed.marital_status }),
        }));

        toast({ 
          title: "Parse JD สำเร็จ!", 
          description: "ข้อมูลถูกนำเข้าฟอร์มอัตโนมัติแล้ว" 
        });
      } else {
        throw new Error(functionData.error || "Failed to parse JD");
      }
    } catch (error: any) {
      console.error("Error parsing JD:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message || "ไม่สามารถ Parse JD ได้",
        variant: "destructive",
      });
    } finally {
      setParsingJD(false);
    }
  };

  const parseRequisitionFormWithAI = async () => {
    if (!requisitionFormFile) return;

    setParsingReqForm(true);
    try {
      toast({ title: "กำลัง Parse ใบขออัตราด้วย AI...", description: "กรุณารอสักครู่" });

      const documentText = await extractTextFromPDF(requisitionFormFile);

      const { data: functionData, error: functionError } = await supabase.functions.invoke("parse-jd-document", {
        body: { documentText, documentType: "requisition_form" },
      });

      if (functionError) throw functionError;

      if (functionData.success && functionData.data) {
        const parsed = functionData.data;
        
        // Auto-fill form with parsed data
        setFormData(prev => ({
          ...prev,
          ...(parsed.position && { position: parsed.position }),
          ...(parsed.department && { department: parsed.department }),
          ...(parsed.work_location && { work_location: parsed.work_location }),
          ...(parsed.reports_to && { reports_to: parsed.reports_to }),
          ...(parsed.quantity && { quantity: parsed.quantity.toString() }),
          ...(parsed.justification && { justification: parsed.justification }),
          ...(parsed.hiring_type && { hiring_type: parsed.hiring_type as any }),
          ...(parsed.job_grade && { job_grade: parsed.job_grade }),
        }));

        toast({ 
          title: "Parse ใบขออัตราสำเร็จ!", 
          description: "ข้อมูลถูกนำเข้าฟอร์มอัตโนมัติแล้ว" 
        });
      } else {
        throw new Error(functionData.error || "Failed to parse requisition form");
      }
    } catch (error: any) {
      console.error("Error parsing requisition form:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message || "ไม่สามารถ Parse ใบขออัตราได้",
        variant: "destructive",
      });
    } finally {
      setParsingReqForm(false);
    }
  };

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

      // Create requisition
      await createRequisition.mutateAsync({
        ...formData,
        quantity: parseInt(formData.quantity),
        jd_file_url: jdFileUrl,
      });

      // Create job position in job_positions table
      const jobDescription = [
        formData.job_duties ? `**หน้าที่และความรับผิดชอบ:**\n${formData.job_duties}` : '',
        formData.justification ? `\n\n**เหตุผลในการเปิดรับ:**\n${formData.justification}` : ''
      ].filter(Boolean).join('');

      const qualifications = [
        formData.gender && formData.gender !== 'ไม่ระบุ' ? `- เพศ: ${formData.gender}` : '',
        formData.max_age ? `- อายุไม่เกิน: ${formData.max_age} ปี` : '',
        formData.min_education ? `- การศึกษา: ${formData.min_education}` : '',
        formData.field_of_study ? `- สาขา: ${formData.field_of_study}` : '',
        formData.min_experience ? `- ประสบการณ์: ${formData.min_experience}` : '',
        formData.experience_in ? `- ประสบการณ์ด้าน: ${formData.experience_in}` : '',
        formData.marital_status && formData.marital_status !== 'ไม่ระบุ' ? `- สถานะสมรส: ${formData.marital_status}` : '',
        formData.other_skills ? `- ทักษะอื่นๆ: ${formData.other_skills}` : ''
      ].filter(Boolean).join('\n');

      const { error: jobError } = await supabase.from('job_positions').insert({
        title: formData.position,
        department: formData.department,
        location: formData.work_location,
        job_grade: formData.job_grade || null,
        employment_type: formData.hiring_type === 'permanent' ? 'Full-time' : 
                        formData.hiring_type === 'temporary' ? 'Contract' : 'Replacement',
        required_count: parseInt(formData.quantity),
        start_date: formData.date_needed,
        status: 'open',
        description: jobDescription || null,
        requirements: qualifications || null,
      });

      if (jobError) {
        console.error('Error creating job position:', jobError);
        // Don't throw error, just log it - requisition was already created successfully
      }

      // Reset form
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
      setRequisitionFormFile(null);
      setCurrentPositions([{ position: "", count: "" }, { position: "", count: "" }]);
      
      toast({ 
        title: "บันทึกคำขอสำเร็จ", 
        description: "ส่งคำขออนุมัติและสร้างตำแหน่งงานเรียบร้อยแล้ว" 
      });
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error instanceof Error ? error.message : "ไม่สามารถบันทึกข้อมูลได้",
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

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* File Upload Section - Top */}
          <Card className="border-primary/20 shadow-lg overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-slate-500/10 via-gray-500/10 to-zinc-500/10 border-b border-primary/10">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Upload className="h-5 w-5 text-slate-600" />
                แนบเอกสาร
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-6">
                {/* JD File Upload */}
                <div className="space-y-3">
                  <Label className="text-base font-medium">เอกสาร Job Description (JD)</Label>
                  <div className="border-2 border-dashed border-primary/30 rounded-lg p-6 hover:border-primary/50 transition-all hover:bg-primary/5">
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-3 rounded-full bg-gradient-to-br from-primary/20 to-primary/10">
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
                          <Button type="button" size="sm" className="gap-2" asChild>
                            <span>
                              <FileText className="h-4 w-4" />
                              เลือกไฟล์ JD
                            </span>
                          </Button>
                        </Label>
                        <p className="text-xs text-muted-foreground mt-2">
                          PDF, DOC, DOCX (ไม่เกิน 20MB)
                        </p>
                      </div>
                      {jdFile && (
                        <div className="space-y-2 w-full">
                          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg w-full">
                            <div className="p-1.5 rounded-lg bg-green-100">
                              <FileText className="h-5 w-5 text-green-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-green-900 text-sm truncate">{jdFile.name}</p>
                              <p className="text-xs text-green-700">
                                {(jdFile.size / 1024).toFixed(2)} KB
                              </p>
                            </div>
                            <Button type="button" variant="ghost" size="sm" onClick={() => setJdFile(null)}>
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </div>
                          <Button
                            type="button"
                            onClick={parseJDWithAI}
                            disabled={parsingJD}
                            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                            size="sm"
                          >
                            {parsingJD ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                กำลัง Parse ด้วย AI...
                              </>
                            ) : (
                              <>
                                <Sparkles className="h-4 w-4 mr-2" />
                                Parse JD ด้วย AI
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Requisition Form Upload */}
                <div className="space-y-3">
                  <Label className="text-base font-medium">ใบขออัตรา</Label>
                  <div className="border-2 border-dashed border-primary/30 rounded-lg p-6 hover:border-primary/50 transition-all hover:bg-primary/5">
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-3 rounded-full bg-gradient-to-br from-blue-500/20 to-blue-500/10">
                        <Upload className="h-8 w-8 text-blue-600" />
                      </div>
                      <div className="text-center">
                        <Input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          className="hidden"
                          id="requisition-form-upload"
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
                              setRequisitionFormFile(file);
                            }
                          }}
                        />
                        <Label htmlFor="requisition-form-upload" className="cursor-pointer">
                          <Button type="button" size="sm" variant="secondary" className="gap-2" asChild>
                            <span>
                              <FileText className="h-4 w-4" />
                              เลือกใบขออัตรา
                            </span>
                          </Button>
                        </Label>
                        <p className="text-xs text-muted-foreground mt-2">
                          PDF, DOC, DOCX (ไม่เกิน 20MB)
                        </p>
                      </div>
                      {requisitionFormFile && (
                        <div className="space-y-2 w-full">
                          <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg w-full">
                            <div className="p-1.5 rounded-lg bg-blue-100">
                              <FileText className="h-5 w-5 text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-blue-900 text-sm truncate">{requisitionFormFile.name}</p>
                              <p className="text-xs text-blue-700">
                                {(requisitionFormFile.size / 1024).toFixed(2)} KB
                              </p>
                            </div>
                            <Button type="button" variant="ghost" size="sm" onClick={() => setRequisitionFormFile(null)}>
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </div>
                          <Button
                            type="button"
                            onClick={parseRequisitionFormWithAI}
                            disabled={parsingReqForm}
                            className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
                            size="sm"
                          >
                            {parsingReqForm ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                กำลัง Parse ด้วย AI...
                              </>
                            ) : (
                              <>
                                <Sparkles className="h-4 w-4 mr-2" />
                                Parse ใบขออัตราด้วย AI
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

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
                  <Upload className="h-4 w-4 mr-2" />
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
                    placeholder="เช่น Software Engineer"
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

          {/* Submit Button */}
          <div className="sticky bottom-0 bg-gradient-to-t from-background via-background to-transparent pt-6 pb-4">
            <div className="flex justify-end gap-3">
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
                    Send
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>

        {/* Requisitions Table */}
        <Card className="shadow-xl border-primary/20 mt-12">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-primary" />
                รายการคำขอทั้งหมด
              </CardTitle>
              <Button
                variant="outline"
                onClick={() => exportRequisitionsPDF(requisitions)}
                disabled={requisitions.length === 0}
                className="transition-all hover:scale-105"
              >
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">เลขที่คำขอ</TableHead>
                    <TableHead className="font-semibold">แผนก</TableHead>
                    <TableHead className="font-semibold">ตำแหน่ง</TableHead>
                    <TableHead className="font-semibold">จำนวน</TableHead>
                    <TableHead className="font-semibold">ประเภท</TableHead>
                    <TableHead className="font-semibold">สถานะ</TableHead>
                    <TableHead className="font-semibold">วันที่สร้าง</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                      </TableCell>
                    </TableRow>
                  ) : requisitions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        ยังไม่มีรายการคำขอ
                      </TableCell>
                    </TableRow>
                  ) : (
                    requisitions.map((req) => (
                      <TableRow
                        key={req.id}
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => {
                          setSelectedRequisition(req);
                          setDetailOpen(true);
                        }}
                      >
                        <TableCell className="font-medium">{req.requisition_number}</TableCell>
                        <TableCell>{req.department}</TableCell>
                        <TableCell>{req.position}</TableCell>
                        <TableCell>{req.quantity}</TableCell>
                        <TableCell>{getHiringTypeLabel(req.hiring_type)}</TableCell>
                        <TableCell>{getStatusBadge(req.status)}</TableCell>
                        <TableCell>{format(new Date(req.created_at), "dd/MM/yyyy")}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
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