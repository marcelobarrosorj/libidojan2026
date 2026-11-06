create or replace function public.definir_pin(p_pin text)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $fn$
declare
  v_uid text := auth.uid()::text;
begin
  if v_uid is null or v_uid = '' then
    return jsonb_build_object('ok', false, 'erro', 'nao autenticado');
  end if;

  if p_pin is null or p_pin !~ '^[0-9]{4}$' then
    return jsonb_build_object('ok', false, 'erro', 'pin deve ter 4 digitos');
  end if;

  update public.users
     set pin = crypt(p_pin, gen_salt('bf', 10))
   where user_id = v_uid;

  insert into public.pin_tentativas (user_id, falhas, bloqueado_ate, atualizado_em)
    values (v_uid, 0, null, now())
    on conflict (user_id) do update set falhas = 0, bloqueado_ate = null, atualizado_em = now();

  return jsonb_build_object('ok', true);
end;
$fn$;

revoke all on function public.definir_pin(text) from anon;
grant execute on function public.definir_pin(text) to authenticated;