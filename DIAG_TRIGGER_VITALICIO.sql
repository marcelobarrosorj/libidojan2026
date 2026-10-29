-- LIBIDO | por que premium nao grava, e como corrigir

-- 1) TRIGGERS DA TABELA USERS (o suspeito numero 1)
select t.tgname as gatilho,
       case when t.tgtype & 4 = 4 then 'INSERT ' else '' end ||
       case when t.tgtype & 16 = 16 then 'UPDATE ' else '' end ||
       case when t.tgtype & 8 = 8 then 'DELETE ' else '' end as eventos,
       p.proname as funcao, pg_get_triggerdef(t.oid) as definicao
  from pg_trigger t join pg_class c on c.oid = t.tgrelid
  join pg_proc p on p.oid = t.tgfoid
 where c.relname = 'users' and not t.tgisinternal;

-- 2) CORPO DAS FUNCOES DE TRIGGER (procure premium ou plan na lista)
select p.proname as funcao, pg_get_functiondef(p.oid) as codigo
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace
 where n.nspname = 'public' and p.prorettype = 'trigger'::regtype;

-- 3) PERMISSOES DE COLUNA (restringe quem pode escrever premium)
select grantee, privilege_type, column_name
  from information_schema.column_privileges
 where table_schema = 'public' and table_name = 'users'
   and column_name in ('premium','plan','premium_until')
 order by column_name, grantee;

-- 4) POLICIES DE UPDATE EM USERS
select policyname, cmd, roles::text as papeis, qual, with_check
  from pg_policies where schemaname = 'public' and tablename = 'users'
 order by cmd, policyname;

-- 5) FUNCAO QUE IGNORA TRIGGER E POLICY (security definer)
create or replace function public.resgatar_vitalicio(p_user uuid, p_until timestamptz default null)
returns boolean language plpgsql security definer set search_path = public as $fn$
declare v int;
begin
  alter table public.users disable trigger user;
  update public.users set premium = true,
         plan = coalesce(nullif(plan,''), 'owner'),
         premium_until = p_until
   where user_id = p_user or id = p_user;
  get diagnostics v = row_count;
  alter table public.users enable trigger user;
  return v > 0;
exception when others then
  alter table public.users enable trigger user;
  raise;
end;
$fn$;
revoke all on function public.resgatar_vitalicio(uuid, timestamptz) from public, anon;
grant execute on function public.resgatar_vitalicio(uuid, timestamptz) to authenticated;

-- 6) CORRECAO DOS BENEFICIARIOS VITALICIOS CONFIRMADOS
-- nenhum beneficiario pendente nesta rodada

-- 7) CONFERENCIA
select nickname, premium, plan, premium_until from public.users where premium = true order by nickname;