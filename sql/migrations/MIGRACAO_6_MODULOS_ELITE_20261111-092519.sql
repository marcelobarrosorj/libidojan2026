-- MIGRACAO_6_MODULOS_ELITE v2
-- Identidade em public.users e TEXT; em auth.users e UUID.
-- Todas as comparacoes cruzadas usam cast explicito.

-- ---------- 1.1 Atestado de presenca fisica ----------
create table if not exists public.verificacoes_presenciais (
  id           uuid primary key default gen_random_uuid(),
  atestante_id uuid not null references auth.users(id) on delete cascade,
  atestado_id  uuid not null references auth.users(id) on delete cascade,
  criado_em    timestamptz not null default now(),
  constraint sem_auto_atestado check (atestante_id <> atestado_id)
);
create unique index if not exists ux_verif_par on public.verificacoes_presenciais (atestante_id, atestado_id);
create index if not exists ix_verif_atestado on public.verificacoes_presenciais (atestado_id);
alter table public.verificacoes_presenciais enable row level security;

drop policy if exists verif_select on public.verificacoes_presenciais;
create policy verif_select on public.verificacoes_presenciais
  for select to authenticated using (true);

drop function if exists public.atestar_presenca(uuid);
create function public.atestar_presenca(p_alvo uuid)
returns jsonb language plpgsql security definer set search_path = public
as $fn$
declare
  v_eu    uuid := auth.uid();
  v_total int;
begin
  if v_eu is null then
    return jsonb_build_object('ok', false, 'motivo', 'sem_sessao');
  end if;
  if p_alvo is null then
    return jsonb_build_object('ok', false, 'motivo', 'alvo_invalido');
  end if;
  if p_alvo = v_eu then
    return jsonb_build_object('ok', false, 'motivo', 'auto_atestado');
  end if;
  if not exists (select 1 from public.users where user_id = p_alvo::text) then
    return jsonb_build_object('ok', false, 'motivo', 'perfil_inexistente');
  end if;
  if exists (
    select 1 from public.verificacoes_presenciais
     where atestante_id = v_eu and atestado_id = p_alvo
  ) then
    return jsonb_build_object('ok', false, 'motivo', 'ja_atestado');
  end if;

  insert into public.verificacoes_presenciais (atestante_id, atestado_id)
  values (v_eu, p_alvo);

  select count(*)::int into v_total
    from public.verificacoes_presenciais where atestado_id = p_alvo;

  return jsonb_build_object('ok', true, 'total', v_total, 'selo', v_total >= 3);
exception when others then
  return jsonb_build_object('ok', false, 'motivo', 'erro_banco', 'detalhe', sqlerrm);
end;
$fn$;
revoke all on function public.atestar_presenca(uuid) from anon;
grant execute on function public.atestar_presenca(uuid) to authenticated;

drop view if exists public.usuarios_selo;
create view public.usuarios_selo as
select u.user_id,
       coalesce(c.n, 0)        as atestados,
       (coalesce(c.n, 0) >= 3) as selo
  from public.users u
  left join (
    select atestado_id::text as atestado_txt, count(*)::int as n
      from public.verificacoes_presenciais
     group by atestado_id
  ) c on c.atestado_txt = u.user_id;
grant select on public.usuarios_selo to authenticated;

-- ---------- 1.3 Faixas de distancia ----------
drop function if exists public.faixa_distancia(numeric);
create function public.faixa_distancia(p_metros numeric)
returns text language sql immutable
as $fn$
  select case
    when p_metros is null or p_metros < 0 then 'Distancia indisponivel'
    when p_metros < 1000  then 'Menos de 1 km'
    when p_metros < 5000  then 'Entre 1 e 5 km'
    when p_metros < 15000 then 'Entre 5 e 15 km'
    else 'Na mesma regiao (+15 km)'
  end;
$fn$;
revoke all on function public.faixa_distancia(numeric) from anon;
grant execute on function public.faixa_distancia(numeric) to authenticated;

-- ---------- 2.1 Intencao rapida ----------
create table if not exists public.intencoes_radar (
  user_id       uuid primary key references auth.users(id) on delete cascade,
  intencao      text not null,
  atualizado_em timestamptz not null default now(),
  constraint intencao_valida check (intencao in (
    'Todos','Conversa Inicial','Encontro a Tres','Troca de Casais',
    'Festas & Club','Apenas Curtidas'
  ))
);
alter table public.intencoes_radar enable row level security;

