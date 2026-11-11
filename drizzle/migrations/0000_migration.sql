CREATE SEQUENCE IF NOT EXISTS public.admission_ref_seq;
CREATE TABLE public.admission_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_number text NOT NULL UNIQUE DEFAULT ('SMHS-2026-' || lpad(nextval('public.admission_ref_seq')::text, 4, '0')),
  student_name text NOT NULL,
  parent_name text NOT NULL,
  mobile text NOT NULL,
  alt_mobile text,
  email text,
  address text,
  class_applying text,
  message text,
  source text NOT NULL DEFAULT 'quick',
  status text NOT NULL DEFAULT 'New',
  email_status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.admission_applications TO anon, authenticated;
GRANT SELECT, UPDATE ON public.admission_applications TO authenticated;
GRANT ALL ON public.admission_applications TO service_role;
GRANT USAGE ON SEQUENCE public.admission_ref_seq TO anon, authenticated, service_role;
ALTER TABLE public.admission_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can apply" ON public.admission_applications FOR INSERT TO anon, authenticated
  WITH CHECK (status = 'New' AND length(student_name) BETWEEN 1 AND 100 AND length(parent_name) BETWEEN 1 AND 100 AND length(mobile) BETWEEN 10 AND 15);
CREATE POLICY "Admins read applications" ON public.admission_applications FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins update applications" ON public.admission_applications FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));