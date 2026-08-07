const fs = require('fs');
const path = 'supabase/migrations/20260730150100_reconcile_security_auth.sql';
let content = fs.readFileSync(path, 'utf8');

// 1. handle_new_user
content = content.replace(
`  VALUES (new.id, new.email, split_part(new.email, '@', 1))`,
`  VALUES (new.id::text, new.email, split_part(new.email, '@', 1))`
);

// 2. is_admin
content = content.replace(
`    WHERE user_id = auth.uid() AND (role = 'admin' OR plan = 'admin')`,
`    WHERE user_id = auth.uid()::text AND (role = 'admin' OR plan = 'admin')`
);

// 3. protect_admin_fields
content = content.replace(
`  IF auth.uid() = NEW.user_id AND NOT public.is_admin() THEN`,
`  IF auth.uid()::text = NEW.user_id AND NOT public.is_admin() THEN`
);

// 5. RLS Setup - users
content = content.replace(
`CREATE POLICY "Users can read their own profile and admins can read all" ON public.users FOR SELECT USING (auth.uid() = user_id OR public.is_admin());`,
`CREATE POLICY "Users can read their own profile and admins can read all" ON public.users FOR SELECT USING (auth.uid()::text = user_id OR public.is_admin());`
);
content = content.replace(
`CREATE POLICY "Users can update their own profile" ON public.users FOR UPDATE USING (auth.uid() = user_id OR public.is_admin()) WITH CHECK (auth.uid() = user_id OR public.is_admin());`,
`CREATE POLICY "Users can update their own profile" ON public.users FOR UPDATE USING (auth.uid()::text = user_id OR public.is_admin()) WITH CHECK (auth.uid()::text = user_id OR public.is_admin());`
);

// RLS - posts
content = content.replace(
`CREATE POLICY "Users can insert their own posts" ON public.posts FOR INSERT WITH CHECK (auth.uid() = user_id);`,
`CREATE POLICY "Users can insert their own posts" ON public.posts FOR INSERT WITH CHECK (auth.uid()::text = user_id);`
);
content = content.replace(
`CREATE POLICY "Users can update their own posts" ON public.posts FOR UPDATE USING (auth.uid() = user_id OR public.is_admin()) WITH CHECK (auth.uid() = user_id OR public.is_admin());`,
`CREATE POLICY "Users can update their own posts" ON public.posts FOR UPDATE USING (auth.uid()::text = user_id OR public.is_admin()) WITH CHECK (auth.uid()::text = user_id OR public.is_admin());`
);
content = content.replace(
`CREATE POLICY "Users can delete their own posts" ON public.posts FOR DELETE USING (auth.uid() = user_id OR public.is_admin());`,
`CREATE POLICY "Users can delete their own posts" ON public.posts FOR DELETE USING (auth.uid()::text = user_id OR public.is_admin());`
);

// RLS - reports
content = content.replace(
`CREATE POLICY "Users can read their own reports or admins read all" ON public.reports FOR SELECT USING (auth.uid() = reporter_id OR public.is_admin());`,
`CREATE POLICY "Users can read their own reports or admins read all" ON public.reports FOR SELECT USING (auth.uid()::text = reporter_id OR public.is_admin());`
);
content = content.replace(
`CREATE POLICY "Users can insert reports" ON public.reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);`,
`CREATE POLICY "Users can insert reports" ON public.reports FOR INSERT WITH CHECK (auth.uid()::text = reporter_id);`
);

// RLS - payment_transactions
content = content.replace(
`CREATE POLICY "Users can view own transactions" ON public.payment_transactions FOR SELECT USING (auth.uid() = user_id OR public.is_admin());`,
`CREATE POLICY "Users can view own transactions" ON public.payment_transactions FOR SELECT USING (auth.uid()::text = user_id OR public.is_admin());`
);

fs.writeFileSync(path, content);
console.log('Fixed security auth');
