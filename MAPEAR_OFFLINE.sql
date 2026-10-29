-- mapa: usuario offline visivel na ultima posicao conhecida
alter table public.users add column if not exists last_location_at timestamptz;
alter table public.users add column if not exists last_lat double precision;
alter table public.users add column if not exists last_lng double precision;
update public.users set last_location_at = coalesce(last_location_at, updated_at, created_at, now()) where last_location_at is null;
create index if not exists idx_users_last_loc on public.users (last_location_at desc nulls last);
create or replace function public.mapa_proximos()
returns table (id uuid, nome text, idade int, foto text, lat double precision, lng double precision, online boolean, historico boolean, ultima_vez timestamptz)
language sql security definer set search_path = public
as $fn$
  select u.id, u.nome, u.idade, u.foto,
         coalesce(u.lat, u.last_lat) as lat,
         coalesce(u.lng, u.last_lng) as lng,
         (u.is_online is true and u.updated_at > now() - interval '5 minutes') as online,
         (u.is_online is not true or u.updated_at <= now() - interval '5 minutes') as historico,
         coalesce(u.last_location_at, u.updated_at) as ultima_vez
    from public.users u
   where coalesce(u.lat, u.last_lat) is not null
     and coalesce(u.lng, u.last_lng) is not null
   order by ultima_vez desc nulls last;
$fn$;
revoke all on function public.mapa_proximos() from public, anon;
grant execute on function public.mapa_proximos() to authenticated;