-- Create company_settings table
CREATE TABLE IF NOT EXISTS public.company_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text,
  company_email text,
  microsoft_365_connected boolean DEFAULT false,
  microsoft_365_token text,
  ai_fit_score_weights jsonb DEFAULT '{"skills": 40, "experience": 25, "projects": 15, "education": 10, "other": 10}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;

-- Create policies - admins and HR managers can manage settings
CREATE POLICY "Admins and HR can view settings"
  ON public.company_settings
  FOR SELECT
  TO authenticated
  USING (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'hr_manager'::app_role)
  );

CREATE POLICY "Admins and HR can update settings"
  ON public.company_settings
  FOR UPDATE
  TO authenticated
  USING (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'hr_manager'::app_role)
  );

CREATE POLICY "Admins and HR can insert settings"
  ON public.company_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'hr_manager'::app_role)
  );

-- Create trigger for updated_at
CREATE TRIGGER update_company_settings_updated_at
  BEFORE UPDATE ON public.company_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Insert default settings if none exist
INSERT INTO public.company_settings (company_name, company_email)
VALUES ('บริษัท ABC จำกัด', 'hr@company.com')
ON CONFLICT DO NOTHING;