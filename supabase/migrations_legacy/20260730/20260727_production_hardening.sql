-- 1. Fix user visibility (social app needs to see other users)
DROP POLICY IF EXISTS "Usuários podem ler o próprio perfil" ON public.users;
CREATE POLICY "Anyone can read user profiles" ON public.users FOR SELECT USING (true);

-- 2. Add admin access policy
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.users
    WHERE user_id = auth.uid() AND plan = 'admin'
  );
END;
$$;

-- Allow admins to update and delete users
CREATE POLICY "Admins can update users" ON public.users FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admins can delete users" ON public.users FOR DELETE USING (public.is_admin());

-- 3. Messages table (users can only read their own messages)
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read their messages" ON public.messages FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "Users can insert their messages" ON public.messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- 4. Posts table
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read posts" ON public.posts FOR SELECT USING (true);
CREATE POLICY "Users can insert their own posts" ON public.posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own posts" ON public.posts FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own posts" ON public.posts FOR DELETE USING (auth.uid() = user_id);

-- 5. Reports table
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can insert reports" ON public.reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "Users can read their own reports or admins read all" ON public.reports FOR SELECT USING (auth.uid() = reporter_id OR public.is_admin());
CREATE POLICY "Admins can update reports" ON public.reports FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 6. Admin logs table
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can insert logs" ON public.admin_logs FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins can read logs" ON public.admin_logs FOR SELECT USING (public.is_admin());

-- 7. Ensure status defaults to active
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'status') THEN
    ALTER TABLE public.users ALTER COLUMN status SET DEFAULT 'active';
  ELSE
    ALTER TABLE public.users ADD COLUMN status text DEFAULT 'active';
  END IF;
END $$;
