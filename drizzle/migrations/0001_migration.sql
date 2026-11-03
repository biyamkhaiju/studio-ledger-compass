CREATE TABLE public.workers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  role text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'available',
  photo_path text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.workers TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.workers TO authenticated;
GRANT ALL ON public.workers TO service_role;
ALTER TABLE public.workers ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.validate_worker() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.status NOT IN ('available','working','on_leave') THEN RAISE EXCEPTION 'Invalid worker status'; END IF;
  IF length(trim(NEW.name)) = 0 OR length(NEW.name) > 100 THEN RAISE EXCEPTION 'Name is required (max 100 chars)'; END IF;
  IF length(NEW.role) > 100 OR length(NEW.description) > 500 THEN RAISE EXCEPTION 'Text too long'; END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER validate_worker BEFORE INSERT OR UPDATE ON public.workers FOR EACH ROW EXECUTE FUNCTION public.validate_worker();
CREATE TRIGGER update_workers_updated_at BEFORE UPDATE ON public.workers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Anyone can view workers" ON public.workers FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins can add workers" ON public.workers FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can edit workers" ON public.workers FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete workers" ON public.workers FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can view worker photos" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'worker-photos');
CREATE POLICY "Admins can upload worker photos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'worker-photos' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update worker photos" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'worker-photos' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete worker photos" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'worker-photos' AND public.has_role(auth.uid(), 'admin'));