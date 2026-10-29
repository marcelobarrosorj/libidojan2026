-- LIBIDO - correcoes de causa raiz
alter table public.users add column if not exists last_location_at timestamptz;
alter table public.users add column if not exists last_lat double precision;
alter table public.users add column if not exists last_lng double precision;
update public.users set last_lat = lat, last_lng = lon, last_location_at = now() where last_lat is null and lat is not null and lon is not null;
create or replace function public.salvar_ultima_localizacao() returns trigger language plpgsql as $fn$ begin if new.lat is not null and new.lon is not null then new.last_lat := new.lat; new.last_lng := new.lon; new.last_location_at := now(); end if; return new; end; $fn$;
drop trigger if exists trg_ultima_localizacao on public.users;
create trigger trg_ultima_localizacao before update of lat, lon on public.users for each row execute function public.salvar_ultima_localizacao();
select column_name as coluna, data_type as tipo from information_schema.columns where table_schema = 'public' and table_name = 'users' order by ordinal_position;
select policyname, cmd, roles::text as papeis, qual, with_check from pg_policies where schemaname = 'public' and tablename = 'messages' order by cmd, policyname;