create table if not exists public.pin_tentativas (
  user_id text primary key,
  falhas integer not null default 0,
  bloqueado_ate timestamptz,
  atualizado_em timestamptz not null default now()
);
alter table public.pin_tentativas enable row level security;
revoke all on public.pin_tentativas from anon, authenticated;

create or replace function public.verificar_pin(p_pin text)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions, auth
as $fn$
declare
  v_uid   text := auth.uid()::text;
  v_guard text;
  v_falhas int := 0;
  v_ate    timestamptz;
  v_ok     boolean := false;
  v_novo   text;
  v_pin    text;
begin
  if v_uid is null or v_uid = '' then
    return jsonb_build_object('ok', false, 'erro', 'nao autenticado');
  end if;

  if p_pin is null or length(p_pin) = 0 then
    return jsonb_build_object('ok', false, 'erro', 'pin vazio');
  end if;

  select falhas, bloqueado_ate into v_falhas, v_ate
    from public.pin_tentativas where user_id = v_uid;

  if v_ate is not null and v_ate > now() then
    return jsonb_build_object('ok', false, 'erro', 'bloqueado', 'ate', v_ate);
  end if;

  select pin into v_pin from public.users where user_id = v_uid;
  if v_pin is null or v_pin = '' then
    return jsonb_build_object('ok', false, 'erro', 'sem pin definido');
  end if;

  if v_pin like '$2%$' then
    v_ok := (v_pin = crypt(p_pin, v_pin));
  else
    v_ok := (v_pin = p_pin);
    if v_ok then
      v_novo := crypt(p_pin, gen_salt('bf', 10));
      update public.users set pin = v_novo where user_id = v_uid;
    end if;
  end if;

  if v_ok then
    insert into public.pin_tentativas (user_id, falhas, bloqueado_ate, atualizado_em)
      values (v_uid, 0, null, now())
      on conflict (user_id) do update set falhas = 0, bloqueado_ate = null, atualizado_em = now();
    return jsonb_build_object('ok', true);
  end if;

  v_falhas := coalesce(v_falhas, 0) + 1;
  v_ate := case when v_falhas >= 5 then now() + interval '15 minutes' else null end;

  insert into public.pin_tentativas (user_id, falhas, bloqueado_ate, atualizado_em)
    values (v_uid, v_falhas, v_ate, now())
    on conflict (user_id) do update set falhas = v_falhas, bloqueado_ate = v_ate, atualizado_em = now();

  return jsonb_build_object('ok', false, 'erro', 'pin incorreto', 'falhas', v_falhas, 'restantes', greatest(0, 5 - v_falhas));
end;
$fn$;

revoke all on function public.verificar_pin(text) from anon;
grant execute on function public.verificar_pin(text) to authenticated;