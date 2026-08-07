-- Ensure extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Reconcile public.users
DO $$ BEGIN
  ALTER TABLE public.users ADD COLUMN IF NOT EXISTS premium boolean default false;
  ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role text default 'user';
  ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_banned boolean default false;
  ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_deleted boolean default false;
  ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_online boolean default false;
  ALTER TABLE public.users ADD COLUMN IF NOT EXISTS created_at timestamptz default now();
EXCEPTION
  WHEN duplicate_column THEN null;
END $$;

-- 1.a. Ensure user_id uniqueness
DO $$ 
DECLARE
  v_has_nulls boolean;
  v_has_duplicates boolean;
  v_has_unique_constraint boolean;
BEGIN
  -- Check for nulls
  SELECT EXISTS (SELECT 1 FROM public.users WHERE user_id IS NULL) INTO v_has_nulls;
  IF v_has_nulls THEN
    RAISE EXCEPTION 'Cannot enforce uniqueness: user_id contains NULL values';
  END IF;

  -- Check for duplicates
  SELECT EXISTS (
    SELECT user_id 
    FROM public.users 
    GROUP BY user_id 
    HAVING COUNT(*) > 1
  ) INTO v_has_duplicates;
  IF v_has_duplicates THEN
    RAISE EXCEPTION 'Cannot enforce uniqueness: user_id contains duplicate values';
  END IF;

  -- Check for existing unique constraint or index
  SELECT EXISTS (
    SELECT 1 
    FROM pg_constraint c
    JOIN pg_class t ON c.conrelid = t.oid
    JOIN pg_namespace n ON t.relnamespace = n.oid
    JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY(c.conkey)
    WHERE n.nspname = 'public' 
      AND t.relname = 'users' 
      AND a.attname = 'user_id'
      AND c.contype IN ('p', 'u')
      AND array_length(c.conkey, 1) = 1
  ) OR EXISTS (
    SELECT 1
    FROM pg_index i
    JOIN pg_class t ON i.indrelid = t.oid
    JOIN pg_namespace n ON t.relnamespace = n.oid
    JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY(i.indkey)
    WHERE n.nspname = 'public' 
      AND t.relname = 'users' 
      AND a.attname = 'user_id'
      AND i.indisunique = true
      AND i.indnatts = 1
  ) INTO v_has_unique_constraint;

  -- Create unique index if none exists
  IF NOT v_has_unique_constraint THEN
    CREATE UNIQUE INDEX idx_users_user_id_unique ON public.users(user_id);
    ALTER TABLE public.users ADD CONSTRAINT users_user_id_unique UNIQUE USING INDEX idx_users_user_id_unique;
  END IF;
END $$;

-- 2. Reconcile public.messages
DO $$ BEGIN
  ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS status text default 'sent';
  ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS updated_at timestamptz default now();
EXCEPTION
  WHEN duplicate_column THEN null;
END $$;

CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON public.messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(sender_id, receiver_id);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'messages_sender_id_fkey') THEN
    ALTER TABLE public.messages ADD CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES auth.users(id) NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'messages_receiver_id_fkey') THEN
    ALTER TABLE public.messages ADD CONSTRAINT messages_receiver_id_fkey FOREIGN KEY (receiver_id) REFERENCES auth.users(id) NOT VALID;
  END IF;
END $$;

-- 3. Reconcile public.posts
CREATE TABLE IF NOT EXISTS public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  image text,
  text text,
  likes integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
-- We use NOT VALID for the constraint to avoid failing on existing bad data if any
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'posts_user_id_fkey') THEN
    ALTER TABLE public.posts ADD CONSTRAINT posts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) NOT VALID;
  END IF;
END $$;

-- 4. Reconcile public.reports
CREATE TABLE IF NOT EXISTS public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id text not null,
  target_id text not null,
  reason text not null,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);
CREATE INDEX IF NOT EXISTS idx_reports_reporter_id ON public.reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_reports_target_id ON public.reports(target_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON public.reports(created_at);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'reports_reporter_id_fkey') THEN
    ALTER TABLE public.reports ADD CONSTRAINT reports_reporter_id_fkey FOREIGN KEY (reporter_id) REFERENCES public.users(user_id) NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'reports_target_id_fkey') THEN
    ALTER TABLE public.reports ADD CONSTRAINT reports_target_id_fkey FOREIGN KEY (target_id) REFERENCES public.users(user_id) NOT VALID;
  END IF;
END $$;

-- 5. Reconcile public.admin_logs
CREATE TABLE IF NOT EXISTS public.admin_logs (
  id uuid primary key default gen_random_uuid(),
  admin_id text not null,
  action text not null,
  target_id text,
  created_at timestamptz not null default now()
);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'admin_logs_admin_id_fkey') THEN
    ALTER TABLE public.admin_logs ADD CONSTRAINT admin_logs_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES public.users(user_id) NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'admin_logs_target_id_fkey') THEN
    ALTER TABLE public.admin_logs ADD CONSTRAINT admin_logs_target_id_fkey FOREIGN KEY (target_id) REFERENCES public.users(user_id) NOT VALID;
  END IF;
END $$;

-- 6. Reconcile public.payment_transactions
CREATE TABLE IF NOT EXISTS public.payment_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  payment_id text unique,
  provider text not null default 'manual',
  status text not null default 'pending',
  amount numeric(12,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'payment_transactions_user_id_fkey') THEN
    ALTER TABLE public.payment_transactions ADD CONSTRAINT payment_transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) NOT VALID;
  END IF;
END $$;

-- 7. Secure view for public user profiles
CREATE OR REPLACE VIEW public.user_profiles WITH (security_barrier = true, security_invoker = false) AS
SELECT 
  user_id,
  nickname,
  age,
  gender,
  relationship_status,
  bio,
  photo_url,
  photos,
  height,
  biotype,
  sexual_orientation,
  status,
  couple_profile,
  is_online
FROM public.users
WHERE COALESCE(is_deleted, false) = false AND COALESCE(is_banned, false) = false;

REVOKE ALL ON public.user_profiles FROM PUBLIC;
GRANT SELECT ON public.user_profiles TO anon;
GRANT SELECT ON public.user_profiles TO authenticated;
