-- LIBIDO | fechamento: acesso premium e bloqueio de colunas

-- 1) mantem as duas colunas de validade sempre alinhadas
create or replace function public.sync_premium_datas() returns trigger
language plpgsql as $fn$
begin
  if new.premium_until is null and new.premium_ate is not null then new.premium_until := new.premium_ate; end if;
  if new.premium_ate is null and new.premium_until is not null then new.premium_ate := new.premium_until; end if;
  return new;
end;
$fn$;
drop trigger if exists trg_sync_premium on public.users;
create trigger trg_sync_premium before insert or update on public.users
  for each row execute function public.sync_premium_datas();

-- 2) se premium_until estiver no futuro, premium tem de estar true
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

-- 3) QUEM BLOQUEIA age: triggers, check e functions
select con.conname as restricao, pg_get_constraintdef(con.oid) as regra
  from pg_constraint con join pg_class c on c.oid = con.conrelid
 where c.relname='users' and con.contype='c';

select t.tgname as gatilho, p.proname as funcao
  from pg_trigger t join pg_class c on c.oid = t.tgrelid
  join pg_proc p on p.oid = t.tgfoid
 where c.relname='users' and not t.tgisinternal;

select p.proname as funcao, pg_get_functiondef(p.oid) as corpo
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace
 where n.nspname='public'
   and (pg_get_functiondef(p.oid) ilike '%bloque%' or pg_get_functiondef(p.oid) ilike '%age%')
   and p.prorettype <> 'trigger'::regtype;

-- 4) conferencia final
select nickname, plan, premium, premium_until, premium_ate, is_banned
  from public.users where coalesce(premium,false) or plan = 'owner' order by nickname;