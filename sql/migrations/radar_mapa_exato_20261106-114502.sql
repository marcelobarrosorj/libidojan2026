CREATE OR REPLACE FUNCTION public.radar_mapa(p_raio_km double precision DEFAULT 50, p_celula double precision DEFAULT 0.0001)
 RETURNS TABLE(peer_id text, nickname text, photo_url text, online boolean, faixa text, ordem integer, anel_m integer, angulo double precision, lat_pin double precision, lon_pin double precision)
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select
    b.user_id,
    b.nickname,
    b.foto,
    b.online,
    f.faixa,
    f.ordem,
    f.anel_m as anel_m,
    b.angulo,
    b.lat_pin as lat_pin,
    b.lon_pin as lon_pin
  from (
    select
      u.user_id,
      u.nickname,
      coalesce(u.photo_url, u.photos->>0) as foto,
      coalesce(u.is_online, false) as online,
      (6371 * acos(least(1, greatest(-1,
        sin(radians(eu.lat)) * sin(radians(u.lat)) +
        cos(radians(eu.lat)) * cos(radians(u.lat)) * cos(radians(u.lon - eu.lon))
      )))) as km,
      case when ((('x' || substr(md5(u.user_id || 'anel'), 1, 8))::bit(32)::int & 1) = 0)
           then 1000 else 2000 end as anel_off,
      (((('x' || substr(md5(u.user_id || 'ang'), 1, 8))::bit(32)::int & 65535) / 65535.0) * 360) as angulo,
      (round(u.lat / p_celula) * p_celula
        + (((('x' || substr(md5(u.user_id || 'x'), 1, 8))::bit(32)::int & 255) / 255.0) - 0.5) * p_celula) as lat_pin,
      (round(u.lon / p_celula) * p_celula
        + (((('x' || substr(md5(u.user_id || 'y'), 1, 8))::bit(32)::int & 255) / 255.0) - 0.5) * p_celula) as lon_pin
    from public.users u
    cross join (
      select lat, lon from public.users where user_id = auth.uid()::text
    ) eu
    where u.user_id <> auth.uid()::text
      and eu.lat is not null and eu.lon is not null
      and u.lat is not null and u.lon is not null
      and not coalesce(u.is_deleted, false)
      and not coalesce(u.is_banned, false)
  ) b
  cross join lateral public.faixa_distancia(b.km) f
  where b.km <= p_raio_km
    and b.foto is not null
  order by f.ordem asc, b.nickname asc
  limit 200;
$function$;