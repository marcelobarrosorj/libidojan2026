create or replace function public.marcar_presenca(p_online boolean)
returns void language plpgsql security definer set search_path = public
as $fn$
declare v_uid text := auth.uid()::text;
begin
  if v_uid is null or v_uid = '' then return; end if;
  update public.users
     set is_online = coalesce(p_online, false),
         updated_at = now()
   where user_id = v_uid;
end;
$fn$;
revoke all on function public.marcar_presenca(boolean) from anon;
grant execute on function public.marcar_presenca(boolean) to authenticated;