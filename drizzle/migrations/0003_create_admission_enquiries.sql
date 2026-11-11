CREATE TABLE public.admission_enquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_name TEXT NOT NULL,
  father_name TEXT NOT NULL,
  mother_name TEXT NOT NULL,
  mobile TEXT NOT NULL,
  alt_mobile TEXT,
  email TEXT,
  class_applying TEXT NOT NULL,
  email_status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT INSERT ON public.admission_enquiries TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.admission_enquiries TO authenticated;
GRANT ALL ON public.admission_enquiries TO service_role;

ALTER TABLE public.admission_enquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit an enquiry"
  ON public.admission_enquiries FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can read enquiries"
  ON public.admission_enquiries FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can update enquiries"
  ON public.admission_enquiries FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete enquiries"
  ON public.admission_enquiries FOR DELETE
  TO authenticated
  USING (public.is_admin());