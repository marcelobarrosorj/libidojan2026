create table if not exists public.user_pins (
  user_id text primary key,
  pin_hash text not null,
  atualizado_em timestamptz not null default now()
);
alter table public.user_pins enable row level security;
revoke all on public.user_pins from anon, authenticated;

insert into public.user_pins (user_id, pin_hash)
select user_id, pin from public.users
where pin is not null and length(pin)=60 and left(pin,1)=chr(36)
on conflict (user_id) do update set pin_hash=excluded.pin_hash, atualizado_em=now();

update public.users u set pin = case when exists (select 1 from public.user_pins p where p.user_id=u.user_id) then '1' else null end;

create or replace function public.verificar_pin(p_pin text)
returns jsonb language plpgsql security definer
set search_path = public, extensions, auth
as $fn$
declare
  v_uid text := auth.uid()::text;
  v_falhas int := 0;
  v_ate timestamptz;
  v_hash text;
begin
  if v_uid is null or v_uid='' then return jsonb_build_object('ok',false,'erro','nao autenticado'); end if;
  if p_pin is null or length(p_pin)=0 then return jsonb_build_object('ok',false,'erro','pin vazio'); end if;

  select falhas, bloqueado_ate into v_falhas, v_ate from public.pin_tentativas where user_id=v_uid;
  if v_ate is not null and v_ate > now() then
    return jsonb_build_object('ok',false,'erro','bloqueado','ate',v_ate);
  end if;

  select pin_hash into v_hash from public.user_pins where user_id=v_uid;
  if v_hash is null then return jsonb_build_object('ok',false,'erro','sem pin definido'); end if;

  if v_hash = crypt(p_pin, v_hash) then
    insert into public.pin_tentativas (user_id,falhas,bloqueado_ate,atualizado_em) values (v_uid,0,null,now())
      on conflict (user_id) do update set falhas=0, bloqueado_ate=null, atualizado_em=now();
    return jsonb_build_object('ok',true);
  end if;

  v_falhas := coalesce(v_falhas,0)+1;
  v_ate := case when v_falhas>=5 then now()+interval '15 minutes' else null end;
  insert into public.pin_tentativas (user_id,falhas,bloqueado_ate,atualizado_em) values (v_uid,v_falhas,v_ate,now())
    on conflict (user_id) do update set falhas=v_falhas, bloqueado_ate=v_ate, atualizado_em=now();
  return jsonb_build_object('ok',false,'erro','pin incorreto','falhas',v_falhas,'restantes',greatest(0,5-v_falhas));
end;
$fn$;

create or replace function public.definir_pin(p_pin text)
returns jsonb language plpgsql security definer
set search_path = public, extensions, auth
as $fn$
declare v_uid text := auth.uid()::text;
begin
  if v_uid is null or v_uid='' then return jsonb_build_object('ok',false,'erro','nao autenticado'); end if;
  if p_pin is null or p_pin !~ '^[0-9]{4}$' then return jsonb_build_object('ok',false,'erro','pin deve ter 4 digitos'); end if;

  insert into public.user_pins (user_id,pin_hash,atualizado_em) values (v_uid, crypt(p_pin, gen_salt('bf',10)), now())
    on conflict (user_id) do update set pin_hash=excluded.pin_hash, atualizado_em=now();

  update public.users set pin='1' where user_id=v_uid;

  insert into public.pin_tentativas (user_id,falhas,bloqueado_ate,atualizado_em) values (v_uid,0,null,now())
    on conflict (user_id) do update set falhas=0, bloqueado_ate=null, atualizado_em=now();
  return jsonb_build_object('ok',true);
end;
$fn$;

create or replace function public.tem_pin()
returns boolean language sql security definer set search_path = public
as $fn$ select exists (select 1 from public.user_pins where user_id = auth.uid()::text); $fn$;

revoke all on function public.verificar_pin(text) from anon;
grant execute on function public.verificar_pin(text) to authenticated;
revoke all on function public.definir_pin(text) from anon;
grant execute on function public.definir_pin(text) to authenticated;
grant execute on function public.tem_pin() to authenticated;