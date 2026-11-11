CREATE TABLE public.feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL CHECK (category IN ('faculty','facilities','school')),
  name text,
  mobile text,
  email text,
  message text NOT NULL,
  email_status text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, DELETE ON public.feedback TO authenticated;
GRANT ALL ON public.feedback TO service_role;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins read feedback" ON public.feedback FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "admins delete feedback" ON public.feedback FOR DELETE TO authenticated USING (public.is_admin());