-- ============================================
-- COMPLETE DATABASE SCHEMA FOR ATS SYSTEM
-- ระบบสรรหาและคัดเลือกบุคลากร (Applicant Tracking System)
-- ============================================

-- ============================================
-- 1. ENUMS & TYPES
-- ============================================

-- Create enum for user roles (skip if already exists)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE public.app_role AS ENUM (
      'admin', 
      'hr_manager', 
      'manager',
      'recruiter', 
      'interviewer', 
      'viewer',
      'ceo',
      'candidate'
    );
  END IF;
END $$;

-- ============================================
-- 2. CORE FUNCTIONS
-- ============================================

-- Function to handle updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Function to check if user has specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  );
$$;

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = 'admin'
  );
$$;

-- Function to generate requisition number
CREATE OR REPLACE FUNCTION public.generate_requisition_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  next_num INTEGER;
  year_part TEXT;
BEGIN
  year_part := TO_CHAR(now(), 'YY');
  
  SELECT COALESCE(MAX(CAST(SUBSTRING(requisition_number FROM 8) AS INTEGER)), 0) + 1
  INTO next_num
  FROM public.job_requisitions
  WHERE requisition_number LIKE 'REQ-' || year_part || '%';
  
  RETURN 'REQ-' || year_part || LPAD(next_num::TEXT, 4, '0');
END;
$$;

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, department)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'ผู้ใช้ใหม่'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'department', '')
  );
  
  -- Assign default role (interviewer) for new users
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'interviewer');
  
  RETURN NEW;
END;
$$;

-- ============================================
-- 3. USER MANAGEMENT TABLES
-- ============================================

-- Profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  department TEXT,
  email TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- User roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Role permissions table
CREATE TABLE IF NOT EXISTS public.role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role TEXT NOT NULL,
  resource TEXT NOT NULL,
  action TEXT NOT NULL,
  allowed BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(role, resource, action)
);

-- ============================================
-- 4. JOB MANAGEMENT TABLES
-- ============================================

-- Job positions table
CREATE TABLE IF NOT EXISTS public.job_positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  department TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'filled', 'closed')),
  required_count INTEGER DEFAULT 1 CHECK (required_count > 0),
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

-- Job requisitions table
CREATE TABLE IF NOT EXISTS public.job_requisitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requisition_number TEXT UNIQUE NOT NULL,
  department TEXT NOT NULL,
  position TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  date_needed DATE NOT NULL,
  work_location TEXT NOT NULL,
  reports_to TEXT NOT NULL,
  hiring_type TEXT NOT NULL CHECK (hiring_type IN ('replacement', 'permanent', 'temporary')),
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
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  requested_by UUID REFERENCES public.profiles(id) NOT NULL,
  jd_file_url TEXT,
  requisition_form_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Requisition approvals table
CREATE TABLE IF NOT EXISTS public.requisition_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requisition_id UUID REFERENCES public.job_requisitions(id) ON DELETE CASCADE NOT NULL,
  approver_id UUID REFERENCES public.profiles(id) NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('approved', 'rejected', 'commented')),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================
-- 5. CANDIDATE MANAGEMENT TABLES
-- ============================================

