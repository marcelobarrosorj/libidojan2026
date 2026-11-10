drop function if exists public.excluir_minha_conta();

create function public.excluir_minha_conta()
returns jsonb
language plpgsql
security definer
set search_path = public
as $fn$
declare
  v_uid    text := auth.uid()::text;
  v_claims text := current_setting('request.jwt.claims', true);
begin
  if v_uid is null or v_uid = '' then
    return jsonb_build_object('ok', false, 'motivo', 'sem_sessao');
  end if;

  begin execute 'delete from public.messages where sender_id::text = $1 or receiver_id::text = $1' using v_uid; exception when others then null; end;
  begin execute 'delete from public.posts where user_id::text = $1' using v_uid; exception when others then null; end;
  begin execute 'delete from public.post_comments where user_id::text = $1' using v_uid; exception when others then null; end;
  begin execute 'delete from public.post_likes where user_id::text = $1' using v_uid; exception when others then null; end;
  begin execute 'delete from public.follows where follower_id::text = $1 or following_id::text = $1' using v_uid; exception when others then null; end;
  begin execute 'delete from public.profile_visits where visitor_id::text = $1 or visited_id::text = $1' using v_uid; exception when others then null; end;
  begin execute 'delete from public.push_subscriptions where user_id::text = $1' using v_uid; exception when others then null; end;
  begin execute 'delete from public.mensagens_ocultas where user_id::text = $1' using v_uid; exception when others then null; end;
  begin execute 'delete from public.conversas_ocultas where user_id::text = $1' using v_uid; exception when others then null; end;
  begin execute 'delete from public.user_pins where user_id::text = $1' using v_uid; exception when others then null; end;

  perform set_config('request.jwt.claims', '{}', true);

  update public.users
     set is_deleted = true,
         is_online  = false,
         updated_at = now()
   where user_id = v_uid;

  perform set_config('request.jwt.claims', coalesce(v_claims, ''), true);

  return jsonb_build_object('ok', true);
exception
  when others then
    perform set_config('request.jwt.claims', coalesce(v_claims, ''), true);
    return jsonb_build_object('ok', false, 'motivo', 'erro_banco', 'detalhe', sqlerrm);
end;
$fn$;

revoke all on function public.excluir_minha_conta() from anon;
grant execute on function public.excluir_minha_conta() to authenticated;