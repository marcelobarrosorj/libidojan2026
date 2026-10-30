-- ==========================================================
-- LIBIDO | padronizar online: usar APENAS last_seen
-- Rodar no SQL Editor do Supabase
-- ==========================================================

-- 1) DIAGNOSTICO: quantos perfis tem cada campo preenchido
select
  count(*) as total,
  count(*) filter (where is_online = true) as com_is_online,
  count(*) filter (where last_seen is not null) as com_last_seen,
  count(*) filter (where is_online = true and (last_seen is null or last_seen < now() - interval '5 minutes')) as is_online_desatualizado
  from public.users;

-- 2) SINCRONIZAR: is_online passa a refletir last_seen
update public.users
   set is_online = (last_seen is not null and last_seen > now() - interval '5 minutes')
 where coalesce(is_online, false) <> (last_seen is not null and last_seen > now() - interval '5 minutes');

-- 3) FUNCAO UNICA de online (o app deve usar esta)
create or replace function public.esta_online(p_user uuid, p_janela_min int default 5)
returns boolean language sql stable security definer set search_path = public as $fn$
  select coalesce((
    select (u.last_seen is not null and u.last_seen > now() - (p_janela_min || ' minutes')::interval)
      from public.users u
     where u.user_id = p_user or u.id = p_user
     limit 1
  ), false);
$fn$;
revoke all on function public.esta_online(uuid, int) from public, anon;
grant execute on function public.esta_online(uuid, int) to authenticated;

-- 4) VIEW de perfis visiveis (exclui deletados e banidos)
create or replace view public.perfis_visiveis as
select u.*,
       (u.last_seen is not null and u.last_seen > now() - interval '5 minutes') as online_agora
  from public.users u
 where coalesce(u.is_deleted, false) = false
   and coalesce(u.is_banned, false) = false;

-- 5) CONFERENCIA
select count(*) as visiveis,
       count(*) filter (where online_agora) as online_agora
  from public.perfis_visiveis;