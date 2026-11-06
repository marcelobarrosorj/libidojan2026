do $do$
declare p record;
begin
  for p in select policyname from pg_policies where schemaname='public' and tablename='pin_tentativas' loop
    execute format('drop policy %I on public.pin_tentativas', p.policyname);
  end loop;
end
$do$;

alter table public.pin_tentativas enable row level security;
revoke all on public.pin_tentativas from anon, authenticated;

update public.pin_tentativas set falhas=0, bloqueado_ate=null
 where bloqueado_ate is not null and bloqueado_ate < now();