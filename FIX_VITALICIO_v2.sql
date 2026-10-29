-- LIBIDO | vitalicio - diagnostico e correcao

-- BLOCO 1 | funcao segura (independe de policy de UPDATE)
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

-- BLOCO 2 | quem esta com premium vencido agora
select nickname, plan, premium, premium_until,
       case when premium_until < now() then 'VENCIDO' else 'ok' end as situacao
  from public.users where premium = true order by premium_until nulls last;

-- BLOCO 3 | reativar como VITALICIO apenas as contas confirmadas abaixo
-- Padrao do vitalicio real no seu banco: plan = owner e premium_until = 2099-12-31
-- nenhuma conta com premium vencido nesta rodada

-- BLOCO 4 | conferencia final
select nickname, plan, premium, premium_until from public.users
 where premium = true and (premium_until is null or premium_until > now()) order by nickname;