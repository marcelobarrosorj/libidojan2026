do $dd$
declare r record;
begin
  for r in
    select p.oid::regprocedure::text as sig
    from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname = 'excluir_minha_conta'
  loop
    execute 'drop function if exists ' || r.sig || ' cascade';
  end loop;
end;
$dd$;

create function public.excluir_minha_conta()
returns void
language plpgsql
security definer
set search_path = public, auth, storage
as $body$
declare
  v_uid uuid := auth.uid();
  r record;
begin
  if v_uid is null then
    raise exception 'nao autenticado';
  end if;

  for r in
    select c.conrelid::regclass::text as tbl, a.attname as col
    from pg_constraint c
    join pg_attribute a on a.attrelid = c.conrelid and a.attnum = any(c.conkey)
    join pg_class t on t.oid = c.confrelid
    join pg_namespace n on n.oid = t.relnamespace
    where c.contype = 'f' and n.nspname = 'public' and t.relname = 'users'
  loop
    if r.tbl <> 'public.users' then
      begin
        execute format('delete from %s where %I = $1', r.tbl, r.col) using v_uid;
      exception when others then
        begin
          execute format('delete from %s where %I::text = $1::text', r.tbl, r.col) using v_uid;
        exception when others then null;
        end;
      end;
    end if;
  end loop;

  for r in
    select c.table_name as tbl, c.column_name as col
    from information_schema.columns c
    where c.table_schema = 'public'
      and c.table_name <> 'users'
      and c.column_name in ('user_id','usuario_id','remetente_id','sender_id','destinatario_id','receiver_id','seguidor_id','seguido_id','bloqueador_id','bloqueado_id','autor_id','owner_id','peer_id','from_user','to_user','id_usuario','id_remetente','id_destinatario')
  loop
    begin
      execute format('delete from public.%I where %I = $1', r.tbl, r.col) using v_uid;
    exception when others then
      begin
        execute format('delete from public.%I where %I::text = $1::text', r.tbl, r.col) using v_uid;
      exception when others then null;
      end;
    end;
  end loop;

  begin delete from storage.objects where owner = v_uid; exception when others then null; end;
  begin delete from storage.objects where owner::text = v_uid::text; exception when others then null; end;

  begin delete from public.users where user_id = v_uid; exception when others then null; end;
  begin delete from public.users where user_id::text = v_uid::text; exception when others then null; end;

  delete from auth.users where id = v_uid;
end;
$body$;

grant execute on function public.excluir_minha_conta() to authenticated;