ALTER TABLE public.users ADD COLUMN IF NOT EXISTS spotlight_expires_at timestamptz;
NOTIFY pgrst, 'reload schema';