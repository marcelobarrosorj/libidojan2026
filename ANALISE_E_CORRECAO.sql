-- ==========================================================
-- LIBIDO | correcao dos 4 sintomas relatados
-- ==========================================================

-- A) CONVITE: resgate atomico, sem reuso e sem estado orfao
create or replace function public.resgatar_convite(p_code text, p_user uuid)
returns jsonb language plpgsql security definer set search_path = public as $fn$
declare v_row public.premium_invite_codes; v_ok boolean := false;
begin
  select * into v_row from public.premium_invite_codes
   where upper(code) = upper(p_code) for update;

  if not found then
    return jsonb_build_object('ok', false, 'motivo', 'inexistente');
  end if;
  if coalesce(v_row.is_active, true) = false then
    return jsonb_build_object('ok', false, 'motivo', 'inativo');
  end if;
  if v_row.expires_at is not null and v_row.expires_at < now() then
    return jsonb_build_object('ok', false, 'motivo', 'expirado');
  end if;
  if coalesce(v_row.used_count, 0) > 0 then
    return jsonb_build_object('ok', false, 'motivo', 'ja_usado');
  end if;

  update public.premium_invite_codes
     set used_count = 1, used_by = p_user, used_at = now()
   where id = v_row.id and coalesce(used_count,0) = 0;
  get diagnostics v_ok = row_count;
  if v_ok = false then
    return jsonb_build_object('ok', false, 'motivo', 'corrida');
  end if;

  update public.users
     set premium = true,
         plan = case when plan is null or plan = '' or plan = 'free' then 'premium' else plan end
   where user_id = p_user or id = p_user;

  return jsonb_build_object('ok', true, 'motivo', 'resgatado');
end;
$fn$;
revoke all on function public.resgatar_convite(text, uuid) from public, anon;
grant execute on function public.resgatar_convite(text, uuid) to authenticated;

-- B) REENVIO: sempre gera code NOVO, nunca reaproveita
create or replace function public.reenviar_convite(p_user uuid, p_hours int default null)
returns text language plpgsql security definer set search_path = public as $fn$
declare v_code text;
begin
  v_code := upper(substr(md5(random()::text || clock_timestamp()::text), 1, 10));
  insert into public.premium_invite_codes (code, duration_hours, used_count, is_active)
  values (v_code, p_hours, 0, true);
  return v_code;
end;
$fn$;
revoke all on function public.reenviar_convite(uuid, int) from public, anon;
grant execute on function public.reenviar_convite(uuid, int) to authenticated;

-- C) PERFIL EXCLUIDO: nao pode segurar convite nem bloquear reenvio
update public.premium_invite_codes c
   set used_count = 0, used_by = null, used_at = null
  from public.users u
 where c.used_by = u.user_id and coalesce(u.is_deleted, false) = true;

-- D) AGE: liberar a coluna na RPC de perfil
--    (rode o DIAG_SALVAR_PERFIL.sql primeiro para ver a lista atual)
--    Se a funcao usa whitelist, adicione age e birth_date a ela.

-- E) CHAT: acesso unico e coerente
create or replace function public.tem_acesso(p_user uuid)
returns boolean language sql stable security definer set search_path = public as $fn$
  select exists (
    select 1 from public.users u
     where (u.user_id = p_user or u.id = p_user)
       and coalesce(u.is_banned, false) = false
       and coalesce(u.is_deleted, false) = false
       and ( u.plan = 'owner'
             or coalesce(u.premium, false) = true
             or (u.premium_until is not null and u.premium_until > now()) )
  );
$fn$;
revoke all on function public.tem_acesso(uuid) from public, anon;
grant execute on function public.tem_acesso(uuid) to authenticated;

-- F) CONFERENCIA DA CONTA RELATADA
select u.nickname, u.email, u.plan, u.premium, u.is_banned, u.is_deleted, u.age,
       (select count(*) from public.premium_invite_codes c where c.used_by = u.user_id) as convites_usados
  from public.users u
 where lower(u.email) = 'duplatravessa@gmail.com';