-- ============================================================
-- LIBIDO - APLICAR TUDO (idempotente)
-- Cada bloco tem tratamento de erro proprio: se um falhar,
-- os seguintes continuam.
-- ============================================================

-- ------------------------------------------------------------
-- 1. users: UPDATE so em colunas de perfil
--    Impede que usuario logado altere role, plan ou is_banned.
-- ------------------------------------------------------------
DO $blk1$
DECLARE cols text;
BEGIN
  SELECT string_agg(quote_ident(column_name), ', ') INTO cols
  FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'users'
    AND column_name IN (
      'nickname','display_name','avatar_url','age','birth_date','gender',
      'relationship_status','bio','photo_url','photos','height','weight',
      'biotype','sexual_orientation','couple_profile','lat','lon','city',
      'state','country','is_online','last_seen','updated_at','tagline',
      'looking_for','interests','smoker','drinker'
    );

  IF cols IS NULL THEN
    RAISE NOTICE 'users: nenhuma coluna de perfil encontrada. Nada alterado.';
  ELSE
    EXECUTE 'REVOKE UPDATE ON public.users FROM authenticated';
    EXECUTE format('GRANT UPDATE (%s) ON public.users TO authenticated', cols);
    RAISE NOTICE 'users: UPDATE liberado apenas em %', cols;
  END IF;
END $blk1$;

-- ------------------------------------------------------------
-- 2. mensagens_ocultas: apagar mensagem so para mim
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.mensagens_ocultas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  message_id text NOT NULL,
  ocultada_em timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, message_id)
);

ALTER TABLE public.mensagens_ocultas ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.mensagens_ocultas FROM anon;
GRANT SELECT, INSERT, DELETE ON public.mensagens_ocultas TO authenticated;

DROP POLICY IF EXISTS "mensagens_ocultas_select" ON public.mensagens_ocultas;
CREATE POLICY "mensagens_ocultas_select" ON public.mensagens_ocultas
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "mensagens_ocultas_insert" ON public.mensagens_ocultas;
CREATE POLICY "mensagens_ocultas_insert" ON public.mensagens_ocultas
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "mensagens_ocultas_delete" ON public.mensagens_ocultas;
CREATE POLICY "mensagens_ocultas_delete" ON public.mensagens_ocultas
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_msg_ocultas_user
  ON public.mensagens_ocultas (user_id);

-- ------------------------------------------------------------
-- 3. Trigger: so o remetente apaga para todos
--    Criado apenas se a coluna existir, para nao quebrar.
-- ------------------------------------------------------------
DO $blk2$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='messages'
      AND column_name='apagada_para_todos'
  ) THEN
    RAISE NOTICE 'trigger: coluna apagada_para_todos nao existe. Trigger nao criado.';
  ELSE
    EXECUTE $f$
      CREATE OR REPLACE FUNCTION public.protege_apagada_para_todos()
      RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
      AS $b$
      BEGIN
        IF NEW.apagada_para_todos IS DISTINCT FROM OLD.apagada_para_todos
           AND auth.uid() IS DISTINCT FROM OLD.sender_id THEN
          RAISE EXCEPTION 'Apenas o remetente pode apagar para todos';
        END IF;
        RETURN NEW;
      END;
      $b$;
    $f$;

    EXECUTE 'REVOKE ALL ON FUNCTION public.protege_apagada_para_todos() FROM PUBLIC';
    EXECUTE 'GRANT EXECUTE ON FUNCTION public.protege_apagada_para_todos() TO authenticated';

    EXECUTE 'DROP TRIGGER IF EXISTS trg_protege_apagada ON public.messages';
    EXECUTE 'CREATE TRIGGER trg_protege_apagada BEFORE UPDATE ON public.messages
             FOR EACH ROW EXECUTE FUNCTION public.protege_apagada_para_todos()';
    RAISE NOTICE 'trigger: trg_protege_apagada criado.';
  END IF;
END $blk2$;

