create or replace function public.excluir_minha_conta()
returns void
language plpgsql
security definer
set search_path = public, auth, storage
as $fn$
declare v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'nao autenticado';
  end if;
  begin delete from public.posts where user_id = v_uid; exception when others then null; end;
  begin delete from public.reports where reporter_id = v_uid; exception when others then null; end;
  begin delete from public.reports where target_id = v_uid; exception when others then null; end;
  begin delete from public.admin_logs where admin_id = v_uid; exception when others then null; end;
  begin delete from public.admin_logs where target_id = v_uid; exception when others then null; end;
  begin delete from public.payment_transactions where user_id = v_uid; exception when others then null; end;
  begin delete from public.follows where follower_id = v_uid; exception when others then null; end;
  begin delete from public.follows where following_id = v_uid; exception when others then null; end;
  begin delete from public.message_reactions where user_id = v_uid; exception when others then null; end;
  begin delete from public.user_presence where user_id = v_uid; exception when others then null; end;
  begin delete from public.push_subscriptions where user_id = v_uid; exception when others then null; end;
  begin delete from public.conversation_settings where user_id = v_uid; exception when others then null; end;
  begin delete from public.conversation_settings where peer_id = v_uid; exception when others then null; end;
  begin delete from public.user_profiles where user_id = v_uid; exception when others then null; end;
  begin delete from public.user_subscriptions where user_id = v_uid; exception when others then null; end;
  begin delete from public.post_comments where user_id = v_uid; exception when others then null; end;
  begin delete from public.user_roles where user_id = v_uid; exception when others then null; end;
  begin delete from public.conversas_ocultas_legado where user_id = v_uid; exception when others then null; end;
  begin delete from public.post_likes where user_id = v_uid; exception when others then null; end;
  begin delete from public.premium_auditoria where user_id = v_uid; exception when others then null; end;
  begin delete from public.mensagens_ocultas_legado where user_id = v_uid; exception when others then null; end;
  begin delete from public.promo_usos where user_id = v_uid; exception when others then null; end;
  begin delete from public.conversas_ocultas where user_id = v_uid; exception when others then null; end;
  begin delete from public.conversas_ocultas where peer_id = v_uid; exception when others then null; end;
  begin delete from public.groups where owner_id = v_uid; exception when others then null; end;
  begin delete from public.presenca_publica where user_id = v_uid; exception when others then null; end;
  begin delete from public.forum_threads where user_id = v_uid; exception when others then null; end;
  begin delete from public.forum_posts where user_id = v_uid; exception when others then null; end;
  begin delete from public.events where user_id = v_uid; exception when others then null; end;
  begin delete from public.mensagens_ocultas where user_id = v_uid; exception when others then null; end;
  delete from public.users where user_id = v_uid;
  begin delete from storage.objects where owner = v_uid::text; exception when others then null; end;
  delete from auth.users where id = v_uid;
end;
$fn$;
grant execute on function public.excluir_minha_conta() to authenticated;
notify pgrst, 'reload schema';