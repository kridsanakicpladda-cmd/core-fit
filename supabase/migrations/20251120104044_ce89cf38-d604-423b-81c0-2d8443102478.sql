-- Create job_positions table
CREATE TABLE public.job_positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  department TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'filled', 'closed')),
  required_count INTEGER DEFAULT 1 CHECK (required_count > 0),
  start_date DATE NOT NULL,
  end_date DATE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create candidates table
CREATE TABLE public.candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  source TEXT NOT NULL CHECK (source IN ('LinkedIn', 'Website', 'Referral', 'Job Board', 'Other')),
  ai_fit_score INTEGER CHECK (ai_fit_score >= 0 AND ai_fit_score <= 100),
  resume_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create applications table (connects candidates to positions)
CREATE TABLE public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID REFERENCES public.candidates(id) ON DELETE CASCADE NOT NULL,
  position_id UUID REFERENCES public.job_positions(id) ON DELETE CASCADE NOT NULL,
  stage TEXT NOT NULL DEFAULT 'New' CHECK (stage IN ('New', 'Screening', 'Interview', 'Offer', 'Hired', 'Rejected')),
  applied_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  notes TEXT,
  UNIQUE(candidate_id, position_id)
);

-- Create interviews table
CREATE TABLE public.interviews (
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

-- Create recruitment_costs table
CREATE TABLE public.recruitment_costs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL,
  amount NUMERIC NOT NULL CHECK (amount >= 0),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  CHECK (period_end >= period_start)
);

-- Enable RLS on all tables
ALTER TABLE public.job_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recruitment_costs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for job_positions
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

-- RLS Policies for candidates
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

CREATE POLICY "HR and recruiters can update candidates"
ON public.candidates FOR UPDATE
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'hr_manager'::app_role) OR
  has_role(auth.uid(), 'recruiter'::app_role)
);

-- RLS Policies for applications
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

-- RLS Policies for interviews
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

-- RLS Policies for recruitment_costs
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

-- Create triggers for updated_at
CREATE TRIGGER update_job_positions_updated_at
BEFORE UPDATE ON public.job_positions
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_candidates_updated_at
BEFORE UPDATE ON public.candidates
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_applications_updated_at
BEFORE UPDATE ON public.applications
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_interviews_updated_at
BEFORE UPDATE ON public.interviews
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create indexes for better performance
CREATE INDEX idx_applications_candidate_id ON public.applications(candidate_id);
CREATE INDEX idx_applications_position_id ON public.applications(position_id);
CREATE INDEX idx_applications_stage ON public.applications(stage);
CREATE INDEX idx_interviews_application_id ON public.interviews(application_id);
CREATE INDEX idx_interviews_interviewer_id ON public.interviews(interviewer_id);
CREATE INDEX idx_candidates_source ON public.candidates(source);
CREATE INDEX idx_job_positions_status ON public.job_positions(status);
CREATE INDEX idx_job_positions_department ON public.job_positions(department);