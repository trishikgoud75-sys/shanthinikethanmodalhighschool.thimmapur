CREATE TABLE public.leadership (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  designation text NOT NULL DEFAULT '',
  photo_url text,
  sort_order integer NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT true,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.leadership TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.leadership TO authenticated;
GRANT ALL ON public.leadership TO service_role;

ALTER TABLE public.leadership ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Leadership is public" ON public.leadership FOR SELECT USING (published OR has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins insert leadership" ON public.leadership FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins update leadership" ON public.leadership FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins delete leadership" ON public.leadership FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER leadership_updated_at BEFORE UPDATE ON public.leadership FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();