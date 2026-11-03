-- ============================================================================
--  LIBIDO ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â exclusao estilo WhatsApp + midia de visualizacao unica
--  Rodar no SQL Editor do Supabase. Idempotente: pode repetir sem efeito colateral.
-- ============================================================================
begin;

-- 1. COLUNAS DE CONTROLE -----------------------------------------------------
alter table public.messages add column if not exists apagada_para_todos boolean not null default false;
alter table public.messages add column if not exists apagada_em timestamptz;
alter table public.messages add column if not exists apagada_por uuid;
alter table public.messages add column if not exists view_once boolean not null default false;
alter table public.messages add column if not exists viewed_at timestamptz;
alter table public.messages add column if not exists consumida_em timestamptz;
alter table public.messages add column if not exists media_path text;
alter table public.messages add column if not exists apagada_geral boolean not null default false;
alter table public.messages add column if not exists media_meta jsonb;

create index if not exists idx_msg_par on public.messages (sender_id, receiver_id, created_at desc);
create index if not exists idx_msg_viewonce on public.messages (receiver_id) where view_once and viewed_at is null;

-- 2. APAGAR PARA MIM ---------------------------------------------------------
create table if not exists public.mensagens_ocultas (
  user_id     uuid not null references auth.users(id) on delete cascade,
  message_id  text not null,
  ocultada_em timestamptz not null default now(),
  primary key (user_id, message_id)
);
alter table public.mensagens_ocultas add column if not exists ocultada_em timestamptz not null default now();
alter table public.mensagens_ocultas enable row level security;
drop policy if exists mo_sel on public.mensagens_ocultas;
drop policy if exists mo_ins on public.mensagens_ocultas;
drop policy if exists mo_del on public.mensagens_ocultas;
create policy mo_sel on public.mensagens_ocultas for select to authenticated using (auth.uid() = user_id);
create policy mo_ins on public.mensagens_ocultas for insert to authenticated with check (auth.uid() = user_id);
create policy mo_del on public.mensagens_ocultas for delete to authenticated using (auth.uid() = user_id);
grant select, insert, delete on public.mensagens_ocultas to authenticated;

-- 3. APAGAR / LIMPAR CONVERSA ------------------------------------------------
create table if not exists public.conversas_ocultas (
  user_id    uuid not null references auth.users(id) on delete cascade,
  peer_id    uuid not null,
  limpar_ate timestamptz,
  oculta_em  timestamptz,
  updated_at timestamptz not null default now(),
  primary key (user_id, peer_id)
);
alter table public.conversas_ocultas add column if not exists limpar_ate timestamptz;
alter table public.conversas_ocultas add column if not exists oculta_em  timestamptz;
alter table public.conversas_ocultas add column if not exists updated_at timestamptz not null default now();
alter table public.conversas_ocultas enable row level security;
drop policy if exists co_sel on public.conversas_ocultas;
drop policy if exists co_ins on public.conversas_ocultas;
drop policy if exists co_upd on public.conversas_ocultas;
drop policy if exists co_del on public.conversas_ocultas;
create policy co_sel on public.conversas_ocultas for select to authenticated using (auth.uid() = user_id);
create policy co_ins on public.conversas_ocultas for insert to authenticated with check (auth.uid() = user_id);
create policy co_upd on public.conversas_ocultas for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy co_del on public.conversas_ocultas for delete to authenticated using (auth.uid() = user_id);
grant select, insert, update, delete on public.conversas_ocultas to authenticated;

-- 4. FECHAR O BYPASS ---------------------------------------------------------
-- Cliente perde UPDATE amplo; so pode alterar status de entrega/leitura.
-- POLITICA DE ESCRITA DO CLIENTE -----------------------------------------
-- BLOQUEADAS PARA SEMPRE (nucleo da midia de visualizacao unica):
--   viewed_at, view_once, media_url, media_path, consumida_em
-- LIBERADAS (exclusao e edicao legitimas do app):
--   apagada_para_todos, apagada_em, apagada_por, apagada_geral,
--   content, edited_at, edited_by, fixada, status, delivered_at, read_at, media_type
-- Somente colunas que EXISTIREM recebem o grant (information_schema).
do $$$$
declare
  permitidas text[] := array[
    'status','delivered_at','read_at','content','edited_at','edited_by',
    'fixada','media_type',
    'apagada_para_todos','apagada_em','apagada_por','apagada_geral'
  ];
  c text;
begin
  revoke update on public.messages from authenticated;
  foreach c in array permitidas loop
    if exists (select 1 from information_schema.columns
               where table_schema = 'public'
                 and table_name   = 'messages'
                 and column_name  = c) then
      execute format('grant update (%I) on public.messages to authenticated', c);
    end if;
  end loop;
end $$$$;

