drop function if exists public._dump_funcoes(text);
drop function if exists public._dump_funcoes();
drop function if exists public._dump_all();
drop view  if exists public._rpc_defs;
drop table if exists public._ddl_export;

create table public._ddl_export as
select row_number() over (
         order by n.nspname, p.proname, pg_get_function_identity_arguments(p.oid)
       ) as id,
       n.nspname::text                                   as schema_name,
       p.proname::text                                   as nome,
       case p.prokind when 'p' then 'procedure' else 'function' end as tipo,
       pg_get_function_identity_arguments(p.oid)         as args,
       pg_get_functiondef(p.oid)                         as definicao
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname not in ('pg_catalog','information_schema')
  and p.prokind in ('f','p');

alter table public._ddl_export add primary key (id);
alter table public._ddl_export enable row level security;

create policy _ddl_export_owner on public._ddl_export
  for select to authenticated
  using (auth.uid() = '0027337b-efa2-4148-8338-9d130bdc600f'::uuid);

grant select on public._ddl_export to authenticated;
notify pgrst, 'reload schema';