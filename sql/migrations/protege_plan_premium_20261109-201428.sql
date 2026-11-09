create or replace function public.proteger_campos_usuario()
returns trigger language plpgsql security definer set search_path to 'public'
as $fn$
declare
  v_old jsonb := to_jsonb(old);
  v_new jsonb := to_jsonb(new);
  v_chave text;
  v_lista text[] := array[
    'user_id','role','status','is_banned','is_deleted','is_admin','is_premium',
    'subscription_status','subscription_current_period_end','stripe_customer_id',
    'premium_expires_at','premium_since','created_at',
    'premium','plan','premium_until'
  ];
begin
  if auth.uid() is null then return new; end if;
  if coalesce(public.is_admin(), false) then return new; end if;
  foreach v_chave in array v_lista loop
    if (v_new ? v_chave) or (v_old ? v_chave) then
      if (v_new -> v_chave) is distinct from (v_old -> v_chave) then
        raise exception 'campo protegido: %', v_chave;
      end if;
    end if;
  end loop;
  return new;
end;
$fn$;