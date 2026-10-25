-- ============================================================
-- LIBIDO - LIMPEZA E PRESENCA
-- Rode o arquivo 00_diagnostico.sql antes deste.
-- Bloco adaptativo: descobre sozinho o nome das colunas.
-- ============================================================

-- ---------- 1) PREVIA: confira antes de apagar ----------
do $$
declare
  col_nome text;
  sql text;
begin
  select column_name into col_nome
  from information_schema.columns
  where table_schema = 'public' and table_name = 'users'
    and column_name in ('nickname','apelido','username','display_name','profile_name','nome_perfil','name','nome')
  order by case column_name
    when 'nickname' then 1 when 'apelido' then 2 when 'username' then 3
    when 'display_name' then 4 when 'profile_name' then 5
    when 'nome_perfil' then 6 when 'name' then 7 else 8 end
  limit 1;

  if col_nome is null then
    raise exception 'Coluna de nome nao encontrada. Rode 00_diagnostico.sql e me mande a lista.';
  end if;

  raise notice 'Coluna de nome em uso: %', col_nome;

  sql := format(
    'select user_id, %I as apelido, created_at from public.users where lower(trim(%I::text)) = any($1) order by created_at',
    col_nome, col_nome);

  raise notice 'PREVIA das contas de teste:';
  execute sql using array['casal natural vr','gf','homem raiz','mmbn','teste','teste 10','uau'];
end $$;

-- ---------- 2) PREVIA legivel em tabela ----------
select u.user_id,
       u.created_at,
       to_jsonb(u) - 'user_id' - 'created_at' - 'updated_at' as dados
from public.users u
where lower(trim(to_jsonb(u)->>'nickname')) in
  ('casal natural vr','gf','homem raiz','mmbn','teste','teste 10','uau')
order by u.created_at;

-- ---------- 3) EXCLUSAO ----------
do $$
declare
  col_nome text;
  ids text[];
  qtd integer := 0;
  sql text;
  lista text[] := array['casal natural vr','gf','homem raiz','mmbn','teste','teste 10','uau'];
begin
  select column_name into col_nome
  from information_schema.columns
  where table_schema = 'public' and table_name = 'users'
    and column_name in ('nickname','apelido','username','display_name','profile_name','nome_perfil','name','nome')
  order by case column_name
    when 'nickname' then 1 when 'apelido' then 2 when 'username' then 3
    when 'display_name' then 4 when 'profile_name' then 5
    when 'nome_perfil' then 6 when 'name' then 7 else 8 end
  limit 1;

  if col_nome is null then
    raise exception 'Coluna de nome nao encontrada.';
  end if;

  sql := format('select array_agg(user_id::text) from public.users where lower(trim(%I::text)) = any($1)', col_nome);
  execute sql into ids using lista;

  if ids is null or array_length(ids, 1) = 0 then
    raise notice 'Nenhuma conta de teste encontrada. Nada foi apagado.';
    return;
  end if;

  raise notice 'Contas encontradas (%): %', array_length(ids, 1), ids;

  begin
    delete from public.messages where sender_id::text = any(ids) or receiver_id::text = any(ids);
    get diagnostics qtd = row_count; raise notice 'messages: %', qtd;
  exception when undefined_table or undefined_column then raise notice 'messages ignorado';
  end;

  begin
    delete from public.message_reactions where user_id = any(ids);
    get diagnostics qtd = row_count; raise notice 'message_reactions: %', qtd;
  exception when undefined_table or undefined_column then raise notice 'message_reactions ignorado';
  end;

  begin
    delete from public.conversation_settings where user_id = any(ids) or peer_id = any(ids);
    get diagnostics qtd = row_count; raise notice 'conversation_settings: %', qtd;
  exception when undefined_table or undefined_column then raise notice 'conversation_settings ignorado';
  end;

  begin
    delete from public.posts where user_id::text = any(ids);
    get diagnostics qtd = row_count; raise notice 'posts: %', qtd;
  exception when undefined_table or undefined_column then raise notice 'posts ignorado';
  end;

  begin
    delete from public.post_likes where user_id::text = any(ids);
    get diagnostics qtd = row_count; raise notice 'post_likes: %', qtd;
  exception when undefined_table or undefined_column then raise notice 'post_likes ignorado';
  end;

  begin
    delete from public.profile_visits where visitor_id::text = any(ids) or visited_id::text = any(ids);
    get diagnostics qtd = row_count; raise notice 'profile_visits: %', qtd;
  exception when undefined_table or undefined_column then raise notice 'profile_visits ignorado';
  end;

  begin
    delete from public.blocks where blocker_id::text = any(ids) or blocked_id::text = any(ids);
    get diagnostics qtd = row_count; raise notice 'blocks: %', qtd;
  exception when undefined_table or undefined_column then raise notice 'blocks ignorado';
  end;

  begin
    delete from public.reports where reporter_id::text = any(ids) or reported_id::text = any(ids);
    get diagnostics qtd = row_count; raise notice 'reports: %', qtd;
  exception when undefined_table or undefined_column then raise notice 'reports ignorado';
  end;

  begin
    update public.payment_transactions set status = 'EXPIRADO'
    where user_id::text = any(ids) and status in ('WAITING','PENDING','CREATED','IN_PROGRESS');
    get diagnostics qtd = row_count; raise notice 'payment_transactions: %', qtd;
  exception when undefined_table or undefined_column then raise notice 'payment_transactions ignorado';
  end;

  begin
    delete from public.user_banimentos where alvo_id::text = any(ids);
    get diagnostics qtd = row_count; raise notice 'user_banimentos: %', qtd;
  exception when undefined_table or undefined_column then raise notice 'user_banimentos ignorado';
  end;

  delete from public.users where user_id::text = any(ids);
  get diagnostics qtd = row_count;
  raise notice 'USERS REMOVIDOS: %', qtd;
