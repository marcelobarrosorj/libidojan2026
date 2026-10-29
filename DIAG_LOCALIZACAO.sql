-- LIBIDO | localizacao: quem esta empilhado no centro fixo do mapa

-- 1) perfis a menos de 3 km da coordenada fixa (-22.9068, -43.1729)
select nickname, lat, lon, last_location_at,
       round((6371 * acos(least(1, cos(radians(-22.9068)) * cos(radians(lat))
         * cos(radians(lon) - radians(-43.1729)) + sin(radians(-22.9068))
         * sin(radians(lat)))))) as km_do_centro_fixo
  from public.users
 where lat is not null and lon is not null
   and round((6371 * acos(least(1, cos(radians(-22.9068)) * cos(radians(lat))
     * cos(radians(lon) - radians(-43.1729)) + sin(radians(-22.9068))
     * sin(radians(lat)))))) < 3
 order by nickname;

-- 2) APOS conferir a lista acima: zera a coordenada suspeita
--    (o usuario reenvia ao abrir o app com GPS real)
-- update public.users set lat = null, lon = null, last_lat = null, last_lng = null
--  where nickname in ('COLE_AQUI_OS_NICKNAMES_CONFIRMADOS');

-- 3) conferencia
select count(*) as com_coordenada, count(distinct lat) as latitudes_distintas
  from public.users where lat is not null;