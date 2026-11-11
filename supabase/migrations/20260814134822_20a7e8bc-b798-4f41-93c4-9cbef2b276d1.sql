CREATE POLICY "Anyone can read school media"
  ON storage.objects FOR SELECT USING (bucket_id = 'school-media');
CREATE POLICY "Admins can upload school media"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'school-media' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins can update school media"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'school-media' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins can delete school media"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'school-media' AND public.has_role(auth.uid(),'admin'));