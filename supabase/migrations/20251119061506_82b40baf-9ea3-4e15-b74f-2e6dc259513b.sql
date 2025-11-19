-- Add 'manager' to app_role enum
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'app_role' AND e.enumlabel = 'manager'
  ) THEN
    ALTER TYPE public.app_role ADD VALUE 'manager';
  END IF;
END $$;

-- Create role_permissions table for granular permission control
CREATE TABLE IF NOT EXISTS public.role_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role text NOT NULL, -- Using text instead of enum to avoid transaction issue
  resource text NOT NULL, -- 'home', 'jobs', 'job_application', etc.
  action text NOT NULL, -- 'view', 'create', 'edit', 'delete'
  allowed boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(role, resource, action)
);

-- Enable RLS on role_permissions
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

-- RLS policies: only admins can manage role permissions
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

-- Add trigger for updated_at
CREATE TRIGGER update_role_permissions_updated_at
BEFORE UPDATE ON public.role_permissions
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();