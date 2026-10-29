-- LIBIDO | localizacao: diagnosticar e unificar as colunas

-- 1) coordenadas impossiveis (inversao lat/lon)
select nickname, lat, lon, last_lat, last_lng
  from public.users
 where (lat is not null and (lat < -90 or lat > 90))
    or (lon is not null and (lon < -180 or lon > 180))
    or (last_lat is not null and (last_lat < -90 or last_lat > 90))
    or (last_lng is not null and (last_lng < -180 or last_lng > 180));

-- 2) coordenadas fora do Brasil (lat -34..6 / lon -74..-34)
select nickname, lat, lon, last_lat, last_lng, last_location_at
  from public.users
 where lat is not null
   and (lat not between -34 and 6 or lon not between -74 and -34);

-- 3) dessincronizacao entre as duas duplas
select count(*) as divergentes
  from public.users
 where lat is distinct from last_lat or lon is distinct from last_lng;

-- 4) alinhar: last_ passa a espelhar lat/lon (ou o contrario, conforme o app le)
update public.users
   set last_lat = lat, last_lng = lon
 where lat is not null and lon is not null
   and (last_lat is null or last_lng is null);

-- 5) trigger que impede nova dessincronizacao
create or replace function public.sync_localizacao() returns trigger
language plpgsql as $fn$
begin
  if new.lat is not null and new.lon is not null then
    new.last_lat := new.lat;
    new.last_lng := new.lon;
    new.last_location_at := now();
  end if;
  return new;
end;
$fn$;
drop trigger if exists trg_sync_localizacao on public.users;
create trigger trg_sync_localizacao before insert or update on public.users
  for each row execute function public.sync_localizacao();

-- 6) conferencia
select nickname, lat, lon, last_lat, last_lng, last_location_at
  from public.users where lat is not null order by last_location_at desc nulls last limit 20;