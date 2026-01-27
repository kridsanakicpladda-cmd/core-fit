import { useState, useEffect } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Upload, FileText, Plus, User, X, Loader2, Sparkles, Briefcase, GraduationCap, Users, Home, Heart, Phone as PhoneIcon, Shield, Calendar, Car, Languages as LanguagesIcon, Award, AlertCircle } from "lucide-react";
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

const JobApplication = () => {
  const { toast } = useToast();
  const { addCandidate } = useCandidates();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [privacyDialogOpen, setPrivacyDialogOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoadingCandidate, setIsLoadingCandidate] = useState(false);
  const [existingCandidateId, setExistingCandidateId] = useState<string | null>(null);
  
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
        .eq('status', 'open')
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

  useEffect(() => {
    const state = location.state as { jobId?: string; jobTitle?: string } | null;
    if (state?.jobTitle) {
      setFormData(prev => ({ ...prev, position: state.jobTitle }));
      setAvailablePositions(prev => {
        const exists = prev.some(p => p.title === state.jobTitle);
        return exists ? prev : [{ id: state.jobId || '', title: state.jobTitle! }, ...prev];
      });
      toast({
        title: "ตำแหน่งงานถูกเลือกแล้ว",
        description: `คุณกำลังสมัครตำแหน่ง: ${state.jobTitle}`,
      });
    }
  }, [location.state, toast]);

  // Fetch candidate data from URL params (for invited candidates from Quick Apply)
  useEffect(() => {
    const candidateId = searchParams.get('candidateId');
    if (!candidateId) return;

    const fetchCandidateData = async () => {
      setIsLoadingCandidate(true);
      try {
        // Fetch candidate basic info
        const { data: candidate, error: candidateError } = await supabase
          .from('candidates')
          .select('*')
          .eq('id', candidateId)
          .single();

        if (candidateError) {
          console.error('Error fetching candidate:', candidateError);
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

        // Store candidate ID for update instead of insert
        setExistingCandidateId(candidateId);

        // Pre-fill form data from candidate
        if (candidate) {
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
            title: "ดึงข้อมูลสำเร็จ",
            description: "ข้อมูลจากการฝากประวัติถูกกรอกแล้ว กรุณาตรวจสอบและกรอกข้อมูลเพิ่มเติม",
          });
        }
      } catch (error) {
        console.error('Error loading candidate data:', error);
      } finally {
        setIsLoadingCandidate(false);
      }
    };

    fetchCandidateData();
  }, [searchParams, toast]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === 'application/pdf') {
        setSelectedFile(file);
        toast({
          title: "ไฟล์ถูกเลือกแล้ว",
          description: file.name,
        });
      } else {
        toast({
          title: "รองรับเฉพาะไฟล์ PDF",
          description: "กรุณาเลือกไฟล์ PDF เท่านั้น",
          variant: "destructive",
        });
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      const file = files[0];
      if (file.type === 'application/pdf') {
        setSelectedFile(file);
        addSparkleEffect(e as any);
        toast({
          title: "ไฟล์ถูกเลือกแล้ว",
          description: file.name,
        });
      } else {
        toast({
          title: "รองรับเฉพาะไฟล์ PDF",
          description: "กรุณาเลือกไฟล์ PDF เท่านั้น",
          variant: "destructive",
        });
      }
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

  const addWorkExperience = () => {
    setWorkExperiences([...workExperiences, { company: "", position: "", duration: "", salary: "", responsibilities: "", reason: "" }]);
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

  const addFamilyMember = () => {
    setFamilyMembers([...familyMembers, { name: "", relationship: "", age: "", occupation: "" }]);
  };

  const removeFamilyMember = (index: number) => {
    if (familyMembers.length > 2) {
      setFamilyMembers(familyMembers.filter((_, i) => i !== index));
    }
  };

  const updateFamilyMember = (index: number, field: keyof FamilyMember, value: string) => {
    const updated = [...familyMembers];
    updated[index][field] = value;
    setFamilyMembers(updated);
  };

  const addLanguageSkill = () => {
    setLanguageSkills([...languageSkills, { language: "", spoken: "", written: "", understand: "" }]);
  };

  const removeLanguageSkill = (index: number) => {
    if (languageSkills.length > 1) {
      setLanguageSkills(languageSkills.filter((_, i) => i !== index));
    }
  };

  const updateLanguageSkill = (index: number, field: keyof LanguageSkill, value: string) => {
    const updated = [...languageSkills];
    updated[index][field] = value;
    setLanguageSkills(updated);
  };

  const updateEducation = (index: number, field: keyof Education, value: string) => {
    const updated = [...educations];
    updated[index][field] = value;
    setEducations(updated);
  };

  // Helper function to convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data:application/pdf;base64, prefix
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
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
      // Use CDN for worker to avoid module loading issues
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

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

      // Call the deployed parse-resume function
      let data: any = null;
      let error: any = null;

      try {
        const result = await supabase.functions.invoke('parse-resume', {
          body: { 
            resumeText: fullText
            // Note: fileBase64 removed to avoid payload size issues
          }
        });
        data = result.data;
        error = result.error;
        
        console.log('parse-resume response:', result);
      } catch (e) {
        console.error('Error calling parse-resume:', e);
        // Fallback to simple parsing
        const lines = fullText.split('\n').filter(line => line.trim());
        let name = "ผู้สมัคร";
        let email = "";
        let phone = "";
        
        for (const line of lines.slice(0, 10)) {
          const lowerLine = line.toLowerCase();
          if (lowerLine.includes('@') && !email) {
            email = line.trim();
          }
          if (/\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/.test(line) && !phone) {
            phone = line.trim();
          }
          if ((lowerLine.includes('name') || lowerLine.includes('ชื่อ')) && line.length < 50) {
            name = line.replace(/name|ชื่อ|:/gi, '').trim() || name;
          }
        }

        data = {
          success: true,
          data: {
            name,
            email,
            phone,
            position: "",
            skills: ["JavaScript", "React"],
            experience: fullText.substring(0, 300) + "..."
          }
        };
        error = null;
      }

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
        const parsed = data.data as {
          name?: string;
          email?: string;
          phone?: string;
          position?: string;
          experience?: string;
          education?: string;
          skills?: string[];
        };

        const fullName = (parsed.name || "").trim();
        let firstNameFromFull = "";
        let lastNameFromFull = "";

        if (fullName) {
          const nameParts = fullName.split(/\s+/);
          firstNameFromFull = nameParts[0] ?? "";
          lastNameFromFull = nameParts.slice(1).join(" ");
        }
        
        setFormData(prev => ({
          ...prev,
          firstName: firstNameFromFull || parsed.name || prev.firstName,
          lastName: lastNameFromFull || prev.lastName,
          email: parsed.email || prev.email,
          mobilePhone: parsed.phone || prev.mobilePhone,
          position: parsed.position || prev.position,
          otherSkills:
            parsed.skills && parsed.skills.length
              ? prev.otherSkills
                ? `${prev.otherSkills}\n${parsed.skills.join(", ")}`
                : parsed.skills.join(", ")
              : prev.otherSkills,
          trainingCurriculums:
            parsed.education && !prev.trainingCurriculums
              ? parsed.education
              : prev.trainingCurriculums,
        }));

        if (parsed.experience) {
          setWorkExperiences(prevWorks => {
            if (!prevWorks.length) {
              return [
                {
                  company: "",
                  position: "",
                  duration: "",
                  salary: "",
                  responsibilities: parsed.experience || "",
                  reason: "",
                },
              ];
            }

            const [first, ...rest] = prevWorks;
            if (first.responsibilities) {
              return prevWorks;
            }

            const updatedFirst = { ...first, responsibilities: parsed.experience || first.responsibilities };
            return [updatedFirst, ...rest];
          });
        }

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    const requiredFields = [
      { value: formData.position, label: "ตำแหน่งที่สมัคร" },
      { value: selectedFile, label: "Resume / CV" },
      { value: formData.firstName, label: "ชื่อ" },
      { value: formData.lastName, label: "นามสกุล" },
      { value: formData.mobilePhone, label: "เบอร์โทรศัพท์" },
      { value: formData.email, label: "อีเมล" },
      { value: formData.privacyConsent, label: "ยินยอมนโยบายความเป็นส่วนตัว" },
    ];

    const missingFields = requiredFields.filter(field => !field.value);
    
    if (missingFields.length > 0) {
      toast({
        title: "กรุณากรอกข้อมูลให้ครบถ้วน",
        description: `ช่องที่ยังไม่ได้กรอก: ${missingFields.map(f => f.label).join(", ")}`,
        variant: "destructive",
      });
      return;
    }

    try {
      let resumeUrl = "";
      let photoUrl = "";

      // Upload resume file
      if (selectedFile) {
        // Sanitize filename to remove special characters and Thai characters
        const sanitizedResumeName = selectedFile.name
          .replace(/[^\w.-]/g, '_')
          .replace(/_{2,}/g, '_');
        const resumeFileName = `${Date.now()}_${sanitizedResumeName}`;
        const { error: resumeError } = await supabase.storage
          .from('resumes')
          .upload(resumeFileName, selectedFile);

        if (resumeError) {
          console.error('Resume upload error:', resumeError);
          toast({
            title: "เกิดข้อผิดพลาด",
            description: `ไม่สามารถอัปโหลดไฟล์เรซูเม่ได้: ${resumeError.message}`,
            variant: "destructive",
          });
          return;
        }

        const { data: resumeData } = supabase.storage
          .from('resumes')
          .getPublicUrl(resumeFileName);
        
        resumeUrl = resumeData.publicUrl;
      }

      // Upload profile photo
      if (profilePhoto) {
        // Sanitize filename to remove special characters and Thai characters
        const sanitizedPhotoName = profilePhoto.name
          .replace(/[^\w.-]/g, '_')
          .replace(/_{2,}/g, '_');
        const photoFileName = `${Date.now()}_${sanitizedPhotoName}`;
        const { error: photoError } = await supabase.storage
          .from('profile-photos')
          .upload(photoFileName, profilePhoto);

        if (photoError) {
          console.error('Photo upload error:', photoError);
          toast({
            title: "เกิดข้อผิดพลาด",
            description: `ไม่สามารถอัปโหลดรูปภาพได้: ${photoError.message}`,
            variant: "destructive",
          });
          return;
        }

        const { data: photoData } = supabase.storage
          .from('profile-photos')
          .getPublicUrl(photoFileName);
        
        photoUrl = photoData.publicUrl;
      }

      // Insert or update candidate data
      let candidateId: string;

      // If we have an existing candidate ID from URL params (invited from Quick Apply)
      if (existingCandidateId) {
        // Update existing candidate and change source from Quick Apply to Job Application
        const { error: updateError } = await supabase
          .from('candidates')
          .update({
            name: `${formData.firstName} ${formData.lastName}`,
            phone: formData.mobilePhone || null,
            source: 'Job Application', // Change source from Quick Apply to Job Application
            stage: 'Screening', // Move to Screening stage after completing full application
            resume_url: resumeUrl || undefined,
            photo_url: photoUrl || undefined,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingCandidateId);

        if (updateError) {
          toast({
            title: "เกิดข้อผิดพลาด",
            description: "ไม่สามารถอัปเดตข้อมูลผู้สมัครได้",
            variant: "destructive",
          });
          return;
        }
        candidateId = existingCandidateId;
      } else {
        // Check if candidate exists by email
        const { data: existingCandidate } = await supabase
          .from('candidates')
          .select('id')
          .eq('email', formData.email)
          .maybeSingle();

        if (existingCandidate) {
          // Update existing candidate
          const { error: updateError } = await supabase
            .from('candidates')
            .update({
              name: `${formData.firstName} ${formData.lastName}`,
              phone: formData.mobilePhone || null,
              resume_url: resumeUrl || null,
              photo_url: photoUrl || null,
              updated_at: new Date().toISOString(),
            })
            .eq('id', existingCandidate.id);

          if (updateError) {
            toast({
              title: "เกิดข้อผิดพลาด",
              description: "ไม่สามารถอัปเดตข้อมูลผู้สมัครได้",
              variant: "destructive",
            });
            return;
          }
          candidateId = existingCandidate.id;
        } else {
          // Insert new candidate
          const { data: newCandidate, error: insertError } = await supabase
            .from('candidates')
            .insert({
              name: `${formData.firstName} ${formData.lastName}`,
              email: formData.email,
              phone: formData.mobilePhone || null,
              source: 'Job Application',
              stage: 'Pending',
              resume_url: resumeUrl || null,
              photo_url: photoUrl || null,
            } as any)
            .select('id')
            .single();

          if (insertError) {
            console.error('Insert candidate error:', insertError);
            toast({
              title: "เกิดข้อผิดพลาด",
              description: `ไม่สามารถบันทึกข้อมูลผู้สมัครได้: ${insertError.message}`,
              variant: "destructive",
            });
            return;
          }
          candidateId = newCandidate.id;
        }
      }

      // Save all form details to candidate_details table
      const candidateDetailsData = {
        candidate_id: candidateId,
        position: formData.position,
        expected_salary: formData.expectedSalary,
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
        marital_status: formData.maritalStatus,
        spouse_name: formData.spouseName,
        spouse_occupation: formData.spouseOccupation,
        number_of_children: formData.numberOfChildren,
        emergency_name: formData.emergencyName,
        emergency_relation: formData.emergencyRelation,
        emergency_address: formData.emergencyAddress,
        emergency_phone: formData.emergencyPhone,
        computer_skill: formData.computerSkill,
        driving_car: formData.drivingCar,
        driving_car_license_no: formData.drivingCarLicenseNo,
        driving_motorcycle: formData.drivingMotorcycle,
        driving_motorcycle_license_no: formData.drivingMotorcycleLicenseNo,
        other_skills: formData.otherSkills,
        training_curriculums: formData.trainingCurriculums,
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
        educations: JSON.parse(JSON.stringify(educations)),
        work_experiences: JSON.parse(JSON.stringify(workExperiences)),
        family_members: JSON.parse(JSON.stringify(familyMembers)),
        language_skills: JSON.parse(JSON.stringify(languageSkills)),
        privacy_consent: formData.privacyConsent,
      };

      // Check if details already exist for this candidate
      const { data: existingDetails } = await supabase
        .from('candidate_details')
        .select('id')
        .eq('candidate_id', candidateId)
        .maybeSingle();

      if (existingDetails) {
        // Update existing details
        const { error: detailsError } = await supabase
          .from('candidate_details')
          .update(candidateDetailsData)
          .eq('id', existingDetails.id);

        if (detailsError) {
          console.error('Error updating candidate details:', detailsError);
        }
      } else {
        // Insert new details
        const { error: detailsError } = await supabase
          .from('candidate_details')
          .insert(candidateDetailsData);

        if (detailsError) {
          console.error('Error inserting candidate details:', detailsError);
        }
      }

      // Also add to context for UI update
      addCandidate({
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        phone: formData.mobilePhone || "-",
        position: formData.position,
        experience: "ระบุในเรซูเม่",
        skills: [],
        resumeFile: selectedFile.name,
        resumeUrl: resumeUrl || undefined,
        coverLetter: "",
        photoUrl: photoUrl || undefined,
      });

      toast({
        title: "ส่งใบสมัครสำเร็จ",
        description: `ใบสมัครของคุณสำหรับตำแหน่ง ${formData.position} ถูกส่งแล้ว`,
      });

      // Reset form
      setFormData({
        position: "",
        expectedSalary: "",
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
        maritalStatus: "single",
        spouseName: "",
        spouseOccupation: "",
        numberOfChildren: "",
        emergencyName: "",
        emergencyRelation: "",
        emergencyAddress: "",
        emergencyPhone: "",
        computerSkill: false,
        drivingCar: false,
        drivingCarLicenseNo: "",
        drivingMotorcycle: false,
        drivingMotorcycleLicenseNo: "",
        otherSkills: "",
        trainingCurriculums: "",
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
      setSelectedFile(null);
      setProfilePhoto(null);
      setProfilePhotoPreview(null);
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error instanceof Error ? error.message : "ไม่สามารถส่งใบสมัครได้",
        variant: "destructive",
      });
    }
  };

  // Show loading state while fetching candidate data
  if (isLoadingCandidate) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
          <p className="text-lg text-muted-foreground">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5 py-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* Invitation Banner for candidates from Quick Apply */}
        {existingCandidateId && (
          <div className="mb-6 p-4 bg-gradient-to-r from-pink-50 to-purple-50 border-2 border-pink-200 rounded-xl animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-pink-100 rounded-full">
                <Heart className="w-6 h-6 text-pink-500" />
              </div>
              <div>
                <h3 className="font-semibold text-pink-700">บริษัทสนใจประวัติของคุณ!</h3>
                <p className="text-sm text-pink-600">
                  กรุณากรอกข้อมูลเพิ่มเติมเพื่อให้การสมัครงานเสร็จสมบูรณ์ ข้อมูลบางส่วนถูกดึงมาจากที่คุณกรอกไว้ก่อนหน้านี้
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent mb-3">
            EMPLOYMENT APPLICATION
          </h1>
          <p className="text-3xl font-semibold text-muted-foreground mb-2">
            ใบสมัครงาน
          </p>
          <p className="text-sm text-muted-foreground italic">
            (Please fill in English, if capable)
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
                  <CardTitle className="text-2xl">Position & Salary</CardTitle>
                  <CardDescription>ตำแหน่งที่สมัครและเงินเดือนที่คาดหวัง</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Profile Photo */}
                <div className="lg:col-span-3">
                  <Label className="text-base font-semibold">รูปถ่าย 1-2 นิ้ว / Photo</Label>
                  <div className="mt-3 space-y-4">
                    <div className="relative w-full aspect-[3/4] max-w-[180px] rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                      {profilePhotoPreview ? (
                        <img 
                          src={profilePhotoPreview} 
                          alt="Profile preview" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-20 h-20 text-primary/50" />
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
                      Position Applied / ตำแหน่งที่สมัคร <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={formData.position}
                      onValueChange={(value) => setFormData({ ...formData, position: value })}
                    >
                      <SelectTrigger className="border-2 focus:border-primary">
                        <SelectValue placeholder="เลือกตำแหน่ง..." />
                      </SelectTrigger>
                      <SelectContent>
                        {availablePositions
                          .filter((position, index, self) =>
                            index === self.findIndex((p) => p.title === position.title)
                          )
                          .map((position) => (
                            <SelectItem key={position.id} value={position.title}>
                              {position.title}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="expectedSalary" className="text-base font-semibold">
                      Expected Salary / เงินเดือนที่คาดหวัง (บาท)
                    </Label>
                    <Input
                      id="expectedSalary"
                      type="number"
                      value={formData.expectedSalary}
                      onChange={(e) => setFormData({ ...formData, expectedSalary: e.target.value })}
                      className="border-2 focus:border-primary"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label className="text-base font-semibold">
                      Attached CV / แนบไฟล์ Resume <span className="text-destructive">*</span>
                    </Label>
                    
                    {/* Drag & Drop Zone */}
                    <div
                      onDragOver={handleDragOver}
                      onDragEnter={handleDragEnter}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`
                        relative border-2 border-dashed rounded-xl p-8 transition-all duration-300
                        ${isDragging 
                          ? 'border-primary bg-primary/10 scale-[1.02]' 
                          : 'border-border hover:border-primary/50 bg-gradient-to-br from-primary/5 to-secondary/5'
                        }
                        ${selectedFile ? 'border-solid border-primary/30' : ''}
                      `}
                    >
                      <input
                        id="resume"
                        type="file"
                        accept=".pdf"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      
                      {!selectedFile ? (
                        <label htmlFor="resume" className="cursor-pointer block">
                          <div className="flex flex-col items-center gap-4">
                            <div className={`
                              p-4 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 transition-transform duration-300
                              ${isDragging ? 'scale-110 animate-pulse' : 'hover:scale-110'}
                            `}>
                              <FileText className={`w-10 h-10 transition-colors ${isDragging ? 'text-primary animate-bounce' : 'text-primary/70'}`} />
                            </div>
                            <div className="text-center space-y-2">
                              <p className="text-base font-semibold text-foreground">
                                {isDragging ? 'วาง PDF ที่นี่...' : 'ลากและวาง PDF ที่นี่'}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                หรือ คลิกเพื่อเลือกไฟล์ PDF
                              </p>
                              <p className="text-xs text-muted-foreground italic">
                                รองรับเฉพาะไฟล์ PDF เท่านั้น
                              </p>
                            </div>
                          </div>
                        </label>
                      ) : (
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3 flex-1">
                            <div className="p-3 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20">
                              <FileText className="w-6 h-6 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-foreground truncate">{selectedFile.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => setSelectedFile(null)}
                              className="hover:bg-destructive/10 hover:text-destructive"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* AI Parse Button */}
                    {selectedFile && (
                      <Button 
                        type="button" 
                        onClick={(e) => {
                          addSparkleEffect(e as any);
                          parseResumeWithAI();
                        }}
                        disabled={isParsing}
                        className="w-full gap-2 bg-gradient-to-r from-primary via-secondary to-accent hover:opacity-90 hover-scale"
                      >
                        {isParsing ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            กำลัง Parse Resume ด้วย AI...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4" />
                            Parse Resume with AI
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Personal Record */}
          <Card className="border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-xl">
            <CardHeader className="bg-gradient-to-r from-secondary/10 to-primary/10 rounded-t-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-secondary/20 rounded-lg">
                  <User className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <CardTitle className="text-2xl">PERSONAL RECORD</CardTitle>
                  <CardDescription>ประวัติส่วนตัว</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {/* Name */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-2 space-y-2">
                  <Label>คำนำหน้า / Title</Label>
                  <Select
                    value={formData.titleName}
                    onValueChange={(value) => setFormData({ ...formData, titleName: value })}
                  >
                    <SelectTrigger className="border-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="นาย">นาย / Mr.</SelectItem>
                      <SelectItem value="นางสาว">นางสาว / Miss</SelectItem>
                      <SelectItem value="นาง">นาง / Mrs.</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="md:col-span-3 space-y-2">
                  <Label>
                    ชื่อ / Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="border-2 focus:border-secondary"
                  />
                </div>

                <div className="md:col-span-4 space-y-2">
                  <Label>
                    นามสกุล / Last Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="border-2 focus:border-secondary"
                  />
                </div>

                <div className="md:col-span-3 space-y-2">
                  <Label>ชื่อเล่น / Nickname</Label>
                  <Input
                    value={formData.nickname}
                    onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                    className="border-2 focus:border-secondary"
                  />
                </div>
              </div>

              {/* Address */}
              <div className="space-y-2">
                <Label>Present Address / ที่อยู่ปัจจุบัน</Label>
                <Input
                  value={formData.presentAddress}
                  onChange={(e) => setFormData({ ...formData, presentAddress: e.target.value })}
                  className="border-2 focus:border-secondary"
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                <div className="space-y-2">
                  <Label>Moo / หมู่</Label>
                  <Input
                    value={formData.moo}
                    onChange={(e) => setFormData({ ...formData, moo: e.target.value })}
                    className="border-2"
                  />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label>District / ตำบล</Label>
                  <Input
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    className="border-2"
                  />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label>District / เขต/อำเภอ</Label>
                  <Input
                    value={formData.subDistrict}
                    onChange={(e) => setFormData({ ...formData, subDistrict: e.target.value })}
                    className="border-2"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Province / จังหวัด</Label>
                  <Input
                    value={formData.province}
                    onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                    className="border-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Zip Code / รหัสไปรษณีย์</Label>
                  <Input
                    value={formData.zipCode}
                    onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                    maxLength={5}
                    className="border-2"
                  />
                </div>

                <div className="space-y-2">
                  <Label>
                    Mobile Phone / โทรศัพท์มือถือ <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    value={formData.mobilePhone}
                    onChange={(e) => setFormData({ ...formData, mobilePhone: e.target.value })}
                    className="border-2"
                  />
                </div>

                <div className="space-y-2">
                  <Label>
                    E-mail / อีเมล์ <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="border-2"
                  />
                </div>
              </div>

              {/* Birth & Personal Details */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Date of Birth / ว/ด/ป เกิด</Label>
                  <Input
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                    className="border-2"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Age / อายุ (ปี)</Label>
                  <Input
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="border-2"
                  />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label>ID Card No. / เลขบัตรประชาชน</Label>
                  <Input
                    value={formData.idCard}
                    onChange={(e) => setFormData({ ...formData, idCard: e.target.value })}
                    maxLength={17}
                    className="border-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                <div className="space-y-2">
                  <Label>Sex / เพศ</Label>
                  <Select
                    value={formData.sex}
                    onValueChange={(value) => setFormData({ ...formData, sex: value })}
                  >
                    <SelectTrigger className="border-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">ชาย / Male</SelectItem>
                      <SelectItem value="female">หญิง / Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Blood Type / กรุ๊ปเลือด</Label>
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

                <div className="md:col-span-2 space-y-2">
                  <Label>Religion / ศาสนา</Label>
                  <Input
                    value={formData.religion}
                    onChange={(e) => setFormData({ ...formData, religion: e.target.value })}
                    className="border-2"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Height / ส่วนสูง (cm)</Label>
                  <Input
                    type="number"
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                    className="border-2"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Weight / น้ำหนัก (kg)</Label>
                  <Input
                    type="number"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    className="border-2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 3: Family Record */}
          <Card className="border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-xl">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-t-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/20 rounded-lg">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">FAMILY RECORD</CardTitle>
                    <CardDescription>ประวัติครอบครัว (บิดา มารดา พี่น้อง)</CardDescription>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addFamilyMember}
                  className="gap-2 hover-scale"
                >
                  <Plus className="w-4 h-4" />
                  เพิ่ม
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {familyMembers.map((member, index) => (
                <div key={index} className="p-4 border-2 rounded-xl bg-primary/5 space-y-3 hover:bg-primary/10 transition-colors">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">สมาชิกครอบครัวที่ {index + 1}</h4>
                    {familyMembers.length > 2 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFamilyMember(index)}
                        className="hover:bg-destructive/10 hover:text-destructive"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="space-y-2">
                      <Label>Name / ชื่อ</Label>
                      <Input
                        value={member.name}
                        onChange={(e) => updateFamilyMember(index, "name", e.target.value)}
                        className="border-2"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Relationship / ความสัมพันธ์</Label>
                      <Select
                        value={member.relationship}
                        onValueChange={(value) => updateFamilyMember(index, "relationship", value)}
                      >
                        <SelectTrigger className="border-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="บิดา">บิดา / Father</SelectItem>
                          <SelectItem value="มารดา">มารดา / Mother</SelectItem>
                          <SelectItem value="พี่ชาย">พี่ชาย / Brother</SelectItem>
                          <SelectItem value="พี่สาว">พี่สาว / Sister</SelectItem>
                          <SelectItem value="น้องชาย">น้องชาย / Brother</SelectItem>
                          <SelectItem value="น้องสาว">น้องสาว / Sister</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Age / อายุ</Label>
                      <Input
                        value={member.age}
                        onChange={(e) => updateFamilyMember(index, "age", e.target.value)}
                        className="border-2"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Occupation / อาชีพ</Label>
                      <Input
                        value={member.occupation}
                        onChange={(e) => updateFamilyMember(index, "occupation", e.target.value)}
                        className="border-2"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Section 4: Marital Status */}
          <Card className="border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-xl">
            <CardHeader className="bg-gradient-to-r from-secondary/10 to-primary/10 rounded-t-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-secondary/20 rounded-lg">
                  <Heart className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <CardTitle className="text-2xl">MARITAL STATUS</CardTitle>
                  <CardDescription>สถานภาพสมรส</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-3">
                <RadioGroup
                  value={formData.maritalStatus}
                  onValueChange={(value) => setFormData({ ...formData, maritalStatus: value })}
                  className="flex gap-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="single" id="single" />
                    <Label htmlFor="single" className="font-normal cursor-pointer">
                      ☐ Single / โสด
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="married" id="married" />
                    <Label htmlFor="married" className="font-normal cursor-pointer">
                      ☐ Married / แต่งงาน
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {formData.maritalStatus === "married" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in">
                  <div className="space-y-2">
                    <Label>Spouse's name / ชื่อคู่สมรส</Label>
                    <Input
                      value={formData.spouseName}
                      onChange={(e) => setFormData({ ...formData, spouseName: e.target.value })}
                      className="border-2"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Occupation / อาชีพ</Label>
                    <Input
                      value={formData.spouseOccupation}
                      onChange={(e) => setFormData({ ...formData, spouseOccupation: e.target.value })}
                      className="border-2"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>No. of Children / จำนวนบุตร</Label>
                    <Input
                      type="number"
                      value={formData.numberOfChildren}
                      onChange={(e) => setFormData({ ...formData, numberOfChildren: e.target.value })}
                      className="border-2"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Section 5: Emergency Contact */}
          <Card className="border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-xl">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-t-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/20 rounded-lg">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl">EMERGENCY CONTACT</CardTitle>
                  <CardDescription>บุคคลติดต่อในกรณีฉุกเฉิน</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Name / ชื่อ</Label>
                  <Input
                    value={formData.emergencyName}
                    onChange={(e) => setFormData({ ...formData, emergencyName: e.target.value })}
                    className="border-2"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Relationship / ความสัมพันธ์</Label>
                  <Input
                    value={formData.emergencyRelation}
                    onChange={(e) => setFormData({ ...formData, emergencyRelation: e.target.value })}
                    className="border-2"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Address / ที่อยู่</Label>
                <Textarea
                  value={formData.emergencyAddress}
                  onChange={(e) => setFormData({ ...formData, emergencyAddress: e.target.value })}
                  rows={2}
                  className="border-2 resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label>Mobile Phone / โทรศัพท์มือถือ</Label>
                <Input
                  value={formData.emergencyPhone}
                  onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                  className="border-2"
                />
              </div>
            </CardContent>
          </Card>

          {/* Section 6: Educational Record */}
          <Card className="border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-xl">
            <CardHeader className="bg-gradient-to-r from-secondary/10 to-primary/10 rounded-t-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-secondary/20 rounded-lg">
                  <GraduationCap className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <CardTitle className="text-2xl">EDUCATIONAL RECORD</CardTitle>
                  <CardDescription>ประวัติการศึกษา</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {educations.map((edu, index) => (
                <div key={index} className="p-4 border-2 rounded-xl bg-secondary/5 space-y-3">
                  <h4 className="font-semibold">
                    {edu.level === "high-school" && "High School / มัธยมศึกษา"}
                    {edu.level === "diploma" && "Diploma / อนุปริญญา"}
                    {edu.level === "bachelor" && "Bachelor / ปริญญาตรี"}
                    {edu.level === "master" && "Master / ปริญญาโท"}
                    {edu.level === "others" && "Others / อื่นๆ"}
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="space-y-2">
                      <Label>Year Graduated / ปีที่จบ</Label>
                      <Input
                        value={edu.yearGraduated}
                        onChange={(e) => updateEducation(index, "yearGraduated", e.target.value)}
                        className="border-2"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Name of Institution / สถาบัน</Label>
                      <Input
                        value={edu.institution}
                        onChange={(e) => updateEducation(index, "institution", e.target.value)}
                        className="border-2"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Major / สาขา</Label>
                      <Input
                        value={edu.major}
                        onChange={(e) => updateEducation(index, "major", e.target.value)}
                        className="border-2"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>G.P.A</Label>
                      <Input
                        value={edu.gpa}
                        onChange={(e) => updateEducation(index, "gpa", e.target.value)}
                        className="border-2"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Section 7: Special Skills - Languages */}
          <Card className="border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-xl">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-t-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/20 rounded-lg">
                    <LanguagesIcon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">SPECIAL SKILL - Foreign Languages</CardTitle>
                    <CardDescription>ความสามารถพิเศษ - ภาษาต่างประเทศ</CardDescription>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addLanguageSkill}
                  className="gap-2 hover-scale"
                >
                  <Plus className="w-4 h-4" />
                  เพิ่มภาษา
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {languageSkills.map((lang, index) => (
                <div key={index} className="p-4 border-2 rounded-xl bg-primary/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">ภาษาที่ {index + 1}</h4>
                    {languageSkills.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeLanguageSkill(index)}
                        className="hover:bg-destructive/10 hover:text-destructive"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="space-y-2">
                      <Label>Language / ภาษา</Label>
                      <Input
                        value={lang.language}
                        onChange={(e) => updateLanguageSkill(index, "language", e.target.value)}
                        placeholder="ภาษาอังกฤษ / English"
                        className="border-2"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Spoken / พูด</Label>
                      <Select
                        value={lang.spoken}
                        onValueChange={(value) => updateLanguageSkill(index, "spoken", value)}
                      >
                        <SelectTrigger className="border-2">
                          <SelectValue placeholder="เลือก..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="excellent">ดีมาก / Excellent</SelectItem>
                          <SelectItem value="good">ดี / Good</SelectItem>
                          <SelectItem value="fair">พอใช้ / Fair</SelectItem>
                          <SelectItem value="no">ไม่ได้ / No</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Written / เขียน</Label>
                      <Select
                        value={lang.written}
                        onValueChange={(value) => updateLanguageSkill(index, "written", value)}
                      >
                        <SelectTrigger className="border-2">
                          <SelectValue placeholder="เลือก..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="excellent">ดีมาก / Excellent</SelectItem>
                          <SelectItem value="good">ดี / Good</SelectItem>
                          <SelectItem value="fair">พอใช้ / Fair</SelectItem>
                          <SelectItem value="no">ไม่ได้ / No</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Understand / เข้าใจ</Label>
                      <Select
                        value={lang.understand}
                        onValueChange={(value) => updateLanguageSkill(index, "understand", value)}
                      >
                        <SelectTrigger className="border-2">
                          <SelectValue placeholder="เลือก..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="excellent">ดีมาก / Excellent</SelectItem>
                          <SelectItem value="good">ดี / Good</SelectItem>
                          <SelectItem value="fair">พอใช้ / Fair</SelectItem>
                          <SelectItem value="no">ไม่ได้ / No</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ))}

              {/* Other Skills */}
              <div className="pt-4 border-t space-y-4">
                <h4 className="font-semibold text-lg flex items-center gap-2">
                  <Award className="w-5 h-5 text-primary" />
                  Other Skills / ทักษะอื่นๆ
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="computerSkill"
                      checked={formData.computerSkill}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, computerSkill: checked as boolean })
                      }
                    />
                    <Label htmlFor="computerSkill" className="font-normal cursor-pointer">
                      ☐ Computer / คอมพิวเตอร์
                    </Label>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="drivingCar"
                        checked={formData.drivingCar}
                        onCheckedChange={(checked) =>
                          setFormData({ ...formData, drivingCar: checked as boolean })
                        }
                      />
                      <Label htmlFor="drivingCar" className="font-normal cursor-pointer">
                        ☐ Driving Car / การขับขี่รถยนต์
                      </Label>
                    </div>
                    {formData.drivingCar && (
                      <Input
                        value={formData.drivingCarLicenseNo}
                        onChange={(e) => setFormData({ ...formData, drivingCarLicenseNo: e.target.value })}
                        className="border-2 ml-6"
                      />
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="drivingMotorcycle"
                        checked={formData.drivingMotorcycle}
                        onCheckedChange={(checked) =>
                          setFormData({ ...formData, drivingMotorcycle: checked as boolean })
                        }
                      />
                      <Label htmlFor="drivingMotorcycle" className="font-normal cursor-pointer">
                        ☐ Driving Motorcycle / การขับขี่จักรยานยนต์
                      </Label>
                    </div>
                    {formData.drivingMotorcycle && (
                      <Input
                        value={formData.drivingMotorcycleLicenseNo}
                        onChange={(e) => setFormData({ ...formData, drivingMotorcycleLicenseNo: e.target.value })}
                        className="border-2 ml-6"
                      />
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>☐ Others / อื่นๆ</Label>
                    <Input
                      value={formData.otherSkills}
                      onChange={(e) => setFormData({ ...formData, otherSkills: e.target.value })}
                      className="border-2"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 8: Professional Training */}
          <Card className="border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-xl">
            <CardHeader className="bg-gradient-to-r from-secondary/10 to-primary/10 rounded-t-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-secondary/20 rounded-lg">
                  <Award className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <CardTitle className="text-2xl">PROFESSIONAL TRAINING</CardTitle>
                  <CardDescription>ประวัติการฝึกอบรม (Curriculums / หลักสูตร)</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <Textarea
                value={formData.trainingCurriculums}
                onChange={(e) => setFormData({ ...formData, trainingCurriculums: e.target.value })}
                rows={5}
                className="border-2 resize-none"
              />
            </CardContent>
          </Card>

          {/* Section 9: Employment Record */}
          <Card className="border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-xl">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-t-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/20 rounded-lg">
                    <Briefcase className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">EMPLOYMENT RECORD</CardTitle>
                    <CardDescription>ประวัติการทำงาน</CardDescription>
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
                <div key={index} className="p-4 border-2 rounded-xl bg-primary/5 space-y-3">
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

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-2">
                      <Label>Period Time / ระยะเวลา</Label>
                      <Input
                        value={work.duration}
                        onChange={(e) => updateWorkExperience(index, "duration", e.target.value)}
                        className="border-2"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Company / ชื่อสถานประกอบการ</Label>
                      <Input
                        value={work.company}
                        onChange={(e) => updateWorkExperience(index, "company", e.target.value)}
                        className="border-2"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Position / ตำแหน่ง</Label>
                      <Input
                        value={work.position}
                        onChange={(e) => updateWorkExperience(index, "position", e.target.value)}
                        className="border-2"
                      />
                    </div>

                    <div className="md:col-span-2 space-y-2">
                      <Label>Responsibilities / หน้าที่รับผิดชอบ</Label>
                      <Input
                        value={work.responsibilities}
                        onChange={(e) => updateWorkExperience(index, "responsibilities", e.target.value)}
                        className="border-2"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Salary / เงินเดือน</Label>
                      <Input
                        value={work.salary}
                        onChange={(e) => updateWorkExperience(index, "salary", e.target.value)}
                        className="border-2"
                      />
                    </div>

                    <div className="md:col-span-3 space-y-2">
                      <Label>Reason for Leaving / เหตุผลที่ลาออก</Label>
                      <Input
                        value={work.reason}
                        onChange={(e) => updateWorkExperience(index, "reason", e.target.value)}
                        className="border-2"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Section 10: Other Information */}
          <Card className="border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-xl">
            <CardHeader className="bg-gradient-to-r from-secondary/10 to-primary/10 rounded-t-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-secondary/20 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <CardTitle className="text-2xl">OTHER</CardTitle>
                  <CardDescription>ข้อมูลด้านอื่นๆ</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {/* Question 1 */}
              <div className="space-y-3 p-4 rounded-xl bg-muted/30">
                <Label className="text-base font-medium">
                  1. Have you ever applied or worked with ICP Group before?<br />
                  ท่านเคยสมัครหรือทำงานในกลุ่มบริษัทในเครือ ไอ ซี พี มาก่อนหรือไม่?
                </Label>
                <RadioGroup
                  value={formData.workedAtICPBefore}
                  onValueChange={(value) => setFormData({ ...formData, workedAtICPBefore: value })}
                  className="flex gap-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="icp-yes" />
                    <Label htmlFor="icp-yes" className="font-normal cursor-pointer">Yes / เคย</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="icp-no" />
                    <Label htmlFor="icp-no" className="font-normal cursor-pointer">No / ไม่เคย</Label>
                  </div>
                </RadioGroup>
                {formData.workedAtICPBefore === "yes" && (
                  <Input
                    value={formData.workedAtICPDetails}
                    onChange={(e) => setFormData({ ...formData, workedAtICPDetails: e.target.value })}
                    className="border-2"
                  />
                )}
              </div>

              {/* Question 2 */}
              <div className="space-y-3 p-4 rounded-xl bg-muted/30">
                <Label className="text-base font-medium">
                  2. Do you have any relatives or friends working in ICP Group?<br />
                  ท่านมีญาติพี่น้องหรือคนรู้จักทำงานในกลุ่มบริษัทในเครือ ไอ ซี พี หรือไม่?
                </Label>
                <RadioGroup
                  value={formData.relativesAtICP}
                  onValueChange={(value) => setFormData({ ...formData, relativesAtICP: value })}
                  className="flex gap-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="relatives-yes" />
                    <Label htmlFor="relatives-yes" className="font-normal cursor-pointer">Yes / เคย</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="relatives-no" />
                    <Label htmlFor="relatives-no" className="font-normal cursor-pointer">No / ไม่เคย</Label>
                  </div>
                </RadioGroup>
                {formData.relativesAtICP === "yes" && (
                  <Input
                    value={formData.relativesAtICPDetails}
                    onChange={(e) => setFormData({ ...formData, relativesAtICPDetails: e.target.value })}
                    className="border-2"
                  />
                )}
              </div>

              {/* Question 3 */}
              <div className="space-y-3 p-4 rounded-xl bg-muted/30">
                <Label className="text-base font-medium">
                  3. Have you ever been convicted for any crimes?<br />
                  ท่านเคยถูกตัดสินดำเนินคดีหรือไม่?
                </Label>
                <RadioGroup
                  value={formData.criminalRecord}
                  onValueChange={(value) => setFormData({ ...formData, criminalRecord: value })}
                  className="flex gap-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="criminal-yes" />
                    <Label htmlFor="criminal-yes" className="font-normal cursor-pointer">Yes / เคย</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="criminal-no" />
                    <Label htmlFor="criminal-no" className="font-normal cursor-pointer">No / ไม่เคย</Label>
                  </div>
                </RadioGroup>
                {formData.criminalRecord === "yes" && (
                  <Input
                    value={formData.criminalRecordDetails}
                    onChange={(e) => setFormData({ ...formData, criminalRecordDetails: e.target.value })}
                    className="border-2"
                  />
                )}
              </div>

              {/* Question 4 */}
              <div className="space-y-3 p-4 rounded-xl bg-muted/30">
                <Label className="text-base font-medium">
                  4. Have you ever been seriously ill within the past 5 years?<br />
                  ใน 5 ปีที่ผ่านมา ท่านเคยป่วยเป็นโรคติดต่อร้ายแรงหรือไม่?
                </Label>
                <RadioGroup
                  value={formData.seriousIllness}
                  onValueChange={(value) => setFormData({ ...formData, seriousIllness: value })}
                  className="flex gap-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="illness-yes" />
                    <Label htmlFor="illness-yes" className="font-normal cursor-pointer">Yes / เคย</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="illness-no" />
                    <Label htmlFor="illness-no" className="font-normal cursor-pointer">No / ไม่เคย</Label>
                  </div>
                </RadioGroup>
                {formData.seriousIllness === "yes" && (
                  <Input
                    value={formData.seriousIllnessDetails}
                    onChange={(e) => setFormData({ ...formData, seriousIllnessDetails: e.target.value })}
                    className="border-2"
                  />
                )}
              </div>

              {/* Question 5 */}
              <div className="space-y-3 p-4 rounded-xl bg-muted/30">
                <Label className="text-base font-medium">
                  5. Do you have color blindness?<br />
                  ท่านมีภาวะตาบอดสีหรือไม่?
                </Label>
                <RadioGroup
                  value={formData.colorBlindness}
                  onValueChange={(value) => setFormData({ ...formData, colorBlindness: value })}
                  className="flex gap-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="color-yes" />
                    <Label htmlFor="color-yes" className="font-normal cursor-pointer">Yes / มี</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="color-no" />
                    <Label htmlFor="color-no" className="font-normal cursor-pointer">No / ไม่มี</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Question 6 */}
              <div className="space-y-3 p-4 rounded-xl bg-muted/30">
                <Label className="text-base font-medium">
                  6. Are you pregnant at the moment?<br />
                  ขณะนี้ท่านอยู่ในระหว่างการตั้งครรภ์หรือไม่?
                </Label>
                <RadioGroup
                  value={formData.pregnant}
                  onValueChange={(value) => setFormData({ ...formData, pregnant: value })}
                  className="flex gap-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="pregnant-yes" />
                    <Label htmlFor="pregnant-yes" className="font-normal cursor-pointer">Yes / มี</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="pregnant-no" />
                    <Label htmlFor="pregnant-no" className="font-normal cursor-pointer">No / ไม่มี</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Question 7 */}
              <div className="space-y-3 p-4 rounded-xl bg-muted/30">
                <Label className="text-base font-medium">
                  7. Have you ever been seriously or contracted with contagious disease?<br />
                  ท่านเคยป่วยหนักและเป็นโรคติดต่อร้ายแรงมาก่อนหรือไม่?
                </Label>
                <RadioGroup
                  value={formData.contagiousDisease}
                  onValueChange={(value) => setFormData({ ...formData, contagiousDisease: value })}
                  className="flex gap-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="disease-yes" />
                    <Label htmlFor="disease-yes" className="font-normal cursor-pointer">Yes / เคย</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="disease-no" />
                    <Label htmlFor="disease-no" className="font-normal cursor-pointer">No / ไม่เคย</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Declaration */}
              <div className="p-4 bg-muted/50 rounded-xl border-2 border-primary/20">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  <strong>I understand that any falsified statement on this application can be sufficient cause for dismissal if I am employed.</strong><br />
                  ข้าพเจ้าขอรับรองว่าข้อความข้างต้นเป็นความจริงทุกประการ การปิดบังความจริงใดๆ จะทำให้ข้าพเจ้าหมดสิทธิในการได้รับการพิจารณาจ้างงานหรือถูกปลดออกจากงานในกรณีบริษัทฯ ได้ว่าจ้างข้าพเจ้าแล้ว
                </p>
              </div>
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
                    ส่งใบสมัคร / Submit
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
