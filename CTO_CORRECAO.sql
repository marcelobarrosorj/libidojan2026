-- ==========================================================
-- LIBIDO | correcao definitiva: convite, acesso, age
-- Rodar no SQL Editor. Idempotente: pode repetir sem efeito duplo.
-- ==========================================================

-- A) RESGATE ATOMICO: uso unico garantido, sem corrida
create or replace function public.resgatar_convite(p_code text, p_user uuid)
returns jsonb language plpgsql security definer set search_path = public as $fn$
declare v_row public.premium_invite_codes; v_n int := 0;
begin
  select * into v_row from public.premium_invite_codes
   where upper(code) = upper(trim(p_code)) for update;
  if not found then return jsonb_build_object('ok', false, 'motivo', 'inexistente'); end if;
  if coalesce(v_row.is_active, true) = false then return jsonb_build_object('ok', false, 'motivo', 'inativo'); end if;
  if v_row.expires_at is not null and v_row.expires_at < now() then return jsonb_build_object('ok', false, 'motivo', 'expirado'); end if;
  if coalesce(v_row.used_count, 0) > 0 then return jsonb_build_object('ok', false, 'motivo', 'ja_usado'); end if;
  update public.premium_invite_codes
     set used_count = 1, used_by = p_user, used_at = now()
   where id = v_row.id and coalesce(used_count,0) = 0;
  get diagnostics v_n = row_count;
  if v_n = 0 then return jsonb_build_object('ok', false, 'motivo', 'corrida'); end if;
  update public.users set premium = true,
         plan = case when plan is null or plan = '' or plan = 'free' then 'premium' else plan end
   where user_id = p_user or id = p_user;
  return jsonb_build_object('ok', true, 'motivo', 'resgatado');
end;
$fn$;
revoke all on function public.resgatar_convite(text, uuid) from public, anon;
grant execute on function public.resgatar_convite(text, uuid) to authenticated;

-- B) TRAVA DE USO UNICO NO BANCO (impede reuso mesmo por API direta)
create or replace function public.bloqueia_reuso_convite() returns trigger
language plpgsql as $fn$
begin
  if old.used_count is not null and old.used_count > 0
     and new.used_count is not null and new.used_count > old.used_count then
    raise exception 'convite % ja foi utilizado', old.code;
  end if;
  return new;
end;
$fn$;
drop trigger if exists trg_bloqueia_reuso on public.premium_invite_codes;
create trigger trg_bloqueia_reuso before update on public.premium_invite_codes
  for each row execute function public.bloqueia_reuso_convite();

-- C) REENVIO SEMPRE COM CODIGO NOVO
create or replace function public.reenviar_convite(p_hours int default null)
returns text language plpgsql security definer set search_path = public as $fn$
declare v_code text;
begin
  v_code := 'LIB-PREM-' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 6));
  insert into public.premium_invite_codes (code, duration_hours, used_count, is_active)
  values (v_code, p_hours, 0, true);
  return v_code;
end;
$fn$;
revoke all on function public.reenviar_convite(int) from public, anon;
grant execute on function public.reenviar_convite(int) to authenticated;

-- D) LIBERAR CONVITES PRESOS EM CONTA EXCLUIDA
update public.premium_invite_codes c
   set used_count = 0, used_by = null, used_at = null
  from public.users u
 where c.used_by = u.user_id and coalesce(u.is_deleted, false) = true;

-- E) ACESSO UNICO (usar esta funcao no app)
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

-- F) DIAGNOSTICO: por que salvar_perfil recusa age
select p.proname as funcao, pg_get_functiondef(p.oid) as codigo
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace
 where n.nspname = 'public' and p.proname = 'salvar_perfil';

-- G) CONFERENCIA
select code, used_count, used_by, duration_hours from public.premium_invite_codes
 where coalesce(used_count,0) > 1 order by used_count desc;