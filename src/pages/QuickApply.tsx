import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, FileText, User, Loader2, Sparkles, MapPin, Briefcase, Phone, Mail, Ruler, Weight, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { addSparkleEffect } from "@/lib/sparkle";

interface JobPosition {
  id: string;
  title: string;
  status: string;
}

const QuickApply = () => {
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [jobPositions, setJobPositions] = useState<JobPosition[]>([]);
  const [isLoadingPositions, setIsLoadingPositions] = useState(true);

  // Fetch job positions on mount
  useEffect(() => {
    const fetchJobPositions = async () => {
      try {
        const { data, error } = await supabase
          .from('job_positions')
          .select('id, title, status')
          .eq('status', 'Open')
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

  const [formData, setFormData] = useState({
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
  });

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

  const handleInputChange = (field: string, value: string) => {
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
      const { data: existingCandidate } = await supabase
        .from('candidates')
        .select('id')
        .eq('email', formData.email)
        .maybeSingle();

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

        if (updateError) throw updateError;
        candidate = updatedCandidate;
      } else {
        // Create new candidate record
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

        if (candidateError) throw candidateError;
        candidate = newCandidate;
      }

      // Upsert candidate_details record
      const { error: detailsError } = await supabase
        .from('candidate_details')
        .upsert({
          candidate_id: candidate.id,
          first_name: formData.firstName,
          last_name: formData.lastName,
          sex: formData.sex,
          weight: formData.weight,
          height: formData.height,
          age: formData.age,
          mobile_phone: formData.mobilePhone,
          position: formData.interestedPosition,
          expected_salary: formData.expectedSalary,
          present_address: formData.preferredLocation,
        }, {
          onConflict: 'candidate_id'
        });

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
      });
      setSelectedFile(null);

    } catch (error: any) {
      console.error('Submit error:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message || "ไม่สามารถบันทึกข้อมูลได้",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            แบบฟอร์มสมัครงานกับบริษัทในเครือ ICP
          </h1>
          <p className="text-muted-foreground">
            ฝากประวัติไว้กับเรา ทีมงานจะพิจารณา Resume และติดต่อกลับให้เร็วที่สุด
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6">
          {/* Resume Upload Section */}
          <Card className="border-2 border-dashed hover:border-primary/50 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                อัปโหลด Resume
              </CardTitle>
              <CardDescription>
                อัปโหลด Resume ของคุณเพื่อให้ระบบ AI กรอกข้อมูลให้อัตโนมัติ
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                  isDragging
                    ? "border-primary bg-primary/5 scale-[1.02]"
                    : "border-muted-foreground/25 hover:border-primary/50 hover:bg-accent/5"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {isParsing ? (
                  <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                      <Loader2 className="h-16 w-16 text-primary animate-spin" />
                      <Sparkles className="h-6 w-6 text-primary absolute -top-1 -right-1 animate-pulse" />
                    </div>
                    <div>
                      <p className="font-semibold text-lg">AI กำลังอ่านข้อมูลจาก Resume...</p>
                      <p className="text-sm text-muted-foreground mt-1">กรุณารอสักครู่</p>
                    </div>
                  </div>
                ) : selectedFile ? (
                  <div className="flex flex-col items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <FileText className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">{selectedFile.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setSelectedFile(null)}
                    >
                      เลือกไฟล์ใหม่
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                      <Upload className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-lg">ลากไฟล์มาวางที่นี่</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        หรือคลิกเพื่อเลือกไฟล์ (PDF, DOC, DOCX)
                      </p>
                    </div>
                    <Input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileChange}
                      className="hidden"
                      id="resume-upload"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('resume-upload')?.click()}
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                ข้อมูลส่วนตัว
              </CardTitle>
              <CardDescription>
                กรอกข้อมูลส่วนตัวของคุณ
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Name */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">
                    ชื่อ <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    placeholder="ชื่อ"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">
                    นามสกุล <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    placeholder="นามสกุล"
                    required
                  />
                </div>
              </div>

              {/* Sex, Age */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sex">เพศ</Label>
                  <Select
                    value={formData.sex}
                    onValueChange={(value) => handleInputChange("sex", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกเพศ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">ชาย</SelectItem>
                      <SelectItem value="female">หญิง</SelectItem>
                      <SelectItem value="not_specified">ไม่ระบุ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="age" className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    อายุ (ปี)
                  </Label>
                  <Input
                    id="age"
                    type="number"
                    value={formData.age}
                    onChange={(e) => handleInputChange("age", e.target.value)}
                    placeholder="อายุ"
                  />
                </div>
              </div>

              {/* Height, Weight */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="height" className="flex items-center gap-1">
                    <Ruler className="h-4 w-4" />
                    ส่วนสูง (ซม.)
                  </Label>
                  <Input
                    id="height"
                    type="number"
                    value={formData.height}
                    onChange={(e) => handleInputChange("height", e.target.value)}
                    placeholder="ส่วนสูง"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight" className="flex items-center gap-1">
                    <Weight className="h-4 w-4" />
                    น้ำหนัก (กก.)
                  </Label>
                  <Input
                    id="weight"
                    type="number"
                    value={formData.weight}
                    onChange={(e) => handleInputChange("weight", e.target.value)}
                    placeholder="น้ำหนัก"
                  />
                </div>
              </div>

              {/* Contact */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    อีเมล <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="example@email.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mobilePhone" className="flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    เบอร์โทรศัพท์ <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="mobilePhone"
                    type="tel"
                    value={formData.mobilePhone}
                    onChange={(e) => handleInputChange("mobilePhone", e.target.value)}
                    placeholder="08X-XXX-XXXX"
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Job Interest */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary" />
                ความสนใจในงาน
              </CardTitle>
              <CardDescription>
                กรอกข้อมูลตำแหน่งงานและเงินเดือนที่คุณสนใจ
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="interestedPosition">ตำแหน่งที่สนใจ</Label>
                  <Select
                    value={formData.interestedPosition}
                    onValueChange={(value) => handleInputChange("interestedPosition", value)}
                    disabled={isLoadingPositions}
                  >
                    <SelectTrigger>
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
                <div className="space-y-2">
                  <Label htmlFor="expectedSalary">เงินเดือนที่คาดหวัง (บาท)</Label>
                  <Input
                    id="expectedSalary"
                    type="number"
                    value={formData.expectedSalary}
                    onChange={(e) => handleInputChange("expectedSalary", e.target.value)}
                    placeholder="เช่น 30000"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="preferredLocation" className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  สถานที่ปฏิบัติงาน / เขตที่ต้องการ
                </Label>
                <Select
                  value={formData.preferredLocation}
                  onValueChange={(value) => handleInputChange("preferredLocation", value)}
                >
                  <SelectTrigger>
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
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Button
              type="submit"
              size="lg"
              disabled={isSubmitting}
              onClick={addSparkleEffect}
              className="min-w-[200px] bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  กำลังบันทึก...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Quick Apply
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default QuickApply;
