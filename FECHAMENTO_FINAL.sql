-- ============================================================
-- LIBIDO | fechamento tecnico
-- Rode BLOCO A primeiro. So rode BLOCO C depois de conferir B.
-- ============================================================

-- ============================ BLOCO A =======================
-- A1) quem reverte premium_until (trigger suspeito)
select t.tgname as gatilho,
       p.proname as funcao,
       pg_get_triggerdef(t.oid) as definicao
  from pg_trigger t
  join pg_class c on c.oid = t.tgrelid
  join pg_proc p on p.oid = t.tgfoid
 where c.relname = 'users' and not t.tgisinternal
 order by t.tgname;

-- A2) corpo das funcoes de trigger (procure premium_until := null)
select p.proname as funcao, pg_get_functiondef(p.oid) as codigo
  from pg_proc p
  join pg_namespace n on n.oid = p.pronamespace
 where n.nspname = 'public'
   and p.prorettype = 'trigger'::regtype;

-- A3) CHECK constraints (limite de idade e de premium)
select con.conname as restricao, pg_get_constraintdef(con.oid) as regra
  from pg_constraint con
  join pg_class c on c.oid = con.conrelid
 where c.relname = 'users' and con.contype = 'c';

-- A4) policies de UPDATE em users
select policyname, roles::text as papeis, qual, with_check
  from pg_policies
 where schemaname = 'public' and tablename = 'users' and cmd = 'UPDATE';

-- ============================ BLOCO B =======================
-- B1) consolida premium_ate em premium_until antes de remover
update public.users
   set premium_until = premium_ate
 where premium_until is null and premium_ate is not null;

-- B2) backup da coluna antiga (mantem historico sem depender do schema)
create table if not exists public.users_premium_ate_backup as
select user_id, premium_ate, now() as copiado_em from public.users;

-- B3) confira: nenhuma linha deve sair com premium_ate e sem premium_until
select count(*) as inconsistentes
  from public.users
 where premium_ate is not null and premium_until is null;

-- ============================ BLOCO C =======================
-- C1) SO EXECUTE SE B3 RETORNAR 0 E NENHUM ARQUIVO DO APP USAR premium_ate
-- alter table public.users drop column if exists premium_ate;

-- C2) anti-regressao: premium ligado quando ha data valida
create or replace function public.forca_premium_ativo() returns trigger
language plpgsql as $fn$
begin
  if new.premium_until is not null and new.premium_until > now() then
    new.premium := true;
  end if;
  if new.plan = 'owner' then
    new.premium := true;
  end if;
  return new;
end;
$fn$;
drop trigger if exists trg_forca_premium on public.users;
create trigger trg_forca_premium before insert or update on public.users
  for each row execute function public.forca_premium_ativo();

-- C3) conferencia final
select nickname, plan, premium, premium_until, is_banned
  from public.users
 where coalesce(premium,false) or plan = 'owner'
 order by nickname;