drop policy if exists intencoes_select on public.intencoes_radar;
create policy intencoes_select on public.intencoes_radar
  for select to authenticated using (true);

drop function if exists public.definir_intencao(text);
create function public.definir_intencao(p_intencao text)
returns jsonb language plpgsql security definer set search_path = public
as $fn$
declare
  v_eu uuid := auth.uid();
begin
  if v_eu is null then
    return jsonb_build_object('ok', false, 'motivo', 'sem_sessao');
  end if;
  if p_intencao is null or p_intencao not in (
    'Todos','Conversa Inicial','Encontro a Tres','Troca de Casais',
    'Festas & Club','Apenas Curtidas'
  ) then
    return jsonb_build_object('ok', false, 'motivo', 'intencao_invalida');
  end if;

  insert into public.intencoes_radar (user_id, intencao, atualizado_em)
  values (v_eu, p_intencao, now())
  on conflict (user_id) do update
    set intencao = excluded.intencao,
        atualizado_em = now();

  return jsonb_build_object('ok', true, 'intencao', p_intencao);
exception when others then
  return jsonb_build_object('ok', false, 'motivo', 'erro_banco', 'detalhe', sqlerrm);
end;
$fn$;
revoke all on function public.definir_intencao(text) from anon;
grant execute on function public.definir_intencao(text) to authenticated;

-- ---------- 2.3 Afinidade ----------
drop function if exists public.calcular_afinidade(uuid, uuid);
create function public.calcular_afinidade(p_a uuid, p_b uuid)
returns int language plpgsql stable security definer set search_path = public
as $fn$
declare
  a public.users%rowtype;
  b public.users%rowtype;
  v int := 0;
begin
  if p_a is null or p_b is null or p_a = p_b then
    return 0;
  end if;

  select * into a from public.users where user_id = p_a::text;
  select * into b from public.users where user_id = p_b::text;
  if a.user_id is null or b.user_id is null then
    return 0;
  end if;

  if a.relationship_status is not null
     and a.relationship_status = b.relationship_status then
    v := v + 25;
  end if;

  if a.sexual_orientation is not null
     and a.sexual_orientation = b.sexual_orientation then
    v := v + 20;
  end if;

  if a.biotype is not null and a.biotype = b.biotype then
    v := v + 15;
  end if;

  if a.age is not null and b.age is not null then
    v := v + greatest(0, 20 - (abs(a.age - b.age) * 2));
  end if;

  if a.couple_profile is not null and b.couple_profile is not null then
    v := v + 10;
  end if;

  if exists (
    select 1 from public.follows f
     where (f.follower_id::text = p_a::text and f.following_id::text = p_b::text)
        or (f.follower_id::text = p_b::text and f.following_id::text = p_a::text)
  ) then
    v := v + 10;
  end if;

  return least(100, greatest(0, v));
end;
$fn$;
revoke all on function public.calcular_afinidade(uuid, uuid) from anon;
grant execute on function public.calcular_afinidade(uuid, uuid) to authenticated;

-- ---------- 3.2 Check-in em eventos ----------
create table if not exists public.checkins_eventos (
  id        uuid primary key default gen_random_uuid(),
  user_id   uuid not null references auth.users(id) on delete cascade,
  evento_id text not null,
  dia       date not null default ((now() at time zone 'America/Sao_Paulo')::date),
  criado_em timestamptz not null default now(),
  constraint checkin_unico unique (user_id, evento_id, dia)
);
create index if not exists ix_checkin_evento_dia on public.checkins_eventos (evento_id, dia);
alter table public.checkins_eventos enable row level security;

drop policy if exists checkins_select on public.checkins_eventos;
create policy checkins_select on public.checkins_eventos
  for select to authenticated using (true);

drop function if exists public.checkin_evento(text);
create function public.checkin_evento(p_evento text)
returns jsonb language plpgsql security definer set search_path = public
as $fn$
declare
  v_eu  uuid := auth.uid();
  v_dia date := (now() at time zone 'America/Sao_Paulo')::date;
  v_n   int;
  v_dentro boolean;