-- 5. HELPER: destruir objeto do Storage a partir da URL ----------------------
create or replace function public._midia_apagar_objeto(p_url text)
returns void language plpgsql security definer set search_path = public, storage as $$
declare v_b text; v_o text;
begin
  if p_url is null or p_url = '' then return; end if;
  if p_url ~ '/object/(public|sign|authenticated)/' then
    v_b := substring(p_url from '/object/(?:public|sign|authenticated)/([^/]+)/');
    v_o := substring(p_url from '/object/(?:public|sign|authenticated)/[^/]+/(.+?)(?:\?|$)');
  else
    v_b := 'midia-unica';
    v_o := p_url;
  end if;
  if v_b is null or v_o is null then return; end if;
  begin
    delete from storage.objects o where o.bucket_id = v_b and o.name = v_o;
  exception when others then null;
  end;
end $$;

-- 6. LISTAR CONVERSAS (nasce de messages, nao de user_profiles) --------------
create or replace function public.listar_conversas()
returns table (
  peer_id uuid, ultima_mensagem text, ultima_em timestamptz,
  ultimo_de uuid, nao_lidas bigint, midia_pendente boolean
)
language sql security definer set search_path = public as $$
with me as (select auth.uid() as uid),
base as (
  select m.*,
         case when m.sender_id = (select uid from me) then m.receiver_id else m.sender_id end as peer
  from public.messages m
  where (m.sender_id = (select uid from me) or m.receiver_id = (select uid from me))
    and not exists (
      select 1 from public.mensagens_ocultas o
      where o.user_id = (select uid from me) and o.message_id = m.id::text
    )
),
filtrado as (
  select b.* from base b
  where b.created_at > coalesce(
    (select c.limpar_ate from public.conversas_ocultas c
      where c.user_id = (select uid from me) and c.peer_id = b.peer),
    '-infinity'::timestamptz)
),
ult as (
  select distinct on (peer) peer, content, created_at, sender_id,
         apagada_para_todos, view_once, viewed_at
  from filtrado order by peer, created_at desc
)
select u.peer,
       case when u.apagada_para_todos then 'Mensagem apagada'
            when u.view_once          then 'Foto'
            else coalesce(nullif(u.content, ''), 'Mensagem') end,
       u.created_at, u.sender_id,
       (select count(*) from filtrado f
         where f.peer = u.peer and f.receiver_id = (select uid from me)
           and coalesce(f.status, '') <> 'read'
           and not f.apagada_para_todos),
       exists (select 1 from filtrado f
         where f.peer = u.peer and f.view_once
           and f.receiver_id = (select uid from me) and f.viewed_at is null)
from ult u
where coalesce(
  (select c.oculta_em from public.conversas_ocultas c
    where c.user_id = (select uid from me) and c.peer_id = u.peer),
  '-infinity'::timestamptz) < u.created_at
order by u.created_at desc;
$$;

-- 7. LISTAR MENSAGENS (mascara midia no servidor) ----------------------------
create or replace function public.listar_mensagens(p_peer uuid, p_limit int default 300)
returns table (
  id text, sender_id uuid, receiver_id uuid, content text, created_at timestamptz,
  status text, delivered_at timestamptz, read_at timestamptz,
  media_url text, media_type text, view_once boolean, viewed_at timestamptz,
  apagada_para_todos boolean, apagada_em timestamptz, midia_disponivel boolean
)
language sql security definer set search_path = public as $$
with me as (select auth.uid() as uid),
corte as (
  select coalesce(
    (select c.limpar_ate from public.conversas_ocultas c
      where c.user_id = (select uid from me) and c.peer_id = p_peer),
    '-infinity'::timestamptz) as t
)
select m.id::text, m.sender_id, m.receiver_id,
       case when m.apagada_para_todos then '' else coalesce(m.content, '') end,
       m.created_at, m.status, m.delivered_at, m.read_at,
       case when m.apagada_para_todos then null
            when m.view_once and m.viewed_at is not null then null
            else m.media_url end,
       m.media_type, m.view_once, m.viewed_at, m.apagada_para_todos, m.apagada_em,
       (m.media_url is not null
        and not m.apagada_para_todos
        and (not m.view_once or m.viewed_at is null))
from public.messages m, me, corte
where (m.sender_id = me.uid or m.receiver_id = me.uid)
  and (m.sender_id = p_peer or m.receiver_id = p_peer)
  and m.created_at > corte.t
  and not exists (
    select 1 from public.mensagens_ocultas o
    where o.user_id = me.uid and o.message_id = m.id::text
  )
order by m.created_at desc
limit greatest(1, least(p_limit, 1000));
$$;

-- 8. ABRIR MIDIA UNICA (atomico, uma vez) ------------------------------------
create or replace function public.abrir_midia_unica(p_message text)
returns table (url text, ja_aberta boolean)
language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid(); v_url text;
begin
  if v_uid is null then raise exception 'nao autenticado'; end if;

  select m.media_url into v_url
    from public.messages m
   where m.id::text = p_message
     and m.receiver_id = v_uid
     and m.view_once = true
     and m.viewed_at is null
   for update;

  if v_url is null then
    return query select null::text, true;
    return;
  end if;

  update public.messages
     set viewed_at = now(),
         consumida_em = now(),
         media_path = coalesce(media_path, v_url),
         media_url = null
   where id::text = p_message;

  return query select v_url, false;
