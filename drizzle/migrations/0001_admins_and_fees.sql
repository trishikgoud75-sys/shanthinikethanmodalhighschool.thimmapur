-- Admin emails table: source of truth for who may edit site content
CREATE TABLE public.admins (
  email TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.admins TO authenticated;
GRANT ALL ON public.admins TO service_role;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "signed-in users can read admins" ON public.admins FOR SELECT TO authenticated USING (true);

-- Admin check by the signed-in user's email (security definer bypasses RLS on admins)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admins
    WHERE email = lower(coalesce(auth.jwt() ->> 'email', ''))
  )
$$;

-- Class-wise fee structure, edited by admins
CREATE TABLE public.fees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_name TEXT NOT NULL,
  amount TEXT NOT NULL DEFAULT 'To be updated',
  sort_order INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.fees TO anon, authenticated;
GRANT ALL ON public.fees TO service_role;
ALTER TABLE public.fees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "everyone can read fees" ON public.fees FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admins update fees" ON public.fees FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "admins insert fees" ON public.fees FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "admins delete fees" ON public.fees FOR DELETE TO authenticated USING (public.is_admin());

-- Let admin emails (in addition to the existing role system) manage all content tables
CREATE POLICY "admin emails manage faculty" ON public.faculty FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "admin emails manage events" ON public.events FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "admin emails manage notices" ON public.notices FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "admin emails manage gallery images" ON public.gallery_images FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "admin emails manage gallery albums" ON public.gallery_albums FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "admin emails manage leadership" ON public.leadership FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "admin emails manage site content" ON public.site_content FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Media bucket: admin emails may upload/replace/delete files
CREATE POLICY "admin emails upload media" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'school-media' AND public.is_admin());
CREATE POLICY "admin emails update media" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'school-media' AND public.is_admin());
CREATE POLICY "admin emails delete media" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'school-media' AND public.is_admin());