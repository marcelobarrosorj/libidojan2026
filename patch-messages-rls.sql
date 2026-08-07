DROP POLICY IF EXISTS "Users can read their messages" ON public.messages;
CREATE POLICY "Users can read their messages" ON public.messages FOR SELECT USING (auth.uid()::text = sender_id::text OR auth.uid()::text = receiver_id::text);

DROP POLICY IF EXISTS "Users can insert their messages" ON public.messages;
CREATE POLICY "Users can insert their messages" ON public.messages FOR INSERT WITH CHECK (auth.uid()::text = sender_id::text);

DROP POLICY IF EXISTS "Users can update their messages" ON public.messages;
CREATE POLICY "Users can update their messages" ON public.messages FOR UPDATE USING (auth.uid()::text = sender_id::text OR auth.uid()::text = receiver_id::text) WITH CHECK (auth.uid()::text = sender_id::text OR auth.uid()::text = receiver_id::text);
