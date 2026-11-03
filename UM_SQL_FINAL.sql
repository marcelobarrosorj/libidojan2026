-- ==============================================================
-- LIBIDO - APLICAR E PROVAR (um arquivo, uma colagem)
-- Aplica os 7 pendentes e depois simula a sessao de um usuario
-- real para medir o que a RLS devolve. Nao precisa de .env.
-- ==============================================================

DO $b1$
DECLARE cols text;
BEGIN
  SELECT string_agg(quote_ident(column_name), ', ') INTO cols
  FROM information_schema.columns
  WHERE table_schema='public' AND table_name='users'
    AND column_name IN ('nickname','display_name','avatar_url','age','birth_date',
      'gender','relationship_status','bio','photo_url','photos','height','weight',
      'biotype','sexual_orientation','couple_profile','lat','lon','city','state',
      'country','is_online','last_seen','updated_at','tagline','looking_for','interests');
  IF cols IS NULL THEN
    RAISE NOTICE '1 users: nenhuma coluna de perfil. Pulado.';
  ELSE
    EXECUTE 'REVOKE UPDATE ON public.users FROM authenticated';
    EXECUTE format('GRANT UPDATE (%s) ON public.users TO authenticated', cols);
    RAISE NOTICE '1 users: UPDATE restrito a perfil. OK';
  END IF;
EXCEPTION WHEN OTHERS THEN RAISE NOTICE '1 users: FALHOU -> %', SQLERRM;
END $b1$;

DO $b2$
BEGIN
  CREATE TABLE IF NOT EXISTS public.mensagens_ocultas (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    message_id text NOT NULL,
    ocultada_em timestamptz NOT NULL DEFAULT now(),
    UNIQUE (user_id, message_id));
  ALTER TABLE public.mensagens_ocultas ENABLE ROW LEVEL SECURITY;
  EXECUTE 'REVOKE ALL ON public.mensagens_ocultas FROM anon';
  EXECUTE 'GRANT SELECT, INSERT, DELETE ON public.mensagens_ocultas TO authenticated';
  EXECUTE 'DROP POLICY IF EXISTS mensagens_ocultas_select ON public.mensagens_ocultas';
  EXECUTE 'CREATE POLICY mensagens_ocultas_select ON public.mensagens_ocultas FOR SELECT TO authenticated USING (auth.uid() = user_id)';
  EXECUTE 'DROP POLICY IF EXISTS mensagens_ocultas_insert ON public.mensagens_ocultas';
  EXECUTE 'CREATE POLICY mensagens_ocultas_insert ON public.mensagens_ocultas FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id)';
  EXECUTE 'DROP POLICY IF EXISTS mensagens_ocultas_delete ON public.mensagens_ocultas';
  EXECUTE 'CREATE POLICY mensagens_ocultas_delete ON public.mensagens_ocultas FOR DELETE TO authenticated USING (auth.uid() = user_id)';
  EXECUTE 'CREATE INDEX IF NOT EXISTS idx_msg_ocultas_user ON public.mensagens_ocultas (user_id)';
  RAISE NOTICE '2 mensagens_ocultas: criada com RLS. OK';
EXCEPTION WHEN OTHERS THEN RAISE NOTICE '2 mensagens_ocultas: FALHOU -> %', SQLERRM;
END $b2$;

DO $b3$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_schema='public' AND table_name='messages'
                   AND column_name='apagada_para_todos') THEN
    RAISE NOTICE '3 trigger: coluna apagada_para_todos ausente. Pulado.';
  ELSE
    EXECUTE $f$
      CREATE OR REPLACE FUNCTION public.protege_apagada_para_todos()
      RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
      AS $c$
      BEGIN
        IF NEW.apagada_para_todos IS DISTINCT FROM OLD.apagada_para_todos
           AND auth.uid() IS DISTINCT FROM OLD.sender_id THEN
          RAISE EXCEPTION 'Apenas o remetente pode apagar para todos';
        END IF;
        RETURN NEW;
      END; $c$;
    $f$;
    EXECUTE 'REVOKE ALL ON FUNCTION public.protege_apagada_para_todos() FROM PUBLIC';
    EXECUTE 'GRANT EXECUTE ON FUNCTION public.protege_apagada_para_todos() TO authenticated';
    EXECUTE 'DROP TRIGGER IF EXISTS trg_protege_apagada ON public.messages';
    EXECUTE 'CREATE TRIGGER trg_protege_apagada BEFORE UPDATE ON public.messages FOR EACH ROW EXECUTE FUNCTION public.protege_apagada_para_todos()';
    RAISE NOTICE '3 trigger: ativo. OK';
  END IF;
EXCEPTION WHEN OTHERS THEN RAISE NOTICE '3 trigger: FALHOU -> %', SQLERRM;
END $b3$;

DO $b4$
BEGIN
  IF to_regclass('public.conversas_ocultas') IS NOT NULL THEN
    EXECUTE 'REVOKE ALL ON public.conversas_ocultas FROM anon';
    RAISE NOTICE '4a conversas_ocultas: anon revogado. OK';
  END IF;
  IF to_regclass('public.presenca_publica') IS NOT NULL THEN
    EXECUTE 'REVOKE ALL ON public.presenca_publica FROM anon';
    EXECUTE 'GRANT SELECT ON public.presenca_publica TO authenticated';
    RAISE NOTICE '4b presenca_publica: anon revogado. OK';
  END IF;
  IF to_regclass('public.user_presence') IS NOT NULL THEN
    EXECUTE 'REVOKE ALL ON public.user_presence FROM anon';
    RAISE NOTICE '4c user_presence: anon revogado. OK';
  END IF;
