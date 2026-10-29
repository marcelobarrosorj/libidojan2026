-- ============================================================
-- LIBIDO | CORRIGIR follows
-- Idempotente. Funciona nas tres causas possiveis:
--   RLS desligada / policy permissiva / GRANT direto para anon
-- ============================================================

begin;

-- 1. liga RLS
alter table public.follows enable row level security;

-- 2. remove qualquer policy que permita anon ou public
do $$
declare r record;
begin
  for r in
    select policyname
      from pg_policies
     where schemaname = 'public'
       and tablename  = 'follows'
       and (roles && array['anon','public']::name[])
  loop
    execute format('drop policy %I on public.follows', r.policyname);
    raise notice 'policy removida: %', r.policyname;
  end loop;
end $$;

-- 3. corta acesso anonimo
revoke all on public.follows from anon;

-- 4. garante que authenticated mantem acesso
grant select, insert, delete on public.follows to authenticated;

-- 5. policies corretas
drop policy if exists follows_select on public.follows;
create policy follows_select on public.follows
  for select to authenticated
  using (true);

drop policy if exists follows_insert_own on public.follows;
create policy follows_insert_own on public.follows
  for insert to authenticated
  with check (follower_id::text = auth.uid()::text);

drop policy if exists follows_delete_own on public.follows;
create policy follows_delete_own on public.follows
  for delete to authenticated
  using (follower_id::text = auth.uid()::text);

commit;

-- 6. verificacao
select policyname, cmd, roles, qual, with_check
  from pg_policies
 where schemaname = 'public' and tablename = 'follows'
 order by policyname;