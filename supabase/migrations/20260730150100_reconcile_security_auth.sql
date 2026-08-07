-- 1. handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  INSERT INTO public.users (user_id, email, nickname)
  VALUES (new.id::text, new.email, split_part(new.email, '@', 1))
  ON CONFLICT (user_id) DO NOTHING;
  RETURN new;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. is_admin function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE user_id = auth.uid()::text AND (role = 'admin' OR plan = 'admin')
  );
END;
$$;
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- 3. protect_admin_fields function
CREATE OR REPLACE FUNCTION public.protect_admin_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If not an admin, ensure they can't change admin fields
  IF auth.uid()::text = NEW.user_id AND NOT public.is_admin() THEN
    NEW.plan = OLD.plan;
    NEW.premium = OLD.premium;
    NEW.role = OLD.role;
    NEW.is_banned = OLD.is_banned;
    NEW.is_deleted = OLD.is_deleted;
  END IF;
  RETURN NEW;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.protect_admin_fields() FROM PUBLIC;

DROP TRIGGER IF EXISTS trg_protect_admin_fields ON public.users;
CREATE TRIGGER trg_protect_admin_fields
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.protect_admin_fields();

-- 4. increment_likes function
CREATE OR REPLACE FUNCTION public.increment_likes(post_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.posts
  SET likes = COALESCE(likes, 0) + 1
  WHERE id = post_id;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.increment_likes(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.increment_likes(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.increment_likes(uuid) TO authenticated;

-- 5. RLS Setup
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Usuários podem ler o próprio perfil" ON public.users;
DROP POLICY IF EXISTS "Users can read their own profile and admins can read all" ON public.users;
CREATE POLICY "Users can read their own profile and admins can read all" ON public.users FOR SELECT USING (auth.uid()::text = user_id OR public.is_admin());
DROP POLICY IF EXISTS "Usuários podem atualizar o próprio perfil" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
CREATE POLICY "Users can update their own profile" ON public.users FOR UPDATE USING (auth.uid()::text = user_id OR public.is_admin()) WITH CHECK (auth.uid()::text = user_id OR public.is_admin());
DROP POLICY IF EXISTS "Admins can update users" ON public.users;
DROP POLICY IF EXISTS "Admins can delete users" ON public.users;
CREATE POLICY "Admins can delete users" ON public.users FOR DELETE USING (public.is_admin());
-- Insert is handled by trigger and backend

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can read their messages" ON public.messages;
CREATE POLICY "Users can read their messages" ON public.messages FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
DROP POLICY IF EXISTS "Users can insert their messages" ON public.messages;
CREATE POLICY "Users can insert their messages" ON public.messages FOR INSERT WITH CHECK (auth.uid() = sender_id);
DROP POLICY IF EXISTS "Users can update their messages" ON public.messages;
CREATE POLICY "Users can update their messages" ON public.messages FOR UPDATE USING (auth.uid() = sender_id OR auth.uid() = receiver_id) WITH CHECK (auth.uid() = sender_id OR auth.uid() = receiver_id);

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read posts" ON public.posts;
DROP POLICY IF EXISTS "Read posts from active users" ON public.posts;
CREATE POLICY "Read posts from active users" ON public.posts FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE public.users.user_id = public.posts.user_id 
    AND COALESCE(is_deleted, false) = false 
    AND COALESCE(is_banned, false) = false
  ) OR public.is_admin()
);
DROP POLICY IF EXISTS "Users can insert their own posts" ON public.posts;
CREATE POLICY "Users can insert their own posts" ON public.posts FOR INSERT WITH CHECK (auth.uid()::text = user_id);
DROP POLICY IF EXISTS "Users can update their own posts" ON public.posts;
CREATE POLICY "Users can update their own posts" ON public.posts FOR UPDATE USING (auth.uid()::text = user_id OR public.is_admin()) WITH CHECK (auth.uid()::text = user_id OR public.is_admin());
DROP POLICY IF EXISTS "Users can delete their own posts" ON public.posts;
CREATE POLICY "Users can delete their own posts" ON public.posts FOR DELETE USING (auth.uid()::text = user_id OR public.is_admin());

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can read their own reports or admins read all" ON public.reports;
CREATE POLICY "Users can read their own reports or admins read all" ON public.reports FOR SELECT USING (auth.uid()::text = reporter_id OR public.is_admin());
DROP POLICY IF EXISTS "Users can insert reports" ON public.reports;
CREATE POLICY "Users can insert reports" ON public.reports FOR INSERT WITH CHECK (auth.uid()::text = reporter_id);
DROP POLICY IF EXISTS "Admins can update reports" ON public.reports;
CREATE POLICY "Admins can update reports" ON public.reports FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());

ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can read logs" ON public.admin_logs;
CREATE POLICY "Admins can read logs" ON public.admin_logs FOR SELECT USING (public.is_admin());
DROP POLICY IF EXISTS "Admins can insert logs" ON public.admin_logs;
CREATE POLICY "Admins can insert logs" ON public.admin_logs FOR INSERT WITH CHECK (public.is_admin());

ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can view payment transactions" ON public.payment_transactions;
DROP POLICY IF EXISTS "Users can view own transactions" ON public.payment_transactions;
CREATE POLICY "Users can view own transactions" ON public.payment_transactions FOR SELECT USING (auth.uid()::text = user_id OR public.is_admin());

-- Remove old functionality
DROP FUNCTION IF EXISTS public.activate_premium(uuid);
DROP FUNCTION IF EXISTS public.process_payment(uuid, text, text, text, numeric);
DROP POLICY IF EXISTS "Users can read their messages" ON public.messages;
CREATE POLICY "Users can read their messages" ON public.messages FOR SELECT USING (auth.uid()::text = sender_id::text OR auth.uid()::text = receiver_id::text);

DROP POLICY IF EXISTS "Users can insert their messages" ON public.messages;
CREATE POLICY "Users can insert their messages" ON public.messages FOR INSERT WITH CHECK (auth.uid()::text = sender_id::text);

DROP POLICY IF EXISTS "Users can update their messages" ON public.messages;
CREATE POLICY "Users can update their messages" ON public.messages FOR UPDATE USING (auth.uid()::text = sender_id::text OR auth.uid()::text = receiver_id::text) WITH CHECK (auth.uid()::text = sender_id::text OR auth.uid()::text = receiver_id::text);
DROP POLICY IF EXISTS "Users can read their messages" ON public.messages;
CREATE POLICY "Users can read their messages" ON public.messages FOR SELECT USING (auth.uid()::text = sender_id::text OR auth.uid()::text = receiver_id::text);

DROP POLICY IF EXISTS "Users can insert their messages" ON public.messages;
CREATE POLICY "Users can insert their messages" ON public.messages FOR INSERT WITH CHECK (auth.uid()::text = sender_id::text);

DROP POLICY IF EXISTS "Users can update their messages" ON public.messages;
CREATE POLICY "Users can update their messages" ON public.messages FOR UPDATE USING (auth.uid()::text = sender_id::text OR auth.uid()::text = receiver_id::text) WITH CHECK (auth.uid()::text = sender_id::text OR auth.uid()::text = receiver_id::text);