-- Candidates table
CREATE TABLE IF NOT EXISTS public.candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  source TEXT NOT NULL CHECK (source IN ('LinkedIn', 'Website', 'Referral', 'Job Board', 'Other')),
  stage TEXT DEFAULT 'Pending' CHECK (stage IN ('Pending', 'Interested', 'Shortlist', 'Screening', 'Interview', 'Offer', 'Hired', 'Rejected')),
  ai_fit_score INTEGER CHECK (ai_fit_score >= 0 AND ai_fit_score <= 100),
  resume_url TEXT,
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Candidate details table (full application form data)
CREATE TABLE IF NOT EXISTS public.candidate_details (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  candidate_id UUID NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
  
  -- Job Application Info
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
  
  -- Special Skills
  computer_skill BOOLEAN DEFAULT false,
  driving_car BOOLEAN DEFAULT false,
  driving_car_license_no TEXT,
  driving_motorcycle BOOLEAN DEFAULT false,
  driving_motorcycle_license_no TEXT,
  other_skills TEXT,
  
  -- Training
  training_curriculums TEXT,
  
  -- Other Questions
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
  
  -- Complex data stored as JSONB
  educations JSONB DEFAULT '[]'::jsonb,
  work_experiences JSONB DEFAULT '[]'::jsonb,
  family_members JSONB DEFAULT '[]'::jsonb,
  language_skills JSONB DEFAULT '[]'::jsonb,
  
  -- Privacy consent
  privacy_consent BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Employment records table
CREATE TABLE IF NOT EXISTS public.employment_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID REFERENCES public.candidates(id) ON DELETE CASCADE NOT NULL,
  period_time TEXT,
  company TEXT,
  position TEXT,
  responsibilities TEXT,
  salary NUMERIC,
  reason_for_leaving TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================
-- 6. APPLICATION & INTERVIEW TABLES
-- ============================================

-- Applications table
CREATE TABLE IF NOT EXISTS public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID REFERENCES public.candidates(id) ON DELETE CASCADE NOT NULL,
  position_id UUID REFERENCES public.job_positions(id) ON DELETE CASCADE NOT NULL,
  stage TEXT NOT NULL DEFAULT 'New' CHECK (stage IN ('New', 'Screening', 'Interview', 'Offer', 'Hired', 'Rejected')),
  ai_fit_score INTEGER CHECK (ai_fit_score >= 0 AND ai_fit_score <= 100),
  ai_fit_reasoning TEXT,
  applied_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  notes TEXT,
  UNIQUE(candidate_id, position_id)
);

-- Interviews table
CREATE TABLE IF NOT EXISTS public.interviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES public.applications(id) ON DELETE CASCADE NOT NULL,
  interviewer_id UUID REFERENCES public.profiles(id),
  scheduled_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  result TEXT CHECK (result IN ('passed', 'failed')),
  score INTEGER CHECK (score >= 0 AND score <= 100),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 7. NOTIFICATIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('status_change', 'interview', 'candidate', 'general')),
  candidate_name TEXT,
  old_status TEXT,
  new_status TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ============================================
-- 8. RECRUITMENT COSTS & SETTINGS
-- ============================================

-- Recruitment costs table
CREATE TABLE IF NOT EXISTS public.recruitment_costs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL,
  amount NUMERIC NOT NULL CHECK (amount >= 0),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  CHECK (period_end >= period_start)
);

-- Company settings table
CREATE TABLE IF NOT EXISTS public.company_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT,
  company_email TEXT,
  microsoft_365_connected BOOLEAN DEFAULT false,
  microsoft_365_token TEXT,
  ai_fit_score_weights JSONB DEFAULT '{"skills": 40, "experience": 25, "projects": 15, "education": 10, "other": 10}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================
-- 9. ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_requisitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requisition_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employment_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recruitment_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 10. RLS POLICIES - PROFILES
-- ============================================

-- Admins can do everything with profiles
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can insert profiles"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update profiles"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete profiles"
  ON public.profiles FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- Users can view and update their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid());

-- ============================================
-- 11. RLS POLICIES - USER ROLES
-- ============================================

CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can insert roles"
  ON public.user_roles FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update roles"
  ON public.user_roles FOR UPDATE
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete roles"
  ON public.user_roles FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- ============================================
-- 12. RLS POLICIES - ROLE PERMISSIONS
-- ============================================

CREATE POLICY "Admins can view role permissions"
  ON public.role_permissions FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can insert role permissions"
  ON public.role_permissions FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update role permissions"
  ON public.role_permissions FOR UPDATE
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete role permissions"
  ON public.role_permissions FOR DELETE
  USING (public.is_admin(auth.uid()));

-- ============================================
-- 13. RLS POLICIES - JOB POSITIONS
-- ============================================

