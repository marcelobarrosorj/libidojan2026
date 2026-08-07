ALTER TABLE IF EXISTS public.messages ADD COLUMN IF NOT EXISTS status text DEFAULT 'sent';
