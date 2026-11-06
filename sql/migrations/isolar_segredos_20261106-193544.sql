create table if not exists public.user_secrets (
  user_id text primary key,
  password_hash text,
  atualizado_em timestamptz not null default now()
);
alter table public.user_secrets enable row level security;
revoke all on public.user_secrets from anon, authenticated;

insert into public.user_secrets (user_id, password_hash)
select user_id, password_hash from public.users
where password_hash is not null and password_hash <> ''
on conflict (user_id) do update set password_hash = excluded.password_hash, atualizado_em = now();

update public.users set password_hash = null where password_hash is not null;

revoke select (pin, password_hash) on public.users from authenticated, anon;
revoke insert (pin, password_hash) on public.users from authenticated, anon;
revoke update (pin, password_hash) on public.users from authenticated, anon;