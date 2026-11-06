create or replace function public.contar_nao_lidas()
returns integer
language sql
security definer
set search_path = public, auth
as $fn$
  select coalesce(count(*),0)::int
  from public.messages m
  where m.receiver_id = auth.uid()
    and m.read_at is null
    and coalesce(m.apagada_para_mim,false) = false
    and coalesce(m.apagada_para_todos,false) = false
$fn$;