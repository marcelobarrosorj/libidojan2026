-- LIBIDO | resgate de convite que liga acesso de verdade
create or replace function public.resgatar_vitalicio(p_user uuid, p_until timestamptz default null)
returns boolean language plpgsql security definer set search_path = public as $fn$
declare v int;
begin
  update public.users
     set premium = true,
         plan = case when plan is null or plan = '' then 'premium' else plan end
   where user_id = p_user or id = p_user;
  get diagnostics v = row_count;
  return v > 0;
end;
$fn$;
revoke all on function public.resgatar_vitalicio(uuid, timestamptz) from public, anon;
grant execute on function public.resgatar_vitalicio(uuid, timestamptz) to authenticated;

-- toda conta premium precisa de plano premium ou owner (o app le plan)
update public.users set plan = 'premium' where coalesce(premium,false) and (plan is null or plan = '' or plan = 'free');

select nickname, plan, premium, premium_until, is_banned from public.users
 where coalesce(premium,false) or plan in ('premium','owner') order by nickname;