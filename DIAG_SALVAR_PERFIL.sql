-- LIBIDO | salvar_perfil: por que bloqueia age

-- 1) CODIGO DA FUNCAO QUE O APP CHAMA
select p.proname as funcao, pg_get_functiondef(p.oid) as codigo
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace
 where n.nspname = 'public' and p.proname in ('salvar_perfil')

-- 2) TRIGGERS DA TABELA USERS
select t.tgname as gatilho, p.proname as funcao
  from pg_trigger t join pg_class c on c.oid = t.tgrelid
  join pg_proc p on p.oid = t.tgfoid
 where c.relname = 'users' and not t.tgisinternal;

-- 3) CHECK constraints
select con.conname as restricao, pg_get_constraintdef(con.oid) as regra
  from pg_constraint con join pg_class c on c.oid = con.conrelid
 where c.relname = 'users' and con.contype = 'c';