-- Funcoes de public
-- Gerado: 2026-11-04 19:31

-- _midia_apagar_objeto(p_url text)
CREATE OR REPLACE FUNCTION public._midia_apagar_objeto(p_url text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'storage'
AS $function$
declare v_b text; v_o text;
begin
  if p_url is null or p_url = '' then return; end if;
  if p_url ~ '/object/(public|sign|authenticated)/' then
    v_b := substring(p_url from '/object/(?:public|sign|authenticated)/([^/]+)/');
    v_o := substring(p_url from '/object/(?:public|sign|authenticated)/[^/]+/(.+?)(?:\?|$)');
  else
    v_b := 'midia-unica'; v_o := p_url;
  end if;
  if v_b is null or v_o is null then return; end if;
  begin
    delete from storage.objects o where o.bucket_id = v_b and o.name = v_o;
  exception when others then null;
  end;
end $function$;

-- abrir_foto_unica(p_message text)
CREATE OR REPLACE FUNCTION public.abrir_foto_unica(p_message text)
 RETURNS TABLE(url text, ja_aberta boolean)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_uid uuid := auth.uid(); v_url text;
begin
  if v_uid is null then raise exception 'nao autenticado'; end if;

  select u.url into v_url
    from public.midia_unica u
    join public.messages m on m.id::text = u.message_id
   where u.message_id = p_message
     and m.receiver_id = v_uid
     and not m.apagada_para_todos
     and m.content like '[FOTO1X]%'
   for update of u;

  if v_url is null then
    return query select null::text, true;
    return;
  end if;

  delete from public.midia_unica where message_id = p_message;

  update public.messages
     set media_path   = v_url,
         consumida_em = now(),
         viewed_at    = now()
   where id::text = p_message;

  return query select v_url, false;
end $function$;

-- abrir_midia_unica(p_message text)
CREATE OR REPLACE FUNCTION public.abrir_midia_unica(p_message text)
 RETURNS TABLE(url text, ja_aberta boolean)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_uid uuid := auth.uid(); v_url text;
begin
  if v_uid is null then raise exception 'nao autenticado'; end if;

  select u.url into v_url
    from public.midia_unica u
    join public.messages m on m.id::text = u.message_id
   where u.message_id = p_message
     and m.receiver_id = v_uid
     and m.view_once = true
     and m.viewed_at is null
   for update of u;

  if v_url is null then
    return query select null::text, true;
    return;
  end if;

  -- o registro some: segunda chamada nao tem de onde ler
  delete from public.midia_unica where message_id = p_message;

  update public.messages
     set viewed_at    = now(),
         consumida_em = now(),
         media_path   = coalesce(media_path, v_url),
         media_url    = null
   where id::text = p_message;

  return query select v_url, false;
end $function$;

-- alternar_bloqueio(p_target_id text)
CREATE OR REPLACE FUNCTION public.alternar_bloqueio(p_target_id text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_me text := (auth.uid())::text;
  v_existe uuid;
BEGIN
  IF v_me IS NULL OR p_target_id IS NULL OR v_me = p_target_id THEN
    RETURN jsonb_build_object('ok', false, 'erro', 'Operacao invalida.');
  END IF;
  SELECT id INTO v_existe FROM public.blocks WHERE blocker_id = v_me AND blocked_id = p_target_id LIMIT 1;
  IF v_existe IS NOT NULL THEN
    DELETE FROM public.blocks WHERE id = v_existe;
    RETURN jsonb_build_object('ok', true, 'blocked', false);
  ELSE
    INSERT INTO public.blocks (blocker_id, blocked_id) VALUES (v_me, p_target_id) ON CONFLICT DO NOTHING;
    DELETE FROM public.follows WHERE (follower_id = v_me AND following_id = p_target_id) OR (follower_id = p_target_id AND following_id = v_me);
    RETURN jsonb_build_object('ok', true, 'blocked', true);
  END IF;
END;
$function$;

-- alternar_seguir(p_target_id text)
CREATE OR REPLACE FUNCTION public.alternar_seguir(p_target_id text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_me text := (auth.uid())::text;
  v_bloqueado boolean;
  v_ja_segue boolean;
  v_total integer;
BEGIN
  IF v_me IS NULL OR p_target_id IS NULL OR btrim(p_target_id) = '' OR v_me = p_target_id THEN
    RETURN jsonb_build_object('ok', false, 'erro', 'Operacao invalida.');
  END IF;
  SELECT EXISTS (SELECT 1 FROM public.blocks WHERE (blocker_id = v_me AND blocked_id = p_target_id) OR (blocker_id = p_target_id AND blocked_id = v_me)) INTO v_bloqueado;
  IF v_bloqueado THEN
    RETURN jsonb_build_object('ok', false, 'erro', 'Perfil indisponivel.');
  END IF;
  SELECT EXISTS (SELECT 1 FROM public.follows WHERE follower_id = v_me AND following_id = p_target_id) INTO v_ja_segue;
  IF v_ja_segue THEN
    DELETE FROM public.follows WHERE follower_id = v_me AND following_id = p_target_id;
    SELECT count(*)::integer INTO v_total FROM public.follows WHERE following_id = p_target_id;
    RETURN jsonb_build_object('ok', true, 'following', false, 'count', v_total);
  ELSE
    INSERT INTO public.follows (follower_id, following_id) VALUES (v_me, p_target_id) ON CONFLICT DO NOTHING;
    SELECT count(*)::integer INTO v_total FROM public.follows WHERE following_id = p_target_id;
    RETURN jsonb_build_object('ok', true, 'following', true, 'count', v_total);
  END IF;
END;
$function$;

-- apagar_para_mim(p_message text)
CREATE OR REPLACE FUNCTION public.apagar_para_mim(p_message text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_uid uuid := auth.uid();
begin
  if v_uid is null then raise exception 'nao autenticado'; end if;
  insert into public.mensagens_ocultas (user_id, message_id)
  select v_uid, m.id::text from public.messages m
   where m.id::text = p_message and (m.sender_id = v_uid or m.receiver_id = v_uid)
  on conflict (user_id, message_id) do nothing;
  return true;
end $function$;

-- apagar_para_mim(p_msg uuid)
CREATE OR REPLACE FUNCTION public.apagar_para_mim(p_msg uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_eu uuid := auth.uid();
begin
  if v_eu is null then
    return false;
  end if;

  update public.messages
     set apagada_para = array_append(apagada_para, v_eu)
   where id = p_msg
     and v_eu in (sender_id, receiver_id)
     and not (v_eu = any(apagada_para));

  return found;
end;
$function$;

-- apagar_para_todos(p_message text)
CREATE OR REPLACE FUNCTION public.apagar_para_todos(p_message text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_uid uuid := auth.uid(); v_url text;
begin
  if v_uid is null then raise exception 'nao autenticado'; end if;

  select coalesce(m.media_path, m.media_url,
                  (select u.url from public.midia_unica u where u.message_id = m.id::text))
    into v_url
    from public.messages m
   where m.id::text = p_message
     and m.sender_id = v_uid
     and not m.apagada_para_todos
     and m.created_at > now() - interval '48 hours';

  if not found then return false; end if;

  perform public._midia_apagar_objeto(v_url);
  delete from public.midia_unica where message_id = p_message;

  update public.messages
     set apagada_para_todos = true,
         apagada_em         = now(),
         apagada_por        = v_uid,
         content            = '[FOTO-REMOVIDA]',
         media_url          = null,
         media_path         = null,
         apagada_geral      = true,
         media_meta         = null
   where id::text = p_message and sender_id = v_uid;

  return true;
end $function$;

-- auto_confirm_new_users()
CREATE OR REPLACE FUNCTION public.auto_confirm_new_users()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
  NEW.email_confirmed_at := now();
  RETURN NEW;
END;
$function$;

-- block_self_follow()
CREATE OR REPLACE FUNCTION public.block_self_follow()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  IF NEW.follower_id = NEW.following_id THEN
    RAISE EXCEPTION 'Nao pode seguir a si mesmo';
  END IF;
  RETURN NEW;
END;
$function$;

-- buscar_mensagens(p_peer uuid, p_termo text)
CREATE OR REPLACE FUNCTION public.buscar_mensagens(p_peer uuid, p_termo text)
 RETURNS SETOF messages
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select
    m.id,
    m.sender_id,
    m.receiver_id,
    m.content,
    m.created_at,
    m.read_at,
    m.status,
    m.updated_at,
    m.delivered_at,
    m.edited_at,
    m.apagada_geral,
    '{}'::uuid[] as apagada_para,
    m.reply_to_id,
    m.tipo,
    m.media_url,
    m.media_meta,
    m.fixada,
    m.expires_at
  from public.messages m
  where p_termo is not null
    and length(btrim(p_termo)) >= 2
    and (
      (m.sender_id = auth.uid() and m.receiver_id = p_peer)
      or (m.receiver_id = auth.uid() and m.sender_id = p_peer)
    )
    and m.apagada_geral = false
    and not (auth.uid() = any(m.apagada_para))
    and to_tsvector('portuguese', coalesce(m.content, ''))
        @@ plainto_tsquery('portuguese', p_termo)
  order by m.created_at desc
  limit 50;
$function$;

-- check_user_premium(uid uuid)
CREATE OR REPLACE FUNCTION public.check_user_premium(uid uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.users u
    WHERE u.user_id = uid::text
      AND (
        u.role IN ('owner','admin','moderator')
        OR (u.premium_until IS NOT NULL AND u.premium_until > now())
        OR (u.premium = true AND u.premium_until IS NULL)
        OR EXISTS (
          SELECT 1 FROM public.user_subscriptions s
          WHERE s.user_id::text = u.user_id
            AND s.status = 'active'
            AND s.expires_at > now()
        )
      )
  );
$function$;

-- confirmar_midia_consumida(p_message text)
CREATE OR REPLACE FUNCTION public.confirmar_midia_consumida(p_message text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_uid uuid := auth.uid(); v_url text;
begin
  if v_uid is null then return; end if;
  select m.media_path into v_url
    from public.messages m
   where m.id::text = p_message and m.receiver_id = v_uid and m.consumida_em is not null;
  perform public._midia_apagar_objeto(v_url);
end $function$;

-- contar_nao_lidas()
CREATE OR REPLACE FUNCTION public.contar_nao_lidas()
 RETURNS TABLE(peer_id uuid, qtd bigint)
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select m.sender_id, count(*)::bigint
    from public.messages m
   where m.receiver_id = auth.uid()
     and m.read_at is null
     and m.apagada_geral = false
     and not (auth.uid() = any(m.apagada_para))
   group by m.sender_id;
$function$;

-- contar_seguidores(p_user_id text)
CREATE OR REPLACE FUNCTION public.contar_seguidores(p_user_id text)
 RETURNS integer
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT count(*)::integer FROM public.follows WHERE following_id = p_user_id;
$function$;

-- curtir_post(p_post_id text, p_delta integer)
CREATE OR REPLACE FUNCTION public.curtir_post(p_post_id text, p_delta integer)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_eu   uuid := auth.uid();
  v_post uuid;
begin
  if v_eu is null then
    return;
  end if;

  if p_delta not in (1, -1) then
    return;
  end if;

  if coalesce(p_post_id, '') !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
    return;
  end if;

  v_post := p_post_id::uuid;

  if not exists (select 1 from public.posts where id = v_post) then
    return;
  end if;

  if p_delta = -1 then
    delete from public.post_likes
     where post_id = v_post
       and user_id = v_eu::text;
  else
    insert into public.post_likes (post_id, user_id)
    values (v_post, v_eu::text)
    on conflict (post_id, user_id) do nothing;
  end if;

  perform public.recalcular_likes(v_post);
end;
$function$;

-- expirar_premium()
CREATE OR REPLACE FUNCTION public.expirar_premium()
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_qtd integer := 0;
begin
  update public.users
     set premium = false,
         updated_at = now()
   where premium is distinct from false
     and premium_until is not null
     and premium_until <= now()
     and coalesce(is_banned, false) = false
     and coalesce(is_deleted, false) = false;

  get diagnostics v_qtd = row_count;
  return v_qtd;
end;
$function$;

-- faixa_distancia(p_km double precision)
CREATE OR REPLACE FUNCTION public.faixa_distancia(p_km double precision)
 RETURNS TABLE(faixa text, ordem integer, anel_m integer)
 LANGUAGE sql
 IMMUTABLE
AS $function$
  select
    case
      when p_km is null then 'distancia indisponivel'
      when p_km < 0.5  then 'ate 500 m'
      when p_km < 1    then '500 m a 1 km'
      when p_km < 2    then '1 a 2 km'
      when p_km < 5    then '2 a 5 km'
      when p_km < 10   then '5 a 10 km'
      when p_km < 25   then '10 a 25 km'
      when p_km < 50   then '25 a 50 km'
      else 'mais de 50 km'
    end,
    case
      when p_km is null then 99
      when p_km < 0.5  then 1
      when p_km < 1    then 2
      when p_km < 2    then 3
      when p_km < 5    then 4
      when p_km < 10   then 5
      when p_km < 25   then 6
      when p_km < 50   then 7
      else 8
    end,
    case
      when p_km is null then null
      when p_km < 0.5  then 500
      when p_km < 1    then 1000
      when p_km < 2    then 2000
      when p_km < 5    then 5000
      when p_km < 10   then 10000
      when p_km < 25   then 25000
      when p_km < 50   then 50000
      else 50000
    end;
$function$;

-- garantir_perfil()
CREATE OR REPLACE FUNCTION public.garantir_perfil()
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_eu      uuid := auth.uid();
  v_apelido text;
  v_qtd     integer := 0;
begin
  if v_eu is null then
    return false;
  end if;

  if exists (select 1 from public.users where user_id = v_eu::text) then
    return false;
  end if;

  v_apelido := 'Membro ' || upper(right(replace(v_eu::text, '-', ''), 4));

  insert into public.users (user_id, nickname, status, is_online, is_deleted, is_banned, updated_at)
  select v_eu::text, v_apelido, 'active', false, false, false, now() at time zone 'UTC'
  where not exists (select 1 from public.users where user_id = v_eu::text);

  get diagnostics v_qtd = row_count;
  return v_qtd > 0;
end;
$function$;

-- get_user_role()
CREATE OR REPLACE FUNCTION public.get_user_role()
 RETURNS text
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT role
  FROM public.user_roles
  WHERE user_id = auth.uid()::text
  LIMIT 1;
$function$;

-- handle_new_user()
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'auth'
AS $function$
BEGIN
  INSERT INTO public.users (user_id, email, nickname)
  VALUES (new.id::text, new.email, split_part(new.email, '@', 1))
  ON CONFLICT (user_id) DO NOTHING;
  RETURN new;
END;
$function$;

-- increment_likes(post_id uuid)
CREATE OR REPLACE FUNCTION public.increment_likes(post_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  if auth.uid() is null then
    return;
  end if;

  perform public.recalcular_likes(post_id);
end;
$function$;

-- is_admin()
CREATE OR REPLACE FUNCTION public.is_admin()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE user_id = auth.uid()::text
      AND role IN ('owner', 'admin')
  );
$function$;

-- libido_delete_chat_file(p_path text)
CREATE OR REPLACE FUNCTION public.libido_delete_chat_file(p_path text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  if auth.uid() is null then
    return;
  end if;

  delete from storage.objects
  where bucket_id = 'photos'
    and name = p_path
    and name like '%/chat-%';
end;
$function$;

-- limpar_conversa(p_peer uuid, p_ocultar boolean)
CREATE OR REPLACE FUNCTION public.limpar_conversa(p_peer uuid, p_ocultar boolean DEFAULT false)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_uid uuid := auth.uid();
begin
  if v_uid is null then raise exception 'nao autenticado'; end if;
  insert into public.conversas_ocultas (user_id, peer_id, limpar_ate, oculta_em, updated_at)
  values (v_uid, p_peer, now(), case when p_ocultar then now() else null end, now())
  on conflict (user_id, peer_id) do update
    set limpar_ate = now(),
        oculta_em  = case when p_ocultar then now() else null end,
        updated_at = now();
end $function$;

-- limpar_feed_24h()
CREATE OR REPLACE FUNCTION public.limpar_feed_24h()
 RETURNS void
 LANGUAGE plpgsql
AS $function$
DECLARE
  alvo record;
  caminho text;
BEGIN
  FOR alvo IN SELECT id, image FROM public.posts WHERE created_at < now() - interval '24 hours' LOOP
    caminho := regexp_replace(alvo.image, '^https://[^/]+/storage/v1/object/public/photos/', '');
    IF caminho IS NOT NULL AND caminho <> alvo.image
       AND NOT EXISTS (SELECT 1 FROM public.posts p2 WHERE p2.image = alvo.image AND p2.id <> alvo.id)
       AND NOT EXISTS (SELECT 1 FROM public.users u
                       WHERE u.photo_url = alvo.image
                          OR u.photos::text LIKE '%' || alvo.image || '%')
    THEN
      BEGIN
        DELETE FROM storage.objects WHERE bucket_id = 'photos' AND name = caminho;
      EXCEPTION WHEN OTHERS THEN
        NULL; -- Supabase bloqueia exclusao direta via SQL; o post expira
              -- normalmente e o arquivo sai depois pela Storage API
      END;
    END IF;
    DELETE FROM public.posts WHERE id = alvo.id;
  END LOOP;
END;
$function$;

-- limpar_mensagens_expiradas()
CREATE OR REPLACE FUNCTION public.limpar_mensagens_expiradas()
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_qtd integer := 0;
begin
  delete from public.messages
   where expires_at is not null
     and expires_at < now();

  get diagnostics v_qtd = row_count;
  return v_qtd;
end;
$function$;

-- limpar_midias_consumidas(p_minutos integer)
CREATE OR REPLACE FUNCTION public.limpar_midias_consumidas(p_minutos integer DEFAULT 10)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare r record; n int := 0;
begin
  for r in select m.id::text as id, m.media_path from public.messages m
            where m.view_once and m.consumida_em is not null and m.media_path is not null
              and m.consumida_em < now() - (p_minutos || ' minutes')::interval
  loop
    perform public._midia_apagar_objeto(r.media_path);
    update public.messages set media_path = null where id::text = r.id;
    n := n + 1;
  end loop;
  return n;
end $function$;

-- limpar_presenca_fantasma()
CREATE OR REPLACE FUNCTION public.limpar_presenca_fantasma()
 RETURNS void
 LANGUAGE sql
AS $function$
  UPDATE public.users
  SET is_online = false
  WHERE is_online = true
    AND (updated_at IS NULL OR updated_at < now() - interval '30 minutes');
$function$;

-- listar_conversas()
CREATE OR REPLACE FUNCTION public.listar_conversas()
 RETURNS TABLE(peer_id uuid, ultima_mensagem text, ultima_em timestamp with time zone, ultimo_de uuid, nao_lidas bigint, midia_pendente boolean)
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
with me as (select auth.uid() as uid),
base as (
  select m.*, case when m.sender_id = (select uid from me) then m.receiver_id else m.sender_id end as peer
  from public.messages m
  where (m.sender_id = (select uid from me) or m.receiver_id = (select uid from me))
    and not exists (select 1 from public.mensagens_ocultas o
                    where o.user_id = (select uid from me) and o.message_id = m.id::text)
),
filtrado as (
  select b.* from base b
  where b.created_at > coalesce((select c.limpar_ate from public.conversas_ocultas c
      where c.user_id = (select uid from me) and c.peer_id = b.peer), '-infinity'::timestamptz)
),
ult as (
  select distinct on (peer) peer, content, created_at, sender_id, apagada_para_todos, view_once, viewed_at
  from filtrado order by peer, created_at desc
)
select u.peer,
       case when u.apagada_para_todos then 'Mensagem apagada'
            when u.view_once then 'Foto'
            else coalesce(nullif(u.content,''), 'Mensagem') end,
       u.created_at, u.sender_id,
       (select count(*) from filtrado f
         where f.peer = u.peer and f.receiver_id = (select uid from me)
           and coalesce(f.status,'') <> 'read' and not f.apagada_para_todos),
       exists (select 1 from filtrado f
         where f.peer = u.peer and f.view_once
           and f.receiver_id = (select uid from me) and f.viewed_at is null)
from ult u
where coalesce((select c.oculta_em from public.conversas_ocultas c
    where c.user_id = (select uid from me) and c.peer_id = u.peer), '-infinity'::timestamptz) < u.created_at
order by u.created_at desc;
$function$;

-- listar_mensagens(p_peer uuid, p_limit integer)
CREATE OR REPLACE FUNCTION public.listar_mensagens(p_peer uuid, p_limit integer DEFAULT 300)
 RETURNS TABLE(id text, sender_id uuid, receiver_id uuid, content text, created_at timestamp with time zone, status text, delivered_at timestamp with time zone, read_at timestamp with time zone, media_url text, media_type text, view_once boolean, viewed_at timestamp with time zone, apagada_para_todos boolean, apagada_em timestamp with time zone, midia_disponivel boolean)
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
with me as (select auth.uid() as uid),
corte as (select coalesce((select c.limpar_ate from public.conversas_ocultas c
    where c.user_id = (select uid from me) and c.peer_id = p_peer), '-infinity'::timestamptz) as t)
select m.id::text, m.sender_id, m.receiver_id,
       case when m.apagada_para_todos then '' else coalesce(m.content,'') end,
       m.created_at, m.status, m.delivered_at, m.read_at,
       -- view_once NUNCA expoe URL; foto comum continua normal
       case when m.view_once then null else m.media_url end,
       m.media_type, m.view_once, m.viewed_at, m.apagada_para_todos, m.apagada_em,
       (case when m.view_once then
               (m.viewed_at is null and m.receiver_id = me.uid
                and exists (select 1 from public.midia_unica u where u.message_id = m.id::text))
             else (m.media_url is not null and not m.apagada_para_todos)
        end)
from public.messages m, me, corte
where (m.sender_id = me.uid or m.receiver_id = me.uid)
  and (m.sender_id = p_peer or m.receiver_id = p_peer)
  and m.created_at > corte.t
  and not exists (select 1 from public.mensagens_ocultas o
                  where o.user_id = me.uid and o.message_id = m.id::text)
order by m.created_at desc
limit greatest(1, least(p_limit, 1000));
$function$;

-- marcar_conversa_lida(p_peer uuid)
CREATE OR REPLACE FUNCTION public.marcar_conversa_lida(p_peer uuid)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_eu  uuid := auth.uid();
  v_qtd integer := 0;
begin
  if v_eu is null or p_peer is null then
    return 0;
  end if;

  update public.messages
     set read_at      = now(),
         delivered_at = coalesce(delivered_at, now())
   where receiver_id = v_eu
     and sender_id   = p_peer
     and read_at is null;

  get diagnostics v_qtd = row_count;
  return v_qtd;
end;
$function$;

-- marcar_presenca()
CREATE OR REPLACE FUNCTION public.marcar_presenca()
 RETURNS void
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  insert into public.user_presence (user_id, last_seen_at)
  select auth.uid(), now()
  where auth.uid() is not null
  on conflict (user_id) do update
     set last_seen_at = now();
$function$;

-- mark_messages_delivered(p_sender_id uuid)
CREATE OR REPLACE FUNCTION public.mark_messages_delivered(p_sender_id uuid)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE affected integer;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  UPDATE public.messages
     SET delivered_at = COALESCE(delivered_at, now()),
         status = CASE WHEN read_at IS NOT NULL THEN 'read' ELSE 'delivered' END,
         updated_at = now()
   WHERE receiver_id = auth.uid()
     AND sender_id = p_sender_id
     AND delivered_at IS NULL;
  GET DIAGNOSTICS affected = ROW_COUNT;
  RETURN affected;
END;
$function$;

-- mark_messages_read(p_sender_id uuid)
CREATE OR REPLACE FUNCTION public.mark_messages_read(p_sender_id uuid)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE affected integer;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  UPDATE public.messages
     SET delivered_at = COALESCE(delivered_at, now()),
         read_at = COALESCE(read_at, now()),
         status = 'read',
         updated_at = now()
   WHERE receiver_id = auth.uid()
     AND sender_id = p_sender_id
     AND read_at IS NULL;
  GET DIAGNOSTICS affected = ROW_COUNT;
  RETURN affected;
END;
$function$;

-- mensagens_foto_unica_guard()
CREATE OR REPLACE FUNCTION public.mensagens_foto_unica_guard()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_url text;
begin
  if new.content is null then return new; end if;

  if new.content like '[FOTO1X]%' and length(new.content) > 8 then
    v_url := substr(new.content, 9);
    if v_url <> '' then
      insert into public.midia_unica (message_id, url)
      values (new.id::text, v_url)
      on conflict (message_id) do update set url = excluded.url;
      new.content := '[FOTO1X]';
    end if;
  end if;

  return new;
end $function$;

-- mensagens_midia_unica_guard()
CREATE OR REPLACE FUNCTION public.mensagens_midia_unica_guard()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  if new.view_once and new.media_url is not null then
    insert into public.midia_unica (message_id, url)
    values (new.id::text, new.media_url)
    on conflict (message_id) do update set url = excluded.url;
  end if;
  -- a URL nunca fica exposta em messages quando view_once = true
  if new.view_once then
    new.media_url := null;
  end if;
  return new;
end $function$;

-- notificar_push_nova_mensagem()
CREATE OR REPLACE FUNCTION public.notificar_push_nova_mensagem()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'net'
AS $function$
declare
  v_segredo text;
begin
  if tg_op <> 'INSERT' then
    return new;
  end if;

  if new.receiver_id is null then
    return new;
  end if;

  select valor into v_segredo
    from public.app_private_config
   where chave = 'push_webhook_secret';

  if v_segredo is null or v_segredo = 'TROCAR' or length(v_segredo) < 20 then
    return new;
  end if;

  perform net.http_post(
    url := 'https://www.libidoapp.com.br/api/send-push',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-webhook-secret', v_segredo
    ),
    body := jsonb_build_object(
      'receiver_id', new.receiver_id,
      'sender_id', new.sender_id
    )
  );

  return new;
end;
$function$;

-- perfis_proximos(p_raio_km numeric)
CREATE OR REPLACE FUNCTION public.perfis_proximos(p_raio_km numeric DEFAULT 50)
 RETURNS TABLE(user_id text, nickname text, age text, photo_url text, photos jsonb, status text, couple_profile jsonb, is_online boolean, distancia_m double precision)
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  with eu as (
    select uy.lat as minha_lat, uy.lon as minha_lon
    from public.users uy
    where uy.user_id = auth.uid()::text
  ),
  dist as (
    select u.user_id,
           u.nickname,
           u.age,
           u.photo_url,
           u.photos,
           u.status,
           u.couple_profile,
           u.is_online,
           6371000 * 2 * asin(
             least(1.0::double precision, sqrt(
               power(sin(radians((u.lat - eu.minha_lat)::double precision) / 2), 2) +
               cos(radians(eu.minha_lat::double precision)) *
               cos(radians(u.lat::double precision)) *
               power(sin(radians((u.lon - eu.minha_lon)::double precision) / 2), 2)
             ))
           ) as distancia_m
    from public.users u
    cross join eu
    where auth.uid() is not null
      and u.user_id <> auth.uid()::text
      and coalesce(u.is_deleted, false) = false
      and coalesce(u.is_banned, false) = false
      and u.lat is not null
      and u.lon is not null
      and eu.minha_lat is not null
      and eu.minha_lon is not null
  )
  select d.user_id, d.nickname, d.age, d.photo_url, d.photos,
         d.status, d.couple_profile, d.is_online, d.distancia_m
  from dist d
  where d.distancia_m <= coalesce(p_raio_km, 50) * 1000
  order by d.distancia_m
  limit 100;
$function$;

-- post_likes_sync()
CREATE OR REPLACE FUNCTION public.post_likes_sync()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  if tg_op = 'DELETE' then
    perform public.recalcular_likes(old.post_id);
    return old;
  end if;

  if tg_op = 'UPDATE' and old.post_id is distinct from new.post_id then
    perform public.recalcular_likes(old.post_id);
  end if;

  perform public.recalcular_likes(new.post_id);
  return new;
end;
$function$;

-- process_payment(p_user_id uuid, p_payment_id text, p_provider text, p_status text, p_amount numeric)
CREATE OR REPLACE FUNCTION public.process_payment(p_user_id uuid, p_payment_id text, p_provider text, p_status text, p_amount numeric)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_tx_id    uuid;
  v_plan_id  uuid;
  v_duration int;
  v_expires  timestamptz;
  v_base     timestamptz;
  v_novo     timestamptz;
  v_centavos numeric := round(coalesce(p_amount, 0) * 100);
begin
  if p_status is null
     or upper(btrim(p_status)) not in ('PAID','APPROVED','CONFIRMED','RECEIVED','COMPLETED') then
    return false;
  end if;

  if p_user_id is null
     or coalesce(btrim(p_payment_id), '') = ''
     or coalesce(btrim(p_provider), '') = ''
     or v_centavos <= 0 then
    return false;
  end if;

  select id, plan_id
    into v_tx_id, v_plan_id
  from public.payment_transactions
  where payment_id = btrim(p_payment_id)
    and provider = btrim(p_provider)
    and user_id = p_user_id::text
    and round(amount * 100) = v_centavos
  limit 1;

  if v_tx_id is null then
    return false;
  end if;

  if exists (
    select 1 from public.payment_transactions
    where id = v_tx_id
      and upper(coalesce(status, '')) in ('PAID','APPROVED','CONFIRMED','RECEIVED','COMPLETED')
  ) then
    return false;
  end if;

  if not exists (select 1 from public.users where user_id = p_user_id::text) then
    return false;
  end if;

  if v_plan_id is not null then
    select duration_days into v_duration
      from public.subscription_plans
     where id = v_plan_id;
  end if;

  if v_duration is null or v_duration < 1 then
    select sp.id, sp.duration_days
      into v_plan_id, v_duration
      from public.subscription_plans sp
     where round(sp.price * 100) = v_centavos
     order by sp.duration_days asc
     limit 1;
  end if;

  if v_plan_id is null or v_duration is null or v_duration < 1 then
    return false;
  end if;

  select expires_at
    into v_expires
  from public.user_subscriptions
  where user_id = p_user_id
  order by expires_at desc nulls last
  limit 1;

  v_base := now();
  if v_expires is not null and v_expires > now() then
    v_base := v_expires;
  end if;

  v_novo := v_base + make_interval(days => v_duration);

  update public.payment_transactions
     set status = 'PAID',
         updated_at = now()
   where id = v_tx_id
     and upper(coalesce(status, '')) not in ('PAID','APPROVED','CONFIRMED','RECEIVED','COMPLETED');

  if not found then
    return false;
  end if;

  if v_expires is not null and v_expires > now() then
    update public.user_subscriptions
       set plan_id = v_plan_id,
           status = 'active',
           expires_at = v_novo,
           updated_at = now()
     where user_id = p_user_id
       and expires_at = v_expires;

    if not found then
      insert into public.user_subscriptions (user_id, plan_id, status, started_at, expires_at)
      values (p_user_id, v_plan_id, 'active', now(), v_novo);
    end if;
  else
    insert into public.user_subscriptions (user_id, plan_id, status, started_at, expires_at)
    values (p_user_id, v_plan_id, 'active', now(), v_novo);
  end if;

  perform set_config('app.concedendo_premium', 'on', true);

  update public.users
     set premium = true,
         plan = 'premium',
         premium_until = v_novo,
         premium_ate = v_novo,
         updated_at = now()
   where user_id = p_user_id::text;

  perform set_config('app.concedendo_premium', '', true);

  return true;
end;
$function$;

-- protect_admin_fields()
CREATE OR REPLACE FUNCTION public.protect_admin_fields()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  actor_role text;
begin
  if coalesce(current_setting('app.concedendo_premium', true), '') = 'on' then
    return new;
  end if;

  if auth.uid() is null then
    return new;
  end if;

  select role into actor_role
    from public.users
   where user_id = auth.uid()::text;

  if old.role = 'owner' and actor_role <> 'owner' then
    raise exception 'owner account is protected';
  end if;

  if auth.uid()::text = new.user_id and actor_role not in ('owner', 'admin') then
    new.plan := old.plan;
    new.premium := old.premium;
    new.role := old.role;
    new.is_banned := old.is_banned;
    new.is_deleted := old.is_deleted;
  elsif actor_role = 'admin' then
    new.role := old.role;
    new.plan := old.plan;
    new.premium := old.premium;
  end if;

  return new;
end;
$function$;

-- protect_premium_downgrade()
CREATE OR REPLACE FUNCTION public.protect_premium_downgrade()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
  eterno boolean;
  futuro boolean;
BEGIN
  eterno := (coalesce(OLD.premium, false) = true AND OLD.premium_until IS NULL);
  futuro := (OLD.premium_until IS NOT NULL AND OLD.premium_until > now());

  IF eterno THEN
    -- Eterno e o estado mais alto: nenhuma escrita grava data por cima
    IF NEW.premium_until IS NOT NULL THEN
      NEW.premium_until := NULL;
    END IF;
    IF NEW.premium IS DISTINCT FROM true THEN
      NEW.premium := true;
    END IF;
  ELSIF futuro THEN
    -- Premium com data futura: mantem sempre o prazo mais longo
    IF NEW.premium_until IS NOT NULL AND NEW.premium_until < OLD.premium_until THEN
      NEW.premium_until := OLD.premium_until;
    END IF;
    IF NEW.premium IS DISTINCT FROM true THEN
      NEW.premium := true;
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;

-- protege_apagada_para_todos()
CREATE OR REPLACE FUNCTION public.protege_apagada_para_todos()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.apagada_para_todos IS DISTINCT FROM OLD.apagada_para_todos
     AND auth.uid() IS DISTINCT FROM OLD.sender_id THEN
    RAISE EXCEPTION 'Apenas o remetente pode apagar para todos';
  END IF;
  RETURN NEW;
END;
$function$;

-- proteger_campos_perfil()
CREATE OR REPLACE FUNCTION public.proteger_campos_perfil()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_old   jsonb := to_jsonb(old);
  v_new   jsonb := to_jsonb(new);
  v_chave text;
  v_lista text[] := array[
    'id',
    'user_id',
    'is_admin',
    'role',
    'status',
    'is_banned',
    'is_deleted',
    'is_premium',
    'subscription_status',
    'subscription_current_period_end',
    'stripe_customer_id',
    'created_at'
  ];
begin
  if auth.uid() is null then
    return new;
  end if;

  if coalesce(public.is_admin(), false) then
    return new;
  end if;

  foreach v_chave in array v_lista loop
    if (v_new ? v_chave) or (v_old ? v_chave) then
      if (v_new -> v_chave) is distinct from (v_old -> v_chave) then
        raise exception 'campo protegido: %', v_chave;
      end if;
    end if;
  end loop;

  return new;
end;
$function$;

-- proteger_campos_post()
CREATE OR REPLACE FUNCTION public.proteger_campos_post()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
declare
  v_recalc text := coalesce(current_setting('app.recalculando_likes', true), '');
begin
  if auth.uid() is null then
    return new;
  end if;

  if coalesce(public.is_admin(), false) then
    return new;
  end if;

  if v_recalc = 'on' then
    if tg_op = 'UPDATE'
       and (new.id is distinct from old.id
            or new.user_id is distinct from old.user_id
            or new.created_at is distinct from old.created_at
            or new.image is distinct from old.image
            or new.text is distinct from old.text) then
      raise exception 'recalculo nao altera outros campos';
    end if;
    return new;
  end if;

  if tg_op = 'INSERT' then
    new.likes := 0;
    return new;
  end if;

  if new.likes is distinct from old.likes then
    raise exception 'contador de curtidas e somente leitura';
  end if;

  if new.id is distinct from old.id
     or new.user_id is distinct from old.user_id
     or new.created_at is distinct from old.created_at then
    raise exception 'campos imutaveis do post';
  end if;

  return new;
end;
$function$;

-- proteger_campos_usuario()
CREATE OR REPLACE FUNCTION public.proteger_campos_usuario()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_old   jsonb := to_jsonb(old);
  v_new   jsonb := to_jsonb(new);
  v_chave text;
  v_lista text[] := array[
    'user_id',
    'role',
    'status',
    'is_banned',
    'is_deleted',
    'is_admin',
    'is_premium',
    'subscription_status',
    'subscription_current_period_end',
    'stripe_customer_id',
    'premium_expires_at',
    'premium_since',
    'created_at'
  ];
begin
  if auth.uid() is null then
    return new;
  end if;

  if coalesce(public.is_admin(), false) then
    return new;
  end if;

  foreach v_chave in array v_lista loop
    if (v_new ? v_chave) or (v_old ? v_chave) then
      if (v_new -> v_chave) is distinct from (v_old -> v_chave) then
        raise exception 'campo protegido: %', v_chave;
      end if;
    end if;
  end loop;

  return new;
end;
$function$;

-- proteger_colunas_privilegiadas_users()
CREATE OR REPLACE FUNCTION public.proteger_colunas_privilegiadas_users()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  IF current_setting('request.jwt.claim.role', true) = 'authenticated' AND TG_OP = 'UPDATE' THEN
    NEW.premium := OLD.premium;
    NEW.plan := OLD.plan;
    NEW.premium_until := OLD.premium_until;
    NEW.is_banned := OLD.is_banned;
  END IF;
  RETURN NEW;
END;
$function$;

-- proteger_update_mensagem()
CREATE OR REPLACE FUNCTION public.proteger_update_mensagem()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_eu        uuid := auth.uid();
  v_remetente boolean;
  v_destino   boolean;
  v_com_midia boolean;
begin
  if v_eu is not null then

    v_remetente := (old.sender_id is not null and v_eu = old.sender_id);
    v_destino   := (old.receiver_id is not null and v_eu = old.receiver_id);
    v_com_midia := (old.media_url is not null);

    if not v_remetente and not v_destino then
      raise exception 'sem permissao nesta mensagem';
    end if;

    if new.id is distinct from old.id
       or new.sender_id is distinct from old.sender_id
       or new.receiver_id is distinct from old.receiver_id
       or new.created_at is distinct from old.created_at then
      raise exception 'campos imutaveis nao podem ser alterados';
    end if;

    if new.tipo is distinct from old.tipo
       or new.media_url is distinct from old.media_url
       or new.edited_at is distinct from old.edited_at
       or new.apagada_geral is distinct from old.apagada_geral
       or new.reply_to_id is distinct from old.reply_to_id
       or new.expires_at is distinct from old.expires_at then
      if not v_remetente then
        raise exception 'apenas o remetente altera estes campos';
      end if;
    end if;

    if new.content is distinct from old.content
       or new.media_meta is distinct from old.media_meta then
      if not v_remetente and not (v_destino and v_com_midia) then
        raise exception 'apenas o remetente altera o conteudo';
      end if;
    end if;

    if new.read_at is distinct from old.read_at
       or new.delivered_at is distinct from old.delivered_at then
      if not v_destino then
        raise exception 'apenas o destinatario marca entrega e leitura';
      end if;
    end if;

    if new.apagada_para is distinct from old.apagada_para then
      if v_eu = any(coalesce(old.apagada_para, '{}'::uuid[])) then
        raise exception 'ja apagada para este usuario';
      end if;
      if new.apagada_para is distinct from (coalesce(old.apagada_para, '{}'::uuid[]) || v_eu) then
        raise exception 'apagada_para so pode acrescentar o proprio usuario';
      end if;
    end if;

  end if;

  if new.read_at is not null then
    new.status := 'read';
  elsif new.delivered_at is not null then
    new.status := 'delivered';
  else
    new.status := coalesce(old.status, 'sent');
  end if;

  new.updated_at := now();

  return new;
end;
$function$;

-- radar_mapa(p_raio_km double precision, p_celula double precision)
CREATE OR REPLACE FUNCTION public.radar_mapa(p_raio_km double precision DEFAULT 50, p_celula double precision DEFAULT 0.005)
 RETURNS TABLE(peer_id text, nickname text, photo_url text, online boolean, faixa text, ordem integer, anel_m integer, angulo double precision, lat_pin double precision, lon_pin double precision)
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select
    b.user_id,
    b.nickname,
    b.foto,
    b.online,
    f.faixa,
    f.ordem,
    case when b.online then f.anel_m else b.anel_off end as anel_m,
    b.angulo,
    case when b.online then b.lat_pin end as lat_pin,
    case when b.online then b.lon_pin end as lon_pin
  from (
    select
      u.user_id,
      u.nickname,
      coalesce(u.photo_url, u.photos->>0) as foto,
      coalesce(u.is_online, false) as online,
      (6371 * acos(least(1, greatest(-1,
        sin(radians(eu.lat)) * sin(radians(u.lat)) +
        cos(radians(eu.lat)) * cos(radians(u.lat)) * cos(radians(u.lon - eu.lon))
      )))) as km,
      case when ((('x' || substr(md5(u.user_id || 'anel'), 1, 8))::bit(32)::int & 1) = 0)
           then 1000 else 2000 end as anel_off,
      (((('x' || substr(md5(u.user_id || 'ang'), 1, 8))::bit(32)::int & 65535) / 65535.0) * 360) as angulo,
      (round(u.lat / p_celula) * p_celula
        + (((('x' || substr(md5(u.user_id || 'x'), 1, 8))::bit(32)::int & 255) / 255.0) - 0.5) * p_celula) as lat_pin,
      (round(u.lon / p_celula) * p_celula
        + (((('x' || substr(md5(u.user_id || 'y'), 1, 8))::bit(32)::int & 255) / 255.0) - 0.5) * p_celula) as lon_pin
    from public.users u
    cross join (
      select lat, lon from public.users where user_id = auth.uid()::text
    ) eu
    where u.user_id <> auth.uid()::text
      and eu.lat is not null and eu.lon is not null
      and u.lat is not null and u.lon is not null
      and not coalesce(u.is_deleted, false)
      and not coalesce(u.is_banned, false)
  ) b
  cross join lateral public.faixa_distancia(b.km) f
  where b.km <= p_raio_km
    and b.foto is not null
  order by f.ordem asc, b.nickname asc
  limit 200;
$function$;

-- recalcular_likes(p_post_id uuid)
CREATE OR REPLACE FUNCTION public.recalcular_likes(p_post_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  if p_post_id is null then
    return;
  end if;

  perform set_config('app.recalculando_likes', 'on', true);

  update public.posts p
     set likes = (
       select count(*)::int from public.post_likes pl where pl.post_id = p.id
     )
   where p.id = p_post_id;

  perform set_config('app.recalculando_likes', '', true);
end;
$function$;

-- reconciliar_premium()
CREATE OR REPLACE FUNCTION public.reconciliar_premium()
 RETURNS TABLE(rebaixados integer, reativados integer)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_reb integer := 0;
  v_rea integer := 0;
begin
  update public.users
     set premium = false,
         updated_at = now()
   where premium is true
     and premium_until is not null
     and premium_until <= now();

  get diagnostics v_reb = row_count;

  update public.users u
     set premium = true,
         plan = 'premium',
         premium_until = coalesce(u.premium_until, sub.exp),
         premium_ate = coalesce(u.premium_until, sub.exp),
         updated_at = now()
  from (
    select s.user_id::text as uid,
           max(s.expires_at) as exp
    from public.user_subscriptions s
    where coalesce(s.status, 'active') = 'active'
      and s.expires_at > now()
    group by s.user_id::text
  ) sub
  where u.user_id = sub.uid
    and coalesce(u.premium, false) = false;

  get diagnostics v_rea = row_count;

  return query select v_reb, v_rea;
end;
$function$;

-- registrar_indicacao(p_slug text)
CREATE OR REPLACE FUNCTION public.registrar_indicacao(p_slug text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_uid text := (auth.uid())::text;
  v_slug text := lower(btrim(COALESCE(p_slug, '')));
BEGIN
  IF v_uid IS NULL OR v_slug = '' OR length(v_slug) > 40 THEN RETURN false; END IF;
  INSERT INTO public.affiliate_referrals (affiliate_slug, referred_user_id, created_at, commission_expires_at)
  VALUES (v_slug, v_uid, now(), now() + interval '12 months') ON CONFLICT (referred_user_id) DO NOTHING;
  RETURN true;
END;
$function$;

-- registrar_premium()
CREATE OR REPLACE FUNCTION public.registrar_premium()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  if tg_op = 'UPDATE'
     and new.premium is not distinct from old.premium
     and new.premium_until is not distinct from old.premium_until then
    return new;
  end if;

  begin
    insert into public.premium_auditoria
      (user_id, premium_de, premium_para, ate_de, ate_para, motivo, ator)
    values (
      new.user_id,
      case when tg_op = 'UPDATE' then old.premium end,
      new.premium,
      case when tg_op = 'UPDATE' then old.premium_until end,
      new.premium_until,
      nullif(current_setting('app.motivo', true), ''),
      coalesce(auth.uid()::text, current_user)
    );
  exception
    when others then
      null;
  end;

  return new;
end;
$function$;

-- salvar_onboarding(p_apelido text, p_bio text, p_foto text, p_tipo_perfil text, p_casal jsonb, p_idade text, p_genero text)
CREATE OR REPLACE FUNCTION public.salvar_onboarding(p_apelido text, p_bio text DEFAULT NULL::text, p_foto text DEFAULT NULL::text, p_tipo_perfil text DEFAULT 'solteiro'::text, p_casal jsonb DEFAULT NULL::jsonb, p_idade text DEFAULT NULL::text, p_genero text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_eu      uuid := auth.uid();
  v_apelido text := btrim(coalesce(p_apelido, ''));
  v_foto    text := btrim(coalesce(p_foto, ''));
  v_linhas  integer := 0;
begin
  if v_eu is null then
    return jsonb_build_object('ok', false, 'motivo', 'sem_sessao');
  end if;

  if length(v_apelido) < 3 then
    return jsonb_build_object('ok', false, 'motivo', 'apelido_curto');
  end if;

  if length(v_apelido) > 30 then
    return jsonb_build_object('ok', false, 'motivo', 'apelido_longo');
  end if;

  if v_foto = '' then
    return jsonb_build_object('ok', false, 'motivo', 'foto_obrigatoria');
  end if;

  if v_apelido ~* '^membro [0-9a-f]{4}$' then
    return jsonb_build_object('ok', false, 'motivo', 'apelido_provisorio');
  end if;

  insert into public.users as u (
    user_id, nickname, bio, photo_url, couple_profile,
    age, gender, status, is_online, is_deleted, is_banned, updated_at
  )
  values (
    v_eu::text,
    v_apelido,
    nullif(btrim(coalesce(p_bio, '')), ''),
    v_foto,
    case when lower(coalesce(p_tipo_perfil, '')) = 'casal' then p_casal else null end,
    nullif(btrim(coalesce(p_idade, '')), ''),
    nullif(btrim(coalesce(p_genero, '')), ''),
    'active',
    true,
    false,
    false,
    now()
  )
  on conflict (user_id) do update set
    nickname       = excluded.nickname,
    bio            = excluded.bio,
    photo_url      = excluded.photo_url,
    couple_profile = excluded.couple_profile,
    age            = coalesce(excluded.age, u.age),
    gender         = coalesce(excluded.gender, u.gender),
    status         = 'active',
    is_online      = true,
    is_deleted     = false,
    updated_at     = now();

  get diagnostics v_linhas = row_count;

  if v_linhas = 0 then
    return jsonb_build_object('ok', false, 'motivo', 'nada_gravado');
  end if;

  return jsonb_build_object('ok', true, 'user_id', v_eu::text);

exception
  when others then
    return jsonb_build_object(
      'ok', false,
      'motivo', 'erro_banco',
      'detalhe', sqlerrm,
      'sqlstate', sqlstate
    );
end;
$function$;

-- salvar_perfil(p_payload jsonb)
CREATE OR REPLACE FUNCTION public.salvar_perfil(p_payload jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_eu     text := auth.uid()::text;
  v_limpo  jsonb := '{}'::jsonb;
  v_antes  jsonb;
  v_depois jsonb;
  v_lista  text;
  v_div    text;
begin
  if v_eu is null then
    return jsonb_build_object('ok', false, 'motivo', 'sem_sessao');
  end if;

  if p_payload is null or jsonb_typeof(p_payload) <> 'object' then
    return jsonb_build_object('ok', false, 'motivo', 'payload_invalido');
  end if;

  select coalesce(jsonb_object_agg(e.key, e.value), '{}'::jsonb)
    into v_limpo
  from jsonb_each(p_payload) e
  join information_schema.columns c
    on c.table_schema = 'public'
   and c.table_name   = 'users'
   and c.column_name  = e.key
   and c.is_generated = 'NEVER'
  where e.key not in (
    'user_id','created_at','updated_at','role','plan','status',
    'premium','premium_until','premium_ate','is_banned','is_deleted'
  );

  insert into public.users (user_id, status)
  values (v_eu, 'active')
  on conflict (user_id) do nothing;

  select to_jsonb(u) into v_antes from public.users u where u.user_id = v_eu;

  v_limpo := v_limpo || jsonb_build_object('updated_at', to_jsonb(now()));

  select string_agg(format('%I = r.%I', k, k), ', ')
    into v_lista
  from jsonb_object_keys(v_limpo) k;

  if v_lista is null then
    return jsonb_build_object('ok', false, 'motivo', 'payload_vazio');
  end if;

  execute format(
    'update public.users u set %s from jsonb_populate_record(null::public.users, %L::jsonb) r where u.user_id = $1',
    v_lista, (v_antes || v_limpo)::text
  ) using v_eu;

  select to_jsonb(u) into v_depois from public.users u where u.user_id = v_eu;

  if v_depois is null then
    return jsonb_build_object('ok', false, 'motivo', 'nao_encontrado');
  end if;

  select string_agg(k, ', ')
    into v_div
  from jsonb_object_keys(v_limpo - 'updated_at') k
  where v_depois->k is distinct from v_limpo->k;

  if v_div is not null then
    return jsonb_build_object('ok', false, 'motivo', 'bloqueado', 'campos', v_div);
  end if;

  return jsonb_build_object('ok', true);

exception
  when others then
    return jsonb_build_object(
      'ok', false, 'motivo', 'erro_banco',
      'detalhe', sqlerrm, 'sqlstate', sqlstate
    );
end;
$function$;

-- salvar_ultima_localizacao()
CREATE OR REPLACE FUNCTION public.salvar_ultima_localizacao()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
begin
  if new.lat is not null and new.lon is not null then
    new.last_lat := new.lat;
    new.last_lng := new.lon;
    new.last_location_at := now();
  end if;
  return new;
end;
$function$;

-- sync_premium_flag()
CREATE OR REPLACE FUNCTION public.sync_premium_flag()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  IF NEW.plan = 'premium'
     AND (NEW.premium_until IS NULL OR NEW.premium_until > now())
     AND NEW.is_banned IS NOT TRUE
     AND NEW.is_deleted IS NOT TRUE
     AND NEW.premium IS DISTINCT FROM true THEN
    NEW.premium := true;
  END IF;
  RETURN NEW;
END;
$function$;

-- usar_promo(p_codigo text)
CREATE OR REPLACE FUNCTION public.usar_promo(p_codigo text)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_dias integer;
  v_uid  text := auth.uid()::text;
  v_cod  text := upper(btrim(coalesce(p_codigo, '')));
  v_ins  integer := 0;
begin
  if v_uid is null then
    return -1;
  end if;

  if v_cod = '' then
    return -3;
  end if;

  select dias_gratis into v_dias
    from public.promo_links
   where codigo = v_cod
     and ativo = true
     and (validade is null or validade > now())
     and usos_feitos < limite_usos
   for update;

  if v_dias is null then
    return -3;
  end if;

  insert into public.promo_usos (codigo, user_id)
  values (v_cod, v_uid)
  on conflict (user_id) do nothing;

  get diagnostics v_ins = row_count;

  if v_ins = 0 then
    return -2;
  end if;

  update public.promo_links
     set usos_feitos = usos_feitos + 1
   where codigo = v_cod;

  update public.users
     set premium = true,
         plan = 'premium',
         premium_until = now() + make_interval(days => v_dias),
         premium_ate = now() + make_interval(days => v_dias)
   where user_id = v_uid;

  return v_dias;
end;
$function$;

-- validar_convite(p_codigo text)
CREATE OR REPLACE FUNCTION public.validar_convite(p_codigo text)
 RETURNS TABLE(valido boolean, duration_hours integer)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_cod text := upper(btrim(coalesce(p_codigo, '')));
  v_h   integer;
  v_ok  boolean := false;
begin
  if v_cod = '' or auth.uid() is null then
    return query select false, null::integer;
    return;
  end if;

  select c.duration_hours
    into v_h
    from public.premium_invite_codes c
   where c.code = v_cod
     and coalesce(c.active, true) = true
     and coalesce(c.used_count, 0) < coalesce(c.max_uses, 1)
   limit 1;

  v_ok := found;

  return query select v_ok, v_h;
end;
$function$;