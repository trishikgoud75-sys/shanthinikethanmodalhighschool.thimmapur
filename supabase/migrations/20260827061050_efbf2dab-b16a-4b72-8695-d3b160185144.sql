ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'teacher';

CREATE TABLE public.faculty (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  designation text NOT NULL DEFAULT '',
  subject text NOT NULL DEFAULT '',
  qualification text NOT NULL DEFAULT '',
  experience text NOT NULL DEFAULT '',
  bio text NOT NULL DEFAULT '',
  photo_url text,
  contact_email text,
  contact_phone text,
  sort_order integer NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT true,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.faculty TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.faculty TO authenticated;
GRANT ALL ON public.faculty TO service_role;
ALTER TABLE public.faculty ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published faculty are public" ON public.faculty FOR SELECT USING (published OR has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins insert faculty" ON public.faculty FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins update faculty" ON public.faculty FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins delete faculty" ON public.faculty FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE TRIGGER faculty_updated_at BEFORE UPDATE ON public.faculty FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  event_date date NOT NULL DEFAULT CURRENT_DATE,
  location text NOT NULL DEFAULT '',
  image_url text,
  published boolean NOT NULL DEFAULT true,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.events TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.events TO authenticated;
GRANT ALL ON public.events TO service_role;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published events are public" ON public.events FOR SELECT USING (published OR has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins insert events" ON public.events FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins update events" ON public.events FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins delete events" ON public.events FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE TRIGGER events_updated_at BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.site_content (
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_content TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_content TO authenticated;
GRANT ALL ON public.site_content TO service_role;
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Site content is public" ON public.site_content FOR SELECT USING (true);
CREATE POLICY "Admins insert site content" ON public.site_content FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins update site content" ON public.site_content FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins delete site content" ON public.site_content FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE TRIGGER site_content_updated_at BEFORE UPDATE ON public.site_content FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.gallery_albums (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text NOT NULL DEFAULT '',
  cover_url text,
  sort_order integer NOT NULL DEFAULT 0,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.gallery_albums TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.gallery_albums TO authenticated;
GRANT ALL ON public.gallery_albums TO service_role;
ALTER TABLE public.gallery_albums ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Albums are public" ON public.gallery_albums FOR SELECT USING (true);
CREATE POLICY "Admins insert albums" ON public.gallery_albums FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins update albums" ON public.gallery_albums FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins delete albums" ON public.gallery_albums FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE TRIGGER gallery_albums_updated_at BEFORE UPDATE ON public.gallery_albums FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.notices
  ADD COLUMN IF NOT EXISTS published boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS expires_at date;

ALTER TABLE public.gallery_images
  ADD COLUMN IF NOT EXISTS published boolean NOT NULL DEFAULT true;

INSERT INTO public.gallery_albums (name, description, sort_order) VALUES
  ('School Campus', 'Our grounds and buildings', 1),
  ('Classrooms', 'Everyday learning', 2),
  ('Laboratories', 'Science and computer labs', 3),
  ('Library', 'Reading and research', 4),
  ('Sports', 'Games and athletics', 5),
  ('Cultural Events', 'Celebrations and performances', 6),
  ('Annual Day', 'Annual day highlights', 7),
  ('Independence Day', '15th August celebrations', 8),
  ('Republic Day', '26th January celebrations', 9),
  ('Student Activities', 'Clubs, projects and workshops', 10),
  ('School Events', 'Assemblies, visits and more', 11)
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.site_content (key, value) VALUES
  ('homepage', '{"hero_title":"Shanthinikethan Model High School","hero_subtitle":"Empowering Young Minds for a Brighter Future","hero_location":"Thimmapur Village, Kothur Mandal, Rangareddy District","hero_pin":"509325","highlights":[{"title":"Academic excellence","text":"A focused curriculum with regular assessment and personal mentoring."},{"title":"Caring teachers","text":"Every student is known by name and supported individually."},{"title":"Beyond the classroom","text":"Sports, culture, labs and library for all-round growth."}]}'::jsonb),
  ('about', '{"description":"Shanthinikethan Model High School is committed to creating a positive learning environment where students develop knowledge, creativity, discipline and confidence.","mission":"To nurture curious, responsible and confident learners through quality teaching and personal care.","vision":"To be a school where every child discovers their strengths and is prepared for a brighter future.","principal_message":"We welcome you to our school family. Our teachers work closely with every child so learning is joyful, disciplined and meaningful.","history":"The school has served the families of Thimmapur and neighbouring villages for many years, growing steadily in strength and facilities."}'::jsonb),
  ('admissions', '{"intro":"Admissions are open for the coming academic year. Visit the school office for application forms and guidance.","requirements":["Birth certificate copy","Transfer certificate from previous school","Progress report of last class","Four passport size photographs","Aadhaar copy of student and parent"],"dates":[{"label":"Application forms available","value":"March onwards"},{"label":"Interaction and admission","value":"April - June"},{"label":"Academic year begins","value":"June"}],"contact":"Visit the school office at Thimmapur Village, Kothur Mandal, Rangareddy District, Telangana 509325 (near the railway station)."}'::jsonb),
  ('contact', '{"phone":"","email":"","address_lines":["Thimmapur Village","Kothur Mandal","Rangareddy District","Telangana, India","PIN Code: 509325","Near Railway Station"],"map_query":"Shanthinikethan Model High School, Thimmapur Village, Kothur Mandal, Rangareddy District, Telangana 509325","social":[]}'::jsonb)
ON CONFLICT (key) DO NOTHING;