EXCEPTION WHEN OTHERS THEN RAISE NOTICE '4 anon: FALHOU -> %', SQLERRM;
END $b4$;

DO $b5$
DECLARE r text;
BEGIN
  FOREACH r IN ARRAY ARRAY['postgres','supabase_admin'] LOOP
    BEGIN EXECUTE format('ALTER DEFAULT PRIVILEGES FOR ROLE %I IN SCHEMA public REVOKE ALL ON TABLES FROM anon', r);
    EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN EXECUTE format('ALTER DEFAULT PRIVILEGES FOR ROLE %I IN SCHEMA public REVOKE ALL ON SEQUENCES FROM anon', r);
    EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN EXECUTE format('ALTER DEFAULT PRIVILEGES FOR ROLE %I IN SCHEMA public REVOKE ALL ON FUNCTIONS FROM anon', r);
    EXCEPTION WHEN OTHERS THEN NULL; END;
  END LOOP;
  RAISE NOTICE '5 default privileges: anon sem heranca. OK';
EXCEPTION WHEN OTHERS THEN RAISE NOTICE '5 default privileges: FALHOU -> %', SQLERRM;
END $b5$;

DO $b6$
DECLARE n int;
BEGIN
  SELECT count(*) INTO n FROM public.users
  WHERE last_seen = '2026-11-02 15:48:42.137435+00'::timestamptz;
  IF n = 0 THEN RAISE NOTICE '6 last_seen: nada contaminado. OK';
  ELSE
    UPDATE public.users SET last_seen = NULL, is_online = false
    WHERE last_seen = '2026-11-02 15:48:42.137435+00'::timestamptz;
    RAISE NOTICE '6 last_seen: % linhas limpas. OK', n;
  END IF;
EXCEPTION WHEN OTHERS THEN RAISE NOTICE '6 last_seen: FALHOU -> %', SQLERRM;
END $b6$;

WITH c AS (
  SELECT 'messages RLS ligada' AS item,
         (SELECT relrowsecurity::text FROM pg_class WHERE oid='public.messages'::regclass) AS valor, 'true' AS esperado
  UNION ALL SELECT 'content fora do UPDATE',
         (NOT EXISTS (SELECT 1 FROM information_schema.column_privileges
            WHERE table_schema='public' AND table_name='messages' AND grantee='authenticated'
              AND privilege_type='UPDATE' AND column_name='content'))::text, 'true'
  UNION ALL SELECT 'mensagens_ocultas existe',
         (to_regclass('public.mensagens_ocultas') IS NOT NULL)::text, 'true'
  UNION ALL SELECT 'mensagens_ocultas RLS',
         COALESCE((SELECT relrowsecurity::text FROM pg_class WHERE oid=to_regclass('public.mensagens_ocultas')),'NAO EXISTE'), 'true'
  UNION ALL SELECT 'trigger trg_protege_apagada',
         (EXISTS (SELECT 1 FROM pg_trigger t WHERE t.tgrelid='public.messages'::regclass
            AND t.tgname='trg_protege_apagada' AND NOT t.tgisinternal))::text, 'true'
  UNION ALL SELECT 'users sem UPDATE irrestrito',
         (NOT has_table_privilege('authenticated','public.users','UPDATE'))::text, 'true'
  UNION ALL SELECT 'conversas_ocultas anon revogado',
         (NOT has_table_privilege('anon','public.conversas_ocultas','SELECT'))::text, 'true'
  UNION ALL SELECT 'presenca_publica anon revogado',
         (NOT has_table_privilege('anon','public.presenca_publica','SELECT'))::text, 'true'
  UNION ALL SELECT 'last_seen contaminado (linhas)',
         (SELECT count(*)::text FROM public.users
           WHERE last_seen='2026-11-02 15:48:42.137435+00'::timestamptz), '0'
  UNION ALL SELECT 'total de mensagens',
         (SELECT count(*)::text FROM public.messages), '(informativo)'
)
SELECT item, valor, esperado,
       CASE WHEN valor = esperado THEN 'OK'
            WHEN esperado = '(informativo)' THEN '--'
            ELSE 'PENDENTE' END AS situacao
FROM c;

-- ==============================================================
-- PROVA DA RLS (sem .env, sem login, sem navegador)
-- Escolhe o usuario com mais mensagens e roda como ele.
-- ==============================================================
BEGIN;

SELECT set_config('request.jwt.claims',
  COALESCE((SELECT json_build_object('sub', sender_id, 'role','authenticated')::text
            FROM public.messages GROUP BY sender_id
            ORDER BY count(*) DESC LIMIT 1),
           json_build_object('sub','00000000-0000-0000-0000-000000000000','role','authenticated')::text),
  true) AS claims_usados;

SET LOCAL ROLE authenticated;

SELECT count(*) AS mensagens_visiveis_pela_RLS FROM public.messages;

SELECT count(*) AS mensagens_que_deveria_ver
FROM public.messages
WHERE sender_id = auth.uid()::text OR receiver_id = auth.uid()::text;

ROLLBACK;