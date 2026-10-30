-- ==========================================================
-- LIBIDO | funil de acesso: uma funcao, zero ambiguidade
-- ==========================================================

-- A) CONCEDER ACESSO (usada por convite, pagamento e admin)
create or replace function public.conceder_acesso(p_user uuid, p_horas int default null)
returns jsonb language plpgsql security definer set search_path = public as $fn$
declare v_ate timestamptz;
begin
  if p_horas is null then v_ate := null;
  else v_ate := now() + (p_horas || ' hours')::interval; end if;

  update public.users
     set premium = true,
         premium_until = coalesce(v_ate, premium_until),
         plan = case when plan is null or plan = '' or plan = 'free' then 'premium' else plan end,
         is_banned = false,
         is_deleted = false
   where user_id = p_user or id = p_user;

  return jsonb_build_object('ok', true, 'ate', v_ate);
end;
$fn$;
revoke all on function public.conceder_acesso(uuid, int) from public, anon;
grant execute on function public.conceder_acesso(uuid, int) to authenticated;

-- B) ACESSO UNICO (o app deve usar SO esta)
create or replace function public.tem_acesso(p_user uuid)
returns boolean language sql stable security definer set search_path = public as $fn$
  select exists (
    select 1 from public.users u
     where (u.user_id = p_user or u.id = p_user)
       and coalesce(u.is_banned, false) = false
       and coalesce(u.is_deleted, false) = false
       and ( u.plan = 'owner' or coalesce(u.premium, false) = true
             or (u.premium_until is not null and u.premium_until > now()) )
  );
$fn$;
revoke all on function public.tem_acesso(uuid) from public, anon;
grant execute on function public.tem_acesso(uuid) to authenticated;

-- C) TRAVA DE USO UNICO DO CONVITE
create or replace function public.bloqueia_reuso_convite() returns trigger
language plpgsql as $fn$
begin
  if coalesce(old.used_count,0) > 0 and coalesce(new.used_count,0) > coalesce(old.used_count,0) then
    raise exception 'convite % ja utilizado', old.code;
  end if;
  return new;
end;
$fn$;
drop trigger if exists trg_bloqueia_reuso on public.premium_invite_codes;
create trigger trg_bloqueia_reuso before update on public.premium_invite_codes
  for each row execute function public.bloqueia_reuso_convite();

-- D) CONFERENCIA
select nickname, plan, premium, premium_until, is_banned, is_deleted from public.users
 where coalesce(premium,false) or plan in ('premium','owner') order by nickname;