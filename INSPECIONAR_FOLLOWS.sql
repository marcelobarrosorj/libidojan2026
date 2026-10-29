-- INSPECIONAR follows
select column_name, data_type, is_nullable
  from information_schema.columns
 where table_schema = 'public' and table_name = 'follows'
 order by ordinal_position;

select relrowsecurity as rls_ativo
  from pg_class c join pg_namespace n on n.oid = c.relnamespace
 where n.nspname = 'public' and c.relname = 'follows';

select policyname, cmd, roles, qual, with_check
  from pg_policies
 where schemaname = 'public' and tablename = 'follows'
 order by policyname;

select grantee, privilege_type
  from information_schema.role_table_grants
 where table_schema = 'public' and table_name = 'follows'
   and grantee in ('anon','authenticated')
 order by grantee, privilege_type;