CREATE POLICY "HR and managers can view positions"
  ON public.job_positions FOR SELECT
  USING (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'hr_manager'::app_role) OR
    has_role(auth.uid(), 'manager'::app_role) OR
    has_role(auth.uid(), 'recruiter'::app_role)
  );

CREATE POLICY "HR and managers can insert positions"
  ON public.job_positions FOR INSERT
  WITH CHECK (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'hr_manager'::app_role) OR
    has_role(auth.uid(), 'manager'::app_role)
  );

CREATE POLICY "HR and managers can update positions"
  ON public.job_positions FOR UPDATE
  USING (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'hr_manager'::app_role) OR
    has_role(auth.uid(), 'manager'::app_role)
  );

-- ============================================
-- 14. RLS POLICIES - JOB REQUISITIONS
-- ============================================

CREATE POLICY "Anyone can view requisitions"
  ON public.job_requisitions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create requisitions"
  ON public.job_requisitions FOR INSERT
  TO authenticated
  WITH CHECK (requested_by = auth.uid());

CREATE POLICY "Users can update own pending requisitions"
  ON public.job_requisitions FOR UPDATE
  TO authenticated
  USING (requested_by = auth.uid() AND status = 'pending');

CREATE POLICY "Admins and HR can update requisitions"
  ON public.job_requisitions FOR UPDATE
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'hr_manager')
  );

CREATE POLICY "Users can delete own pending requisitions"
  ON public.job_requisitions FOR DELETE
  TO authenticated
  USING (requested_by = auth.uid() AND status = 'pending');

-- ============================================
-- 15. RLS POLICIES - REQUISITION APPROVALS
-- ============================================

CREATE POLICY "Anyone can view approval history"
  ON public.requisition_approvals FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins and HR can add approvals"
  ON public.requisition_approvals FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'hr_manager')
  );

-- ============================================
-- 16. RLS POLICIES - CANDIDATES
-- ============================================

CREATE POLICY "HR and recruiters can view candidates"
  ON public.candidates FOR SELECT
  USING (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'hr_manager'::app_role) OR
    has_role(auth.uid(), 'manager'::app_role) OR
    has_role(auth.uid(), 'recruiter'::app_role) OR
    has_role(auth.uid(), 'interviewer'::app_role)
  );

CREATE POLICY "HR and recruiters can insert candidates"
  ON public.candidates FOR INSERT
  WITH CHECK (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'hr_manager'::app_role) OR
    has_role(auth.uid(), 'recruiter'::app_role)
  );

CREATE POLICY "Public can insert candidates from job application"
  ON public.candidates FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "HR and recruiters can update candidates"
  ON public.candidates FOR UPDATE
  USING (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'hr_manager'::app_role) OR
    has_role(auth.uid(), 'recruiter'::app_role)
  );

CREATE POLICY "Public can update candidates by email"
  ON public.candidates FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- ============================================
-- 17. RLS POLICIES - CANDIDATE DETAILS
-- ============================================

CREATE POLICY "Public can insert candidate details"
  ON public.candidate_details FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public can update candidate details"
  ON public.candidate_details FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "HR and recruiters can view candidate details"
  ON public.candidate_details FOR SELECT
  USING (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'hr_manager'::app_role) OR 
    has_role(auth.uid(), 'manager'::app_role) OR 
    has_role(auth.uid(), 'recruiter'::app_role) OR 
    has_role(auth.uid(), 'interviewer'::app_role)
  );

-- ============================================
-- 18. RLS POLICIES - EMPLOYMENT RECORDS
-- ============================================

CREATE POLICY "Allow authenticated users to view employment records"
  ON public.employment_records FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert employment records"
  ON public.employment_records FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update employment records"
  ON public.employment_records FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to delete employment records"
  ON public.employment_records FOR DELETE
  TO authenticated
  USING (true);

-- ============================================
-- 19. RLS POLICIES - APPLICATIONS
-- ============================================

CREATE POLICY "HR and recruiters can view applications"
  ON public.applications FOR SELECT
  USING (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'hr_manager'::app_role) OR
    has_role(auth.uid(), 'manager'::app_role) OR
    has_role(auth.uid(), 'recruiter'::app_role) OR
    has_role(auth.uid(), 'interviewer'::app_role)
  );

