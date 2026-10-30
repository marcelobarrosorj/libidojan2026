-- ==========================================================
-- LIBIDO | recuperar conta orfa e desbloquear convites
-- Rodar no SQL Editor. Idempotente.
-- ==========================================================

-- A) DIAGNOSTICO: a conta existe em auth?
select id, email, email_confirmed_at, banned_until, deleted_at, created_at
  from auth.users
 where lower(email) = 'duplatravessa@gmail.com';

-- B) DIAGNOSTICO: identidades ligadas a esse email
select i.id, i.user_id, i.provider, i.identity_data->>'email' as email_ident, i.created_at
  from auth.identities i
 where lower(i.identity_data->>'email') = 'duplatravessa@gmail.com';

-- C) DIAGNOSTICO: perfil orfao em public.users
select user_id, nickname, email, premium, plan, is_banned, is_deleted
  from public.users
 where lower(email) = 'duplatravessa@gmail.com';

-- D) SE A CONTA EXISTIR EM AUTH: confirmar email e remover ban
update auth.users
   set email_confirmed_at = coalesce(email_confirmed_at, now()),
       banned_until = null,
       deleted_at = null,
       updated_at = now()
 where lower(email) = 'duplatravessa@gmail.com';

-- E) GARANTIR PERFIL PREMIUM VITALICIO
insert into public.users (user_id, nickname, email, premium, plan, is_banned, is_deleted)
select u.id,
       'DuplaTravessa',
       u.email, true, 'premium', false, false
  from auth.users u
 where lower(u.email) = 'duplatravessa@gmail.com'
   and not exists (select 1 from public.users p where p.user_id = u.id);

update public.users
   set premium = true,
       plan = case when plan is null or plan = '' or plan = 'free' then 'premium' else plan end,
       is_banned = false,
       is_deleted = false
 where lower(email) = 'duplatravessa@gmail.com';

-- F) DESBLOQUEAR CONVITES: gerar 10 novos vitalicios
insert into public.premium_invite_codes (code, duration_hours, used_count, is_active)
select 'LIB-PREM-' || upper(substr(md5(random()::text || clock_timestamp()::text || g::text), 1, 6)),
       null, 0, true
  from generate_series(1,10) g;

-- G) CONFERIR PERFIS EXCLUIDOS (46% da base)
select count(*) filter (where coalesce(is_deleted,false)) as excluidos,
       count(*) filter (where coalesce(is_banned,false)) as banidos,
       count(*) as total
  from public.users;

-- H) CONFERENCIA FINAL
select nickname, email, plan, premium, is_banned, is_deleted from public.users
 where lower(email) = 'duplatravessa@gmail.com';

select code, used_count, is_active from public.premium_invite_codes
 where coalesce(used_count,0) = 0 order by created_at desc limit 10;