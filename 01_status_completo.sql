WITH c AS (

  -- ---- mensagens: o que ja foi confirmado -------------------------------
  SELECT 'messages RLS ligada' AS item,
         (SELECT relrowsecurity::text FROM pg_class
           WHERE oid = 'public.messages'::regclass) AS valor, 'true' AS esperado

  UNION ALL
  SELECT 'messages INSERT with_check ok',
         COALESCE((SELECT with_check FROM pg_policies
            WHERE schemaname='public' AND tablename='messages'
              AND policyname='messages_insert_sender'), 'AUSENTE'),
         'auth.uid() = sender_id'

  UNION ALL
  SELECT 'messages policies so authenticated',
         COALESCE((SELECT bool_and(roles = '{authenticated}')::text FROM pg_policies
            WHERE schemaname='public' AND tablename='messages'), 'AUSENTE'),
         'true'

  UNION ALL
  SELECT 'content FORA do UPDATE',
         (NOT EXISTS (
            SELECT 1 FROM information_schema.column_privileges
            WHERE table_schema='public' AND table_name='messages'
              AND grantee='authenticated' AND privilege_type='UPDATE'
              AND column_name='content'))::text,
         'true'

  -- ---- o que nunca foi confirmado ---------------------------------------
  UNION ALL
  SELECT 'mensagens_ocultas existe',
         (to_regclass('public.mensagens_ocultas') IS NOT NULL)::text, 'true'

  UNION ALL
  SELECT 'mensagens_ocultas RLS',
         COALESCE((SELECT relrowsecurity::text FROM pg_class
            WHERE oid = to_regclass('public.mensagens_ocultas')), 'NAO EXISTE'),
         'true'

  UNION ALL
  SELECT 'trigger trg_protege_apagada',
         (EXISTS (SELECT 1 FROM pg_trigger t
            WHERE t.tgrelid='public.messages'::regclass
              AND t.tgname='trg_protege_apagada' AND NOT t.tgisinternal))::text,
         'true'

  UNION ALL
  SELECT 'users UPDATE por coluna (content nao vaza)',
         (NOT has_table_privilege('authenticated','public.users','UPDATE'))::text,
         'true = trava por coluna aplicada'

  UNION ALL
  SELECT 'default priv: anon em TABELAS',
         CASE WHEN EXISTS (
           SELECT 1 FROM pg_default_acl d JOIN pg_namespace n ON n.oid=d.defaclnamespace
           WHERE n.nspname='public' AND d.defaclobjtype='r'
             AND d.defaclacl::text LIKE '%anon=%') THEN 'ABERTO' ELSE 'FECHADO' END,
         'FECHADO'

  UNION ALL
  SELECT 'default priv: anon em FUNCOES',
         CASE WHEN EXISTS (
           SELECT 1 FROM pg_default_acl d JOIN pg_namespace n ON n.oid=d.defaclnamespace
           WHERE n.nspname='public' AND d.defaclobjtype='f'
             AND d.defaclacl::text LIKE '%anon=%') THEN 'ABERTO' ELSE 'FECHADO' END,
         'FECHADO'

  UNION ALL
  SELECT 'conversas_ocultas anon revogado',
         (NOT has_table_privilege('anon','public.conversas_ocultas','SELECT'))::text,
         'true'

  UNION ALL
  SELECT 'presenca_publica anon revogado',
         (NOT has_table_privilege('anon','public.presenca_publica','SELECT'))::text,
         'true'

  UNION ALL
  SELECT 'last_seen contaminado (linhas)',
         (SELECT count(*)::text FROM public.users
           WHERE last_seen = '2026-11-02 15:48:42.137435+00'::timestamptz),
         '0'

  UNION ALL
  SELECT 'TOTAL de mensagens no banco',
         (SELECT count(*)::text FROM public.messages), '(informativo)'

  UNION ALL
  SELECT 'online agora (view unificada)',
         (SELECT count(*)::text FROM public.presenca_publica WHERE online),
         '(informativo)'
)
SELECT item, valor, esperado,
       CASE WHEN valor = esperado THEN 'OK'
            WHEN esperado = '(informativo)' THEN '--'
            ELSE 'PENDENTE' END AS situacao
FROM c;