CREATE POLICY "HR and recruiters can insert applications"
  ON public.applications FOR INSERT
  WITH CHECK (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'hr_manager'::app_role) OR
    has_role(auth.uid(), 'recruiter'::app_role)
  );

CREATE POLICY "HR and recruiters can update applications"
  ON public.applications FOR UPDATE
  USING (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'hr_manager'::app_role) OR
    has_role(auth.uid(), 'recruiter'::app_role)
  );

-- ============================================
-- 20. RLS POLICIES - INTERVIEWS
-- ============================================

CREATE POLICY "HR and interviewers can view interviews"
  ON public.interviews FOR SELECT
  USING (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'hr_manager'::app_role) OR
    has_role(auth.uid(), 'manager'::app_role) OR
    has_role(auth.uid(), 'recruiter'::app_role) OR
    has_role(auth.uid(), 'interviewer'::app_role)
  );

CREATE POLICY "HR and recruiters can insert interviews"
  ON public.interviews FOR INSERT
  WITH CHECK (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'hr_manager'::app_role) OR
    has_role(auth.uid(), 'recruiter'::app_role)
  );

CREATE POLICY "HR and interviewers can update interviews"
  ON public.interviews FOR UPDATE
  USING (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'hr_manager'::app_role) OR
    has_role(auth.uid(), 'recruiter'::app_role) OR
    (has_role(auth.uid(), 'interviewer'::app_role) AND interviewer_id = auth.uid())
  );

-- ============================================
-- 21. RLS POLICIES - NOTIFICATIONS
-- ============================================

CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "HR and recruiters can insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'hr_manager'::app_role) OR 
    has_role(auth.uid(), 'recruiter'::app_role)
  );

CREATE POLICY "Users can update their own notifications"
  ON public.notifications FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own notifications"
  ON public.notifications FOR DELETE
  USING (user_id = auth.uid());

-- ============================================
-- 22. RLS POLICIES - RECRUITMENT COSTS
-- ============================================

CREATE POLICY "HR and managers can view costs"
  ON public.recruitment_costs FOR SELECT
  USING (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'hr_manager'::app_role) OR
    has_role(auth.uid(), 'manager'::app_role)
  );

CREATE POLICY "HR and managers can insert costs"
  ON public.recruitment_costs FOR INSERT
  WITH CHECK (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'hr_manager'::app_role) OR
    has_role(auth.uid(), 'manager'::app_role)
  );

CREATE POLICY "HR and managers can update costs"
  ON public.recruitment_costs FOR UPDATE
  USING (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'hr_manager'::app_role) OR
    has_role(auth.uid(), 'manager'::app_role)
  );

-- ============================================
-- 23. RLS POLICIES - COMPANY SETTINGS
-- ============================================

CREATE POLICY "Admins and HR can view settings"
  ON public.company_settings FOR SELECT
  TO authenticated
  USING (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'hr_manager'::app_role)
  );

CREATE POLICY "Admins and HR can update settings"
  ON public.company_settings FOR UPDATE
  TO authenticated
  USING (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'hr_manager'::app_role)
  );

CREATE POLICY "Admins and HR can insert settings"
  ON public.company_settings FOR INSERT
  TO authenticated
  WITH CHECK (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'hr_manager'::app_role)
  );

-- ============================================
-- 24. CREATE TRIGGERS
-- ============================================

-- Trigger for auth.users to create profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Triggers for updated_at columns
DROP TRIGGER IF EXISTS on_profiles_updated ON public.profiles;
CREATE TRIGGER on_profiles_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS update_role_permissions_updated_at ON public.role_permissions;
CREATE TRIGGER update_role_permissions_updated_at
  BEFORE UPDATE ON public.role_permissions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS update_job_positions_updated_at ON public.job_positions;
CREATE TRIGGER update_job_positions_updated_at
  BEFORE UPDATE ON public.job_positions
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS on_job_requisitions_updated ON public.job_requisitions;
CREATE TRIGGER on_job_requisitions_updated
  BEFORE UPDATE ON public.job_requisitions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS update_candidates_updated_at ON public.candidates;
