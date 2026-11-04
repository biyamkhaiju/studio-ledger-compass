ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS invitation_category text;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS event_date date;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS event_time text NOT NULL DEFAULT '';
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS event_venue text NOT NULL DEFAULT '';
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS hosts text NOT NULL DEFAULT '';
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS invitation_message text NOT NULL DEFAULT '';
UPDATE public.projects SET invitation_category = 'wedding' WHERE division = 'wedding' AND invitation_category IS NULL;
ALTER TABLE public.projects ADD CONSTRAINT projects_invitation_category_check CHECK (invitation_category IS NULL OR invitation_category IN ('wedding','anniversary','baby_born','bartabandha'));

CREATE TABLE public.invitation_guests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name text NOT NULL,
  relation text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  slug text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT invitation_guests_name_check CHECK (length(btrim(name)) BETWEEN 1 AND 200),
  CONSTRAINT invitation_guests_relation_check CHECK (length(relation) <= 200),
  CONSTRAINT invitation_guests_phone_check CHECK (length(phone) <= 50),
  CONSTRAINT invitation_guests_slug_check CHECK (slug ~ '^[^/?#[:space:]]{3,160}$')
);
CREATE INDEX invitation_guests_project ON public.invitation_guests(project_id);
CREATE INDEX invitation_guests_owner ON public.invitation_guests(user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.invitation_guests TO authenticated;
GRANT ALL ON public.invitation_guests TO service_role;
ALTER TABLE public.invitation_guests ENABLE ROW LEVEL SECURITY;
CREATE POLICY guest_owner ON public.invitation_guests FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid() AND EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.user_id = auth.uid()));

CREATE TRIGGER invitation_guests_updated_at BEFORE UPDATE ON public.invitation_guests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Public read of one invitation by its link; returns only what the invitation card shows.
CREATE OR REPLACE FUNCTION public.get_invitation(_slug text)
RETURNS TABLE(guest_name text, relation text, category text, hosts text, event_date date, event_time text, event_venue text, message text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT g.name, g.relation, coalesce(p.invitation_category, 'wedding'),
         coalesce(nullif(btrim(p.hosts), ''), c.name, ''), p.event_date, p.event_time, p.event_venue, p.invitation_message
  FROM public.invitation_guests g
  JOIN public.projects p ON p.id = g.project_id
  LEFT JOIN public.clients c ON c.id = p.client_id
  WHERE g.slug = _slug AND p.division = 'wedding' AND p.status <> 'cancelled'
  LIMIT 1
$$;
REVOKE ALL ON FUNCTION public.get_invitation(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_invitation(text) TO anon, authenticated;