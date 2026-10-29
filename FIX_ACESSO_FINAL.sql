-- LIBIDO | acesso premium: correcao definitiva e anti-regressao

-- 1) alinha as duas colunas de validade que existem na tabela
update public.users set premium_until = premium_ate
 where premium_until is null and premium_ate is not null;
update public.users set premium_ate = premium_until
 where premium_ate is null and premium_until is not null;

-- 2) vitalicio recebe data sentinela (evita NULL em comparacao de data)
update public.users set premium_until = '2099-12-31 23:59:59+00', premium_ate = '2099-12-31 23:59:59+00'
 where coalesce(premium,false) = true
   and (premium_until is null or premium_ate is null);

-- 3) trigger que mantem as duas colunas sempre iguais
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

-- 4) funcao unica de acesso (use esta no app, nao replique a regra)
create or replace function public.tem_acesso(p_user uuid)
returns boolean language sql stable security definer set search_path = public as $fn$
  select exists (
    select 1 from public.users u
     where (u.user_id = p_user or u.id = p_user)
       and coalesce(u.is_banned,false) = false
       and coalesce(u.is_deleted,false) = false
       and ( u.plan = 'owner'
             or ( coalesce(u.premium,false) = true
                  and (u.premium_until is null or u.premium_until > now()) ) )
  );
$fn$;
revoke all on function public.tem_acesso(uuid) from public, anon;
grant execute on function public.tem_acesso(uuid) to authenticated;

-- 5) conferencia final
select nickname, plan, premium, premium_until, premium_ate, is_banned
  from public.users where coalesce(premium,false) or plan = 'owner' order by nickname;