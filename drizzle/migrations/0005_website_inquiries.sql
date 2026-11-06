CREATE TABLE public.inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  occasion text NOT NULL DEFAULT '',
  event_date date,
  message text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'new',
  notes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.inquiries TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.inquiries TO authenticated;
GRANT ALL ON public.inquiries TO service_role;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can send an inquiry" ON public.inquiries FOR INSERT TO anon, authenticated
  WITH CHECK (status = 'new' AND notes = '');
CREATE POLICY "Admins read inquiries" ON public.inquiries FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update inquiries" ON public.inquiries FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete inquiries" ON public.inquiries FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE OR REPLACE FUNCTION public.validate_inquiry() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF length(trim(NEW.name)) = 0 OR length(NEW.name) > 100 THEN RAISE EXCEPTION 'Name is required (max 100 chars)'; END IF;
  IF length(NEW.phone) > 30 OR length(NEW.email) > 255 OR length(NEW.occasion) > 50 OR length(NEW.message) > 2000 OR length(NEW.notes) > 2000 THEN RAISE EXCEPTION 'Text too long'; END IF;
  IF length(trim(NEW.phone)) = 0 AND length(trim(NEW.email)) = 0 THEN RAISE EXCEPTION 'Phone or email is required'; END IF;
  IF NEW.status NOT IN ('new','contacted','converted','closed') THEN RAISE EXCEPTION 'Invalid status'; END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER validate_inquiry BEFORE INSERT OR UPDATE ON public.inquiries FOR EACH ROW EXECUTE FUNCTION public.validate_inquiry();
CREATE TRIGGER update_inquiries BEFORE UPDATE ON public.inquiries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();