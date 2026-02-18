import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, FileText, User, Loader2, Sparkles, MapPin, Briefcase, Phone, Mail, Ruler, Weight, Calendar, ExternalLink, ClipboardList } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import PrivacyPolicyDialog from "@/components/PrivacyPolicyDialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { addSparkleEffect } from "@/lib/sparkle";
import logoIcp from "@/assets/logo.png";
import logoMabin from "@/assets/ม้าบิน (1).png";
import logoTopone from "@/assets/TOPONE.png";
import logoKaset from "@/assets/ICK logo_Horizontal&Vertical-01.png";

interface JobPosition {
  id: string;
  title: string;
  status: string;
}

const PublicQuickApply = () => {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [resumeRawText, setResumeRawText] = useState<string>(''); // Store full resume text from OCR
  const [isParsing, setIsParsing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [jobPositions, setJobPositions] = useState<JobPosition[]>([]);
  const [isLoadingPositions, setIsLoadingPositions] = useState(true);

  // Get position from URL query params
  const positionFromUrl = searchParams.get("position") || "";

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    sex: "",
    weight: "",
    height: "",
    age: "",
    email: "",
    mobilePhone: "",
    interestedPosition: positionFromUrl,
    expectedSalary: "",
    preferredLocation: "",
    workExperience: "", // ประสบการณ์ฝึกงาน/ทำงาน
    privacyConsent: false,
  });

  // Update interestedPosition when URL param changes
  useEffect(() => {
    if (positionFromUrl) {
      setFormData(prev => ({ ...prev, interestedPosition: positionFromUrl }));
    }
  }, [positionFromUrl]);

  // Fetch job positions on mount
  useEffect(() => {
    const fetchJobPositions = async () => {
      try {
        const { data, error } = await supabase
          .from('job_positions')
          .select('id, title, status')
          .eq('status', 'open')
          .order('title');

        if (error) throw error;
        setJobPositions(data || []);
      } catch (error) {
        console.error('Error fetching job positions:', error);
      } finally {
        setIsLoadingPositions(false);
      }
    };

    fetchJobPositions();
  }, []);

  const [privacyDialogOpen, setPrivacyDialogOpen] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      handleParseResume(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      handleParseResume(file);
    }
  };

  const handleParseResume = async (file: File) => {
    setIsParsing(true);

    try {
      // Convert file to base64
      const fileBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          // Remove data URL prefix (e.g., "data:application/pdf;base64,")
          const base64 = result.split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // Call parse-resume edge function with base64 data
      const { data: parseResult, error: parseError } = await supabase.functions.invoke(
        'parse-resume',
        {
          body: {
            fileBase64: fileBase64,
          },
        }
      );

      if (parseError) {
        console.error('Parse error:', parseError);
        throw new Error('ไม่สามารถอ่านข้อมูลจาก Resume ได้');
      }

      if (parseResult?.success && parseResult?.data) {
        const parsed = parseResult.data;

        // Store raw text for AI fit score analysis
        if (parsed.raw_text) {
          setResumeRawText(parsed.raw_text);
        }

        // Parse name - split first and last name
        let firstName = '';
        let lastName = '';
        if (parsed.name) {
          const nameParts = parsed.name.trim().split(/\s+/);
          firstName = nameParts[0] || '';
          lastName = nameParts.slice(1).join(' ') || '';
        }

        // Auto-fill form with parsed data
        setFormData(prev => ({
          ...prev,
          firstName: firstName || prev.firstName,
          lastName: lastName || prev.lastName,
          email: parsed.email || prev.email,
          mobilePhone: parsed.phone || prev.mobilePhone,
          interestedPosition: parsed.position || prev.interestedPosition,
          expectedSalary: prev.expectedSalary,
          sex: prev.sex,
          age: prev.age,
          height: prev.height,
          weight: prev.weight,
          preferredLocation: prev.preferredLocation,
        }));

        toast({
          title: "อ่านข้อมูลสำเร็จ",
          description: "กรอกข้อมูลจาก Resume เรียบร้อยแล้ว กรุณาตรวจสอบความถูกต้อง",
        });
      } else {
        throw new Error(parseResult?.error || 'ไม่สามารถอ่านข้อมูลจาก Resume ได้');
      }
    } catch (error: any) {
      console.error('Error parsing resume:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message || "ไม่สามารถอ่านข้อมูลจาก Resume ได้",
        variant: "destructive",
      });
    } finally {
      setIsParsing(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate required fields
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.mobilePhone) {
        throw new Error('กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน');
      }

      // Upload resume file if exists
      let resumeUrl = null;
      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${Date.now()}_${formData.firstName}_${formData.lastName}.${fileExt}`;
        const filePath = `quick-apply/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('resumes')
          .upload(filePath, selectedFile);

        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage
            .from('resumes')
            .getPublicUrl(filePath);
          resumeUrl = publicUrl;
        }
      }

      // Check if candidate with this email already exists
      const { data: existingCandidate, error: checkError } = await supabase
        .from('candidates')
        .select('id')
        .eq('email', formData.email)
        .maybeSingle();

      console.log('Check existing candidate:', { existingCandidate, checkError });

      let candidate;

      if (existingCandidate) {
        // Update existing candidate
        const { data: updatedCandidate, error: updateError } = await supabase
          .from('candidates')
          .update({
            name: `${formData.firstName} ${formData.lastName}`,
            phone: formData.mobilePhone,
            resume_url: resumeUrl || undefined,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingCandidate.id)
          .select()
          .single();

        console.log('Update candidate result:', { updatedCandidate, updateError });
        if (updateError) throw updateError;
        candidate = updatedCandidate;
      } else {
        // Create new candidate record
        console.log('Inserting new candidate with data:', {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          phone: formData.mobilePhone,
          source: 'Quick Apply',
          stage: 'Pending',
          resume_url: resumeUrl,
        });

        const { data: newCandidate, error: candidateError } = await supabase
          .from('candidates')
          .insert({
            name: `${formData.firstName} ${formData.lastName}`,
            email: formData.email,
            phone: formData.mobilePhone,
            source: 'Quick Apply',
            stage: 'Pending',
            resume_url: resumeUrl,
          })
          .select()
          .single();

        console.log('Insert candidate result:', { newCandidate, candidateError });
        if (candidateError) throw candidateError;
        candidate = newCandidate;
      }

      // Upsert candidate_details record
      console.log('Upserting candidate_details with candidate_id:', candidate.id);
      const { data: detailsData, error: detailsError } = await supabase
        .from('candidate_details')
        .upsert({
          candidate_id: candidate.id,
          first_name: formData.firstName,
          last_name: formData.lastName,
          sex: formData.sex || null,
          weight: formData.weight || null,
          height: formData.height || null,
          age: formData.age || null,
          mobile_phone: formData.mobilePhone,
          position: formData.interestedPosition || null,
          expected_salary: formData.expectedSalary || null,
          present_address: formData.preferredLocation || null,
          other_skills: formData.workExperience || null, // ประสบการณ์ฝึกงาน/ทำงาน
          resume_raw_text: resumeRawText || null, // Store full resume text for AI analysis
        }, {
          onConflict: 'candidate_id'
        })
        .select();

      console.log('Upsert candidate_details result:', { detailsData, detailsError });
      if (detailsError) {
        console.error('Details error:', detailsError);
      }

      toast({
        title: "ส่งประวัติสำเร็จ",
        description: "ขอบคุณที่สนใจร่วมงานกับเรา เราจะพิจารณาประวัติของคุณและติดต่อกลับโดยเร็ว",
      });

      // Reset form
      setFormData({
        firstName: "",
        lastName: "",
        sex: "",
        weight: "",
        height: "",
        age: "",
        email: "",
        mobilePhone: "",
        interestedPosition: "",
        expectedSalary: "",
        preferredLocation: "",
        workExperience: "",
        privacyConsent: false,
      });
      setSelectedFile(null);
      setResumeRawText(''); // Clear resume text

    } catch (error: any) {
      console.error('Submit error:', error);

      // Handle duplicate email error with friendly message
      let errorMessage = "ไม่สามารถบันทึกข้อมูลได้";
      if (error.code === '23505' && error.message?.includes('email')) {
        errorMessage = "อีเมลนี้ถูกใช้งานแล้ว ระบบจะอัปเดตข้อมูลให้";
        // Try update instead
        try {
          const { data: existingCandidate } = await supabase
            .from('candidates')
            .select('id')
            .eq('email', formData.email)
            .single();

          if (existingCandidate) {
            await supabase
              .from('candidates')
              .update({
                name: `${formData.firstName} ${formData.lastName}`,
                phone: formData.mobilePhone,
                updated_at: new Date().toISOString(),
              })
              .eq('id', existingCandidate.id);

            toast({
              title: "อัปเดตข้อมูลสำเร็จ",
              description: "อัปเดตข้อมูลของคุณเรียบร้อยแล้ว",
            });

            // Reset form
            setFormData({
              firstName: "",
              lastName: "",
              sex: "",
              weight: "",
              height: "",
              age: "",
              email: "",
              mobilePhone: "",
              interestedPosition: "",
              expectedSalary: "",
              preferredLocation: "",
              workExperience: "",
              privacyConsent: false,
            });
            setSelectedFile(null);
            setResumeRawText(''); // Clear resume text
            return;
          }
        } catch (retryError) {
          console.error('Retry error:', retryError);
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: "เกิดข้อผิดพลาด",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-6 sm:py-12">
          <div className="text-center">
            {/* Company Logos */}
            <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-6 md:gap-10 mb-4 sm:mb-6">
              <div className="hover:scale-105 transition-transform">
                <img
                  src={logoIcp}
                  alt="ICP Ladda"
                  className="h-10 sm:h-14 md:h-16 w-auto object-contain"
                />
              </div>
              <div className="hover:scale-105 transition-transform">
                <img
                  src={logoMabin}
                  alt="ปุ๋ยตราม้าบิน"
                  className="h-10 sm:h-14 md:h-16 w-auto object-contain"
                />
              </div>
              <div className="hover:scale-105 transition-transform">
                <img
                  src={logoTopone}
                  alt="TOP ONE"
                  className="h-10 sm:h-14 md:h-16 w-auto object-contain"
                />
              </div>
              <div className="hover:scale-105 transition-transform">
                <img
                  src={logoKaset}
                  alt="Icon Kaset"
                  className="h-10 sm:h-14 md:h-16 w-auto object-contain"
                />
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-3 bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              สมัครงานกับ ICP Group
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto px-2">
              บริษัทในเครือ ICP Group ดำเนินธุรกิจด้านเคมีเกษตร การผลิตปุ๋ยเคมี
              <span className="hidden sm:inline"><br /></span>
              <span className="sm:hidden"> </span>
              และการนำเข้าวัตถุดิบแม่ปุ๋ยคุณภาพ ภายใต้มาตรฐาน ISO ระดับสากล
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:gap-6">
            {/* Resume Upload Section */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <CardTitle className="flex items-center gap-2 text-slate-700 text-base sm:text-lg">
                    <div className="bg-slate-100 rounded-lg p-1.5 sm:p-2">
                      <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600" />
                    </div>
                    อัปโหลด Resume
                  </CardTitle>
                  <Button
                    type="button"
                    variant="outline"
                    size="default"
                    onClick={() => window.location.href = '/public-jobs?returnUrl=/jobs-apply'}
                    className="group flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white border-0 rounded-xl px-4 sm:px-6 py-2.5 sm:py-3 shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-300 w-full sm:w-auto"
                  >
                    <Briefcase className="h-4 w-4 sm:h-5 sm:w-5 text-white/90" />
                    <span className="font-bold text-sm sm:text-[15px]">ตำแหน่งงานที่เปิดรับ</span>
                    <ExternalLink className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white/70 group-hover:translate-x-0.5 transition-transform" />
                  </Button>
                </div>
                <CardDescription className="text-sm sm:text-base mt-2">
                  อัปโหลด Resume ของคุณเพื่อให้ระบบ AI กรอกข้อมูลให้อัตโนมัติ
                </CardDescription>
              </CardHeader>
              <CardContent className="px-4 sm:px-6">
                <div
                  className={`border-2 border-dashed rounded-xl p-4 sm:p-8 text-center transition-all duration-300 ${
                    isDragging
                      ? "border-primary bg-primary/5 scale-[1.02]"
                      : "border-muted-foreground/25 hover:border-primary/50 hover:bg-accent/5"
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  {isParsing ? (
                    <div className="flex flex-col items-center gap-3 sm:gap-4">
                      <div className="relative">
                        <Loader2 className="h-12 w-12 sm:h-16 sm:w-16 text-primary animate-spin" />
                        <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-primary absolute -top-1 -right-1 animate-pulse" />
                      </div>
                      <div>
                        <p className="font-semibold text-base sm:text-lg">AI กำลังอ่านข้อมูลจาก Resume...</p>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-1">กรุณารอสักครู่</p>
                      </div>
                    </div>
                  ) : selectedFile ? (
                    <div className="flex flex-col items-center gap-3 sm:gap-4">
                      <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-primary/10 flex items-center justify-center">
                        <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm sm:text-base break-all px-2">{selectedFile.name}</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedFile(null);
                          setResumeRawText(''); // Clear resume text when changing file
                        }}
                      >
                        เลือกไฟล์ใหม่
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3 sm:gap-4">
                      <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                        <Upload className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-base sm:text-lg">ลากไฟล์มาวางที่นี่</p>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                          หรือคลิกเพื่อเลือกไฟล์ (PDF, DOC, DOCX)
                        </p>
                      </div>
                      <Input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileChange}
                        className="hidden"
                        id="resume-upload-public"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('resume-upload-public')?.click()}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        เลือกไฟล์
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Personal Information */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6">
                <CardTitle className="flex items-center gap-2 text-slate-700 text-base sm:text-lg">
                  <div className="bg-slate-100 rounded-lg p-1.5 sm:p-2">
                    <User className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600" />
                  </div>
                  ข้อมูลส่วนตัว
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  กรอกข้อมูลส่วนตัวของคุณ
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
                {/* Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-1.5 sm:space-y-2">
                    <Label htmlFor="firstName" className="text-sm">
                      ชื่อ <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      placeholder="ชื่อ"
                      required
                      className="h-10 sm:h-11"
                    />
                  </div>
                  <div className="space-y-1.5 sm:space-y-2">
                    <Label htmlFor="lastName" className="text-sm">
                      นามสกุล <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      placeholder="นามสกุล"
                      required
                      className="h-10 sm:h-11"
                    />
                  </div>
                </div>

                {/* Sex, Age */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                  <div className="space-y-1.5 sm:space-y-2">
                    <Label htmlFor="sex" className="text-sm">เพศ</Label>
                    <Select
                      value={formData.sex}
                      onValueChange={(value) => handleInputChange("sex", value)}
                    >
                      <SelectTrigger className="h-10 sm:h-11">
                        <SelectValue placeholder="เลือกเพศ" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">ชาย</SelectItem>
                        <SelectItem value="female">หญิง</SelectItem>
                        <SelectItem value="not_specified">ไม่ระบุ</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5 sm:space-y-2">
                    <Label htmlFor="age" className="flex items-center gap-1 text-sm">
                      <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      อายุ (ปี)
                    </Label>
                    <Input
                      id="age"
                      type="number"
                      value={formData.age}
                      onChange={(e) => handleInputChange("age", e.target.value)}
                      placeholder="อายุ"
                      className="h-10 sm:h-11"
                    />
                  </div>
                </div>

                {/* Height, Weight */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-1.5 sm:space-y-2">
                    <Label htmlFor="height" className="flex items-center gap-1 text-sm">
                      <Ruler className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      ส่วนสูง (ซม.)
                    </Label>
                    <Input
                      id="height"
                      type="number"
                      value={formData.height}
                      onChange={(e) => handleInputChange("height", e.target.value)}
                      placeholder="ส่วนสูง"
                      className="h-10 sm:h-11"
                    />
                  </div>
                  <div className="space-y-1.5 sm:space-y-2">
                    <Label htmlFor="weight" className="flex items-center gap-1 text-sm">
                      <Weight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      น้ำหนัก (กก.)
                    </Label>
                    <Input
                      id="weight"
                      type="number"
                      value={formData.weight}
                      onChange={(e) => handleInputChange("weight", e.target.value)}
                      placeholder="น้ำหนัก"
                      className="h-10 sm:h-11"
                    />
                  </div>
                </div>

                {/* Contact */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-1.5 sm:space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-1 text-sm">
                      <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      อีเมล <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="example@email.com"
                      required
                      className="h-10 sm:h-11"
                    />
                  </div>
                  <div className="space-y-1.5 sm:space-y-2">
                    <Label htmlFor="mobilePhone" className="flex items-center gap-1 text-sm">
                      <Phone className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      เบอร์โทรศัพท์ <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="mobilePhone"
                      type="tel"
                      value={formData.mobilePhone}
                      onChange={(e) => handleInputChange("mobilePhone", e.target.value)}
                      placeholder="08X-XXX-XXXX"
                      required
                      className="h-10 sm:h-11"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Job Interest */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6">
                <CardTitle className="flex items-center gap-2 text-slate-700 text-base sm:text-lg">
                  <div className="bg-slate-100 rounded-lg p-1.5 sm:p-2">
                    <Briefcase className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600" />
                  </div>
                  ความสนใจในงาน
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  กรอกข้อมูลตำแหน่งงานและเงินเดือนที่คุณสนใจ
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-1.5 sm:space-y-2">
                    <Label htmlFor="interestedPosition" className="text-sm">ตำแหน่งที่สนใจ</Label>
                    <Select
                      value={formData.interestedPosition}
                      onValueChange={(value) => handleInputChange("interestedPosition", value)}
                      disabled={isLoadingPositions}
                    >
                      <SelectTrigger className="h-10 sm:h-11">
                        <SelectValue placeholder={isLoadingPositions ? "กำลังโหลด..." : "เลือกตำแหน่งที่สนใจ"} />
                      </SelectTrigger>
                      <SelectContent>
                        {jobPositions.map((position) => (
                          <SelectItem key={position.id} value={position.title}>
                            {position.title}
                          </SelectItem>
                        ))}
                        {jobPositions.length === 0 && !isLoadingPositions && (
                          <SelectItem value="other" disabled>
                            ไม่มีตำแหน่งที่เปิดรับสมัคร
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5 sm:space-y-2">
                    <Label htmlFor="expectedSalary" className="text-sm">เงินเดือนที่คาดหวัง (บาท)</Label>
                    <Input
                      id="expectedSalary"
                      type="number"
                      value={formData.expectedSalary}
                      onChange={(e) => handleInputChange("expectedSalary", e.target.value)}
                      placeholder="เช่น 30000"
                      className="h-10 sm:h-11"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="preferredLocation" className="flex items-center gap-1 text-sm">
                    <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    สถานที่ปฏิบัติงาน / เขตที่ต้องการ
                  </Label>
                  <Select
                    value={formData.preferredLocation}
                    onValueChange={(value) => handleInputChange("preferredLocation", value)}
                  >
                    <SelectTrigger className="h-10 sm:h-11">
                      <SelectValue placeholder="เลือกสถานที่ปฏิบัติงาน" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="เขตเหนือ">เขตเหนือ</SelectItem>
                      <SelectItem value="เขตภาคกลาง">เขตภาคกลาง</SelectItem>
                      <SelectItem value="เขตใต้">เขตใต้</SelectItem>
                      <SelectItem value="เขตตะวันออก">เขตตะวันออก</SelectItem>
                      <SelectItem value="เขตตะวันตก">เขตตะวันตก</SelectItem>
                      <SelectItem value="สำนักงานสุรวงศ์ (กรุงเทพ)">สำนักงานสุรวงศ์ (กรุงเทพ)</SelectItem>
                      <SelectItem value="สำนักงานศรีราชา (ชลบุรี)">สำนักงานศรีราชา (ชลบุรี)</SelectItem>
                      <SelectItem value="โรงงานนครปฐม">โรงงานนครปฐม</SelectItem>
                      <SelectItem value="โรงงานอยุธยา">โรงงานอยุธยา</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Work Experience */}
                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="workExperience" className="flex items-center gap-1 text-sm">
                    <ClipboardList className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    ประสบการณ์ฝึกงาน/ทำงาน
                  </Label>
                  <Textarea
                    id="workExperience"
                    value={formData.workExperience}
                    onChange={(e) => handleInputChange("workExperience", e.target.value)}
                    placeholder="กรุณาระบุประสบการณ์การทำงาน เช่น ตำแหน่ง บริษัท ระยะเวลา หน้าที่รับผิดชอบ"
                    className="min-h-[100px] resize-none"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Privacy Consent */}
            <div className="flex items-start space-x-2.5 sm:space-x-3 px-1">
              <Checkbox
                id="privacy"
                checked={formData.privacyConsent}
                onCheckedChange={(checked) => handleInputChange("privacyConsent", checked as boolean)}
                required
                className="mt-0.5"
              />
              <label
                htmlFor="privacy"
                className="text-xs sm:text-sm font-normal leading-relaxed cursor-pointer"
              >
                ฉันยินยอมให้เก็บข้อมูลและใช้งานตาม{" "}
                <button
                  type="button"
                  onClick={() => setPrivacyDialogOpen(true)}
                  className="text-primary underline hover:text-primary/80 font-semibold"
                >
                  นโยบายความเป็นส่วนตัว
                </button>{" "}
                แล้ว <span className="text-destructive">*</span>
              </label>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center gap-4 pt-2 sm:pt-4 pb-4 sm:pb-0">
              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting || !formData.privacyConsent}
                onClick={addSparkleEffect}
                className="w-full sm:w-auto sm:min-w-[250px] h-12 sm:h-14 text-base sm:text-lg bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 shadow-lg hover:shadow-xl transition-all"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 mr-2 animate-spin" />
                    กำลังบันทึก...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                    ส่งใบสมัคร
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>

      {/* Privacy Policy Dialog */}
      <PrivacyPolicyDialog
        open={privacyDialogOpen}
        onOpenChange={setPrivacyDialogOpen}
      />
    </div>
  );
};

export default PublicQuickApply;