CREATE TRIGGER update_candidates_updated_at
  BEFORE UPDATE ON public.candidates
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS update_candidate_details_updated_at ON public.candidate_details;
CREATE TRIGGER update_candidate_details_updated_at
  BEFORE UPDATE ON public.candidate_details
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS on_employment_records_updated ON public.employment_records;
CREATE TRIGGER on_employment_records_updated
  BEFORE UPDATE ON public.employment_records
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS update_applications_updated_at ON public.applications;
CREATE TRIGGER update_applications_updated_at
  BEFORE UPDATE ON public.applications
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS update_interviews_updated_at ON public.interviews;
CREATE TRIGGER update_interviews_updated_at
  BEFORE UPDATE ON public.interviews
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS update_company_settings_updated_at ON public.company_settings;
CREATE TRIGGER update_company_settings_updated_at
  BEFORE UPDATE ON public.company_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- 25. CREATE INDEXES FOR PERFORMANCE
-- ============================================

-- Indexes for candidate_details
CREATE INDEX IF NOT EXISTS idx_candidate_details_candidate_id ON public.candidate_details(candidate_id);

-- Indexes for employment_records
CREATE INDEX IF NOT EXISTS idx_employment_records_candidate_id ON public.employment_records(candidate_id);

-- Indexes for applications
CREATE INDEX IF NOT EXISTS idx_applications_candidate_id ON public.applications(candidate_id);
CREATE INDEX IF NOT EXISTS idx_applications_position_id ON public.applications(position_id);
CREATE INDEX IF NOT EXISTS idx_applications_stage ON public.applications(stage);
CREATE INDEX IF NOT EXISTS idx_applications_ai_fit_score ON public.applications(ai_fit_score DESC);

-- Indexes for interviews
CREATE INDEX IF NOT EXISTS idx_interviews_application_id ON public.interviews(application_id);
CREATE INDEX IF NOT EXISTS idx_interviews_interviewer_id ON public.interviews(interviewer_id);

-- Indexes for candidates
CREATE INDEX IF NOT EXISTS idx_candidates_source ON public.candidates(source);
CREATE INDEX IF NOT EXISTS idx_candidates_stage ON public.candidates(stage);

-- Indexes for job_positions
CREATE INDEX IF NOT EXISTS idx_job_positions_status ON public.job_positions(status);
CREATE INDEX IF NOT EXISTS idx_job_positions_department ON public.job_positions(department);

-- Indexes for job_requisitions
CREATE INDEX IF NOT EXISTS idx_job_requisitions_status ON public.job_requisitions(status);
CREATE INDEX IF NOT EXISTS idx_job_requisitions_requested_by ON public.job_requisitions(requested_by);

-- Indexes for requisition_approvals
CREATE INDEX IF NOT EXISTS idx_requisition_approvals_requisition_id ON public.requisition_approvals(requisition_id);

