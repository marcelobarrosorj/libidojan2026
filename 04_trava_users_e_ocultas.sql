-- ============================================================
-- P2 — users: usuario edita o proprio perfil, nao se promove a admin
-- ============================================================
REVOKE UPDATE ON public.users FROM authenticated;

GRANT UPDATE (
  nickname, age, birth_date, gender, relationship_status, bio,
  photo_url, photos, height, biotype, sexual_orientation,
  couple_profile, lat, lon, is_online, last_seen, updated_at
) ON public.users TO authenticated;

-- ============================================================
-- P3 — mensagens_ocultas: apagar para mim sem apagar a mensagem
-- ============================================================
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

-- ============================================================
-- Verificacao
-- ============================================================
SELECT grantee, privilege_type, column_name
FROM information_schema.column_privileges
WHERE table_schema = 'public'
  AND table_name   = 'users'
  AND grantee      = 'authenticated'
  AND privilege_type = 'UPDATE'
ORDER BY column_name;

SELECT c.relname AS objeto,
       has_table_privilege('anon', c.oid, 'SELECT')          AS anon_sel,
       has_table_privilege('authenticated', c.oid, 'SELECT') AS auth_sel,
       has_table_privilege('authenticated', c.oid, 'INSERT') AS auth_ins,
       c.relrowsecurity AS rls
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND c.relname = 'mensagens_ocultas';