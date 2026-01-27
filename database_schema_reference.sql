-- ============================================
-- DATABASE SCHEMA REFERENCE - ATS SYSTEM
-- สำหรับดู Schema เท่านั้น ไม่ใช่สำหรับรัน!
-- ============================================

-- ============================================
-- 1. TABLES OVERVIEW
-- ============================================

/*
USER MANAGEMENT:
- profiles (ข้อมูลผู้ใช้)
- user_roles (บทบาทผู้ใช้)
- role_permissions (สิทธิ์การเข้าถึง)

JOB MANAGEMENT:
- job_positions (ตำแหน่งงาน)
- job_requisitions (ใบขออนุมัติเปิดรับสมัคร)
- requisition_approvals (ประวัติการอนุมัติ)

CANDIDATE MANAGEMENT:
- candidates (ข้อมูลผู้สมัคร)
- candidate_details (ข้อมูลผู้สมัครแบบละเอียด)
- employment_records (ประวัติการทำงาน)

APPLICATION & INTERVIEW:
- applications (การสมัครงาน)
- interviews (การสัมภาษณ์)

OTHERS:
- notifications (การแจ้งเตือน)
- recruitment_costs (ค่าใช้จ่ายในการสรรหา)
- company_settings (การตั้งค่าบริษัท)

STORAGE BUCKETS:
- resumes (เรซูเม่)
- profile-photos (รูปโปรไฟล์)
- job-descriptions (JD files)
*/


-- ============================================
-- 2. COMPLETE TABLE STRUCTURES
-- ============================================

-- profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  department TEXT,
  email TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- user_roles
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, role)
);

-- role_permissions
CREATE TABLE public.role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role TEXT NOT NULL,
  resource TEXT NOT NULL,
  action TEXT NOT NULL,
  allowed BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(role, resource, action)
);

-- job_positions
CREATE TABLE public.job_positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  department TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  required_count INTEGER DEFAULT 1,
  start_date DATE NOT NULL,
  end_date DATE,
  description TEXT,
  salary TEXT,
  salary_min INTEGER,
  salary_max INTEGER,
  location TEXT,
  job_grade TEXT,
  employment_type TEXT DEFAULT 'Full-time',
  responsibilities TEXT,
  requirements TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- job_requisitions
CREATE TABLE public.job_requisitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requisition_number TEXT UNIQUE NOT NULL,
  department TEXT NOT NULL,
  position TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  date_needed DATE NOT NULL,
  work_location TEXT NOT NULL,
  reports_to TEXT NOT NULL,
  hiring_type TEXT NOT NULL,
  replacement_for TEXT,
  replacement_date DATE,
  temporary_duration TEXT,
  justification TEXT NOT NULL,
  job_description_no TEXT,
  job_grade TEXT,
  job_duties TEXT,
  salary TEXT,
  gender TEXT,
  max_age TEXT,
  min_experience TEXT,
  min_education TEXT,
  field_of_study TEXT,
  other_skills TEXT,
  marital_status TEXT,
  experience_in TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  requested_by UUID REFERENCES public.profiles(id) NOT NULL,
  jd_file_url TEXT,
  requisition_form_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- requisition_approvals
CREATE TABLE public.requisition_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requisition_id UUID REFERENCES public.job_requisitions(id) ON DELETE CASCADE NOT NULL,
  approver_id UUID REFERENCES public.profiles(id) NOT NULL,
  action TEXT NOT NULL,
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- candidates
CREATE TABLE public.candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  source TEXT NOT NULL,
  stage TEXT DEFAULT 'Pending',
  ai_fit_score INTEGER,
  resume_url TEXT,
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);


-- candidate_details (ข้อมูลฟอร์มสมัครงานแบบเต็ม)
CREATE TABLE public.candidate_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID REFERENCES public.candidates(id) ON DELETE CASCADE NOT NULL,
  
  -- Job Info
  position TEXT,
  expected_salary TEXT,
  
  -- Personal Info
  title_name TEXT,
  first_name TEXT,
  last_name TEXT,
  nickname TEXT,
  present_address TEXT,
  moo TEXT,
  district TEXT,
  sub_district TEXT,
  province TEXT,
  zip_code TEXT,
  mobile_phone TEXT,
  birth_date DATE,
  age TEXT,
  id_card TEXT,
  sex TEXT,
  blood_type TEXT,
  religion TEXT,
  height TEXT,
  weight TEXT,
  
  -- Marital Status
  marital_status TEXT,
  spouse_name TEXT,
  spouse_occupation TEXT,
  number_of_children TEXT,
  
  -- Emergency Contact
  emergency_name TEXT,
  emergency_relation TEXT,
  emergency_address TEXT,
  emergency_phone TEXT,
  
  -- Skills
  computer_skill BOOLEAN DEFAULT false,
  driving_car BOOLEAN DEFAULT false,
  driving_car_license_no TEXT,
  driving_motorcycle BOOLEAN DEFAULT false,
  driving_motorcycle_license_no TEXT,
  other_skills TEXT,
  training_curriculums TEXT,
  
  -- Questions
  worked_at_icp_before TEXT,
  worked_at_icp_details TEXT,
  relatives_at_icp TEXT,
  relatives_at_icp_details TEXT,
  criminal_record TEXT,
  criminal_record_details TEXT,
  serious_illness TEXT,
  serious_illness_details TEXT,
  color_blindness TEXT,
  pregnant TEXT,
  contagious_disease TEXT,
  
  -- Test Scores
  hr_test_score INTEGER,
  department_test_score INTEGER,
  
  -- JSONB Data
  educations JSONB DEFAULT '[]'::jsonb,
  work_experiences JSONB DEFAULT '[]'::jsonb,
  family_members JSONB DEFAULT '[]'::jsonb,
  language_skills JSONB DEFAULT '[]'::jsonb,
  
  privacy_consent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- employment_records
CREATE TABLE public.employment_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID REFERENCES public.candidates(id) ON DELETE CASCADE NOT NULL,
  period_time TEXT,
  company TEXT,
  position TEXT,
  responsibilities TEXT,
  salary NUMERIC,
  reason_for_leaving TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- applications
CREATE TABLE public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID REFERENCES public.candidates(id) ON DELETE CASCADE NOT NULL,
  position_id UUID REFERENCES public.job_positions(id) ON DELETE CASCADE NOT NULL,
  stage TEXT NOT NULL DEFAULT 'New',
  ai_fit_score INTEGER,
  ai_fit_reasoning TEXT,
  applied_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  notes TEXT,
  UNIQUE(candidate_id, position_id)
);

-- interviews
CREATE TABLE public.interviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES public.applications(id) ON DELETE CASCADE NOT NULL,
  interviewer_id UUID REFERENCES public.profiles(id),
  scheduled_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'scheduled',
  result TEXT,
  score INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- notifications
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL,
  candidate_name TEXT,
  old_status TEXT,
  new_status TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- recruitment_costs
CREATE TABLE public.recruitment_costs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- company_settings
CREATE TABLE public.company_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT,
  company_email TEXT,
  microsoft_365_connected BOOLEAN DEFAULT false,
  microsoft_365_token TEXT,
  ai_fit_score_weights JSONB DEFAULT '{"skills": 40, "experience": 25, "projects": 15, "education": 10, "other": 10}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- END OF SCHEMA REFERENCE
-- ============================================
