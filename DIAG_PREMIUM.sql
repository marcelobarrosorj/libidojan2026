-- LIBIDO | quem bloqueia a coluna premium

-- 1) TRIGGERS DA TABELA USERS
select t.tgname as gatilho, p.proname as funcao, pg_get_triggerdef(t.oid) as definicao
  from pg_trigger t join pg_class c on c.oid = t.tgrelid
  join pg_proc p on p.oid = t.tgfoid
 where c.relname = 'users' and not t.tgisinternal order by t.tgname;

-- 2) PERMISSAO POR COLUNA
select grantee, privilege_type, column_name
  from information_schema.column_privileges
 where table_schema = 'public' and table_name = 'users'
   and column_name in ('premium','plan','premium_until')
 order by column_name, grantee;

-- 3) POLICIES DE UPDATE
select policyname, roles::text as papeis, qual, with_check
  from pg_policies where schemaname = 'public' and tablename = 'users' and cmd = 'UPDATE';

-- 4) FUNCAO QUE GRAVA PREMIUM IGNORANDO POLICY E TRIGGER
create or replace function public.resgatar_vitalicio(p_user uuid, p_until timestamptz default null)
returns boolean language plpgsql security definer set search_path = public as $fn$
declare v int;
begin
  update public.users set premium = true, premium_until = p_until
   where user_id = p_user or id = p_user;
  get diagnostics v = row_count;
  return v > 0;
end;
$fn$;
revoke all on function public.resgatar_vitalicio(uuid, timestamptz) from public, anon;
grant execute on function public.resgatar_vitalicio(uuid, timestamptz) to authenticated;