-- Indexes for notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- ============================================
-- 26. STORAGE BUCKETS SETUP
-- ============================================

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('resumes', 'resumes', true, 52428800, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']),
  ('profile-photos', 'profile-photos', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']),
  ('job-descriptions', 'job-descriptions', true, 52428800, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ============================================
-- 27. STORAGE POLICIES
-- ============================================

-- Policies for resumes bucket
DROP POLICY IF EXISTS "Anyone can upload resumes" ON storage.objects;
CREATE POLICY "Anyone can upload resumes"
  ON storage.objects FOR INSERT
  TO public
  WITH CHECK (bucket_id = 'resumes');

DROP POLICY IF EXISTS "Public can upload resumes" ON storage.objects;
CREATE POLICY "Public can upload resumes"
  ON storage.objects FOR INSERT
  TO anon
  WITH CHECK (bucket_id = 'resumes');

DROP POLICY IF EXISTS "Anyone can view resumes" ON storage.objects;
CREATE POLICY "Anyone can view resumes"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'resumes');

DROP POLICY IF EXISTS "Users can update their own resumes" ON storage.objects;
CREATE POLICY "Users can update their own resumes"
  ON storage.objects FOR UPDATE
  TO public
  USING (bucket_id = 'resumes');

DROP POLICY IF EXISTS "Users can delete their own resumes" ON storage.objects;
CREATE POLICY "Users can delete their own resumes"
  ON storage.objects FOR DELETE
  TO public
  USING (bucket_id = 'resumes');

-- Policies for profile-photos bucket
DROP POLICY IF EXISTS "Anyone can upload profile photos" ON storage.objects;
CREATE POLICY "Anyone can upload profile photos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'profile-photos');

DROP POLICY IF EXISTS "Public can upload profile photos" ON storage.objects;
CREATE POLICY "Public can upload profile photos"
  ON storage.objects FOR INSERT
  TO anon
  WITH CHECK (bucket_id = 'profile-photos');

DROP POLICY IF EXISTS "Anyone can view profile photos" ON storage.objects;
CREATE POLICY "Anyone can view profile photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'profile-photos');

-- Policies for job-descriptions bucket
DROP POLICY IF EXISTS "Allow public uploads for job-descriptions" ON storage.objects;
CREATE POLICY "Allow public uploads for job-descriptions"
  ON storage.objects FOR INSERT 
  WITH CHECK (bucket_id = 'job-descriptions');

DROP POLICY IF EXISTS "Allow public access for job-descriptions" ON storage.objects;
CREATE POLICY "Allow public access for job-descriptions"
  ON storage.objects FOR SELECT 
  USING (bucket_id = 'job-descriptions');

DROP POLICY IF EXISTS "Authenticated users can view JD files" ON storage.objects;
CREATE POLICY "Authenticated users can view JD files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'job-descriptions' 
    AND auth.role() = 'authenticated'
  );

DROP POLICY IF EXISTS "Users can upload their own JD files" ON storage.objects;
CREATE POLICY "Users can upload their own JD files"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'job-descriptions'
    AND auth.role() = 'authenticated'
  );

DROP POLICY IF EXISTS "Users can update their own JD files" ON storage.objects;
CREATE POLICY "Users can update their own JD files"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'job-descriptions'
    AND auth.role() = 'authenticated'
  );

DROP POLICY IF EXISTS "Admins and HR can delete JD files" ON storage.objects;
CREATE POLICY "Admins and HR can delete JD files"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'job-descriptions'
    AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'hr_manager'::app_role))
  );

-- ============================================
-- 28. INSERT DEFAULT DATA
-- ============================================

-- Insert default company settings
INSERT INTO public.company_settings (company_name, company_email)
VALUES ('บริษัท ABC จำกัด', 'hr@company.com')
ON CONFLICT DO NOTHING;

-- ============================================
-- 29. COMMENTS ON COLUMNS
-- ============================================

COMMENT ON COLUMN public.applications.ai_fit_score IS 'AI-calculated fit score (0-100) between candidate and job position';
COMMENT ON COLUMN public.applications.ai_fit_reasoning IS 'AI-generated reasoning for the fit score';
COMMENT ON COLUMN public.job_positions.salary IS 'Salary information for the job position (e.g., "25,000-30,000 บาท", "ตามตกลง", "Negotiable")';
COMMENT ON COLUMN public.job_requisitions.jd_file_url IS 'URL path to uploaded Job Description file';
COMMENT ON COLUMN public.job_requisitions.requisition_form_url IS 'URL path to uploaded Requisition Form file';
COMMENT ON COLUMN public.job_requisitions.job_grade IS 'Job Grade level (e.g., JG 1.1 Staff, JG 2.1 Senior)';
COMMENT ON COLUMN public.job_requisitions.job_duties IS 'Detailed job duties and responsibilities';
COMMENT ON COLUMN public.job_requisitions.salary IS 'Salary information (e.g., "25,000-30,000 บาท", "ตามตกลง", "Negotiable")';

-- ============================================
-- END OF SCHEMA
-- ============================================
