const fs = require('fs');

const path = 'supabase/migrations/20260730150000_reconcile_core_schema.sql';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
`-- 3. Reconcile public.posts
CREATE TABLE IF NOT EXISTS public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  image text,
  text text,
  likes integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);`,
`DO $$ BEGIN
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
);`
);

content = content.replace(
`-- 4. Reconcile public.reports
CREATE TABLE IF NOT EXISTS public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null,
  target_id uuid not null,
  reason text not null,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);
CREATE INDEX IF NOT EXISTS idx_reports_reporter_id ON public.reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_reports_target_id ON public.reports(target_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON public.reports(created_at);

-- 5. Reconcile public.admin_logs
CREATE TABLE IF NOT EXISTS public.admin_logs (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null,
  action text not null,
  target_id uuid,
  created_at timestamptz not null default now()
);

-- 6. Reconcile public.payment_transactions
CREATE TABLE IF NOT EXISTS public.payment_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  payment_id text unique,
  provider text not null default 'manual',
  status text not null default 'pending',
  amount numeric(12,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);`,
`-- 4. Reconcile public.reports
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
END $$;`
);

fs.writeFileSync(path, content);
console.log('Fixed core schema');
