-- Migration 0003: excluir_minha_conta com FK real, nome e cast por tipo
-- Gerada em 2026-11-06 10:57
-- Cobre admin_id, target_id, reporter_id e users.user_id em texto.

create or replace function public.excluir_minha_conta()
returns void
language plpgsql
security definer
set search_path = public, auth, storage
as $body$
declare
  v_uid uuid := auth.uid();
  v_txt text;
begin
  if v_uid is null then
    raise exception 'nao autenticado';
  end if;
  v_txt := v_uid::text;

  begin delete from storage.objects where owner = v_txt; exception when others then null; end;
  begin delete from public.messages where receiver_id = v_uid or sender_id = v_uid; exception when others then null; end;
  begin delete from public.message_reactions where user_id = v_uid; exception when others then null; end;
  begin delete from public.post_likes where user_id = v_txt; exception when others then null; end;
  begin delete from public.post_comments where user_id = v_txt; exception when others then null; end;
  begin delete from public.posts where user_id = v_txt; exception when others then null; end;
  begin delete from public.forum_posts where user_id = v_txt; exception when others then null; end;
  begin delete from public.forum_threads where user_id = v_txt; exception when others then null; end;
  begin delete from public.follows where follower_id = v_txt or following_id = v_txt; exception when others then null; end;
  begin delete from public.mensagens_ocultas where user_id = v_uid; exception when others then null; end;
  begin delete from public.mensagens_ocultas_legado where user_id = v_uid; exception when others then null; end;
  begin delete from public.conversas_ocultas where peer_id = v_uid or user_id = v_uid; exception when others then null; end;
  begin delete from public.conversas_ocultas_legado where user_id = v_uid; exception when others then null; end;
  begin delete from public.conversation_settings where peer_id = v_uid or user_id = v_uid; exception when others then null; end;
  begin delete from public.user_presence where user_id = v_uid; exception when others then null; end;
  begin delete from public.presenca_publica where user_id = v_uid; exception when others then null; end;
  begin delete from public.promo_usos where user_id = v_txt; exception when others then null; end;
  begin delete from public.events where user_id = v_txt; exception when others then null; end;
  begin delete from public.push_subscriptions where user_id = v_uid; exception when others then null; end;
  begin delete from public.user_profiles where user_id = v_txt; exception when others then null; end;
  begin delete from public.user_roles where user_id = v_txt; exception when others then null; end;
  begin delete from public.profiles where id = v_uid; exception when others then null; end;

  begin update public.payment_transactions set user_id = null where user_id = v_txt; exception when others then null; end;
  begin update public.user_subscriptions set user_id = null where user_id = v_uid; exception when others then null; end;
  begin update public.premium_auditoria set user_id = null where user_id = v_txt; exception when others then null; end;
  begin update public.admin_logs set admin_id = null where admin_id = v_txt; exception when others then null; end;
  begin update public.admin_logs set target_id = null where target_id = v_txt; exception when others then null; end;
  begin update public.reports set reporter_id = null where reporter_id = v_txt; exception when others then null; end;
  begin update public.reports set target_id = null where target_id = v_txt; exception when others then null; end;
  begin update public.groups set owner_id = null where owner_id = v_txt; exception when others then null; end;

  delete from public.users where user_id = v_txt;
  delete from auth.users where id = v_uid;
end;
$body$;

grant execute on function public.excluir_minha_conta() to authenticated;

notify pgrst, 'reload schema';