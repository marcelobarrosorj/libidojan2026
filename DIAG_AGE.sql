-- LIBIDO | coluna age: existe, tipo, limites, policies e triggers

-- 1) TODAS AS COLUNAS DE USERS
select column_name, data_type, is_nullable, column_default
  from information_schema.columns
 where table_schema='public' and table_name='users' order by ordinal_position;

-- 2) CHECK CONSTRAINTS (limite de idade costuma morar aqui)
select con.conname as nome, pg_get_constraintdef(con.oid) as definicao
  from pg_constraint con join pg_class c on c.oid = con.conrelid
 where c.relname='users' and con.contype='c' order by con.conname;

-- 3) POLICIES DE UPDATE
select policyname, roles::text as papeis, qual, with_check
  from pg_policies where schemaname='public' and tablename='users' and cmd='UPDATE';

-- 4) TRIGGERS
select t.tgname as gatilho, p.proname as funcao, pg_get_triggerdef(t.oid) as definicao
  from pg_trigger t join pg_class c on c.oid = t.tgrelid
  join pg_proc p on p.oid = t.tgfoid
 where c.relname='users' and not t.tgisinternal;

-- 5) SE A COLUNA NAO EXISTIR, descomente e rode:
-- alter table public.users add column if not exists age integer;

-- 6) CONFERENCIA
select count(*) as total, count(age) as com_age from public.users;