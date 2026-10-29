-- LIBIDO | o trigger que bloqueia premium_until

-- 1) TRIGGERS DA TABELA USERS
select t.tgname as gatilho, p.proname as funcao, pg_get_triggerdef(t.oid) as definicao
  from pg_trigger t
  join pg_class c on c.oid = t.tgrelid
  join pg_proc p on p.oid = t.tgfoid
 where c.relname = 'users' and not t.tgisinternal
 order by t.tgname;

-- 2) CODIGO DAS FUNCOES DE TRIGGER
select p.proname as funcao, pg_get_functiondef(p.oid) as codigo
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace
 where n.nspname = 'public' and p.prorettype = 'trigger'::regtype;

-- 3) CHECK constraints (limite de idade fica aqui)
select con.conname as restricao, pg_get_constraintdef(con.oid) as regra
  from pg_constraint con join pg_class c on c.oid = con.conrelid
 where c.relname = 'users' and con.contype = 'c';

-- 4) ESTADO FINAL (premium=true e o que libera acesso)
select nickname, plan, premium, premium_until, is_banned
  from public.users
 where coalesce(premium,false) or plan = 'owner'
 order by nickname;

-- 5) SO DEPOIS DE LER O ITEM 1, se o trigger for indevido:
-- alter table public.users disable trigger NOME_DO_GATILHO;