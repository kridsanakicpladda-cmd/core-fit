-- Add column for requisition form file URL
ALTER TABLE public.job_requisitions 
ADD COLUMN requisition_form_url text;