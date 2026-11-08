drop policy if exists mo_upd on public.mensagens_ocultas;
create policy mo_upd on public.mensagens_ocultas
  for update
  to authenticated
  using (user_id::text = auth.uid()::text)
  with check (user_id::text = auth.uid()::text);