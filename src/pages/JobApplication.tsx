import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Upload, FileText, Plus, User, X, Loader2, Sparkles, Briefcase, GraduationCap, Users, Home, Heart, Phone as PhoneIcon, Shield, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCandidates } from "@/contexts/CandidatesContext";
import PrivacyPolicyDialog from "@/components/PrivacyPolicyDialog";
import { supabase } from "@/integrations/supabase/client";
import { addSparkleEffect } from "@/lib/sparkle";

interface Education {
  level: string;
  institution: string;
  major: string;
  gpa: string;
  yearGraduated: string;
}

interface WorkExperience {
  company: string;
  position: string;
  duration: string;
  salary: string;
  reason: string;
}

interface Reference {
  name: string;
  position: string;
  company: string;
  phone: string;
}

const JobApplication = () => {
  const { toast } = useToast();
  const { addCandidate } = useCandidates();
  const location = useLocation();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [languages, setLanguages] = useState<Array<{ language: string; level: string }>>([
    { language: "", level: "good" }
  ]);
  const [educations, setEducations] = useState<Education[]>([
    { level: "", institution: "", major: "", gpa: "", yearGraduated: "" }
  ]);
  const [workExperiences, setWorkExperiences] = useState<WorkExperience[]>([
    { company: "", position: "", duration: "", salary: "", reason: "" }
  ]);
  const [references, setReferences] = useState<Reference[]>([
    { name: "", position: "", company: "", phone: "" }
  ]);
  const [privacyDialogOpen, setPrivacyDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    // Job Application Info
    position: "",
    salaryRequired: "",
    startDate: "",
    
    // Personal Info
    fullName: "",
    nickname: "",
    idCard: "",
    birthDate: "",
    age: "",
    nationality: "ไทย",
    religion: "พุทธ",
    race: "ไทย",
    height: "",
    weight: "",
    bloodType: "",
    maritalStatus: "single",
    militaryStatus: "",
    
    // Contact
    email: "",
    phone: "",
    lineId: "",
    currentAddress: "",
    permanentAddress: "",
    sameAddress: false,
    
    // Emergency Contact
    emergencyName: "",
    emergencyRelation: "",
    emergencyPhone: "",
    
    // Family
    fatherName: "",
    fatherAge: "",
    fatherOccupation: "",
    motherName: "",
    motherAge: "",
    motherOccupation: "",
    spouseName: "",
    spouseAge: "",
    spouseOccupation: "",
    siblings: "",
    
    // Additional
    coverLetter: "",
    skills: "",
    certifications: "",
    informationSource: "",
    referrerName: "",
    privacyConsent: false,
  });

  const availablePositions = [
    "Senior Software Engineer",
    "Product Manager",
    "UX/UI Designer",
    "Data Analyst",
    "Marketing Manager",
    "Sales Executive",
  ];

  useEffect(() => {
    const state = location.state as { jobTitle?: string } | null;
    if (state?.jobTitle) {
      setFormData(prev => ({ ...prev, position: state.jobTitle }));
      toast({
        title: "ตำแหน่งงานถูกเลือกแล้ว",
        description: `คุณกำลังสมัครตำแหน่ง: ${state.jobTitle}`,
      });
    }
  }, [location.state, toast]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      toast({
        title: "ไฟล์ถูกเลือกแล้ว",
        description: `${e.target.files[0].name}`,
      });
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfilePhoto(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      toast({
        title: "อัปโหลดรูปภาพสำเร็จ",
        description: file.name,
      });
    }
  };

  const addLanguage = () => {
    setLanguages([...languages, { language: "", level: "good" }]);
  };

  const removeLanguage = (index: number) => {
    if (languages.length > 1) {
      setLanguages(languages.filter((_, i) => i !== index));
    }
  };

  const updateLanguage = (index: number, field: "language" | "level", value: string) => {
    const updated = [...languages];
    updated[index][field] = value;
    setLanguages(updated);
  };

  const addEducation = () => {
    setEducations([...educations, { level: "", institution: "", major: "", gpa: "", yearGraduated: "" }]);
  };

  const removeEducation = (index: number) => {
    if (educations.length > 1) {
      setEducations(educations.filter((_, i) => i !== index));
    }
  };

  const updateEducation = (index: number, field: keyof Education, value: string) => {
    const updated = [...educations];
    updated[index][field] = value;
    setEducations(updated);
  };

  const addWorkExperience = () => {
    setWorkExperiences([...workExperiences, { company: "", position: "", duration: "", salary: "", reason: "" }]);
  };

  const removeWorkExperience = (index: number) => {
    if (workExperiences.length > 1) {
      setWorkExperiences(workExperiences.filter((_, i) => i !== index));
    }
  };

  const updateWorkExperience = (index: number, field: keyof WorkExperience, value: string) => {
    const updated = [...workExperiences];
    updated[index][field] = value;
    setWorkExperiences(updated);
  };

  const addReference = () => {
    setReferences([...references, { name: "", position: "", company: "", phone: "" }]);
  };

  const removeReference = (index: number) => {
    if (references.length > 1) {
      setReferences(references.filter((_, i) => i !== index));
    }
  };

  const updateReference = (index: number, field: keyof Reference, value: string) => {
    const updated = [...references];
    updated[index][field] = value;
    setReferences(updated);
  };

  const parseResumeWithAI = async () => {
    if (!selectedFile) {
      toast({
        title: "ไม่พบไฟล์",
        description: "กรุณาอัปโหลดไฟล์ Resume ก่อน",
        variant: "destructive",
      });
      return;
    }

    if (selectedFile.type !== 'application/pdf') {
      toast({
        title: "รองรับเฉพาะไฟล์ PDF",
        description: "กรุณาอัปโหลดไฟล์ PDF เท่านั้น",
        variant: "destructive",
      });
      return;
    }

    setIsParsing(true);

    try {
      const pdfjsLib = await import('pdfjs-dist');
      const pdfjsWorker = await import('pdfjs-dist/build/pdf.worker.mjs?url');
      pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker.default;

      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      let fullText = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        fullText += pageText + '\n';
      }

      if (!fullText.trim()) {
        toast({
          title: "ไม่พบข้อความ",
          description: "ไม่สามารถดึงข้อความจาก PDF ได้ อาจเป็น PDF ที่สแกนมา",
          variant: "destructive",
        });
        setIsParsing(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke('parse-resume', {
        body: { resumeText: fullText }
      });

      if (error) {
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถ parse Resume ได้ กรุณาลองอีกครั้ง",
          variant: "destructive",
        });
        setIsParsing(false);
        return;
      }

      if (data?.success && data?.data) {
        const parsed = data.data;
        
        setFormData(prev => ({
          ...prev,
          fullName: parsed.name || prev.fullName,
          email: parsed.email || prev.email,
          phone: parsed.phone || prev.phone,
          position: parsed.position || prev.position,
          coverLetter: parsed.experience || prev.coverLetter,
        }));

        toast({
          title: "Parse สำเร็จ!",
          description: "ข้อมูลจาก Resume ถูกกรอกในฟอร์มแล้ว กรุณาตรวจสอบความถูกต้อง",
        });
      }

      setIsParsing(false);
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error instanceof Error ? error.message : "ไม่สามารถ parse Resume ได้",
        variant: "destructive",
      });
      setIsParsing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.position || !formData.fullName || !formData.email || !selectedFile || !formData.privacyConsent) {
      toast({
        title: "กรุณากรอกข้อมูลให้ครบถ้วน",
        description: "กรุณากรอกข้อมูลทุกช่องที่มีเครื่องหมาย * อัปโหลดเรซูเม่ และยินยอมนโยบายความเป็นส่วนตัว",
        variant: "destructive",
      });
      return;
    }

    addCandidate({
      name: formData.fullName,
      email: formData.email,
      phone: formData.phone || "-",
      position: formData.position,
      experience: "ระบุในเรซูเม่",
      skills: [],
      resumeFile: selectedFile.name,
      coverLetter: formData.coverLetter,
    });

    toast({
      title: "ส่งใบสมัครสำเร็จ",
      description: `ใบสมัครของคุณสำหรับตำแหน่ง ${formData.position} ถูกส่งแล้ว`,
    });

    // Reset form
    setFormData({
      position: "",
      salaryRequired: "",
      startDate: "",
      fullName: "",
      nickname: "",
      idCard: "",
      birthDate: "",
      age: "",
      nationality: "ไทย",
      religion: "พุทธ",
      race: "ไทย",
      height: "",
      weight: "",
      bloodType: "",
      maritalStatus: "single",
      militaryStatus: "",
      email: "",
      phone: "",
      lineId: "",
      currentAddress: "",
      permanentAddress: "",
      sameAddress: false,
      emergencyName: "",
      emergencyRelation: "",
      emergencyPhone: "",
      fatherName: "",
      fatherAge: "",
      fatherOccupation: "",
      motherName: "",
      motherAge: "",
      motherOccupation: "",
      spouseName: "",
      spouseAge: "",
      spouseOccupation: "",
      siblings: "",
      coverLetter: "",
      skills: "",
      certifications: "",
      informationSource: "",
      referrerName: "",
      privacyConsent: false,
    });
    setSelectedFile(null);
    setProfilePhoto(null);
    setProfilePhotoPreview(null);
    setLanguages([{ language: "", level: "good" }]);
    setEducations([{ level: "", institution: "", major: "", gpa: "", yearGraduated: "" }]);
    setWorkExperiences([{ company: "", position: "", duration: "", salary: "", reason: "" }]);
    setReferences([{ name: "", position: "", company: "", phone: "" }]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5 py-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent mb-3">
            ฟอร์มสมัครงาน
          </h1>
          <p className="text-lg text-muted-foreground">
            เข้าร่วมทีมกับเราและสร้างอนาคตที่สดใสไปด้วยกัน ✨
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Photo & Job Info */}
          <Card className="border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-xl">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-t-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/20 rounded-lg">
                  <Briefcase className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl">ข้อมูลการสมัครงาน</CardTitle>
                  <CardDescription>ตำแหน่งและเงินเดือนที่คาดหวัง</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Profile Photo */}
                <div className="lg:col-span-3">
                  <Label className="text-base font-semibold">รูปถ่าย / Photo</Label>
                  <div className="mt-3 space-y-4">
                    <div className="relative w-full aspect-square max-w-[200px] rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                      {profilePhotoPreview ? (
                        <img 
                          src={profilePhotoPreview} 
                          alt="Profile preview" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-24 h-24 text-primary/50" />
                      )}
                    </div>
                    <input
                      id="profile-photo"
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                    <label htmlFor="profile-photo">
                      <Button 
                        type="button" 
                        variant="secondary" 
                        className="cursor-pointer w-full hover-scale"
                        onClick={(e) => addSparkleEffect(e as any)}
                        asChild
                      >
                        <span className="flex items-center gap-2">
                          <Upload className="w-4 h-4" />
                          อัปโหลดรูป
                        </span>
                      </Button>
                    </label>
                  </div>
                </div>

                {/* Job Details */}
                <div className="lg:col-span-9 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="position" className="text-base font-semibold">
                      ตำแหน่งที่สมัคร / Position <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={formData.position}
                      onValueChange={(value) => setFormData({ ...formData, position: value })}
                    >
                      <SelectTrigger className="border-2 focus:border-primary">
                        <SelectValue placeholder="เลือกตำแหน่ง..." />
                      </SelectTrigger>
                      <SelectContent>
                        {availablePositions.map((position) => (
                          <SelectItem key={position} value={position}>
                            {position}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="salaryRequired">
                        เงินเดือนที่ต้องการ / Salary (บาท)
                      </Label>
                      <Input
                        id="salaryRequired"
                        type="number"
                        value={formData.salaryRequired}
                        onChange={(e) => setFormData({ ...formData, salaryRequired: e.target.value })}
                        placeholder="25,000"
                        className="border-2 focus:border-primary"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="startDate">
                        วันที่สามารถเริ่มงานได้ / Start Date
                      </Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        className="border-2 focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="resume" className="text-base font-semibold">
                      แนบไฟล์ Resume / CV <span className="text-destructive">*</span>
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        value={selectedFile?.name || ""}
                        readOnly
                        placeholder="ยังไม่ได้เลือกไฟล์"
                        className="flex-1 border-2"
                      />
                      <input
                        id="resume"
                        type="file"
                        accept=".pdf"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <label htmlFor="resume">
                        <Button 
                          type="button" 
                          variant="secondary" 
                          className="cursor-pointer hover-scale"
                          onClick={(e) => addSparkleEffect(e as any)}
                          asChild
                        >
                          <span className="flex items-center gap-2">
                            <Upload className="w-4 h-4" />
                            เลือกไฟล์
                          </span>
                        </Button>
                      </label>
                      {selectedFile && (
                        <Button 
                          type="button" 
                          onClick={parseResumeWithAI}
                          disabled={isParsing}
                          className="gap-2 bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                        >
                          {isParsing ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              กำลัง Parse...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4" />
                              AI Parse
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Personal Information */}
          <Card className="border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-xl">
            <CardHeader className="bg-gradient-to-r from-secondary/10 to-primary/10 rounded-t-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-secondary/20 rounded-lg">
                  <User className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <CardTitle className="text-2xl">ข้อมูลส่วนตัว</CardTitle>
                  <CardDescription>กรุณากรอกข้อมูลของคุณให้ครบถ้วน</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">
                    ชื่อ-นามสกุล / Full Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="นายสมชาย ใจดี"
                    className="border-2 focus:border-secondary"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nickname">
                    ชื่อเล่น / Nickname
                  </Label>
                  <Input
                    id="nickname"
                    value={formData.nickname}
                    onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                    placeholder="ชาย"
                    className="border-2 focus:border-secondary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="idCard">
                    เลขบัตรประชาชน / ID Card Number
                  </Label>
                  <Input
                    id="idCard"
                    value={formData.idCard}
                    onChange={(e) => setFormData({ ...formData, idCard: e.target.value })}
                    placeholder="1-2345-67890-12-3"
                    maxLength={17}
                    className="border-2 focus:border-secondary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="birthDate">
                      วันเกิด / Birth Date
                    </Label>
                    <Input
                      id="birthDate"
                      type="date"
                      value={formData.birthDate}
                      onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                      className="border-2 focus:border-secondary"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="age">
                      อายุ / Age
                    </Label>
                    <Input
                      id="age"
                      type="number"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                      placeholder="25"
                      className="border-2 focus:border-secondary"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nationality">
                    สัญชาติ / Nationality
                  </Label>
                  <Input
                    id="nationality"
                    value={formData.nationality}
                    onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                    placeholder="ไทย"
                    className="border-2 focus:border-secondary"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="religion">
                    ศาสนา / Religion
                  </Label>
                  <Input
                    id="religion"
                    value={formData.religion}
                    onChange={(e) => setFormData({ ...formData, religion: e.target.value })}
                    placeholder="พุทธ"
                    className="border-2 focus:border-secondary"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="race">
                    เชื้อชาติ / Race
                  </Label>
                  <Input
                    id="race"
                    value={formData.race}
                    onChange={(e) => setFormData({ ...formData, race: e.target.value })}
                    placeholder="ไทย"
                    className="border-2 focus:border-secondary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="height">
                    ส่วนสูง (ซม.) / Height
                  </Label>
                  <Input
                    id="height"
                    type="number"
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                    placeholder="170"
                    className="border-2 focus:border-secondary"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weight">
                    น้ำหนัก (กก.) / Weight
                  </Label>
                  <Input
                    id="weight"
                    type="number"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    placeholder="65"
                    className="border-2 focus:border-secondary"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bloodType">
                    กรุ๊ปเลือด / Blood Type
                  </Label>
                  <Select
                    value={formData.bloodType}
                    onValueChange={(value) => setFormData({ ...formData, bloodType: value })}
                  >
                    <SelectTrigger className="border-2">
                      <SelectValue placeholder="เลือก..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A">A</SelectItem>
                      <SelectItem value="B">B</SelectItem>
                      <SelectItem value="AB">AB</SelectItem>
                      <SelectItem value="O">O</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maritalStatus">
                    สถานะ / Status
                  </Label>
                  <Select
                    value={formData.maritalStatus}
                    onValueChange={(value) => setFormData({ ...formData, maritalStatus: value })}
                  >
                    <SelectTrigger className="border-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">โสด</SelectItem>
                      <SelectItem value="married">สมรส</SelectItem>
                      <SelectItem value="divorced">หย่า</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="militaryStatus">
                  สถานะทางทหาร / Military Status (สำหรับเพศชาย)
                </Label>
                <Select
                  value={formData.militaryStatus}
                  onValueChange={(value) => setFormData({ ...formData, militaryStatus: value })}
                >
                  <SelectTrigger className="border-2">
                    <SelectValue placeholder="เลือกสถานะ..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="completed">ผ่านการเกณฑ์ทหาร</SelectItem>
                    <SelectItem value="exempted">ได้รับการยกเว้น</SelectItem>
                    <SelectItem value="not-applicable">ไม่มี</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Section 3: Contact Information */}
          <Card className="border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-xl">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-t-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/20 rounded-lg">
                  <PhoneIcon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl">ข้อมูลติดต่อ</CardTitle>
                  <CardDescription>ที่อยู่และช่องทางติดต่อ</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">
                    อีเมล / Email <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="email@example.com"
                    className="border-2 focus:border-primary"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">
                    เบอร์โทรศัพท์ / Phone
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="081-234-5678"
                    className="border-2 focus:border-primary"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="lineId">
                  Line ID
                </Label>
                <Input
                  id="lineId"
                  value={formData.lineId}
                  onChange={(e) => setFormData({ ...formData, lineId: e.target.value })}
                  placeholder="@yourlineid"
                  className="border-2 focus:border-primary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="currentAddress">
                  ที่อยู่ปัจจุบัน / Current Address
                </Label>
                <Textarea
                  id="currentAddress"
                  value={formData.currentAddress}
                  onChange={(e) => setFormData({ ...formData, currentAddress: e.target.value })}
                  placeholder="123 ถนน... แขวง... เขต... กรุงเทพฯ 10XXX"
                  rows={3}
                  className="border-2 focus:border-primary resize-none"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="sameAddress"
                  checked={formData.sameAddress}
                  onCheckedChange={(checked) => {
                    setFormData({ 
                      ...formData, 
                      sameAddress: checked as boolean,
                      permanentAddress: checked ? formData.currentAddress : formData.permanentAddress
                    });
                  }}
                />
                <Label htmlFor="sameAddress" className="font-normal cursor-pointer">
                  ที่อยู่ตามทะเบียนบ้านเหมือนที่อยู่ปัจจุบัน
                </Label>
              </div>

              {!formData.sameAddress && (
                <div className="space-y-2 animate-fade-in">
                  <Label htmlFor="permanentAddress">
                    ที่อยู่ตามทะเบียนบ้าน / Permanent Address
                  </Label>
                  <Textarea
                    id="permanentAddress"
                    value={formData.permanentAddress}
                    onChange={(e) => setFormData({ ...formData, permanentAddress: e.target.value })}
                    placeholder="123 ถนน... ตำบล... อำเภอ... จังหวัด... 10XXX"
                    rows={3}
                    className="border-2 focus:border-primary resize-none"
                  />
                </div>
              )}

              {/* Emergency Contact */}
              <div className="pt-4 border-t">
                <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  ผู้ติดต่อฉุกเฉิน / Emergency Contact
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="emergencyName">
                      ชื่อ / Name
                    </Label>
                    <Input
                      id="emergencyName"
                      value={formData.emergencyName}
                      onChange={(e) => setFormData({ ...formData, emergencyName: e.target.value })}
                      placeholder="นางสาวสมหญิง ใจดี"
                      className="border-2"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emergencyRelation">
                      ความสัมพันธ์ / Relation
                    </Label>
                    <Input
                      id="emergencyRelation"
                      value={formData.emergencyRelation}
                      onChange={(e) => setFormData({ ...formData, emergencyRelation: e.target.value })}
                      placeholder="แม่"
                      className="border-2"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emergencyPhone">
                      เบอร์โทร / Phone
                    </Label>
                    <Input
                      id="emergencyPhone"
                      type="tel"
                      value={formData.emergencyPhone}
                      onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                      placeholder="081-234-5678"
                      className="border-2"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 4: Education */}
          <Card className="border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-xl">
            <CardHeader className="bg-gradient-to-r from-secondary/10 to-primary/10 rounded-t-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-secondary/20 rounded-lg">
                    <GraduationCap className="w-6 h-6 text-secondary" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">ประวัติการศึกษา</CardTitle>
                    <CardDescription>กรุณาระบุประวัติการศึกษาของคุณ</CardDescription>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addEducation}
                  className="gap-2 hover-scale"
                >
                  <Plus className="w-4 h-4" />
                  เพิ่ม
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {educations.map((edu, index) => (
                <div key={index} className="p-4 border-2 rounded-xl bg-secondary/5 space-y-3 hover:bg-secondary/10 transition-colors">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">การศึกษาที่ {index + 1}</h4>
                    {educations.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeEducation(index)}
                        className="hover:bg-destructive/10 hover:text-destructive"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>ระดับการศึกษา / Level</Label>
                      <Select
                        value={edu.level}
                        onValueChange={(value) => updateEducation(index, "level", value)}
                      >
                        <SelectTrigger className="border-2">
                          <SelectValue placeholder="เลือก..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high-school">มัธยมศึกษา</SelectItem>
                          <SelectItem value="vocational">ปวช./ปวส.</SelectItem>
                          <SelectItem value="bachelor">ปริญญาตรี</SelectItem>
                          <SelectItem value="master">ปริญญาโท</SelectItem>
                          <SelectItem value="doctorate">ปริญญาเอก</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>สถาบันการศึกษา / Institution</Label>
                      <Input
                        value={edu.institution}
                        onChange={(e) => updateEducation(index, "institution", e.target.value)}
                        placeholder="จุฬาลงกรณ์มหาวิทยาลัย"
                        className="border-2"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>สาขาวิชา / Major</Label>
                      <Input
                        value={edu.major}
                        onChange={(e) => updateEducation(index, "major", e.target.value)}
                        placeholder="วิทยาการคอมพิวเตอร์"
                        className="border-2"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label>GPA</Label>
                        <Input
                          value={edu.gpa}
                          onChange={(e) => updateEducation(index, "gpa", e.target.value)}
                          placeholder="3.50"
                          className="border-2"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>ปีที่จบ / Year</Label>
                        <Input
                          value={edu.yearGraduated}
                          onChange={(e) => updateEducation(index, "yearGraduated", e.target.value)}
                          placeholder="2565"
                          className="border-2"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Section 5: Work Experience */}
          <Card className="border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-xl">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-t-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/20 rounded-lg">
                    <Briefcase className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">ประสบการณ์ทำงาน</CardTitle>
                    <CardDescription>ประวัติการทำงานของคุณ</CardDescription>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addWorkExperience}
                  className="gap-2 hover-scale"
                >
                  <Plus className="w-4 h-4" />
                  เพิ่ม
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {workExperiences.map((work, index) => (
                <div key={index} className="p-4 border-2 rounded-xl bg-primary/5 space-y-3 hover:bg-primary/10 transition-colors">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">ประสบการณ์ที่ {index + 1}</h4>
                    {workExperiences.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeWorkExperience(index)}
                        className="hover:bg-destructive/10 hover:text-destructive"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>บริษัท / Company</Label>
                      <Input
                        value={work.company}
                        onChange={(e) => updateWorkExperience(index, "company", e.target.value)}
                        placeholder="ABC Company Ltd."
                        className="border-2"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>ตำแหน่ง / Position</Label>
                      <Input
                        value={work.position}
                        onChange={(e) => updateWorkExperience(index, "position", e.target.value)}
                        placeholder="Software Engineer"
                        className="border-2"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>ระยะเวลา / Duration</Label>
                      <Input
                        value={work.duration}
                        onChange={(e) => updateWorkExperience(index, "duration", e.target.value)}
                        placeholder="2 ปี 6 เดือน"
                        className="border-2"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>เงินเดือน / Salary (บาท)</Label>
                      <Input
                        value={work.salary}
                        onChange={(e) => updateWorkExperience(index, "salary", e.target.value)}
                        placeholder="30,000"
                        className="border-2"
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label>เหตุผลที่ลาออก / Reason for Leaving</Label>
                      <Input
                        value={work.reason}
                        onChange={(e) => updateWorkExperience(index, "reason", e.target.value)}
                        placeholder="ต้องการพัฒนาความสามารถ"
                        className="border-2"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Section 6: Languages */}
          <Card className="border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-xl">
            <CardHeader className="bg-gradient-to-r from-secondary/10 to-primary/10 rounded-t-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-secondary/20 rounded-lg">
                    <FileText className="w-6 h-6 text-secondary" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">ทักษะทางภาษา</CardTitle>
                    <CardDescription>ภาษาที่คุณสามารถใช้ได้</CardDescription>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addLanguage}
                  className="gap-2 hover-scale"
                >
                  <Plus className="w-4 h-4" />
                  เพิ่ม
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {languages.map((lang, index) => (
                <div key={index} className="p-4 border-2 rounded-xl bg-secondary/5 space-y-3 hover:bg-secondary/10 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="flex-1 space-y-3">
                      <Select
                        value={lang.language}
                        onValueChange={(value) => updateLanguage(index, "language", value)}
                      >
                        <SelectTrigger className="border-2">
                          <SelectValue placeholder="เลือกภาษา..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="english">ภาษาอังกฤษ / English</SelectItem>
                          <SelectItem value="chinese">ภาษาจีน / Chinese</SelectItem>
                          <SelectItem value="japanese">ภาษาญี่ปุ่น / Japanese</SelectItem>
                          <SelectItem value="korean">ภาษาเกาหลี / Korean</SelectItem>
                          <SelectItem value="french">ภาษาฝรั่งเศส / French</SelectItem>
                        </SelectContent>
                      </Select>

                      <RadioGroup
                        value={lang.level}
                        onValueChange={(value) => updateLanguage(index, "level", value)}
                        className="flex gap-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="excellent" id={`excellent-${index}`} />
                          <Label htmlFor={`excellent-${index}`} className="font-normal cursor-pointer">
                            ดีมาก
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="good" id={`good-${index}`} />
                          <Label htmlFor={`good-${index}`} className="font-normal cursor-pointer">
                            ดี
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="fair" id={`fair-${index}`} />
                          <Label htmlFor={`fair-${index}`} className="font-normal cursor-pointer">
                            พอใช้
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {languages.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeLanguage(index)}
                        className="hover:bg-destructive/10 hover:text-destructive"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Section 7: Family Information */}
          <Card className="border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-xl">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-t-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/20 rounded-lg">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl">ข้อมูลครอบครัว</CardTitle>
                  <CardDescription>ข้อมูลครอบครัวของคุณ</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>ชื่อบิดา / Father's Name</Label>
                  <Input
                    value={formData.fatherName}
                    onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                    placeholder="นายสมศักดิ์ ใจดี"
                    className="border-2"
                  />
                </div>
                <div className="space-y-2">
                  <Label>อายุ / Age</Label>
                  <Input
                    value={formData.fatherAge}
                    onChange={(e) => setFormData({ ...formData, fatherAge: e.target.value })}
                    placeholder="55"
                    className="border-2"
                  />
                </div>
                <div className="space-y-2">
                  <Label>อาชีพ / Occupation</Label>
                  <Input
                    value={formData.fatherOccupation}
                    onChange={(e) => setFormData({ ...formData, fatherOccupation: e.target.value })}
                    placeholder="ธุรกิจส่วนตัว"
                    className="border-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>ชื่อมารดา / Mother's Name</Label>
                  <Input
                    value={formData.motherName}
                    onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
                    placeholder="นางสาวสมหญิง ใจดี"
                    className="border-2"
                  />
                </div>
                <div className="space-y-2">
                  <Label>อายุ / Age</Label>
                  <Input
                    value={formData.motherAge}
                    onChange={(e) => setFormData({ ...formData, motherAge: e.target.value })}
                    placeholder="50"
                    className="border-2"
                  />
                </div>
                <div className="space-y-2">
                  <Label>อาชีพ / Occupation</Label>
                  <Input
                    value={formData.motherOccupation}
                    onChange={(e) => setFormData({ ...formData, motherOccupation: e.target.value })}
                    placeholder="แม่บ้าน"
                    className="border-2"
                  />
                </div>
              </div>

              {formData.maritalStatus === "married" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in">
                  <div className="space-y-2">
                    <Label>ชื่อคู่สมรส / Spouse's Name</Label>
                    <Input
                      value={formData.spouseName}
                      onChange={(e) => setFormData({ ...formData, spouseName: e.target.value })}
                      placeholder="นางสมศรี ใจดี"
                      className="border-2"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>อายุ / Age</Label>
                    <Input
                      value={formData.spouseAge}
                      onChange={(e) => setFormData({ ...formData, spouseAge: e.target.value })}
                      placeholder="28"
                      className="border-2"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>อาชีพ / Occupation</Label>
                    <Input
                      value={formData.spouseOccupation}
                      onChange={(e) => setFormData({ ...formData, spouseOccupation: e.target.value })}
                      placeholder="พนักงานบริษัท"
                      className="border-2"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>จำนวนพี่น้อง / Number of Siblings</Label>
                <Input
                  value={formData.siblings}
                  onChange={(e) => setFormData({ ...formData, siblings: e.target.value })}
                  placeholder="3 คน (เป็นบุตรคนที่ 2)"
                  className="border-2"
                />
              </div>
            </CardContent>
          </Card>

          {/* Section 8: References */}
          <Card className="border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-xl">
            <CardHeader className="bg-gradient-to-r from-secondary/10 to-primary/10 rounded-t-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-secondary/20 rounded-lg">
                    <Heart className="w-6 h-6 text-secondary" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">บุคคลอ้างอิง</CardTitle>
                    <CardDescription>ผู้ที่สามารถติดต่อเพื่อขอข้อมูลเกี่ยวกับคุณ</CardDescription>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addReference}
                  className="gap-2 hover-scale"
                >
                  <Plus className="w-4 h-4" />
                  เพิ่ม
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {references.map((ref, index) => (
                <div key={index} className="p-4 border-2 rounded-xl bg-secondary/5 space-y-3 hover:bg-secondary/10 transition-colors">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">บุคคลอ้างอิงที่ {index + 1}</h4>
                    {references.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeReference(index)}
                        className="hover:bg-destructive/10 hover:text-destructive"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>ชื่อ / Name</Label>
                      <Input
                        value={ref.name}
                        onChange={(e) => updateReference(index, "name", e.target.value)}
                        placeholder="นายสมชาย รักงาน"
                        className="border-2"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>ตำแหน่ง / Position</Label>
                      <Input
                        value={ref.position}
                        onChange={(e) => updateReference(index, "position", e.target.value)}
                        placeholder="ผู้จัดการ"
                        className="border-2"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>บริษัท / Company</Label>
                      <Input
                        value={ref.company}
                        onChange={(e) => updateReference(index, "company", e.target.value)}
                        placeholder="ABC Company Ltd."
                        className="border-2"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>เบอร์โทร / Phone</Label>
                      <Input
                        value={ref.phone}
                        onChange={(e) => updateReference(index, "phone", e.target.value)}
                        placeholder="081-234-5678"
                        className="border-2"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Section 9: Additional Info */}
          <Card className="border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-xl">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-t-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/20 rounded-lg">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl">ข้อมูลเพิ่มเติม</CardTitle>
                  <CardDescription>ทักษะและข้อมูลอื่นๆ</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label>ทักษะพิเศษ / Special Skills</Label>
                <Textarea
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                  placeholder="เช่น Microsoft Office, Adobe Photoshop, การขับรถ, etc."
                  rows={3}
                  className="border-2 focus:border-primary resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label>ใบประกาศนียบัตร / Certifications</Label>
                <Textarea
                  value={formData.certifications}
                  onChange={(e) => setFormData({ ...formData, certifications: e.target.value })}
                  placeholder="เช่น TOEIC 800, ใบขับขี่ประเภท 1, etc."
                  rows={3}
                  className="border-2 focus:border-primary resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label>จดหมายสมัครงาน / Cover Letter</Label>
                <Textarea
                  value={formData.coverLetter}
                  onChange={(e) => setFormData({ ...formData, coverLetter: e.target.value })}
                  placeholder="แนะนำตัวและเหตุผลที่สนใจสมัครงานตำแหน่งนี้..."
                  rows={5}
                  className="border-2 focus:border-primary resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label>ท่านทราบข้อมูลการสมัครจากที่ใด / Information Source</Label>
                <Select
                  value={formData.informationSource}
                  onValueChange={(value) => setFormData({ ...formData, informationSource: value })}
                >
                  <SelectTrigger className="border-2">
                    <SelectValue placeholder="เลือกช่องทาง..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="website">เว็บไซต์บริษัท</SelectItem>
                    <SelectItem value="jobboard">เว็บไซต์หางาน</SelectItem>
                    <SelectItem value="social-media">โซเชียลมีเดีย</SelectItem>
                    <SelectItem value="referral">เพื่อนแนะนำ</SelectItem>
                    <SelectItem value="newspaper">หนังสือพิมพ์</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.informationSource === "referral" && (
                <div className="space-y-2 animate-fade-in">
                  <Label>ชื่อผู้แนะนำ / Referrer Name</Label>
                  <Input
                    value={formData.referrerName}
                    onChange={(e) => setFormData({ ...formData, referrerName: e.target.value })}
                    placeholder="กรอกชื่อผู้แนะนำ"
                    className="border-2"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Privacy & Submit */}
          <Card className="border-2 border-primary/50 shadow-lg">
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div className="flex items-start space-x-3 p-4 bg-muted/50 rounded-lg">
                  <Checkbox
                    id="privacy"
                    checked={formData.privacyConsent}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, privacyConsent: checked as boolean })
                    }
                    className="mt-1"
                  />
                  <Label htmlFor="privacy" className="font-normal leading-relaxed cursor-pointer">
                    ฉันยินยอมให้เก็บข้อมูลและใช้งานตาม{" "}
                    <button
                      type="button"
                      onClick={() => setPrivacyDialogOpen(true)}
                      className="text-primary underline hover:text-primary/80 font-semibold"
                    >
                      นโยบายความเป็นส่วนตัว
                    </button>{" "}
                    แล้ว <span className="text-destructive">*</span>
                  </Label>
                </div>

                <div className="flex gap-4">
                  <Button 
                    type="submit" 
                    className="flex-1 h-12 text-lg bg-gradient-to-r from-primary to-secondary hover:opacity-90 shadow-lg hover:shadow-xl transition-all hover-scale"
                    onClick={(e) => addSparkleEffect(e as any)}
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    ส่งใบสมัคร
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-12 px-8 border-2 hover-scale"
                    onClick={() => {
                      setFormData({
                        position: "",
                        salaryRequired: "",
                        startDate: "",
                        fullName: "",
                        nickname: "",
                        idCard: "",
                        birthDate: "",
                        age: "",
                        nationality: "ไทย",
                        religion: "พุทธ",
                        race: "ไทย",
                        height: "",
                        weight: "",
                        bloodType: "",
                        maritalStatus: "single",
                        militaryStatus: "",
                        email: "",
                        phone: "",
                        lineId: "",
                        currentAddress: "",
                        permanentAddress: "",
                        sameAddress: false,
                        emergencyName: "",
                        emergencyRelation: "",
                        emergencyPhone: "",
                        fatherName: "",
                        fatherAge: "",
                        fatherOccupation: "",
                        motherName: "",
                        motherAge: "",
                        motherOccupation: "",
                        spouseName: "",
                        spouseAge: "",
                        spouseOccupation: "",
                        siblings: "",
                        coverLetter: "",
                        skills: "",
                        certifications: "",
                        informationSource: "",
                        referrerName: "",
                        privacyConsent: false,
                      });
                      setSelectedFile(null);
                      setProfilePhoto(null);
                      setProfilePhotoPreview(null);
                      setLanguages([{ language: "", level: "good" }]);
                      setEducations([{ level: "", institution: "", major: "", gpa: "", yearGraduated: "" }]);
                      setWorkExperiences([{ company: "", position: "", duration: "", salary: "", reason: "" }]);
                      setReferences([{ name: "", position: "", company: "", phone: "" }]);
                    }}
                  >
                    ล้างฟอร์ม
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </form>

        <PrivacyPolicyDialog 
          open={privacyDialogOpen} 
          onOpenChange={setPrivacyDialogOpen}
        />
      </div>
    </div>
  );
};

export default JobApplication;