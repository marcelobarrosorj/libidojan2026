do $dd$
declare r record;
begin
  for r in
    select p.oid::regprocedure::text as sig
    from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname = 'contar_nao_lidas'
  loop
    execute 'drop function if exists ' || r.sig || ' cascade';
  end loop;
end;
$dd$;

create function public.contar_nao_lidas()
returns integer
language sql
security definer
set search_path = public, auth
as $body$
  select coalesce(count(*),0)::int
  from public.messages m
  where m.receiver_id = auth.uid()
    and m.read_at is null
    and coalesce(m.apagada_para_mim,false) = false
    and coalesce(m.apagada_para_todos,false) = false
$body$;

grant execute on function public.contar_nao_lidas() to authenticated;