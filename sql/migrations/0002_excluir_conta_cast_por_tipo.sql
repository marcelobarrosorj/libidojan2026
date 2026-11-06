-- Migration 0002: excluir_minha_conta com cast por tipo de coluna
-- Gerada do banco em 2026-11-06 10:41
-- Corrige: colunas em text nao eram apagadas por comparacao uuid

alter table public.admin_logs alter column admin_id drop not null;
alter table public.payment_transactions alter column user_id drop not null;
alter table public.reports alter column reporter_id drop not null;
alter table public.reports alter column target_id drop not null;

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
  begin delete from storage.objects where owner = v_uid::text; exception when others then null; end;
  begin delete from public.messages where receiver_id = v_uid or sender_id = v_uid; exception when others then null; end;
  begin delete from public.message_reactions where user_id = v_uid; exception when others then null; end;
  begin delete from public.post_likes where user_id = v_txt; exception when others then null; end;
  begin delete from public.post_comments where user_id = v_txt; exception when others then null; end;
  begin delete from public.posts where user_id = v_txt; exception when others then null; end;
  begin delete from public.forum_posts where user_id = v_txt; exception when others then null; end;
  begin delete from public.forum_threads where user_id = v_txt; exception when others then null; end;
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

  delete from public.users where user_id = v_uid;
  delete from auth.users where id = v_uid;
end;
$body$;

grant execute on function public.excluir_minha_conta() to authenticated;

notify pgrst, 'reload schema';