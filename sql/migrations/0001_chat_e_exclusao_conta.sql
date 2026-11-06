-- Migration 0001: contar_nao_lidas + excluir_minha_conta
-- Gerada do banco de producao em 2026-11-06 10:14
-- Idempotente. Aplicar no SQL Editor do Supabase se o banco for recriado.

-- contar_nao_lidas()
CREATE OR REPLACE FUNCTION public.contar_nao_lidas()
 RETURNS integer
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public', 'auth'
AS $function$
  select coalesce(count(*),0)::int
  from public.messages m
  where m.receiver_id = auth.uid()
    and m.read_at is null
    and coalesce(m.apagada_para_mim,false) = false
    and coalesce(m.apagada_para_todos,false) = false
$function$
;
grant execute on function public.contar_nao_lidas() to authenticated;

-- excluir_minha_conta() : versao segura, somente FK
CREATE OR REPLACE FUNCTION public.excluir_minha_conta()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'auth', 'storage'
AS $function$
declare
  v_uid uuid := auth.uid();
  r record;
  v_pass int;
begin
  if v_uid is null then
    raise exception 'nao autenticado';
  end if;

  for v_pass in 1..2 loop
    for r in
      select c.conrelid::regclass::text as tbl, a.attname as col
      from pg_constraint c
      join pg_attribute a on a.attrelid = c.conrelid and a.attnum = any(c.conkey)
      join pg_class t on t.oid = c.confrelid
      join pg_namespace n on n.oid = t.relnamespace
      where c.contype = 'f'
        and ((n.nspname = 'public' and t.relname = 'users') or (n.nspname = 'auth' and t.relname = 'users'))
        and c.conrelid::regclass::text not in ('public.users','auth.users')
    loop
      begin
        execute format('delete from %s where %I = $1', r.tbl, r.col) using v_uid;
      exception when others then null;
      end;
    end loop;
  end loop;

  begin delete from storage.objects where owner = v_uid::text; exception when others then null; end;

  begin delete from public.users where user_id = v_uid; exception when others then null; end;

  delete from auth.users where id = v_uid;
end;
$function$
;
grant execute on function public.excluir_minha_conta() to authenticated;

notify pgrst, 'reload schema';