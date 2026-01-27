import { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Upload, FileText, Plus, User, X, Loader2, Sparkles, Briefcase, GraduationCap, Users, Home, Heart, Phone as PhoneIcon, Shield, Calendar, Car, Languages as LanguagesIcon, Award, AlertCircle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
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
  responsibilities: string;
  reason: string;
}

interface FamilyMember {
  name: string;
  relationship: string;
  age: string;
  occupation: string;
}

interface LanguageSkill {
  language: string;
  spoken: string;
  written: string;
  understand: string;
}

const PublicJobApplication = () => {
  const { toast } = useToast();
  const { candidateId } = useParams<{ candidateId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [privacyDialogOpen, setPrivacyDialogOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoadingCandidate, setIsLoadingCandidate] = useState(true);
  const [candidateNotFound, setCandidateNotFound] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [educations, setEducations] = useState<Education[]>([
    { level: "high-school", institution: "", major: "", gpa: "", yearGraduated: "" },
    { level: "diploma", institution: "", major: "", gpa: "", yearGraduated: "" },
    { level: "bachelor", institution: "", major: "", gpa: "", yearGraduated: "" },
    { level: "master", institution: "", major: "", gpa: "", yearGraduated: "" },
    { level: "others", institution: "", major: "", gpa: "", yearGraduated: "" },
  ]);

  const [workExperiences, setWorkExperiences] = useState<WorkExperience[]>([
    { company: "", position: "", duration: "", salary: "", responsibilities: "", reason: "" }
  ]);

  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([
    { name: "", relationship: "บิดา", age: "", occupation: "" },
    { name: "", relationship: "มารดา", age: "", occupation: "" }
  ]);

  const [languageSkills, setLanguageSkills] = useState<LanguageSkill[]>([
    { language: "ภาษาอังกฤษ (English)", spoken: "", written: "", understand: "" }
  ]);

  const [formData, setFormData] = useState({
    // Job Application Info
    position: "",
    expectedSalary: "",

    // Personal Info
    titleName: "นาย",
    firstName: "",
    lastName: "",
    nickname: "",
    presentAddress: "",
    moo: "",
    district: "",
    subDistrict: "",
    province: "",
    zipCode: "",
    mobilePhone: "",
    email: "",
    birthDate: "",
    age: "",
    idCard: "",
    sex: "male",
    bloodType: "",
    religion: "",
    height: "",
    weight: "",

    // Marital Status
    maritalStatus: "single",
    spouseName: "",
    spouseOccupation: "",
    numberOfChildren: "",

    // Emergency Contact
    emergencyName: "",
    emergencyRelation: "",
    emergencyAddress: "",
    emergencyPhone: "",

    // Special Skills
    computerSkill: false,
    drivingCar: false,
    drivingCarLicenseNo: "",
    drivingMotorcycle: false,
    drivingMotorcycleLicenseNo: "",
    otherSkills: "",

    // Training
    trainingCurriculums: "",

    // Other Questions
    workedAtICPBefore: "",
    workedAtICPDetails: "",
    relativesAtICP: "",
    relativesAtICPDetails: "",
    criminalRecord: "",
    criminalRecordDetails: "",
    seriousIllness: "",
    seriousIllnessDetails: "",
    colorBlindness: "",
    pregnant: "",
    contagiousDisease: "",

    privacyConsent: false,
  });

  const [availablePositions, setAvailablePositions] = useState<Array<{id: string; title: string}>>([]);

  // Fetch available positions from database
  useEffect(() => {
    const fetchPositions = async () => {
      const { data, error } = await supabase
        .from('job_positions')
        .select('id, title')
        .eq('status', 'Open')
        .order('title');

      if (error) {
        console.error('Error fetching positions:', error);
        return;
      }

      if (data) {
        setAvailablePositions(data);
      }
    };

    fetchPositions();
  }, []);

  // Fetch candidate data from URL params (for invited candidates from Quick Apply)
  useEffect(() => {
    if (!candidateId) {
      setCandidateNotFound(true);
      setIsLoadingCandidate(false);
      return;
    }

    const fetchCandidateData = async () => {
      setIsLoadingCandidate(true);
      try {
        // Fetch candidate basic info
        const { data: candidate, error: candidateError } = await supabase
          .from('candidates')
          .select('*')
          .eq('id', candidateId)
          .single();

        if (candidateError || !candidate) {
          console.error('Error fetching candidate:', candidateError);
          setCandidateNotFound(true);
          setIsLoadingCandidate(false);
          return;
        }

        // Fetch candidate details
        const { data: details, error: detailsError } = await supabase
          .from('candidate_details')
          .select('*')
          .eq('candidate_id', candidateId)
          .maybeSingle();

        if (detailsError) {
          console.error('Error fetching candidate details:', detailsError);
        }

        // Pre-fill form data from candidate
        const nameParts = candidate.name?.split(' ') || [];
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        setFormData(prev => ({
          ...prev,
          firstName: details?.first_name || firstName,
          lastName: details?.last_name || lastName,
          email: candidate.email || prev.email,
          mobilePhone: details?.mobile_phone || candidate.phone || prev.mobilePhone,
          position: details?.position || prev.position,
          expectedSalary: details?.expected_salary || prev.expectedSalary,
          // Personal Info
          titleName: details?.title_name || prev.titleName,
          nickname: details?.nickname || prev.nickname,
          presentAddress: details?.present_address || prev.presentAddress,
          moo: details?.moo || prev.moo,
          district: details?.district || prev.district,
          subDistrict: details?.sub_district || prev.subDistrict,
          province: details?.province || prev.province,
          zipCode: details?.zip_code || prev.zipCode,
          birthDate: details?.birth_date || prev.birthDate,
          age: details?.age || prev.age,
          idCard: details?.id_card || prev.idCard,
          sex: details?.sex || prev.sex,
          bloodType: details?.blood_type || prev.bloodType,
          religion: details?.religion || prev.religion,
          height: details?.height || prev.height,
          weight: details?.weight || prev.weight,
          // Marital Status
          maritalStatus: details?.marital_status || prev.maritalStatus,
          spouseName: details?.spouse_name || prev.spouseName,
          spouseOccupation: details?.spouse_occupation || prev.spouseOccupation,
          numberOfChildren: details?.number_of_children || prev.numberOfChildren,
          // Emergency Contact
          emergencyName: details?.emergency_name || prev.emergencyName,
          emergencyRelation: details?.emergency_relation || prev.emergencyRelation,
          emergencyAddress: details?.emergency_address || prev.emergencyAddress,
          emergencyPhone: details?.emergency_phone || prev.emergencyPhone,
          // Skills
          computerSkill: details?.computer_skill || prev.computerSkill,
          drivingCar: details?.driving_car || prev.drivingCar,
          drivingCarLicenseNo: details?.driving_car_license_no || prev.drivingCarLicenseNo,
          drivingMotorcycle: details?.driving_motorcycle || prev.drivingMotorcycle,
          drivingMotorcycleLicenseNo: details?.driving_motorcycle_license_no || prev.drivingMotorcycleLicenseNo,
          otherSkills: details?.other_skills || prev.otherSkills,
          trainingCurriculums: details?.training_curriculums || prev.trainingCurriculums,
        }));

        // Pre-fill educations if available
        if (details?.educations && Array.isArray(details.educations) && details.educations.length > 0) {
          setEducations(details.educations as Education[]);
        }

        // Pre-fill work experiences if available
        if (details?.work_experiences && Array.isArray(details.work_experiences) && details.work_experiences.length > 0) {
          setWorkExperiences(details.work_experiences as WorkExperience[]);
        }

        // Pre-fill family members if available
        if (details?.family_members && Array.isArray(details.family_members) && details.family_members.length > 0) {
          setFamilyMembers(details.family_members as FamilyMember[]);
        }

        // Pre-fill language skills if available
        if (details?.language_skills && Array.isArray(details.language_skills) && details.language_skills.length > 0) {
          setLanguageSkills(details.language_skills as LanguageSkill[]);
        }

        // Set photo preview if exists
        if (candidate.photo_url) {
          setProfilePhotoPreview(candidate.photo_url);
        }

        toast({
          title: "ยินดีต้อนรับ",
          description: "ข้อมูลจากการฝากประวัติถูกกรอกแล้ว กรุณาตรวจสอบและกรอกข้อมูลเพิ่มเติม",
        });
      } catch (error) {
        console.error('Error loading candidate data:', error);
        setCandidateNotFound(true);
      } finally {
        setIsLoadingCandidate(false);
      }
    };

    fetchCandidateData();
  }, [candidateId, toast]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleEducationChange = (index: number, field: string, value: string) => {
    const newEducations = [...educations];
    newEducations[index] = { ...newEducations[index], [field]: value };
    setEducations(newEducations);
  };

  const handleWorkExperienceChange = (index: number, field: string, value: string) => {
    const newWorkExperiences = [...workExperiences];
    newWorkExperiences[index] = { ...newWorkExperiences[index], [field]: value };
    setWorkExperiences(newWorkExperiences);
  };

  const addWorkExperience = () => {
    setWorkExperiences([...workExperiences, { company: "", position: "", duration: "", salary: "", responsibilities: "", reason: "" }]);
  };

  const removeWorkExperience = (index: number) => {
    if (workExperiences.length > 1) {
      setWorkExperiences(workExperiences.filter((_, i) => i !== index));
    }
  };

  const handleFamilyMemberChange = (index: number, field: string, value: string) => {
    const newFamilyMembers = [...familyMembers];
    newFamilyMembers[index] = { ...newFamilyMembers[index], [field]: value };
    setFamilyMembers(newFamilyMembers);
  };

  const addFamilyMember = () => {
    setFamilyMembers([...familyMembers, { name: "", relationship: "", age: "", occupation: "" }]);
  };

  const removeFamilyMember = (index: number) => {
    if (familyMembers.length > 2) {
      setFamilyMembers(familyMembers.filter((_, i) => i !== index));
    }
  };

  const handleLanguageSkillChange = (index: number, field: string, value: string) => {
    const newLanguageSkills = [...languageSkills];
    newLanguageSkills[index] = { ...newLanguageSkills[index], [field]: value };
    setLanguageSkills(newLanguageSkills);
  };

  const addLanguageSkill = () => {
    setLanguageSkills([...languageSkills, { language: "", spoken: "", written: "", understand: "" }]);
  };

  const removeLanguageSkill = (index: number) => {
    if (languageSkills.length > 1) {
      setLanguageSkills(languageSkills.filter((_, i) => i !== index));
    }
  };

  const handleProfilePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfilePhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.privacyConsent) {
      toast({
        title: "กรุณายินยอมนโยบายความเป็นส่วนตัว",
        description: "กรุณาอ่านและยินยอมนโยบายความเป็นส่วนตัวก่อนส่งใบสมัคร",
        variant: "destructive",
      });
      return;
    }

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.mobilePhone) {
      toast({
        title: "กรุณากรอกข้อมูลให้ครบถ้วน",
        description: "กรุณากรอกชื่อ นามสกุล อีเมล และเบอร์โทรศัพท์",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload profile photo if exists
      let photoUrl = profilePhotoPreview;
      if (profilePhoto) {
        const fileExt = profilePhoto.name.split('.').pop();
        const fileName = `${Date.now()}_${formData.firstName}_${formData.lastName}.${fileExt}`;
        const filePath = `photos/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('resumes')
          .upload(filePath, profilePhoto);

        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage
            .from('resumes')
            .getPublicUrl(filePath);
          photoUrl = publicUrl;
        }
      }

      // Upload resume if exists
      let resumeUrl = null;
      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${Date.now()}_${formData.firstName}_${formData.lastName}.${fileExt}`;
        const filePath = `resumes/${fileName}`;

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

      // Update candidate record
      const { error: candidateError } = await supabase
        .from('candidates')
        .update({
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          phone: formData.mobilePhone,
          source: 'Job Application',
          stage: 'Screening',
          photo_url: photoUrl,
          resume_url: resumeUrl || undefined,
          updated_at: new Date().toISOString(),
        })
        .eq('id', candidateId);

      if (candidateError) throw candidateError;

      // Update candidate_details record
      const { error: detailsError } = await supabase
        .from('candidate_details')
        .upsert({
          candidate_id: candidateId,
          // Personal Info
          title_name: formData.titleName,
          first_name: formData.firstName,
          last_name: formData.lastName,
          nickname: formData.nickname,
          present_address: formData.presentAddress,
          moo: formData.moo,
          district: formData.district,
          sub_district: formData.subDistrict,
          province: formData.province,
          zip_code: formData.zipCode,
          mobile_phone: formData.mobilePhone,
          birth_date: formData.birthDate || null,
          age: formData.age,
          id_card: formData.idCard,
          sex: formData.sex,
          blood_type: formData.bloodType,
          religion: formData.religion,
          height: formData.height,
          weight: formData.weight,
          // Job Info
          position: formData.position,
          expected_salary: formData.expectedSalary,
          // Marital Status
          marital_status: formData.maritalStatus,
          spouse_name: formData.spouseName,
          spouse_occupation: formData.spouseOccupation,
          number_of_children: formData.numberOfChildren,
          // Emergency Contact
          emergency_name: formData.emergencyName,
          emergency_relation: formData.emergencyRelation,
          emergency_address: formData.emergencyAddress,
          emergency_phone: formData.emergencyPhone,
          // Skills
          computer_skill: formData.computerSkill,
          driving_car: formData.drivingCar,
          driving_car_license_no: formData.drivingCarLicenseNo,
          driving_motorcycle: formData.drivingMotorcycle,
          driving_motorcycle_license_no: formData.drivingMotorcycleLicenseNo,
          other_skills: formData.otherSkills,
          training_curriculums: formData.trainingCurriculums,
          // Other Questions
          worked_at_icp_before: formData.workedAtICPBefore,
          worked_at_icp_details: formData.workedAtICPDetails,
          relatives_at_icp: formData.relativesAtICP,
          relatives_at_icp_details: formData.relativesAtICPDetails,
          criminal_record: formData.criminalRecord,
          criminal_record_details: formData.criminalRecordDetails,
          serious_illness: formData.seriousIllness,
          serious_illness_details: formData.seriousIllnessDetails,
          color_blindness: formData.colorBlindness,
          pregnant: formData.pregnant,
          contagious_disease: formData.contagiousDisease,
          // Arrays
          educations: educations,
          work_experiences: workExperiences,
          family_members: familyMembers,
          language_skills: languageSkills,
          // Consent
          privacy_consent: formData.privacyConsent,
        }, {
          onConflict: 'candidate_id'
        });

      if (detailsError) {
        console.error('Details error:', detailsError);
      }

      setIsSubmitted(true);
      toast({
        title: "ส่งใบสมัครสำเร็จ",
        description: "ขอบคุณที่สมัครงานกับเรา เราจะติดต่อกลับโดยเร็ว",
      });
    } catch (error: any) {
      console.error('Submit error:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message || "ไม่สามารถส่งใบสมัครได้ กรุณาลองใหม่อีกครั้ง",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (isLoadingCandidate) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  // Candidate not found
  if (candidateNotFound) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">ไม่พบข้อมูลผู้สมัคร</h1>
            <p className="text-muted-foreground mb-4">
              ลิงก์นี้อาจหมดอายุหรือไม่ถูกต้อง กรุณาติดต่อฝ่ายทรัพยากรบุคคล
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success state
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">ส่งใบสมัครสำเร็จ!</h1>
            <p className="text-muted-foreground mb-4">
              ขอบคุณที่สนใจร่วมงานกับบริษัทในเครือ ICP Group
              <br />
              เราจะพิจารณาประวัติของคุณและติดต่อกลับโดยเร็ว
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const educationLevels = [
    { value: "high-school", label: "มัธยมศึกษา/ปวช." },
    { value: "diploma", label: "อนุปริญญา/ปวส." },
    { value: "bachelor", label: "ปริญญาตรี" },
    { value: "master", label: "ปริญญาโท" },
    { value: "others", label: "อื่นๆ" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 py-8">
      <div className="max-w-4xl mx-auto px-4 space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
            ใบสมัครงาน - ICP Group
          </h1>
          <p className="text-muted-foreground">
            กรุณากรอกข้อมูลให้ครบถ้วนเพื่อประกอบการพิจารณา
          </p>
        </div>

        {/* Invited Candidate Banner */}
        <Card className="border-pink-200 bg-gradient-to-r from-pink-50 to-purple-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Heart className="h-6 w-6 text-pink-500" />
              <div>
                <p className="font-semibold text-pink-700">บริษัทสนใจประวัติของคุณ!</p>
                <p className="text-sm text-muted-foreground">
                  ข้อมูลที่คุณเคยกรอกไว้ถูกดึงมาแสดงอัตโนมัติ กรุณาตรวจสอบและกรอกข้อมูลเพิ่มเติม
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <form onSubmit={handleSubmit}>
          {/* Profile Photo */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                รูปถ่าย
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="w-32 h-40 border-2 border-dashed rounded-lg flex items-center justify-center overflow-hidden bg-muted">
                  {profilePhotoPreview ? (
                    <img src={profilePhotoPreview} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User className="h-12 w-12 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePhotoChange}
                    className="hidden"
                    id="photo-upload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('photo-upload')?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    อัปโหลดรูปถ่าย
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    รูปถ่ายหน้าตรง ไม่สวมหมวก ไม่สวมแว่นดำ
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Job Position */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                ตำแหน่งที่สมัคร
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>ตำแหน่งที่สมัคร</Label>
                  <Select value={formData.position} onValueChange={(value) => handleInputChange('position', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกตำแหน่ง" />
                    </SelectTrigger>
                    <SelectContent>
                      {availablePositions.map((pos) => (
                        <SelectItem key={pos.id} value={pos.title}>{pos.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>เงินเดือนที่คาดหวัง (บาท)</Label>
                  <Input
                    type="number"
                    value={formData.expectedSalary}
                    onChange={(e) => handleInputChange('expectedSalary', e.target.value)}
                    placeholder="เช่น 30000"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Personal Information */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                ข้อมูลส่วนตัว
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Name */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>คำนำหน้า</Label>
                  <Select value={formData.titleName} onValueChange={(value) => handleInputChange('titleName', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="นาย">นาย</SelectItem>
                      <SelectItem value="นาง">นาง</SelectItem>
                      <SelectItem value="นางสาว">นางสาว</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>ชื่อ <span className="text-destructive">*</span></Label>
                  <Input
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>นามสกุล <span className="text-destructive">*</span></Label>
                  <Input
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>ชื่อเล่น</Label>
                  <Input
                    value={formData.nickname}
                    onChange={(e) => handleInputChange('nickname', e.target.value)}
                  />
                </div>
              </div>

              {/* Contact */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>อีเมล <span className="text-destructive">*</span></Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>เบอร์โทรศัพท์ <span className="text-destructive">*</span></Label>
                  <Input
                    type="tel"
                    value={formData.mobilePhone}
                    onChange={(e) => handleInputChange('mobilePhone', e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* ID Card & Birth */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>เลขบัตรประชาชน</Label>
                  <Input
                    value={formData.idCard}
                    onChange={(e) => handleInputChange('idCard', e.target.value)}
                    placeholder="X-XXXX-XXXXX-XX-X"
                  />
                </div>
                <div className="space-y-2">
                  <Label>วันเกิด</Label>
                  <Input
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => handleInputChange('birthDate', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>อายุ</Label>
                  <Input
                    type="number"
                    value={formData.age}
                    onChange={(e) => handleInputChange('age', e.target.value)}
                  />
                </div>
              </div>

              {/* Sex, Religion, Blood */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>เพศ</Label>
                  <Select value={formData.sex} onValueChange={(value) => handleInputChange('sex', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">ชาย</SelectItem>
                      <SelectItem value="female">หญิง</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>ศาสนา</Label>
                  <Input
                    value={formData.religion}
                    onChange={(e) => handleInputChange('religion', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>กรุ๊ปเลือด</Label>
                  <Select value={formData.bloodType} onValueChange={(value) => handleInputChange('bloodType', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="เลือก" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A">A</SelectItem>
                      <SelectItem value="B">B</SelectItem>
                      <SelectItem value="AB">AB</SelectItem>
                      <SelectItem value="O">O</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Height, Weight */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>ส่วนสูง (ซม.)</Label>
                  <Input
                    type="number"
                    value={formData.height}
                    onChange={(e) => handleInputChange('height', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>น้ำหนัก (กก.)</Label>
                  <Input
                    type="number"
                    value={formData.weight}
                    onChange={(e) => handleInputChange('weight', e.target.value)}
                  />
                </div>
              </div>

              {/* Address */}
              <div className="space-y-2">
                <Label>ที่อยู่ปัจจุบัน</Label>
                <Textarea
                  value={formData.presentAddress}
                  onChange={(e) => handleInputChange('presentAddress', e.target.value)}
                  placeholder="บ้านเลขที่ ถนน ซอย"
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>แขวง/ตำบล</Label>
                  <Input
                    value={formData.subDistrict}
                    onChange={(e) => handleInputChange('subDistrict', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>เขต/อำเภอ</Label>
                  <Input
                    value={formData.district}
                    onChange={(e) => handleInputChange('district', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>จังหวัด</Label>
                  <Input
                    value={formData.province}
                    onChange={(e) => handleInputChange('province', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>รหัสไปรษณีย์</Label>
                  <Input
                    value={formData.zipCode}
                    onChange={(e) => handleInputChange('zipCode', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Marital Status */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                สถานภาพสมรส
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <RadioGroup
                value={formData.maritalStatus}
                onValueChange={(value) => handleInputChange('maritalStatus', value)}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="single" id="single" />
                  <Label htmlFor="single">โสด</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="married" id="married" />
                  <Label htmlFor="married">สมรส</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="divorced" id="divorced" />
                  <Label htmlFor="divorced">หย่า</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="widowed" id="widowed" />
                  <Label htmlFor="widowed">หม้าย</Label>
                </div>
              </RadioGroup>

              {formData.maritalStatus === 'married' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>ชื่อคู่สมรส</Label>
                    <Input
                      value={formData.spouseName}
                      onChange={(e) => handleInputChange('spouseName', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>อาชีพคู่สมรส</Label>
                    <Input
                      value={formData.spouseOccupation}
                      onChange={(e) => handleInputChange('spouseOccupation', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>จำนวนบุตร</Label>
                    <Input
                      type="number"
                      value={formData.numberOfChildren}
                      onChange={(e) => handleInputChange('numberOfChildren', e.target.value)}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Education */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                ประวัติการศึกษา
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {educations.map((edu, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 border rounded-lg">
                    <div className="space-y-2">
                      <Label>ระดับ</Label>
                      <p className="text-sm font-medium">{educationLevels.find(l => l.value === edu.level)?.label}</p>
                    </div>
                    <div className="space-y-2">
                      <Label>สถาบันการศึกษา</Label>
                      <Input
                        value={edu.institution}
                        onChange={(e) => handleEducationChange(index, 'institution', e.target.value)}
                        placeholder="ชื่อสถาบัน"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>สาขาวิชา</Label>
                      <Input
                        value={edu.major}
                        onChange={(e) => handleEducationChange(index, 'major', e.target.value)}
                        placeholder="สาขา"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>เกรดเฉลี่ย</Label>
                      <Input
                        value={edu.gpa}
                        onChange={(e) => handleEducationChange(index, 'gpa', e.target.value)}
                        placeholder="GPA"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>ปีที่จบ</Label>
                      <Input
                        value={edu.yearGraduated}
                        onChange={(e) => handleEducationChange(index, 'yearGraduated', e.target.value)}
                        placeholder="พ.ศ."
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Work Experience */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  ประวัติการทำงาน
                </span>
                <Button type="button" variant="outline" size="sm" onClick={addWorkExperience}>
                  <Plus className="h-4 w-4 mr-1" /> เพิ่ม
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {workExperiences.map((work, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">ประสบการณ์ที่ {index + 1}</h4>
                      {workExperiences.length > 1 && (
                        <Button type="button" variant="ghost" size="sm" onClick={() => removeWorkExperience(index)}>
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>ชื่อบริษัท</Label>
                        <Input
                          value={work.company}
                          onChange={(e) => handleWorkExperienceChange(index, 'company', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>ตำแหน่ง</Label>
                        <Input
                          value={work.position}
                          onChange={(e) => handleWorkExperienceChange(index, 'position', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>ระยะเวลา</Label>
                        <Input
                          value={work.duration}
                          onChange={(e) => handleWorkExperienceChange(index, 'duration', e.target.value)}
                          placeholder="เช่น 2 ปี 3 เดือน"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>เงินเดือน</Label>
                        <Input
                          type="number"
                          value={work.salary}
                          onChange={(e) => handleWorkExperienceChange(index, 'salary', e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>หน้าที่รับผิดชอบ</Label>
                      <Textarea
                        value={work.responsibilities}
                        onChange={(e) => handleWorkExperienceChange(index, 'responsibilities', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>เหตุผลที่ลาออก</Label>
                      <Input
                        value={work.reason}
                        onChange={(e) => handleWorkExperienceChange(index, 'reason', e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Family Members */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  ข้อมูลครอบครัว
                </span>
                <Button type="button" variant="outline" size="sm" onClick={addFamilyMember}>
                  <Plus className="h-4 w-4 mr-1" /> เพิ่ม
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {familyMembers.map((member, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 border rounded-lg items-end">
                    <div className="space-y-2">
                      <Label>ความสัมพันธ์</Label>
                      <Input
                        value={member.relationship}
                        onChange={(e) => handleFamilyMemberChange(index, 'relationship', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>ชื่อ-นามสกุล</Label>
                      <Input
                        value={member.name}
                        onChange={(e) => handleFamilyMemberChange(index, 'name', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>อายุ</Label>
                      <Input
                        type="number"
                        value={member.age}
                        onChange={(e) => handleFamilyMemberChange(index, 'age', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>อาชีพ</Label>
                      <Input
                        value={member.occupation}
                        onChange={(e) => handleFamilyMemberChange(index, 'occupation', e.target.value)}
                      />
                    </div>
                    {familyMembers.length > 2 && (
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeFamilyMember(index)}>
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Language Skills */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <LanguagesIcon className="h-5 w-5" />
                  ความสามารถทางภาษา
                </span>
                <Button type="button" variant="outline" size="sm" onClick={addLanguageSkill}>
                  <Plus className="h-4 w-4 mr-1" /> เพิ่ม
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {languageSkills.map((lang, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 border rounded-lg items-end">
                    <div className="space-y-2">
                      <Label>ภาษา</Label>
                      <Input
                        value={lang.language}
                        onChange={(e) => handleLanguageSkillChange(index, 'language', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>พูด</Label>
                      <Select value={lang.spoken} onValueChange={(value) => handleLanguageSkillChange(index, 'spoken', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="เลือก" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ดี">ดี</SelectItem>
                          <SelectItem value="พอใช้">พอใช้</SelectItem>
                          <SelectItem value="น้อย">น้อย</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>อ่าน-เขียน</Label>
                      <Select value={lang.written} onValueChange={(value) => handleLanguageSkillChange(index, 'written', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="เลือก" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ดี">ดี</SelectItem>
                          <SelectItem value="พอใช้">พอใช้</SelectItem>
                          <SelectItem value="น้อย">น้อย</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>ฟัง</Label>
                      <Select value={lang.understand} onValueChange={(value) => handleLanguageSkillChange(index, 'understand', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="เลือก" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ดี">ดี</SelectItem>
                          <SelectItem value="พอใช้">พอใช้</SelectItem>
                          <SelectItem value="น้อย">น้อย</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {languageSkills.length > 1 && (
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeLanguageSkill(index)}>
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Special Skills */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                ความสามารถพิเศษ
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="computerSkill"
                    checked={formData.computerSkill as boolean}
                    onCheckedChange={(checked) => handleInputChange('computerSkill', checked as boolean)}
                  />
                  <Label htmlFor="computerSkill">ใช้คอมพิวเตอร์</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="drivingCar"
                    checked={formData.drivingCar as boolean}
                    onCheckedChange={(checked) => handleInputChange('drivingCar', checked as boolean)}
                  />
                  <Label htmlFor="drivingCar">ขับรถยนต์</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="drivingMotorcycle"
                    checked={formData.drivingMotorcycle as boolean}
                    onCheckedChange={(checked) => handleInputChange('drivingMotorcycle', checked as boolean)}
                  />
                  <Label htmlFor="drivingMotorcycle">ขับรถจักรยานยนต์</Label>
                </div>
              </div>

              {formData.drivingCar && (
                <div className="space-y-2">
                  <Label>เลขที่ใบอนุญาตขับรถยนต์</Label>
                  <Input
                    value={formData.drivingCarLicenseNo}
                    onChange={(e) => handleInputChange('drivingCarLicenseNo', e.target.value)}
                  />
                </div>
              )}

              {formData.drivingMotorcycle && (
                <div className="space-y-2">
                  <Label>เลขที่ใบอนุญาตขับรถจักรยานยนต์</Label>
                  <Input
                    value={formData.drivingMotorcycleLicenseNo}
                    onChange={(e) => handleInputChange('drivingMotorcycleLicenseNo', e.target.value)}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label>ความสามารถพิเศษอื่นๆ</Label>
                <Textarea
                  value={formData.otherSkills}
                  onChange={(e) => handleInputChange('otherSkills', e.target.value)}
                  placeholder="ระบุความสามารถพิเศษอื่นๆ"
                />
              </div>
            </CardContent>
          </Card>

          {/* Emergency Contact */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PhoneIcon className="h-5 w-5" />
                บุคคลที่ติดต่อได้ในกรณีฉุกเฉิน
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>ชื่อ-นามสกุล</Label>
                  <Input
                    value={formData.emergencyName}
                    onChange={(e) => handleInputChange('emergencyName', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>ความสัมพันธ์</Label>
                  <Input
                    value={formData.emergencyRelation}
                    onChange={(e) => handleInputChange('emergencyRelation', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>เบอร์โทรศัพท์</Label>
                  <Input
                    type="tel"
                    value={formData.emergencyPhone}
                    onChange={(e) => handleInputChange('emergencyPhone', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>ที่อยู่</Label>
                  <Input
                    value={formData.emergencyAddress}
                    onChange={(e) => handleInputChange('emergencyAddress', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Privacy & Submit */}
          <Card className="mb-6">
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-start space-x-3 p-4 bg-muted/50 rounded-lg">
                <Checkbox
                  id="privacy"
                  checked={formData.privacyConsent}
                  onCheckedChange={(checked) => handleInputChange('privacyConsent', checked as boolean)}
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

              <Button
                type="submit"
                className="w-full h-12 text-lg bg-gradient-to-r from-pink-500 to-purple-500 hover:opacity-90"
                disabled={isSubmitting}
                onClick={(e) => addSparkleEffect(e as any)}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    กำลังส่งใบสมัคร...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    ส่งใบสมัคร
                  </>
                )}
              </Button>
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

export default PublicJobApplication;
