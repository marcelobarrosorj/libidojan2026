create or replace function public.excluir_minha_conta()
returns jsonb language plpgsql security definer set search_path = public
as $fn$
declare
  v_uid    text := auth.uid()::text;
  v_claims text := current_setting('request.jwt.claims', true);
begin
  if v_uid is null or v_uid = '' then
    return jsonb_build_object('ok', false, 'motivo', 'sem_sessao');
  end if;

  perform set_config('request.jwt.claims', '', true);

  update public.users
     set is_deleted = true,
         updated_at = now()
   where user_id = v_uid;

  perform set_config('request.jwt.claims', coalesce(v_claims, ''), true);

  return jsonb_build_object('ok', true);
exception
  when others then
    return jsonb_build_object('ok', false, 'motivo', 'erro_banco', 'detalhe', sqlerrm);
end;
$fn$;
revoke all on function public.excluir_minha_conta() from anon;
grant execute on function public.excluir_minha_conta() to authenticated;