begin
  if v_eu is null then
    return jsonb_build_object('ok', false, 'motivo', 'sem_sessao');
  end if;
  if p_evento is null or length(trim(p_evento)) = 0 then
    return jsonb_build_object('ok', false, 'motivo', 'evento_invalido');
  end if;

  v_dentro := exists (
    select 1 from public.checkins_eventos
     where user_id = v_eu and evento_id = p_evento and dia = v_dia
  );

  if v_dentro then
    delete from public.checkins_eventos
     where user_id = v_eu and evento_id = p_evento and dia = v_dia;
  else
    insert into public.checkins_eventos (user_id, evento_id, dia)
    values (v_eu, p_evento, v_dia);
  end if;

  select count(*)::int into v_n
    from public.checkins_eventos where evento_id = p_evento and dia = v_dia;

  return jsonb_build_object('ok', true, 'total', v_n, 'presente', not v_dentro);
exception when others then
  return jsonb_build_object('ok', false, 'motivo', 'erro_banco', 'detalhe', sqlerrm);
end;
$fn$;
revoke all on function public.checkin_evento(text) from anon;
grant execute on function public.checkin_evento(text) to authenticated;

drop view if exists public.eventos_checkin_resumo;
create view public.eventos_checkin_resumo as
select evento_id, dia, count(*)::int as total
  from public.checkins_eventos
 group by evento_id, dia;
grant select on public.eventos_checkin_resumo to authenticated;

-- ---------- 3.3 Cofre privado (acesso somente por RPC) ----------
create table if not exists public.cofre_fotos (
  id        uuid primary key default gen_random_uuid(),
  user_id   uuid not null references auth.users(id) on delete cascade,
  foto_url  text not null,
  criado_em timestamptz not null default now()
);
create index if not exists ix_cofre_dono on public.cofre_fotos (user_id);

create table if not exists public.cofre_chave (
  user_id       uuid primary key references auth.users(id) on delete cascade,
  salt          text not null,
  chave_hash    text not null,
  atualizado_em timestamptz not null default now()
);

create table if not exists public.cofre_permissoes (
  dono_id      uuid not null references auth.users(id) on delete cascade,
  visitante_id uuid not null references auth.users(id) on delete cascade,
  liberado_em  timestamptz not null default now(),
  primary key (dono_id, visitante_id)
);

create table if not exists public.cofre_tentativas (
  user_id uuid primary key references auth.users(id) on delete cascade,
  n       int not null default 0,
  janela  timestamptz not null default now()
);

alter table public.cofre_fotos      enable row level security;
alter table public.cofre_chave      enable row level security;
alter table public.cofre_permissoes enable row level security;
alter table public.cofre_tentativas enable row level security;

revoke all on public.cofre_fotos      from anon, authenticated;
revoke all on public.cofre_chave      from anon, authenticated;
revoke all on public.cofre_permissoes from anon, authenticated;
revoke all on public.cofre_tentativas from anon, authenticated;

drop function if exists public.cofre_definir_chave(text);
create function public.cofre_definir_chave(p_chave text)
returns jsonb language plpgsql security definer set search_path = public
as $fn$
declare
  v_eu   uuid := auth.uid();
  v_salt text;
begin
  if v_eu is null then
    return jsonb_build_object('ok', false, 'motivo', 'sem_sessao');
  end if;
  if p_chave is null or p_chave !~ '^[0-9]{4}$' then
    return jsonb_build_object('ok', false, 'motivo', 'chave_invalida');
  end if;

  v_salt := replace(gen_random_uuid()::text, '-', '');

  insert into public.cofre_chave (user_id, salt, chave_hash, atualizado_em)
  values (v_eu, v_salt, md5(v_salt || p_chave), now())
  on conflict (user_id) do update
    set salt = excluded.salt,
        chave_hash = excluded.chave_hash,
        atualizado_em = now();

  return jsonb_build_object('ok', true);
exception when others then
  return jsonb_build_object('ok', false, 'motivo', 'erro_banco', 'detalhe', sqlerrm);
end;
$fn$;
revoke all on function public.cofre_definir_chave(text) from anon;
grant execute on function public.cofre_definir_chave(text) to authenticated;

drop function if exists public.cofre_autorizar(uuid);
create function public.cofre_autorizar(p_visitante uuid)
returns jsonb language plpgsql security definer set search_path = public
as $fn$
declare
  v_eu uuid := auth.uid();
begin
  if v_eu is null then
    return jsonb_build_object('ok', false, 'motivo', 'sem_sessao');
  end if;
  if p_visitante is null or p_visitante = v_eu then
    return jsonb_build_object('ok', false, 'motivo', 'visitante_invalido');
  end if;

  insert into public.cofre_permissoes (dono_id, visitante_id)
  values (v_eu, p_visitante)
  on conflict (dono_id, visitante_id) do nothing;

  return jsonb_build_object('ok', true);