end $$;

-- 9. CONFIRMAR CONSUMO -------------------------------------------------------
create or replace function public.confirmar_midia_consumida(p_message text)
returns void language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid(); v_url text;
begin
  if v_uid is null then return; end if;
  select m.media_path into v_url
    from public.messages m
   where m.id::text = p_message and m.receiver_id = v_uid and m.consumida_em is not null;
  perform public._midia_apagar_objeto(v_url);
end $$;

-- 10. VARREDURA PERIODICA ----------------------------------------------------
create or replace function public.limpar_midias_consumidas(p_minutos int default 10)
returns integer language plpgsql security definer set search_path = public as $$
declare r record; n int := 0;
begin
  for r in
    select m.id::text as id, m.media_path
      from public.messages m
     where m.view_once and m.consumida_em is not null and m.media_path is not null
       and m.consumida_em < now() - (p_minutos || ' minutes')::interval
  loop
    perform public._midia_apagar_objeto(r.media_path);
    update public.messages set media_path = null where id::text = r.id;
    n := n + 1;
  end loop;
  return n;
end $$;

-- 11. APAGAR PARA MIM --------------------------------------------------------
create or replace function public.apagar_para_mim(p_message text)
returns boolean language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid();
begin
  if v_uid is null then raise exception 'nao autenticado'; end if;
  insert into public.mensagens_ocultas (user_id, message_id)
  select v_uid, m.id::text
    from public.messages m
   where m.id::text = p_message
     and (m.sender_id = v_uid or m.receiver_id = v_uid)
  on conflict (user_id, message_id) do nothing;
  return found;
end $$;

-- 12. APAGAR PARA TODOS (48h, so remetente) ----------------------------------
create or replace function public.apagar_para_todos(p_message text)
returns boolean language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid(); v_url text;
begin
  if v_uid is null then raise exception 'nao autenticado'; end if;

  select coalesce(m.media_path, m.media_url) into v_url
    from public.messages m
   where m.id::text = p_message
     and m.sender_id = v_uid
     and m.apagada_para_todos = false
     and m.created_at > now() - interval '48 hours';

  if not found then return false; end if;

  perform public._midia_apagar_objeto(v_url);

  update public.messages
     set apagada_para_todos = true, apagada_em = now(), apagada_por = v_uid,
         content = '', media_url = null, media_path = null
   where id::text = p_message and sender_id = v_uid;

  -- Espelha o estado para o esquema paralelo usado por chatAvancado.ts.
  -- Guardas de existencia: o script nunca falha por coluna ausente.
  if exists (select 1 from information_schema.columns
              where table_schema = 'public' and table_name = 'messages'
                and column_name = 'apagada_geral') then
    execute format('update public.messages set apagada_geral = true where id::text = %L', p_message);
  end if;
  if exists (select 1 from information_schema.columns
              where table_schema = 'public' and table_name = 'messages'
                and column_name = 'media_meta') then
    execute format('update public.messages set media_meta = null where id::text = %L', p_message);
  end if;

  return true;
end $$;

-- 13. LIMPAR / APAGAR CONVERSA -----------------------------------------------
create or replace function public.limpar_conversa(p_peer uuid, p_ocultar boolean default false)
returns void language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid();
begin
  if v_uid is null then raise exception 'nao autenticado'; end if;
  insert into public.conversas_ocultas (user_id, peer_id, limpar_ate, oculta_em, updated_at)
  values (v_uid, p_peer, now(), case when p_ocultar then now() else null end, now())
  on conflict (user_id, peer_id) do update
    set limpar_ate = now(),
        oculta_em  = case when p_ocultar then now() else null end,
        updated_at = now();
end $$;

-- 14. PERMISSOES -------------------------------------------------------------
do $$
declare f text;
begin
  foreach f in array array[
    'public.listar_conversas()','public.listar_mensagens(uuid,int)',
    'public.abrir_midia_unica(text)','public.confirmar_midia_consumida(text)',
    'public.apagar_para_mim(text)','public.apagar_para_todos(text)',
    'public.limpar_conversa(uuid,boolean)','public.limpar_midias_consumidas(int)',
    'public._midia_apagar_objeto(text)'
  ] loop
    execute format('revoke all on function %s from anon', f);
    execute format('revoke all on function %s from public', f);
  end loop;

  foreach f in array array[
    'public.listar_conversas()','public.listar_mensagens(uuid,int)',
    'public.abrir_midia_unica(text)','public.confirmar_midia_consumida(text)',
    'public.apagar_para_mim(text)','public.apagar_para_todos(text)',
    'public.limpar_conversa(uuid,boolean)'
  ] loop
    execute format('grant execute on function %s to authenticated', f);
  end loop;
end $$;

commit;