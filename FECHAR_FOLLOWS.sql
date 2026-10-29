-- ============================================================
-- LIBIDO | FECHAR follows  (idempotente, schema-agnostico)
-- Nao usa public.follows fixo: localiza a relacao onde ela estiver.
-- ============================================================

-- ---------- DIAGNOSTICO ----------
do $diag$
declare
  r record;
  n int := 0;
begin
  raise notice '===== relacoes chamadas follows =====';
  for r in
    select n2.nspname as esq, c.relname as rel, c.relkind as kind,
           c.relrowsecurity as rls
      from pg_class c
      join pg_namespace n2 on n2.oid = c.relnamespace
     where c.relname = 'follows'
       and n2.nspname not in ('pg_catalog','information_schema')
  loop
    raise notice '  %.%  kind=%  rls=%', r.esq, r.rel, r.kind, r.rls;
    n := n + 1;
  end loop;
  if n = 0 then
    raise notice '  NENHUMA relacao follows encontrada neste banco.';
  end if;

  raise notice '===== policies abertas em follows =====';
  for r in
    select schemaname, tablename, policyname, roles, cmd
      from pg_policies
     where tablename = 'follows'
  loop
    raise notice '  %.% / % / % / %', r.schemaname, r.tablename,
                  r.policyname, r.roles, r.cmd;
  end loop;
end $diag$;

-- ---------- CORRECAO ----------
do $fix$
declare
  t record;
  p record;
  v_tem_follower boolean;
  v_alvo int := 0;
begin
  for t in
    select n2.nspname as esq, c.relname as rel, c.relkind as kind
      from pg_class c
      join pg_namespace n2 on n2.oid = c.relnamespace
     where c.relname = 'follows'
       and c.relkind in ('r','p')
       and n2.nspname not in ('pg_catalog','information_schema')
  loop
    v_alvo := v_alvo + 1;
    raise notice '>>> aplicando em %.%', t.esq, t.rel;

    select exists (
      select 1 from information_schema.columns
       where table_schema = t.esq
         and table_name   = t.rel
         and column_name  = 'follower_id'
    ) into v_tem_follower;

    -- 1. derruba TODA policy concedida a anon ou public
    for p in
      select policyname
        from pg_policies
       where schemaname = t.esq
         and tablename  = t.rel
         and (roles && array['anon','public']::name[])
    loop
      execute format('drop policy %I on %I.%I', p.policyname, t.esq, t.rel);
      raise notice '    removida: %', p.policyname;
    end loop;

    -- 2. RLS ligado
    execute format('alter table %I.%I enable row level security', t.esq, t.rel);

    -- 3. corta as tres origens de acesso
    execute format('revoke all on %I.%I from public', t.esq, t.rel);
    execute format('revoke all on %I.%I from anon', t.esq, t.rel);
    execute format('grant select, insert, delete on %I.%I to authenticated', t.esq, t.rel);

    -- 4. policies corretas
    execute format('drop policy if exists follows_select_all on %I.%I', t.esq, t.rel);
    execute format('drop policy if exists follows_select on %I.%I', t.esq, t.rel);
    execute format('drop policy if exists follows_insert_own on %I.%I', t.esq, t.rel);
    execute format('drop policy if exists follows_delete_own on %I.%I', t.esq, t.rel);

    execute format('create policy follows_select on %I.%I for select to authenticated using (true)', t.esq, t.rel);

    if v_tem_follower then
      execute format('create policy follows_insert_own on %I.%I for insert to authenticated with check (follower_id::text = auth.uid()::text)', t.esq, t.rel);
      execute format('create policy follows_delete_own on %I.%I for delete to authenticated using (follower_id::text = auth.uid()::text)', t.esq, t.rel);
    else
      raise notice '    follower_id ausente - policies de escrita nao criadas';
    end if;

    raise notice '    OK';
  end loop;

  if v_alvo = 0 then
    raise notice '>>> NADA alterado: nenhuma tabela follows encontrada.';
  end if;
end $fix$;

-- ---------- VERIFICACAO (no proprio SQL) ----------
select schemaname, tablename, policyname, roles, cmd, qual, with_check
  from pg_policies
 where tablename = 'follows'
 order by schemaname, policyname;

select n.nspname as schema, c.relname as tabela,
       c.relrowsecurity as rls,
       has_table_privilege('anon', c.oid, 'SELECT') as anon_pode_ler
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
 where c.relname = 'follows'
   and n.nspname not in ('pg_catalog','information_schema');