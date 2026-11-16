ALTER TABLE public.users ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_verified boolean DEFAULT false;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS vip_expires_at timestamptz;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS trial_messages_sent int DEFAULT 0;
NOTIFY pgrst, 'reload schema';