exception when others then
  return jsonb_build_object('ok', false, 'motivo', 'erro_banco', 'detalhe', sqlerrm);
end;
$fn$;
revoke all on function public.cofre_autorizar(uuid) from anon;
grant execute on function public.cofre_autorizar(uuid) to authenticated;

drop function if exists public.cofre_listar(uuid);
create function public.cofre_listar(p_dono uuid)
returns jsonb language plpgsql security definer set search_path = public
as $fn$
declare
  v_eu       uuid := auth.uid();
  v_total    int;
  v_liberado boolean;
  v_fotos    jsonb;
begin
  if v_eu is null then
    return jsonb_build_object('ok', false, 'motivo', 'sem_sessao');
  end if;

  select count(*)::int into v_total from public.cofre_fotos where user_id = p_dono;

  v_liberado := (v_eu = p_dono) or exists (
    select 1 from public.cofre_permissoes
     where dono_id = p_dono and visitante_id = v_eu
  );

  if v_liberado then
    select coalesce(jsonb_agg(jsonb_build_object('id', id, 'url', foto_url) order by criado_em desc), '[]'::jsonb)
      into v_fotos
      from public.cofre_fotos where user_id = p_dono;
  else
    v_fotos := '[]'::jsonb;
  end if;

  return jsonb_build_object('ok', true, 'total', v_total, 'liberado', v_liberado, 'fotos', v_fotos);
exception when others then
  return jsonb_build_object('ok', false, 'motivo', 'erro_banco', 'detalhe', sqlerrm);
end;
$fn$;
revoke all on function public.cofre_listar(uuid) from anon;
grant execute on function public.cofre_listar(uuid) to authenticated;

drop function if exists public.cofre_abrir(uuid, text);
create function public.cofre_abrir(p_dono uuid, p_chave text)
returns jsonb language plpgsql security definer set search_path = public
as $fn$
declare
  v_eu     uuid := auth.uid();
  v_salt   text;
  v_hash   text;
  v_n      int;
  v_janela timestamptz;
  v_fotos  jsonb;
begin
  if v_eu is null then
    return jsonb_build_object('ok', false, 'motivo', 'sem_sessao');
  end if;

  select n, janela into v_n, v_janela
    from public.cofre_tentativas where user_id = v_eu;

  if v_n is not null and v_janela is not null and v_n >= 5 and v_janela > now() then
    return jsonb_build_object('ok', false, 'motivo', 'bloqueado_por_tentativas');
  end if;

  select salt, chave_hash into v_salt, v_hash
    from public.cofre_chave where user_id = p_dono;

  if v_hash is null then
    return jsonb_build_object('ok', false, 'motivo', 'cofre_sem_chave');
  end if;

  if md5(v_salt || coalesce(p_chave, '')) <> v_hash then
    insert into public.cofre_tentativas (user_id, n, janela)
    values (v_eu, 1, now() + interval '15 minutes')
    on conflict (user_id) do update
      set n = case when public.cofre_tentativas.janela > now()
                   then public.cofre_tentativas.n + 1 else 1 end,
          janela = case when public.cofre_tentativas.janela > now()
                        then public.cofre_tentativas.janela
                        else now() + interval '15 minutes' end;
    return jsonb_build_object('ok', false, 'motivo', 'chave_incorreta');
  end if;

  delete from public.cofre_tentativas where user_id = v_eu;

  if v_eu <> p_dono then
    insert into public.cofre_permissoes (dono_id, visitante_id)
    values (p_dono, v_eu)
    on conflict (dono_id, visitante_id) do nothing;
  end if;

  select coalesce(jsonb_agg(jsonb_build_object('id', id, 'url', foto_url) order by criado_em desc), '[]'::jsonb)
    into v_fotos
    from public.cofre_fotos where user_id = p_dono;

  return jsonb_build_object('ok', true, 'fotos', v_fotos);
exception when others then
  return jsonb_build_object('ok', false, 'motivo', 'erro_banco', 'detalhe', sqlerrm);
end;
$fn$;
revoke all on function public.cofre_abrir(uuid, text) from anon;
grant execute on function public.cofre_abrir(uuid, text) to authenticated;

grant select on public.verificacoes_presenciais to authenticated;
grant select on public.intencoes_radar          to authenticated;
grant select on public.checkins_eventos         to authenticated;