end $$;

-- ---------- 4) CONFERIR: precisa voltar 0 ----------
select count(*) as sobrou
from public.users u
where lower(trim(to_jsonb(u)->>'nickname')) in
  ('casal natural vr','gf','homem raiz','mmbn','teste','teste 10','uau');

-- ---------- 5) PRESENCA: quem nao entra ha 72h sai do radar ----------
do $$
declare
  col_pres text;
  tem_lat boolean;
  tem_lon boolean;
  tem_online boolean;
  sql text;
  qtd integer := 0;
begin
  select column_name into col_pres
  from information_schema.columns
  where table_schema = 'public' and table_name = 'users'
    and column_name in ('last_seen','last_seen_at','ultimo_acesso','last_active','last_login','updated_at')
  order by case column_name
    when 'last_seen' then 1 when 'last_seen_at' then 2
    when 'last_active' then 3 when 'ultimo_acesso' then 4
    when 'last_login' then 5 when 'updated_at' then 6 else 7 end
  limit 1;

  if col_pres is null then
    raise notice 'Nenhuma coluna de presenca encontrada.';
    return;
  end if;

  select exists (select 1 from information_schema.columns
    where table_schema='public' and table_name='users' and column_name='lat') into tem_lat;
  select exists (select 1 from information_schema.columns
    where table_schema='public' and table_name='users' and column_name='lon') into tem_lon;
  select exists (select 1 from information_schema.columns
    where table_schema='public' and table_name='users' and column_name='is_online') into tem_online;

  raise notice 'presenca=%, lat=%, lon=%, is_online=%', col_pres, tem_lat, tem_lon, tem_online;

  if tem_lat and tem_lon then
    sql := format('update public.users set lat = null, lon = null where %I < now() - interval ''72 hours'' and coalesce(is_deleted,false) = false', col_pres);
    execute sql;
    get diagnostics qtd = row_count;
    raise notice 'Coordenada limpa em % perfis inativos', qtd;
  elsif tem_online then
    sql := format('update public.users set is_online = false where %I < now() - interval ''72 hours'' and coalesce(is_deleted,false) = false', col_pres);
    execute sql;
    get diagnostics qtd = row_count;
    raise notice 'is_online desligado em % perfis', qtd;
  else
    raise notice 'Sem colunas de coordenada. Apagar as contas de teste ja resolve o caso relatado.';
  end if;
end $$;