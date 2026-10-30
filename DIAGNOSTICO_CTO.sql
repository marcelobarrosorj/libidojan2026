-- ==========================================================
-- LIBIDO | diagnostico completo - cole o resultado no chat
-- ==========================================================

-- 1) A CONTA ORFA
select id, email, email_confirmed_at, banned_until, deleted_at, created_at
  from auth.users
 where lower(email) = 'duplatravessa@gmail.com';

-- 2) IDENTIDADES DESSE EMAIL
select id, user_id, provider, identity_data->>'email' as email_ident
  from auth.identities
 where lower(identity_data->>'email') = 'duplatravessa@gmail.com';

-- 3) PERFIL EM public.users
select user_id, nickname, email, premium, plan, is_banned, is_deleted
  from public.users
 where lower(email) = 'duplatravessa@gmail.com';

-- 4) EXCLUSOES POR DIA (detecta automacao)
select date_trunc('day', updated_at)::date as dia, count(*) as exclusoes
  from public.users
 where coalesce(is_deleted,false) = true
 group by 1 order by 1 desc limit 20;

-- 5) TRIGGERS QUE PODEM MARCAR is_deleted
select t.tgname as gatilho, p.proname as funcao, pg_get_triggerdef(t.oid) as definicao
  from pg_trigger t
  join pg_class c on c.oid = t.tgrelid
  join pg_proc p on p.oid = t.tgfoid
 where c.relname = 'users' and not t.tgisinternal;

-- 6) FUNCOES QUE MENCIONAM is_deleted
select p.proname as funcao
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace
 where n.nspname = 'public' and pg_get_functiondef(p.oid) ilike '%is_deleted%';

-- 7) RESUMO GERAL
select count(*) as total,
       count(*) filter (where coalesce(is_deleted,false)) as excluidos,
       count(*) filter (where coalesce(is_banned,false)) as banidos,
       count(*) filter (where coalesce(premium,false)) as premium
  from public.users;