-- ------------------------------------------------------------
-- 4. Fecha anon nas tabelas que nasceram abertas
-- ------------------------------------------------------------
DO $blk3$
BEGIN
  IF to_regclass('public.conversas_ocultas') IS NOT NULL THEN
    EXECUTE 'REVOKE ALL ON public.conversas_ocultas FROM anon';
  END IF;
  IF to_regclass('public.presenca_publica') IS NOT NULL THEN
    EXECUTE 'REVOKE ALL ON public.presenca_publica FROM anon';
    EXECUTE 'GRANT SELECT ON public.presenca_publica TO authenticated';
  END IF;
  IF to_regclass('public.user_presence') IS NOT NULL THEN
    EXECUTE 'REVOKE ALL ON public.user_presence FROM anon';
  END IF;
  RAISE NOTICE 'anon: revogado em conversas_ocultas, presenca_publica, user_presence';
END $blk3$;

-- ------------------------------------------------------------
-- 5. last_seen: zera SO o timestamp do backfill
--    Preserva historico real de quem esteve online.
-- ------------------------------------------------------------
DO $blk4$
DECLARE n int;
BEGIN
  SELECT count(*) INTO n FROM public.users
  WHERE last_seen = '2026-11-02 15:48:42.137435+00'::timestamptz;

  IF n = 0 THEN
    RAISE NOTICE 'last_seen: nenhuma linha contaminada. Nada a limpar.';
  ELSE
    UPDATE public.users
    SET last_seen = NULL, is_online = false
    WHERE last_seen = '2026-11-02 15:48:42.137435+00'::timestamptz;
    RAISE NOTICE 'last_seen: % linha(s) limpa(s).', n;
  END IF;
END $blk4$;

-- ------------------------------------------------------------
-- 6. VERIFICACAO FINAL - uma linha por item
-- ------------------------------------------------------------
WITH c AS (
  SELECT 'messages RLS ligada' AS item,
         (SELECT relrowsecurity::text FROM pg_class
           WHERE oid='public.messages'::regclass) AS valor, 'true' AS esperado
  UNION ALL
  SELECT 'trigger trg_protege_apagada',
         (EXISTS (SELECT 1 FROM pg_trigger t
            WHERE t.tgrelid='public.messages'::regclass
              AND t.tgname='trg_protege_apagada' AND NOT t.tgisinternal))::text, 'true'
  UNION ALL
  SELECT 'mensagens_ocultas existe',
         (to_regclass('public.mensagens_ocultas') IS NOT NULL)::text, 'true'
  UNION ALL
  SELECT 'mensagens_ocultas RLS',
         COALESCE((SELECT relrowsecurity::text FROM pg_class
            WHERE oid=to_regclass('public.mensagens_ocultas')),'NAO EXISTE'), 'true'
  UNION ALL
  SELECT 'users trava por coluna aplicada',
         (NOT has_table_privilege('authenticated','public.users','UPDATE'))::text, 'true'
  UNION ALL
  SELECT 'conversas_ocultas anon revogado',
         (NOT has_table_privilege('anon','public.conversas_ocultas','SELECT'))::text, 'true'
  UNION ALL
  SELECT 'presenca_publica anon revogado',
         (NOT has_table_privilege('anon','public.presenca_publica','SELECT'))::text, 'true'
  UNION ALL
  SELECT 'last_seen contaminado (linhas)',
         (SELECT count(*)::text FROM public.users
           WHERE last_seen='2026-11-02 15:48:42.137435+00'::timestamptz), '0'
  UNION ALL
  SELECT 'mensagens no banco',
         (SELECT count(*)::text FROM public.messages), '(informativo)'
  UNION ALL
  SELECT 'online agora',
         (SELECT count(*)::text FROM public.presenca_publica WHERE online), '(informativo)'
)
SELECT item, valor, esperado,
       CASE WHEN valor = esperado THEN 'OK'
            WHEN esperado = '(informativo)' THEN '--'
            ELSE 'PENDENTE' END AS situacao
FROM c;